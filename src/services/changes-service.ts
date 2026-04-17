import type { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import type { IProjectConfigRepository } from "../repositories/interfaces/project-config-repository-interface.js";
import type { ICycleRepository } from "../repositories/interfaces/cycle-repository-interface.js";
import type { IPhaseRepository } from "../repositories/interfaces/phase-repository-interface.js";
import type { IChangeSetRepository } from "../repositories/interfaces/change-set-repository-interface.js";
import type { IChangeChunkRepository } from "../repositories/interfaces/change-chunk-repository-interface.js";
import type { ProjectEntity } from "../entities/project-entity.js";
import type { ProjectConfigEntity } from "../entities/project-config-entity.js";
import { IPhaseConversationService } from "./interfaces/phase-conversation-service-interface.js";
import { IStatusService } from "./interfaces/status-service-interface.js";

export class ChangesService
{
    private readonly projectRepository: IProjectRepository;
    private readonly projectConfigRepository: IProjectConfigRepository;
    private readonly cycleRepository: ICycleRepository;
    private readonly phaseRepository: IPhaseRepository;
    private readonly changeSetRepository: IChangeSetRepository;
    private readonly changeChunkRepository: IChangeChunkRepository;
    private readonly phaseConversationService: IPhaseConversationService;
    private readonly statusService: IStatusService;

    constructor(
        phaseConversationService: IPhaseConversationService,
        statusService: IStatusService,
        projectRepository: IProjectRepository,
        projectConfigRepository: IProjectConfigRepository,
        cycleRepository: ICycleRepository,
        phaseRepository: IPhaseRepository,
        changeSetRepository: IChangeSetRepository,
        changeChunkRepository: IChangeChunkRepository
    )
    {
        this.phaseConversationService = phaseConversationService;
        this.statusService = statusService;
        this.projectRepository = projectRepository;
        this.projectConfigRepository = projectConfigRepository;
        this.cycleRepository = cycleRepository;
        this.phaseRepository = phaseRepository;
        this.changeSetRepository = changeSetRepository;
        this.changeChunkRepository = changeChunkRepository;
    }

    public pending(all: boolean): string
    {
        const project = this.getCurrentProject();
        this.assertNotNull(project, "Project not found");

        const config = this.getCurrentProjectConfig(project.id);
        this.assertNotNull(config, "Config not found");
        void config;

        const cycle = this.cycleRepository.getCurrent(project.id);
        this.assertNotNull(cycle, "No active cycle for current project");

        const phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
        this.assertNotNull(phase, "Phase not found");
        this.assert(phase.status === "REFINING", "Phase not in refining state");

        const changeSet = this.changeSetRepository.getCurrent(phase.id);
        this.assertNotNull(changeSet, "Change Set not found");

        let response = "";

        if (all)
        {
            for (const chunk of this.changeChunkRepository.list(changeSet.id))
            {
                if (chunk.status === "AWAITING_APPROVAL")
                {
                    response += `\n        [${chunk.index}] ${changeSet.fileName}\n`;
                    response += `        ${chunk.blockLocation}\n`;
                    response += `        ${chunk.changeContent}\n\n`;
                }
            }
        }
        else
        {
            const chunk = this.changeChunkRepository.getByIndex(
                changeSet.id,
                changeSet.currentChangeChunkIndex
            );

            this.assertNotNull(chunk, "Chunk not found");
            this.assert(
                chunk.status === "AWAITING_APPROVAL",
                "Current chunk not pending"
            );

            response += `\n    [${chunk.index}] ${changeSet.fileName}\n`;
            response += `    ${chunk.blockLocation}\n`;
            response += `    ${chunk.changeContent}\n\n`;
        }

        return `Cycle ${cycle.status}
  Project : ${project.name}
     RootPath     : ${project.rootProjectPath}
     DocsPath     : ${project.docsRootPath}
     Language     : ${project.documentationLanguage}
     Cycle        : ${cycle.status}
     FileName     : ${changeSet.fileName}
     Step         : ${cycle.currentPhaseIndex}/${cycle.phaseCount}
     ChangeSet    : ${changeSet.currentChangeChunkIndex}/${changeSet.changeChunkCount}

  ${response}
`;
    }

    public apply(all: boolean): string
    {
        const project = this.getCurrentProject();
        this.assertNotNull(project, "Project not found");

        const config = this.getCurrentProjectConfig(project.id);
        this.assertNotNull(config, "Config not found");
        void config;

        const cycle = this.cycleRepository.getCurrent(project.id);
        this.assertNotNull(cycle, "No active cycle for current project");

        let phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
        this.assertNotNull(phase, "Phase not found");
        this.assert(phase.status === "REFINING", "Phase not in refining state");

        let changeSet = this.changeSetRepository.getCurrent(phase.id);
        this.assertNotNull(changeSet, "Change Set not found");

        if (all)
        {
            this.phaseConversationService.applyAll(phase, changeSet);
        }
        else
        {
            this.phaseConversationService.apply(phase, changeSet);
        }

        phase = this.phaseRepository.getById(phase.id);
        this.assertNotNull(phase, "Phase not found after apply");

        changeSet = this.changeSetRepository.getById(changeSet.id);
        return this.statusService.generate(project, cycle, phase, changeSet);
    }

    public discard(all: boolean): string
    {
        const project = this.getCurrentProject();
        this.assertNotNull(project, "Project not found");

        const config = this.getCurrentProjectConfig(project.id);
        this.assertNotNull(config, "Config not found");
        void config;

        const cycle = this.cycleRepository.getCurrent(project.id);
        this.assertNotNull(cycle, "No active cycle for current project");

        let phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
        this.assertNotNull(phase, "Phase not found");
        this.assert(phase.status === "REFINING", "Phase not in refining state");

        let changeSet = this.changeSetRepository.getCurrent(phase.id);
        this.assertNotNull(changeSet, "Change Set not found");

        if (all)
        {
            this.phaseConversationService.discardAll(phase, changeSet);
        }
        else
        {
            this.phaseConversationService.discard(phase, changeSet);
        }

        phase = this.phaseRepository.getById(phase.id);
        this.assertNotNull(phase, "Phase not found after discard");

        changeSet = this.changeSetRepository.getById(changeSet.id);
        return this.statusService.generate(project, cycle, phase, changeSet);
    }

    private getCurrentProject(): ProjectEntity | null
    {
        const repository = this.projectRepository as IProjectRepository & {
            getCurrent?: () => ProjectEntity | null;
        };

        if (typeof repository.getCurrent === "function")
        {
            return repository.getCurrent();
        }

        const projects = this.projectRepository.list();

        if (projects.length === 0)
        {
            return null;
        }

        let currentProject = projects[0];

        for (const project of projects)
        {
            if (project.id > currentProject.id)
            {
                currentProject = project;
            }
        }

        return currentProject;
    }

    private getCurrentProjectConfig(projectId: number): ProjectConfigEntity | null
    {
        const repository = this.projectConfigRepository as IProjectConfigRepository & {
            get?: (projectId: number) => ProjectConfigEntity | null;
        };

        if (typeof repository.get === "function")
        {
            return repository.get(projectId);
        }

        return this.projectConfigRepository.getCurrent(projectId);
    }

    private assert(condition: boolean, message: string): void
    {
        if (!condition)
        {
            throw new Error(message);
        }
    }

    private assertNotNull<T>(value: T | null, message: string): asserts value is T
    {
        if (value === null)
        {
            throw new Error(message);
        }
    }
}