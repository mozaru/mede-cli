import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { IDbConnectionFactory } from "../db/db-connection-factory-interface.js";
import { IUnitOfWork } from "../db/unit-of-work-interface.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { BacklogInterventionCountersRepository } from "../repositories/backlog-intervention-counters-repository.js";
import { BacklogRepository } from "../repositories/backlog-repository.js";
import { ChangeChunkRepository } from "../repositories/change-chunk-repository.js";
import { ChangeSetRepository } from "../repositories/change-set-repository.js";
import { CycleArtifactRepository } from "../repositories/cycle-artifact-repository.js";
import { CycleRepository } from "../repositories/cycle-repository.js";
import { IBacklogInterventionCountersRepository } from "../repositories/interfaces/backlog-intervention-counters-repository-interface.js";
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
import { CycleService } from "../services/cycle-service.js";
import { ICycleService } from "../services/interfaces/cycle-service-interface.js";
import { IPhaseConversationService } from "../services/interfaces/phase-conversation-service-interface.js";
import { IProjectReconstructionService } from "../services/interfaces/project-reconstruction-service-interface.js";
import { IStatusService } from "../services/interfaces/status-service-interface.js";
import { PhaseConversationService } from "../services/phase-conversation-service.js";
import { ProjectReconstructionService } from "../services/project-reconstruction-service.js";
import { StatusService } from "../services/status-service.js";


export class CycleHandler
{
  private readonly cycleService: ICycleService;
  
  constructor() {
    const dbFactory: IDbConnectionFactory = new BetterSqliteConnectionFactory();
    const uow: IUnitOfWork = new UnitOfWork(dbFactory);
    const cycleArtifactRepository: ICycleArtifactRepository = new CycleArtifactRepository(uow);
    const projectConfigRepository: IProjectConfigRepository = new ProjectConfigRepository(uow);
    const cycleRepository: ICycleRepository = new CycleRepository(uow);
    const phaseRepository : IPhaseRepository = new PhaseRepository(uow);
    const changeSetRepository: IChangeSetRepository = new ChangeSetRepository(uow);
    const projectRepository: IProjectRepository = new ProjectRepository(uow);
    const backlogRepository : IBacklogRepository = new BacklogRepository(uow);
    const backlogInterventionCountersRepository: IBacklogInterventionCountersRepository = new BacklogInterventionCountersRepository(uow);
    const changeChunkRepository: IChangeChunkRepository = new ChangeChunkRepository(uow);
    const phaseAttachmentRepository: IPhaseAttachmentRepository = new PhaseAttachmentRepository(uow);
    const phaseConversationRepository: IPhaseConversationRepository = new PhaseConversationRepository(uow);

    const projectReconstructionService: IProjectReconstructionService = new ProjectReconstructionService(projectConfigRepository, projectRepository, backlogRepository, backlogInterventionCountersRepository);
    const statusService: IStatusService = new StatusService(projectRepository, cycleRepository, changeSetRepository, cycleArtifactRepository, phaseRepository);
    const phaseConversationService: IPhaseConversationService = new PhaseConversationService(phaseConversationRepository, phaseAttachmentRepository, cycleArtifactRepository, changeSetRepository, changeChunkRepository, phaseRepository, backlogRepository);

    this.cycleService = new CycleService(projectReconstructionService, phaseConversationService, statusService, projectRepository, projectConfigRepository, cycleRepository, phaseRepository, cycleArtifactRepository, changeSetRepository, changeChunkRepository, phaseAttachmentRepository, phaseConversationRepository);
    
  }

  public async executeCycle(prompt: string, files:Array<string>): Promise<void> {
        const resp = await this.cycleService.cycle(prompt, files);
        console.log(resp);
  }

  public async executeApprove(all:boolean): Promise<void> {
        const resp = await this.cycleService.approve(all)
        console.log(resp);
  }    

  public async executeReject(all:boolean): Promise<void> {
        const resp = await this.cycleService.reject(all)
        console.log(resp);
  }    

  public async executeReset(): Promise<void> {
        const resp = await this.cycleService.reset()
        console.log(resp);
  }    

  public async executeRetry(): Promise<void> {
        const resp = await this.cycleService.retry()
        console.log(resp);
  }    

  public async executeRefine(prompt: string, files:Array<string>): Promise<void> {
        const resp = await this.cycleService.refine(prompt, files)
        console.log(resp);
  }    

  public executeCommit(): void {
        const resp = this.cycleService.commit()
        console.log(resp);
  }    
  public executeRollback(): void {
        const resp = this.cycleService.rollback()
        console.log(resp);
  }    
}
