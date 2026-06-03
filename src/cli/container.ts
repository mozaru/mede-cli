import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../db/unit-of-work.js";

import { BacklogRepository } from "../repositories/backlog-repository.js";
import { BacklogInterventionCountersRepository } from "../repositories/backlog-intervention-counters-repository.js";
import { ChangeChunkRepository } from "../repositories/change-chunk-repository.js";
import { ChangeSetRepository } from "../repositories/change-set-repository.js";
import { CycleArtifactRepository } from "../repositories/cycle-artifact-repository.js";
import { CycleRepository } from "../repositories/cycle-repository.js";
import { PhaseAttachmentRepository } from "../repositories/phase-attachment-repository.js";
import { PhaseConversationRepository } from "../repositories/phase-conversation-repository.js";
import { PhaseRepository } from "../repositories/phase-repository.js";
import { ProjectConfigRepository } from "../repositories/project-config-repository.js";
import { ProjectRepository } from "../repositories/project-repository.js";

import { ChangesService } from "../services/changes-service.js";
import { ConfigService } from "../services/config-service.js";
import { CycleService } from "../services/cycle-service.js";
import { FilesService } from "../services/files-service.js";
import { InitService } from "../services/init-service.js";
import { LlmService } from "../services/llm-service.js";
import { PhaseConversationService } from "../services/phase-conversation-service.js";
import { ProjectReconstructionService } from "../services/project-reconstruction-service.js";
import { StatusService } from "../services/status-service.js";

import type { IChangesService } from "../services/interfaces/changes-service-interface.js";
import type { IConfigService } from "../services/interfaces/config-service-interface.js";
import type { ICycleService } from "../services/interfaces/cycle-service-interface.js";
import type { IFilesService } from "../services/interfaces/files-service-interface.js";
import type { IInitService } from "../services/interfaces/init-service-interface.js";
import type { ILlmService } from "../services/interfaces/llm-service-interface.js";
import type { IStatusService } from "../services/interfaces/status-service-interface.js";

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
}

export function createContainer(): Container {
  const uow = new UnitOfWork(new BetterSqliteConnectionFactory());

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

  const phaseConversationService = new PhaseConversationService(
    phaseConversationRepository,
    phaseAttachmentRepository,
    cycleArtifactRepository,
    changeSetRepository,
    changeChunkRepository,
    phaseRepository,
    backlogRepository,
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
  };
}
