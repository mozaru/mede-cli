import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { IDbConnectionFactory } from "../db/db-connection-factory-interface.js";
import { IUnitOfWork } from "../db/unit-of-work-interface.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { CycleRepository } from "../repositories/cycle-repository.js";
import { ICycleRepository } from "../repositories/interfaces/cycle-repository-interface.js";
import { IProjectConfigRepository } from "../repositories/interfaces/project-config-repository-interface.js";
import { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import { ProjectConfigRepository } from "../repositories/project-config-repository.js";
import { ProjectRepository } from "../repositories/project-repository.js";
import { ConfigService } from "../services/config-service.js";
import { IConfigService } from "../services/interfaces/config-service-interface.js";


export class ConfigHandler {
  private readonly configService: IConfigService;
  
  constructor() {
    const dbFactory: IDbConnectionFactory = new BetterSqliteConnectionFactory();
    const uow: IUnitOfWork = new UnitOfWork(dbFactory);
    const projectRepository: IProjectRepository = new ProjectRepository(uow);
    const projectConfigRepository: IProjectConfigRepository = new ProjectConfigRepository(uow);
    const cycleRepository: ICycleRepository = new CycleRepository(uow);
    this.configService = new ConfigService(projectRepository, projectConfigRepository, cycleRepository);
  }

  public execute(): void {
        const resp = this.configService.getConfig();
        console.log(resp);
  }
  public executeInit(): void {
        this.configService.init();
        console.log("Successfully initialized config");
  }
  public executeApply(): void {
        this.configService.apply();
        console.log("Successfully updated config");
  }
}
