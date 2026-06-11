import { BetterSqliteConnectionFactory } from "../infrastructure/db/better-sqlite-connection-factory.js";
import type { BetterSqliteConnectionFactoryOptions } from "../infrastructure/db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../infrastructure/db/unit-of-work.js";

import { BacklogRepository } from "../infrastructure/repositories/backlog-repository.js";
import { BacklogInterventionCountersRepository } from "../infrastructure/repositories/backlog-intervention-counters-repository.js";
import { ChangeChunkRepository } from "../infrastructure/repositories/change-chunk-repository.js";
import { ChangeSetRepository } from "../infrastructure/repositories/change-set-repository.js";
import { CycleArtifactRepository } from "../infrastructure/repositories/cycle-artifact-repository.js";
import { CycleRepository } from "../infrastructure/repositories/cycle-repository.js";
import { PhaseAttachmentRepository } from "../infrastructure/repositories/phase-attachment-repository.js";
import { PhaseConversationRepository } from "../infrastructure/repositories/phase-conversation-repository.js";
import { PhaseRepository } from "../infrastructure/repositories/phase-repository.js";
import { ProjectConfigRepository } from "../infrastructure/repositories/project-config-repository.js";
import { ProjectRepository } from "../infrastructure/repositories/project-repository.js";

import { BacklogSyncService } from "../application/services/backlog-sync-service.js";
import { ChangesService } from "../application/services/changes-service.js";
import { ConfigService } from "../application/services/config-service.js";
import { CycleService } from "../application/services/cycle-service.js";
import { FilesService } from "../application/services/files-service.js";
import { InitService } from "../application/services/init-service.js";
import { LlmService } from "../application/services/llm-service.js";
import { PhaseConversationService } from "../application/services/phase-conversation-service.js";
import { ProjectReconstructionService } from "../application/services/project-reconstruction-service.js";
import { StatusService } from "../application/services/status-service.js";

import type { IChangesService } from "../domain/interfaces/services/changes-service-interface.js";
import type { IConfigService } from "../domain/interfaces/services/config-service-interface.js";
import type { ICycleService } from "../domain/interfaces/services/cycle-service-interface.js";
import type { IFilesService } from "../domain/interfaces/services/files-service-interface.js";
import type { IInitService } from "../domain/interfaces/services/init-service-interface.js";
import type { ILlmService } from "../domain/interfaces/services/llm-service-interface.js";
import type { IStatusService } from "../domain/interfaces/services/status-service-interface.js";

// Composition root: wires the unit of work, repositories and services exactly
// once. Handlers ask the container for the service they need instead of
// re-assembling the whole dependency graph each (which was duplicated across all
// seven handlers). Each call builds an independent graph with its own unit of
// work / connection — appropriate for a CLI that runs one command per process.
export interface Container {
  statusService: IStatusService;
  cycleService: ICycleService;
  initService: IInitService;
  changesService: IChangesService;
  configService: IConfigService;
  filesService: IFilesService;
  llmService: ILlmService;
  // Closes the underlying unit of work / SQLite connection. The one-shot CLI lets
  // the process exit instead of calling this; the interactive console disposes its
  // shared container when the session ends.
  dispose(): void;
}

export function createContainer(options?: BetterSqliteConnectionFactoryOptions): Container {
  const inMemory = options?.inMemory ?? (process.argv.includes("--in-memory") || process.env.MEDE_IN_MEMORY === "true");
  const uow = new UnitOfWork(new BetterSqliteConnectionFactory({ ...options, inMemory }));

  const projectRepository = new ProjectRepository(uow);
  const projectConfigRepository = new ProjectConfigRepository(uow);
  const cycleRepository = new CycleRepository(uow);
  const phaseRepository = new PhaseRepository(uow);
  const cycleArtifactRepository = new CycleArtifactRepository(uow);
  const changeSetRepository = new ChangeSetRepository(uow);
  const changeChunkRepository = new ChangeChunkRepository(uow);
  const phaseAttachmentRepository = new PhaseAttachmentRepository(uow);
  const phaseConversationRepository = new PhaseConversationRepository(uow);
  const backlogRepository = new BacklogRepository(uow);
  const backlogInterventionCountersRepository = new BacklogInterventionCountersRepository(uow);

  const projectReconstructionService = new ProjectReconstructionService(
    projectConfigRepository,
    projectRepository,
    backlogRepository,
    backlogInterventionCountersRepository,
  );

  const statusService = new StatusService(
    projectRepository,
    cycleRepository,
    changeSetRepository,
    cycleArtifactRepository,
    phaseRepository,
  );

  const backlogSyncService = new BacklogSyncService(
    backlogRepository,
    backlogInterventionCountersRepository,
  );

  const phaseConversationService = new PhaseConversationService(
    phaseConversationRepository,
    phaseAttachmentRepository,
    cycleArtifactRepository,
    changeSetRepository,
    changeChunkRepository,
    phaseRepository,
    backlogRepository,
    cycleRepository,
    null,
    null,
    backlogSyncService,
  );

  const cycleService = new CycleService(
    uow,
    projectReconstructionService,
    phaseConversationService,
    statusService,
    projectRepository,
    projectConfigRepository,
    cycleRepository,
    phaseRepository,
    cycleArtifactRepository,
    changeSetRepository,
    changeChunkRepository,
    phaseAttachmentRepository,
    phaseConversationRepository,
  );

  const initService = new InitService(
    projectReconstructionService,
    cycleService,
    phaseConversationService,
    statusService,
    projectConfigRepository,
    phaseRepository,
    cycleArtifactRepository,
  );

  const changesService = new ChangesService(
    phaseConversationService,
    statusService,
    projectRepository,
    projectConfigRepository,
    cycleRepository,
    phaseRepository,
    changeSetRepository,
    changeChunkRepository,
  );

  const configService = new ConfigService(
    projectRepository,
    projectConfigRepository,
    cycleRepository,
  );

  const filesService = new FilesService(
    projectRepository,
    projectConfigRepository,
    cycleRepository,
    cycleArtifactRepository,
  );

  const llmService = new LlmService(projectRepository, projectConfigRepository);

  return {
    statusService,
    cycleService,
    initService,
    changesService,
    configService,
    filesService,
    llmService,
    dispose: () => uow[Symbol.dispose](),
  };
}

// Interactive-console support: when a shared container is set, handlers reuse it
// (one long-lived SQLite connection for the whole session) instead of building a
// fresh graph per command. In one-shot mode no shared container is set, so each
// command keeps building its own — identical to the previous behavior.
let sharedContainer: Container | null = null;

export function setSharedContainer(container: Container): void {
  sharedContainer = container;
}

export function clearSharedContainer(): void {
  sharedContainer = null;
}

// The container a handler should use: the shared one if a session is active,
// otherwise a fresh, self-contained graph.
export function getContainer(): Container {
  return sharedContainer ?? createContainer();
}
