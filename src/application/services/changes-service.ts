import type { IProjectRepository } from "../../domain/interfaces/repositories/project-repository-interface.js";
import type { IProjectConfigRepository } from "../../domain/interfaces/repositories/project-config-repository-interface.js";
import type { ICycleRepository } from "../../domain/interfaces/repositories/cycle-repository-interface.js";
import type { IPhaseRepository } from "../../domain/interfaces/repositories/phase-repository-interface.js";
import type { IChangeSetRepository } from "../../domain/interfaces/repositories/change-set-repository-interface.js";
import type { IChangeChunkRepository } from "../../domain/interfaces/repositories/change-chunk-repository-interface.js";
import type { ProjectEntity } from "../../domain/entities/project-entity.js";
import type { ProjectConfigEntity } from "../../domain/entities/project-config-entity.js";
import { IPhaseConversationService } from "../../domain/interfaces/services/phase-conversation-service-interface.js";
import { IStatusService } from "../../domain/interfaces/services/status-service-interface.js";
import { I18n } from "../../shared/i18n.js";

export class ChangesService {
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
    changeChunkRepository: IChangeChunkRepository,
  ) {
    this.phaseConversationService = phaseConversationService;
    this.statusService = statusService;
    this.projectRepository = projectRepository;
    this.projectConfigRepository = projectConfigRepository;
    this.cycleRepository = cycleRepository;
    this.phaseRepository = phaseRepository;
    this.changeSetRepository = changeSetRepository;
    this.changeChunkRepository = changeChunkRepository;
  }

  public pending(all: boolean): string {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const config = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(config, "Configuração não encontrada");
    void config;

    const cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");

    const phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
    this.assertNotNull(phase, "Fase não encontrada");
    this.assert(phase.status === "REFINING", "A fase não está em refinamento");

    const changeSet = this.changeSetRepository.getCurrent(phase.id);
    this.assertNotNull(changeSet, "Change-set não encontrado");

    let response = "";

    if (all) {
      for (const chunk of this.changeChunkRepository.list(changeSet.id)) {
        if (chunk.status === "AWAITING_APPROVAL") {
          response += `\n        [${chunk.index}] ${changeSet.fileName}\n`;
          response += `        ${chunk.blockLocation}\n`;
          response += `        ${chunk.changeContent}\n\n`;
        }
      }
    } else {
      const chunk = this.changeChunkRepository.getByIndex(
        changeSet.id,
        changeSet.currentChangeChunkIndex,
      );

      this.assertNotNull(chunk, "Trecho-diff não encontrado");
      this.assert(chunk.status === "AWAITING_APPROVAL", "O trecho-diff atual não está pendente");

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

  public apply(all: boolean): string {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const config = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(config, "Configuração não encontrada");
    void config;

    const cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");

    let phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
    this.assertNotNull(phase, "Fase não encontrada");
    this.assert(phase.status === "REFINING", "A fase não está em refinamento");

    let changeSet = this.changeSetRepository.getCurrent(phase.id);
    this.assertNotNull(changeSet, "Change-set não encontrado");

    if (all) {
      this.phaseConversationService.applyAll(phase, changeSet);
    } else {
      this.phaseConversationService.apply(phase, changeSet);
    }

    phase = this.phaseRepository.getById(phase.id);
    this.assertNotNull(phase, "Fase não encontrada após a aplicação");

    changeSet = this.changeSetRepository.getById(changeSet.id);
    return this.statusService.generate(project, cycle, phase, changeSet);
  }

  public discard(all: boolean): string {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const config = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(config, "Configuração não encontrada");
    void config;

    const cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");

    let phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
    this.assertNotNull(phase, "Fase não encontrada");
    this.assert(phase.status === "REFINING", "A fase não está em refinamento");

    let changeSet = this.changeSetRepository.getCurrent(phase.id);
    this.assertNotNull(changeSet, "Change-set não encontrado");

    if (all) {
      this.phaseConversationService.discardAll(phase, changeSet);
    } else {
      this.phaseConversationService.discard(phase, changeSet);
    }

    phase = this.phaseRepository.getById(phase.id);
    this.assertNotNull(phase, "Fase não encontrada após o descarte");

    changeSet = this.changeSetRepository.getById(changeSet.id);
    return this.statusService.generate(project, cycle, phase, changeSet);
  }

  private getCurrentProject(): ProjectEntity | null {
    const repository = this.projectRepository as IProjectRepository & {
      getCurrent?: () => ProjectEntity | null;
    };

    if (typeof repository.getCurrent === "function") {
      return repository.getCurrent();
    }

    const projects = this.projectRepository.list();

    if (projects.length === 0) {
      return null;
    }

    let currentProject = projects[0];

    for (const project of projects) {
      if (project.id > currentProject.id) {
        currentProject = project;
      }
    }

    return currentProject;
  }

  private getCurrentProjectConfig(projectId: number): ProjectConfigEntity | null {
    const repository = this.projectConfigRepository as IProjectConfigRepository & {
      get?: (projectId: number) => ProjectConfigEntity | null;
    };

    let configEntity: ProjectConfigEntity | null = null;
    if (typeof repository.get === "function") {
      configEntity = repository.get(projectId);
    } else {
      configEntity = this.projectConfigRepository.getCurrent(projectId);
    }

    if (configEntity) {
       try {
         const parsed = JSON.parse(configEntity.content);
         if (parsed.language) {
           I18n.setLanguage(parsed.language);
         }
       } catch {
         // Ignore json parse error
       }
     }

    return configEntity;
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(I18n.t(message));
    }
  }

  private assertNotNull<T>(value: T | null, message: string): asserts value is T {
    if (value === null) {
      throw new Error(I18n.t(message));
    }
  }
}
