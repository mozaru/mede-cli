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

const currentItems = (builder as any).normalizeBacklogItems(backlogRepo.list(projectId));
const previousState = stateParser.parse(previousStatePath);
const comparisons = (builder as any).compareAllWithPrevious(currentItems, previousState);

const newItems = comparisons.filter((c: any) => c.isNewInPeriod);
console.log("Total comparisons count:", comparisons.length);
console.log("isNewInPeriod count:", newItems.length);

if (newItems.length > 0) {
  console.log("Sample new item immutableId:", newItems[0].current.immutableId);
  const previousMap = (builder as any).indexByImmutableId(previousState.backlogItems);
  console.log("Key in previousMap?:", previousMap.has(newItems[0].current.immutableId));
  console.log("Keys in previousMap sample:", Array.from(previousMap.keys()).slice(0, 5));
}
