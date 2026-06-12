import path from "node:path";
import { BetterSqliteConnectionFactory } from "../src/infrastructure/db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../src/infrastructure/db/unit-of-work.js";
import { BacklogRepository } from "../src/infrastructure/repositories/backlog-repository.js";
import { PromptPlaceholderBuilder } from "../src/shared/prompt-place-holder-builder.js";
import { CurrentStateParser } from "../src/shared/current-state-parser.js";
import { FileSystemRepository } from "../src/infrastructure/repositories/file-system-repository.js";

const projectRoot = "D:\\11Tech - Projetos\\Produtos\\11publish";
const factory = new BetterSqliteConnectionFactory({
  projectRootPath: projectRoot,
});
const uow = new UnitOfWork(factory);
const backlogRepo = new BacklogRepository(uow);
const fsRepo = new FileSystemRepository();
const stateParser = new CurrentStateParser(fsRepo);

const builder = new PromptPlaceholderBuilder(backlogRepo, stateParser);

const projectId = 1;
const previousStatePath = path.join(projectRoot, "docs", "situacao-atual.md");

console.log("--- TABELA_ENTREGUES ---");
console.log(builder.buildEntreguesTableFromProject(projectId));

console.log("--- TABELA_NOVOS_CICLO ---");
console.log(builder.buildNovosCicloTableFromProject(projectId, previousStatePath));
