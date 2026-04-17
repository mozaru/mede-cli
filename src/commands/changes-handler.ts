import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { IDbConnectionFactory } from "../db/db-connection-factory-interface.js";
import { IUnitOfWork } from "../db/unit-of-work-interface.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { BacklogRepository } from "../repositories/backlog-repository.js";
import { ChangeChunkRepository } from "../repositories/change-chunk-repository.js";
import { ChangeSetRepository } from "../repositories/change-set-repository.js";
import { CycleArtifactRepository } from "../repositories/cycle-artifact-repository.js";
import { CycleRepository } from "../repositories/cycle-repository.js";
import { IBacklogRepository } from "../repositories/interfaces/backlog-repository-interface.js";
import { IChangeChunkRepository } from "../repositories/interfaces/change-chunk-repository-interface.js";
import { IChangeSetRepository } from "../repositories/interfaces/change-set-repository-interface.js";
import { ICycleArtifactRepository } from "../repositories/interfaces/cycle-artifact-repository-interface.js";
import { ICycleRepository } from "../repositories/interfaces/cycle-repository-interface.js";
import { IPhaseAttachmentRepository } from "../repositories/interfaces/phase-attachment-repository-interface.js";
import { IPhaseConversationRepository } from "../repositories/interfaces/phase-conversation-repository-interface.js";
import { IPhaseRepository } from "../repositories/interfaces/phase-repository-interface.js";
import { IProjectConfigRepository } from "../repositories/interfaces/project-config-repository-interface.js";
import { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import { PhaseAttachmentRepository } from "../repositories/phase-attachment-repository.js";
import { PhaseConversationRepository } from "../repositories/phase-conversation-repository.js";
import { PhaseRepository } from "../repositories/phase-repository.js";
import { ProjectConfigRepository } from "../repositories/project-config-repository.js";
import { ProjectRepository } from "../repositories/project-repository.js";
import { ChangesService } from "../services/changes-service.js";
import { IChangesService } from "../services/interfaces/changes-service-interface.js";
import { IPhaseConversationService } from "../services/interfaces/phase-conversation-service-interface.js";
import { IStatusService } from "../services/interfaces/status-service-interface.js";
import { PhaseConversationService } from "../services/phase-conversation-service.js";
import { StatusService } from "../services/status-service.js";


export class ChangesHandler
{
  private readonly changesService: IChangesService;
  
  constructor() {
    const dbFactory: IDbConnectionFactory = new BetterSqliteConnectionFactory();
    const uow: IUnitOfWork = new UnitOfWork(dbFactory);
    const cycleArtifactRepository: ICycleArtifactRepository = new CycleArtifactRepository(uow);
    const projectRepository: IProjectRepository = new ProjectRepository(uow);
    const projectConfigRepository: IProjectConfigRepository = new ProjectConfigRepository(uow);
    const cycleRepository: ICycleRepository = new CycleRepository(uow);
    const phaseRepository : IPhaseRepository = new PhaseRepository(uow);
    const changeSetRepository: IChangeSetRepository = new ChangeSetRepository(uow);
    const backlogRepository: IBacklogRepository = new BacklogRepository(uow);    
    const changeChunkRepository: IChangeChunkRepository = new ChangeChunkRepository(uow);
    const phaseAttachmentRepository: IPhaseAttachmentRepository = new PhaseAttachmentRepository(uow);
    const phaseConversationRepository: IPhaseConversationRepository = new PhaseConversationRepository(uow);

    const statusService: IStatusService = new StatusService(projectRepository, cycleRepository, changeSetRepository, cycleArtifactRepository, phaseRepository);
    const phaseConversationService: IPhaseConversationService = new PhaseConversationService(phaseConversationRepository, phaseAttachmentRepository, cycleArtifactRepository, changeSetRepository, changeChunkRepository, phaseRepository, backlogRepository);
       
    this.changesService = new ChangesService(phaseConversationService, statusService, projectRepository, projectConfigRepository, cycleRepository, phaseRepository, changeSetRepository, changeChunkRepository);
  }

  public executeApply(all:boolean): void {
        const resp = this.changesService.apply(all)
        console.log(resp);
  }    

  public executeDiscard(all:boolean): void {
        const resp = this.changesService.discard(all)
        console.log(resp);
  }    

  public executePending(all:boolean): void {
        const resp = this.changesService.pending(all)
        console.log(resp);
  }    
}
