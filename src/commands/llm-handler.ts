import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { IDbConnectionFactory } from "../db/db-connection-factory-interface.js";
import { IUnitOfWork } from "../db/unit-of-work-interface.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { IProjectConfigRepository } from "../repositories/interfaces/project-config-repository-interface.js";
import { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import { ProjectConfigRepository } from "../repositories/project-config-repository.js";
import { ProjectRepository } from "../repositories/project-repository.js";
import { ILlmService } from "../services/interfaces/llm-service-interface.js";
import { LlmService } from "../services/llm-service.js";


export class LlmHandler {
  private readonly llmService: ILlmService;
  
  constructor() {
    const dbFactory: IDbConnectionFactory = new BetterSqliteConnectionFactory();
    const uow: IUnitOfWork = new UnitOfWork(dbFactory);
    const projectRepository: IProjectRepository = new ProjectRepository(uow);
    const projectConfigRepository: IProjectConfigRepository = new ProjectConfigRepository(uow);
    this.llmService = new LlmService(projectRepository, projectConfigRepository);
  }

  public execute(): void {
        const resp = this.llmService.providers()
        console.log(resp);
  }
  public async executeTest(prompt:string): Promise<void> {
        const resp = await this.llmService.test(prompt);
        console.log(resp);
  }
}
