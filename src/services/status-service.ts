import type { ProjectEntity } from "../entities/project-entity.js";
import type { CycleEntity } from "../entities/cycle-entity.js";
import type { PhaseEntity } from "../entities/phase-entity.js";
import type { ChangeSetEntity } from "../entities/change-set-entity.js";
import type { CycleArtifactEntity } from "../entities/cycle-artifact-entity.js";

import type { IChangeSetRepository } from "../repositories/interfaces/change-set-repository-interface.js";
import type { ICycleArtifactRepository } from "../repositories/interfaces/cycle-artifact-repository-interface.js";
import { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import { ICycleRepository } from "../repositories/interfaces/cycle-repository-interface.js";
import { IPhaseRepository } from "../repositories/interfaces/phase-repository-interface.js";
import { isEmpty, notIsEmpty } from "../shared/utils.js";

export class StatusService
{
    private readonly changeSetRepository: IChangeSetRepository;
    private readonly cycleArtifactRepository: ICycleArtifactRepository;
    private readonly projectRepository: IProjectRepository;
    private readonly cycleRepository: ICycleRepository;
    private readonly phaseRepository : IPhaseRepository;
    constructor(
        projectRepository: IProjectRepository,
        cycleRepository: ICycleRepository,
        changeSetRepository: IChangeSetRepository,
        cycleArtifactRepository: ICycleArtifactRepository,
        phaseRepository : IPhaseRepository
    )
    {
        this.changeSetRepository = changeSetRepository;
        this.cycleArtifactRepository = cycleArtifactRepository;
        this.projectRepository = projectRepository;
        this.cycleRepository = cycleRepository;
        this.phaseRepository = phaseRepository;
    }

    public phaseStateText(phase: PhaseEntity): string
    {
        let state = "";

        if (phase.status === "REFINING")
        {
            state = "aguardando refine";
        }
        else if (phase.status === "AWAITING_APPROVAL")
        {
            state = "aguardando approve/reject";
        }
        else if (phase.status === "APPROVED")
        {
            state = "aprovada";
        }
        else if (phase.status === "REJECTED")
        {
            state = "rejeitada";
        }
        else if (phase.status === "SKIPPED")
        {
            state = "ignorada";
        }
        else
        {
            state = phase.status;
        }

        return state;
    }

    public proposalStateText(phase: PhaseEntity): string
    {
        let proposal = "";

        if (phase.proposalState === "EMPTY")
        {
            proposal = "vazia";
        }
        else if (phase.proposalState === "NON_EMPTY")
        {
            proposal = "não vazia";
        }
        else
        {
            proposal = "não gerada";
        }

        return proposal;
    }

    public autoModeText(cycle: CycleEntity): string
    {
        let mode = "none";

        if (cycle.autoMode === "APPROVE_ALL")
        {
            mode = "approve-all";
        }
        else if (cycle.autoMode === "REJECT_ALL")
        {
            mode = "reject-all";
        }

        return mode;
    }

    public countRefinements(phase: PhaseEntity): number
    {
        let total = 0;
        const changeSets = this.changeSetRepository.list(phase.id);

        for (const _changeSet of changeSets)
        {
            total += 1;
        }

        return total;
    }

    public countChangedFiles(cycle: CycleEntity): number
    {
        let total = 0;
        const artifacts = this.cycleArtifactRepository.list(cycle.id);

        for (const artifact of artifacts)
        {
            if (notIsEmpty(artifact.backupContent) && artifact.backupContent !== artifact.currentContent)
            {
                total += 1;
            }
        }

        return total;
    }

    public countCreatedFiles(cycle: CycleEntity): number
    {
        let total = 0;
        const artifacts = this.cycleArtifactRepository.list(cycle.id);

        for (const artifact of artifacts)
        {
            if (isEmpty(artifact.backupContent) && notIsEmpty(artifact.currentContent))
            {
                total += 1;
            }
        }

        return total;
    }

    public availableActions(cycle: CycleEntity, phase: PhaseEntity): string
    {
        let actions = "";

        if (cycle.status === "OPEN")
        {
            if (phase.status === "REFINING")
            {
                actions += "    - apply <all>\n";
                actions += "    - discard <all>\n";
                actions += "    - pending\n";
                actions += "    - rollback\n";
            }
            else if (phase.status === "AWAITING_APPROVAL")
            {
                actions += "    - refine\n";
                actions += "    - approve <all>\n";
                actions += "    - reject <all>\n";
                actions += "    - rollback\n";
            }
        }
        else if (cycle.status === "AWAITING_COMMIT")
        {
            actions += "    - commit\n";
            actions += "    - rollback\n";
        }

        return actions;
    }

    public showStatus() : string{

        const project: ProjectEntity | null = this.projectRepository.getCurrent();
        if (project == null)
          return "Projeto não iniciado!";
        const cycle: CycleEntity | null = this.cycleRepository.getCurrent(project!.id);
        const phase: PhaseEntity | null = cycle==null? null : this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
        const changeSet : ChangeSetEntity | null = phase==null? null : this.changeSetRepository.getCurrent(phase.id); 
        
        return this.generate(project!, cycle, phase, changeSet);
    }

    public generate(
        project: ProjectEntity,
        cycle: CycleEntity|null,
        phase: PhaseEntity|null,
        changeSet: ChangeSetEntity | null
    ): string
    {
        const phaseState = (phase==null) ? "--" : this.phaseStateText(phase);
        const proposalState = phase==null? "--" : this.proposalStateText(phase);
        const autoMode = cycle==null? "--" : this.autoModeText(cycle);
        const refinements = phase==null? "--" : this.countRefinements(phase);
        const changedFiles = cycle==null? "--" : this.countChangedFiles(cycle);
        const createdFiles = cycle==null? "--" : this.countCreatedFiles(cycle);
        const actions = cycle==null || phase==null ? "" : this.availableActions(cycle, phase);

        let artifactName = "-";
        let changeSetInfo = "-";

        if (changeSet !== null)
        {
            artifactName = changeSet.fileName;
            changeSetInfo = `${changeSet.currentChangeChunkIndex}/${changeSet.changeChunkCount}`;
        }

       const cycleStatus = cycle==null ? "" : `
    Cycle        : ${cycle?.status}
    Phase        : ${phase?.name}
    Artifact     : ${artifactName}
    State        : ${phaseState}
    Proposal     : ${proposalState}
    Refinements  : ${refinements}
    Changed files: ${changedFiles}
    Created files: ${createdFiles}
    Auto-mode    : ${autoMode}

       ` 

        return `${cycleStatus}
      Project : ${project.name}
      RootPath     : ${project.rootProjectPath}
      DocsPath     : ${project.docsRootPath}
      Language     : ${project.documentationLanguage}
      Cycle        : ${cycle?.status}
      Step         : ${cycle?.currentPhaseIndex}/${cycle?.phaseCount}
      ChangeSet    : ${changeSetInfo}

    Available actions:
${actions}
`;
    }

    public successCommit(project: ProjectEntity, cycle: CycleEntity): string
    {
        return `Cycle ${cycle.status}
  Project : ${project.name}
     RootPath     : ${project.rootProjectPath}
     DocsPath     : ${project.docsRootPath}
     Language     : ${project.documentationLanguage}
     Cycle        : ${cycle.status}
  Commit successful.
`;
    }

    public successRollback(project: ProjectEntity, cycle: CycleEntity): string
    {
        return `Cycle ${cycle.status}
  Project : ${project.name}
     RootPath     : ${project.rootProjectPath}
     DocsPath     : ${project.docsRootPath}
     Language     : ${project.documentationLanguage}
     Cycle        : ${cycle.status}
  Rollback successful.
`;
    }
}