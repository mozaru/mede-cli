import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { IDbConnectionFactory } from "../db/db-connection-factory-interface.js";
import { IUnitOfWork } from "../db/unit-of-work-interface.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { CycleArtifactRepository } from "../repositories/cycle-artifact-repository.js";
import { CycleRepository } from "../repositories/cycle-repository.js";
import { ICycleArtifactRepository } from "../repositories/interfaces/cycle-artifact-repository-interface.js";
import { ICycleRepository } from "../repositories/interfaces/cycle-repository-interface.js";
import { IProjectConfigRepository } from "../repositories/interfaces/project-config-repository-interface.js";
import { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import { ProjectConfigRepository } from "../repositories/project-config-repository.js";
import { ProjectRepository } from "../repositories/project-repository.js";
import { FilesService } from "../services/files-service.js";
import { IFilesService } from "../services/interfaces/files-service-interface.js";

export class FilesHandler {
  private readonly filesService: IFilesService;
  
  constructor() {
    const dbFactory: IDbConnectionFactory = new BetterSqliteConnectionFactory();
    const uow: IUnitOfWork = new UnitOfWork(dbFactory);
    const cycleArtifactRepository: ICycleArtifactRepository = new CycleArtifactRepository(uow);
    const projectConfigRepository: IProjectConfigRepository = new ProjectConfigRepository(uow);
    const cycleRepository: ICycleRepository = new CycleRepository(uow);
    const projectRepository: IProjectRepository = new ProjectRepository(uow);
    
    this.filesService = new FilesService(projectRepository, projectConfigRepository, cycleRepository, cycleArtifactRepository);
  }

  public executeCat(file: string, backup: boolean): void {
        const resp = this.filesService.cat(file, backup);
        console.log(resp);
  }
  public executeList(backup: boolean): void {
        const resp = this.filesService.files(backup);
        console.log(resp);
  }
  public executeDiff(file: string): void {
        const resp = this.filesService.diff(file);
        console.log(resp);
  }
}
