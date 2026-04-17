import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { IDbConnectionFactory } from "../db/db-connection-factory-interface.js";
import { IUnitOfWork } from "../db/unit-of-work-interface.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { ChangeSetRepository } from "../repositories/change-set-repository.js";
import { CycleArtifactRepository } from "../repositories/cycle-artifact-repository.js";
import { CycleRepository } from "../repositories/cycle-repository.js";
import { IChangeSetRepository } from "../repositories/interfaces/change-set-repository-interface.js";
import { ICycleArtifactRepository } from "../repositories/interfaces/cycle-artifact-repository-interface.js";
import { ICycleRepository } from "../repositories/interfaces/cycle-repository-interface.js";
import { IPhaseRepository } from "../repositories/interfaces/phase-repository-interface.js";
import { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import { PhaseRepository } from "../repositories/phase-repository.js";
import { ProjectRepository } from "../repositories/project-repository.js";
import { IStatusService } from "../services/interfaces/status-service-interface.js";
import { StatusService } from "../services/status-service.js";

export class StatusHandler {
  private readonly statusService: IStatusService;
  
  constructor() {
    const dbFactory: IDbConnectionFactory = new BetterSqliteConnectionFactory();
    const uow: IUnitOfWork = new UnitOfWork(dbFactory);
    const changeSetRepository: IChangeSetRepository = new ChangeSetRepository(uow);
    const cycleArtifactRepository: ICycleArtifactRepository = new CycleArtifactRepository(uow);
    const projectRepository: IProjectRepository = new ProjectRepository(uow);
    const cycleRepository: ICycleRepository = new CycleRepository(uow);
    const phaseRepository : IPhaseRepository = new PhaseRepository(uow);
    this.statusService = new StatusService(projectRepository, cycleRepository, changeSetRepository, cycleArtifactRepository, phaseRepository);
  }

  public execute(): void {
        const status = this.statusService.showStatus();
        console.log(status);
  }
}
