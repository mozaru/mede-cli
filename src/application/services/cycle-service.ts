import type { IUnitOfWork } from "../../infrastructure/db/unit-of-work-interface.js";
import type { IFileSystemRepository } from "../../domain/interfaces/repositories/file-system-repository-interface.js";
import type { IProjectRepository } from "../../domain/interfaces/repositories/project-repository-interface.js";
import type { IProjectConfigRepository } from "../../domain/interfaces/repositories/project-config-repository-interface.js";
import type { ICycleRepository } from "../../domain/interfaces/repositories/cycle-repository-interface.js";
import type { IPhaseRepository } from "../../domain/interfaces/repositories/phase-repository-interface.js";
import type { ICycleArtifactRepository } from "../../domain/interfaces/repositories/cycle-artifact-repository-interface.js";
import type { IChangeSetRepository } from "../../domain/interfaces/repositories/change-set-repository-interface.js";
import type { IChangeChunkRepository } from "../../domain/interfaces/repositories/change-chunk-repository-interface.js";
import type { IPhaseAttachmentRepository } from "../../domain/interfaces/repositories/phase-attachment-repository-interface.js";
import type { IPhaseConversationRepository } from "../../domain/interfaces/repositories/phase-conversation-repository-interface.js";
import type { ProjectEntity } from "../../domain/entities/project-entity.js";
import type { ProjectConfigEntity } from "../../domain/entities/project-config-entity.js";
import { CycleEntity } from "../../domain/entities/cycle-entity.js";
import { PhaseEntity } from "../../domain/entities/phase-entity.js";
import { CycleArtifactEntity } from "../../domain/entities/cycle-artifact-entity.js";
import { FileSystemRepository } from "../../infrastructure/repositories/file-system-repository.js";
import { ICycleService } from "../../domain/interfaces/services/cycle-service-interface.js";
import { IProjectReconstructionService } from "../../domain/interfaces/services/project-reconstruction-service-interface.js";
import { IPhaseConversationService } from "../../domain/interfaces/services/phase-conversation-service-interface.js";
import { IStatusService } from "../../domain/interfaces/services/status-service-interface.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import { ListFilesOptionsEntity } from "../../domain/entities/list-files-options-entity.js";
import { parseMedeConfig } from "../../shared/mede-config-schema.js";
import { CycleResponseModel } from "../../domain/models/cycle.model.js";
import { I18n } from "../../shared/i18n.js";

export class CycleService implements ICycleService {
  private readonly uow: IUnitOfWork;
  private readonly projectRepository: IProjectRepository;
  private readonly projectConfigRepository: IProjectConfigRepository;
  private readonly cycleRepository: ICycleRepository;
  private readonly phaseRepository: IPhaseRepository;
  private readonly cycleArtifactRepository: ICycleArtifactRepository;
  private readonly changeSetRepository: IChangeSetRepository;
  private readonly changeChunkRepository: IChangeChunkRepository;
  private readonly phaseAttachmentRepository: IPhaseAttachmentRepository;
  private readonly phaseConversationRepository: IPhaseConversationRepository;
  private readonly docsService: IProjectReconstructionService;
  private readonly phaseConversationService: IPhaseConversationService;
  private readonly statusService: IStatusService;
  private readonly fileSystemRepository: IFileSystemRepository;

  constructor(
    uow: IUnitOfWork,
    docsService: IProjectReconstructionService,
    phaseConversationService: IPhaseConversationService,
    statusService: IStatusService,
    projectRepository: IProjectRepository,
    projectConfigRepository: IProjectConfigRepository,
    cycleRepository: ICycleRepository,
    phaseRepository: IPhaseRepository,
    cycleArtifactRepository: ICycleArtifactRepository,
    changeSetRepository: IChangeSetRepository,
    changeChunkRepository: IChangeChunkRepository,
    phaseAttachmentRepository: IPhaseAttachmentRepository,
    phaseConversationRepository: IPhaseConversationRepository,
    fileSystemRepository: IFileSystemRepository | null = null,
  ) {
    this.uow = uow;
    this.docsService = docsService;
    this.phaseConversationService = phaseConversationService;
    this.statusService = statusService;
    this.fileSystemRepository = fileSystemRepository ?? new FileSystemRepository();
    this.projectRepository = projectRepository;
    this.projectConfigRepository = projectConfigRepository;
    this.cycleRepository = cycleRepository;
    this.phaseRepository = phaseRepository;
    this.cycleArtifactRepository = cycleArtifactRepository;
    this.changeSetRepository = changeSetRepository;
    this.changeChunkRepository = changeChunkRepository;
    this.phaseAttachmentRepository = phaseAttachmentRepository;
    this.phaseConversationRepository = phaseConversationRepository;
  }

  // Runs a block of pure-DB writes inside a single SQLite transaction so that
  // multi-step cycle operations are all-or-nothing. Reentrant: if a transaction
  // is already open (e.g. begin() calling createBackupDocs()), it just joins the
  // outer transaction instead of opening/committing a nested one.
  private transactional<T>(work: () => T): T {
    if (this.uow.isTransactional) {
      return work();
    }

    this.uow.requireTransaction();

    try {
      const result = work();
      this.uow.commit();
      return result;
    } catch (error) {
      this.uow.rollback();
      throw error;
    }
  }

  public createBackupDocs(projectId: number, cycleId: number): void {
    const project = this.getProjectById(projectId);
    this.assertNotNull(project, "Projeto não encontrado");

    const configEntity = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(configEntity, "Configuração não encontrada");

    this.assertFalse(
      this.cycleArtifactRepository.existAnyByCycle(cycleId),
      "Backup already exist!",
    );

    const config = this.parseConfig(configEntity.content);
    const now = this.getCurrentDateTime();

    this.transactional(() => {
      this.insertBackupArtifact(
        cycleId,
        "initialUnderstanding",
        "FROZEN",
        this.fileSystemRepository.combinePath(
          config.docsRoot,
          config.fileNames.initialUnderstanding,
        ),
        now,
      );

      this.insertBackupArtifact(
        cycleId,
        "readme",
        "LIVE",
        this.fileSystemRepository.combinePath(config.docsRoot, config.fileNames.readme),
        now,
      );

      this.insertBackupArtifact(
        cycleId,
        "currentState",
        "LIVE",
        this.fileSystemRepository.combinePath(config.docsRoot, config.fileNames.currentState),
        now,
      );

      this.insertBackupArtifact(
        cycleId,
        "scopeAndVision",
        "LIVE",
        this.fileSystemRepository.combinePath(config.docsRoot, config.fileNames.scopeAndVision),
        now,
      );

      this.insertBackupArtifact(
        cycleId,
        "functionalRequirements",
        "LIVE",
        this.fileSystemRepository.combinePath(
          config.docsRoot,
          config.fileNames.functionalRequirements,
        ),
        now,
      );

      this.insertBackupArtifact(
        cycleId,
        "nonFunctionalRequirements",
        "LIVE",
        this.fileSystemRepository.combinePath(
          config.docsRoot,
          config.fileNames.nonFunctionalRequirements,
        ),
        now,
      );

      this.insertBackupArtifact(
        cycleId,
        "dataModel",
        "LIVE",
        this.fileSystemRepository.combinePath(config.docsRoot, config.fileNames.dataModel),
        now,
      );

      this.insertBackupArtifact(
        cycleId,
        "timeline",
        "LIVE",
        this.fileSystemRepository.combinePath(config.docsRoot, config.fileNames.timeline),
        now,
      );
    });
  }

  public restoreBackup(cycle: CycleEntity): void {
    for (const artifact of this.cycleArtifactRepository.list(cycle.id)) {
      if (artifact.canonicalType === "HISTORICAL") {
        if (this.fileSystemRepository.exists(artifact.artifactPath)) {
          this.fileSystemRepository.deleteFile(artifact.artifactPath);
        }
      } else if (artifact.canonicalType === "LIVE") {
        this.fileSystemRepository.writeFile(artifact.artifactPath, artifact.backupContent);
      }
    }
  }

  public clearCycle(cycle: CycleEntity): void {
    this.transactional(() => {
      for (const phase of this.phaseRepository.list(cycle.id)) {
        this.changeChunkRepository.deleteFromPhase(phase.id);
        this.changeSetRepository.deleteFromPhase(phase.id);
        this.phaseAttachmentRepository.deleteFromPhase(phase.id);
        this.phaseConversationRepository.deleteFromPhase(phase.id);
      }

      this.phaseRepository.deleteFromCycle(cycle.id);
      this.cycleArtifactRepository.deleteFromCycle(cycle.id);
      this.cycleRepository.delete(cycle.id);
    });
  }

  public beginInitialization(projectId: number): CycleResponseModel {
    const project = this.getProjectById(projectId);
    this.assertNotNull(project, "Projeto não encontrado");

    const configEntity = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(configEntity, "Configuração não encontrada");

    const config = this.parseConfig(configEntity.content);

    const currentCycle = this.cycleRepository.getCurrent(projectId);
    this.assertNull(currentCycle, "Já existe um ciclo em andamento.");

    const cycle = new CycleEntity();
    cycle.id = 0;
    cycle.projectId = project.id;
    cycle.status = "OPEN";
    cycle.currentPhaseIndex = 1;
    cycle.phaseCount = 2;
    cycle.autoMode = "NONE";
    cycle.startedAt = this.getCurrentDateTime();
    cycle.finishedAt = "";

    const readmeFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.fileNames.readme,
    );
    const initialUnderstandingFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.fileNames.initialUnderstanding,
    );

    return this.transactional(() => {
      const insertedCycle = this.cycleRepository.insert(cycle);

      const insertedPhase = this.insertPhase(
        insertedCycle.id,
        "GENERATE_README",
        1,
        [],
        readmeFileName,
        "LIVE",
        "readme",
      );

      this.insertPhase(
        insertedCycle.id,
        "GENERATE_INITIAL_UNDERSTANDING",
        2,
        [],
        initialUnderstandingFileName,
        "LIVE",
        "initialUnderstanding",
      );

      this.createBackupDocs(project.id, insertedCycle.id);

      return {
        cycle: insertedCycle,
        phase: insertedPhase,
      };
    });
  }

  public begin(projectId: number): CycleResponseModel {
    const project = this.getProjectById(projectId);
    this.assertNotNull(project, "Projeto não encontrado");

    const configEntity = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(configEntity, "Configuração não encontrada");

    const config = this.parseConfig(configEntity.content);

    const currentCycle = this.cycleRepository.getCurrent(project.id);
    this.assertNull(currentCycle, "Já existe um ciclo em andamento.");

    const dt = new Date();
    const dtStr = this.formatDate(dt);

    const ataDir = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.directories.meetingMinutes,
    );
    const ataOpts = new ListFilesOptionsEntity();
    ataOpts.extensions = [".md"];
    const ataPrefix = config.prefixes.meetingMinutes + "-";
    const existingAtas = this.fileSystemRepository
      .listFiles(ataDir, ataOpts)
      .filter((f) => this.fileSystemRepository.basename(f).startsWith(ataPrefix));
    const cycleNum = (existingAtas.length + 1).toString().padStart(3, "0");

    const ataFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.directories.meetingMinutes,
      `${config.prefixes.meetingMinutes}-${dtStr}-${cycleNum}.md`,
    );

    const adrFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.directories.architecturalDecisions,
      `${config.prefixes.architecturalDecisions}-${dtStr}-${cycleNum}.md`,
    );

    const esmFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.directories.systemMaintenanceSpecifications,
      `${config.prefixes.systemMaintenanceSpecifications}-${dtStr}-${cycleNum}.md`,
    );

    const legFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.directories.deliveryLog,
      `${config.prefixes.deliveryLog}-${dtStr}-${cycleNum}.md`,
    );

    const rmFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.fileNames.readme,
    );
    const rfFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.fileNames.functionalRequirements,
    );
    const nfFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.fileNames.nonFunctionalRequirements,
    );
    const dmFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.fileNames.dataModel,
    );
    const tlFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.fileNames.timeline,
    );
    const svFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.fileNames.scopeAndVision,
    );
    const csFileName = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.fileNames.currentState,
    );

    const cycle = new CycleEntity();
    cycle.id = 0;
    cycle.projectId = project.id;
    cycle.status = "OPEN";
    cycle.currentPhaseIndex = 1;
    cycle.phaseCount = 12;
    cycle.autoMode = "NONE";
    cycle.startedAt = this.getCurrentDateTime();
    cycle.finishedAt = "";

    return this.transactional(() => {
      const insertedCycle = this.cycleRepository.insert(cycle);

      this.createBackupDocs(project.id, insertedCycle.id);

      const firstPhase = this.insertPhase(
        insertedCycle.id,
        "EXTRACT_BACKLOG",
        1,
        [],
        csFileName,
        "LIVE",
        "extractBacklog",
      );

      this.insertPhase(
        insertedCycle.id,
        "GENERATE_MEETING",
        2,
        [csFileName],
        ataFileName,
        "HISTORICAL",
        "meeting",
      );

      this.insertPhase(
        insertedCycle.id,
        "GENERATE_ADR",
        3,
        [ataFileName],
        adrFileName,
        "HISTORICAL",
        "architecturalDecisions",
      );

      this.insertPhase(
        insertedCycle.id,
        "GENERATE_ESM",
        4,
        [ataFileName],
        esmFileName,
        "HISTORICAL",
        "systemMaintenanceSpecifications",
      );

      this.insertPhase(
        insertedCycle.id,
        "GENERATE_DELIVERY_LOG",
        5,
        [ataFileName, esmFileName],
        legFileName,
        "HISTORICAL",
        "deliveryLog",
      );

      this.insertPhase(
        insertedCycle.id,
        "UPDATE_FUNCTIONAL_REQUIREMENTS",
        6,
        [ataFileName, adrFileName],
        rfFileName,
        "LIVE",
        "functionalRequirements",
      );

      this.insertPhase(
        insertedCycle.id,
        "UPDATE_NON_FUNCTIONAL_REQUIREMENTS",
        7,
        [ataFileName, adrFileName],
        nfFileName,
        "LIVE",
        "nonFunctionalRequirements",
      );

      this.insertPhase(
        insertedCycle.id,
        "UPDATE_DATA_MODEL",
        8,
        [ataFileName, adrFileName, rfFileName, nfFileName],
        dmFileName,
        "LIVE",
        "dataModel",
      );

      this.insertPhase(
        insertedCycle.id,
        "UPDATE_TIMELINE",
        9,
        [ataFileName, adrFileName, esmFileName, rfFileName, nfFileName, dmFileName],
        tlFileName,
        "LIVE",
        "timeline",
      );

      this.insertPhase(
        insertedCycle.id,
        "UPDATE_SCOPE_AND_VISION",
        10,
        [ataFileName, adrFileName, rfFileName, nfFileName, dmFileName],
        svFileName,
        "LIVE",
        "scopeAndVision",
      );

      this.insertPhase(
        insertedCycle.id,
        "UPDATE_PROJECT_README",
        11,
        [ataFileName, adrFileName, svFileName],
        rmFileName,
        "LIVE",
        "readme",
      );

      this.insertPhase(
        insertedCycle.id,
        "UPDATE_CURRENT_STATE",
        12,
        [ataFileName, adrFileName, rfFileName, nfFileName, dmFileName, svFileName],
        csFileName,
        "LIVE",
        "currentState",
      );

      return {
        cycle: insertedCycle,
        phase: firstPhase,
      };
    });
  }

  public next(cycle: CycleEntity): CycleResponseModel {
    let currentIndex = cycle.currentPhaseIndex;

    if (cycle.currentPhaseIndex < cycle.phaseCount) {
      currentIndex = cycle.currentPhaseIndex + 1;
      this.cycleRepository.updatePhaseIndex(cycle.id, currentIndex);
    } else {
      this.cycleRepository.awaiting(cycle.id);
    }

    const updatedCycle = this.cycleRepository.getById(cycle.id);
    this.assertNotNull(updatedCycle, "Ciclo não encontrado após a transição");

    const phase = this.phaseRepository.getByIndex(updatedCycle.id, updatedCycle.currentPhaseIndex);

    return {
      cycle: updatedCycle,
      phase: phase ?? new PhaseEntity(),
    };
  }

  public async cycle(
    prompt: string = "",
    files: Array<string> = [],
    onProgress?: (msg: string) => void,
  ): Promise<string> {
    this.docsService.reconstruct();

    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const configEntity = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(configEntity, "Configuração não encontrada");

    const result = this.begin(project.id);
    const cycle = result.cycle;
    const phase = result.phase;

    const config = this.parseConfig(configEntity.content);

    if (prompt) {
      this.cycleArtifactRepository.insert({
        artifactPath: "",
        backupContent: "",
        canonicalName: "prompt",
        canonicalType: "info",
        currentContent: prompt,
        cycleId: cycle.id,
        id: 0,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    onProgress?.(`[LLM] Iniciando geração da primeira fase (${phase.name})...`);
    const changeSet = await this.phaseConversationService.sendMessage(
      project,
      config,
      phase,
      "",
      files,
    );
    onProgress?.(`[LLM] Geração da fase ${phase.name} concluída com sucesso.`);

    if (changeSet === null) {
      this.phaseRepository.empty(phase.id);
    } else {
      this.phaseRepository.nonEmpty(phase.id);
    }

    const refreshedPhase = this.phaseRepository.getById(phase.id) ?? phase;
    return this.statusService.generate(project, cycle, refreshedPhase, changeSet);
  }

  public async approve(all: boolean, onProgress?: (msg: string) => void): Promise<string> {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const configEntity = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(configEntity, "Configuração não encontrada");

    let cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");

    let phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
    this.assertNotNull(phase, "Fase não encontrada");

    const config = this.parseConfig(configEntity.content);

    let changeSet = this.changeSetRepository.getCurrent(phase.id);

    if (all) {
      this.assert(
        phase.status === "REFINING" || phase.status === "AWAITING_APPROVAL",
        "Status da fase inválido",
      );
      this.cycleRepository.approveAll(cycle.id);

      for (let i = cycle.currentPhaseIndex; i <= cycle.phaseCount; i += 1) {
        if (changeSet !== null && phase.status === "REFINING") {
          onProgress?.(`[Aplica] Aplicando alterações pendentes da fase ${phase.name}...`);
          this.phaseConversationService.applyAll(phase, changeSet);
        }

        onProgress?.(`[Aprova] Aprovando fase ${phase.name}...`);
        this.phaseRepository.approve(phase.id);

        const nextResult = this.next(cycle);
        cycle = nextResult.cycle;
        phase = nextResult.phase;

        if (cycle.status === "OPEN") {
          onProgress?.(`[LLM] Iniciando geração da fase ${phase.name}...`);
          changeSet = await this.phaseConversationService.sendMessage(
            project,
            config,
            phase,
            "",
            [],
          );
          onProgress?.(`[LLM] Geração da fase ${phase.name} concluída com sucesso.`);
        } else {
          changeSet = null;
        }
      }

      const finalPhase =
        cycle.status === "OPEN" ? (this.phaseRepository.getById(phase.id) ?? phase) : phase;

      return this.statusService.generate(project, cycle, finalPhase, changeSet);
    }

    this.assert(phase.status === "AWAITING_APPROVAL", "A fase não está aguardando aprovação");

    onProgress?.(`[Aprova] Aprovando fase ${phase.name}...`);
    this.phaseRepository.approve(phase.id);

    const nextResult = this.next(cycle);
    cycle = nextResult.cycle;
    phase = nextResult.phase;

    if (cycle.status === "OPEN") {
      onProgress?.(`[LLM] Iniciando geração da próxima fase (${phase.name})...`);
      changeSet = await this.phaseConversationService.sendMessage(project, config, phase, "", []);
      onProgress?.(`[LLM] Geração da fase ${phase.name} concluída com sucesso.`);
    } else {
      changeSet = null;
    }

    const finalPhase =
      cycle.status === "OPEN" ? (this.phaseRepository.getById(phase.id) ?? phase) : phase;

    return this.statusService.generate(project, cycle, finalPhase, changeSet);
  }

  public async reject(all: boolean): Promise<string> {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const configEntity = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(configEntity, "Configuração não encontrada");

    let cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");

    let phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
    this.assertNotNull(phase, "Fase não encontrada");

    const config = this.parseConfig(configEntity.content);

    let changeSet = this.changeSetRepository.getCurrent(phase.id);

    if (all) {
      this.assert(
        phase.status === "REFINING" || phase.status === "AWAITING_APPROVAL",
        "Status da fase inválido",
      );
      this.cycleRepository.rejectAll(cycle.id);

      for (let i = cycle.currentPhaseIndex; i <= cycle.phaseCount; i += 1) {
        if (changeSet !== null && phase.status === "REFINING") {
          this.phaseConversationService.discardAll(phase, changeSet);
        }

        this.phaseRepository.reject(phase.id);

        const nextResult = this.next(cycle);
        cycle = nextResult.cycle;
        phase = nextResult.phase;

        if (cycle.status === "OPEN") {
          changeSet = await this.phaseConversationService.sendMessage(
            project,
            config,
            phase,
            "",
            [],
          );
        } else {
          changeSet = null;
        }
      }

      const finalPhase =
        cycle.status === "OPEN" ? (this.phaseRepository.getById(phase.id) ?? phase) : phase;

      return this.statusService.generate(project, cycle, finalPhase, changeSet);
    }

    this.assert(phase.status === "AWAITING_APPROVAL", "A fase não está aguardando aprovação");

    this.phaseRepository.reject(phase.id);

    const nextResult = this.next(cycle);
    cycle = nextResult.cycle;
    phase = nextResult.phase;

    if (cycle.status === "OPEN") {
      changeSet = await this.phaseConversationService.sendMessage(project, config, phase, "", []);
    } else {
      changeSet = null;
    }

    const finalPhase =
      cycle.status === "OPEN" ? (this.phaseRepository.getById(phase.id) ?? phase) : phase;

    return this.statusService.generate(project, cycle, finalPhase, changeSet);
  }

  public async reset(): Promise<string> {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const configEntity = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(configEntity, "Configuração não encontrada");

    const cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");
    this.assertTrue(cycle.status === "OPEN", "O ciclo atual não está aberto");

    let phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
    this.assertNotNull(phase, "Fase não encontrada");

    const config = this.parseConfig(configEntity.content);

    this.changeChunkRepository.deleteFromPhase(phase.id);
    this.changeSetRepository.deleteFromPhase(phase.id);
    this.phaseAttachmentRepository.deleteFromPhase(phase.id);
    this.phaseConversationRepository.deleteFromPhase(phase.id);

    this.phaseRepository.reset(phase.id);

    phase = this.phaseRepository.getById(phase.id);
    this.assertNotNull(phase, "Fase não encontrada após o reset");

    for (const artifact of this.cycleArtifactRepository.list(cycle.id)) {
      if (artifact.artifactPath === phase.outputFile) {
        if (artifact.canonicalType === "LIVE") {
          this.fileSystemRepository.writeFile(artifact.artifactPath, artifact.backupContent);
        } else if (artifact.canonicalType === "HISTORICAL") {
          if (this.isEmpty(artifact.backupContent)) {
            if (this.fileSystemRepository.exists(artifact.artifactPath)) {
              this.fileSystemRepository.deleteFile(artifact.artifactPath);
            }
          } else {
            this.fileSystemRepository.writeFile(artifact.artifactPath, artifact.backupContent);
          }
        }

        this.cycleArtifactRepository.updateContent(artifact.id, artifact.backupContent);
      }
    }

    this.cycleRepository.updatePhaseIndex(cycle.id, cycle.currentPhaseIndex);

    const changeSet = await this.phaseConversationService.sendMessage(
      project,
      config,
      phase,
      "",
      [],
    );
    return this.statusService.generate(project, cycle, phase, changeSet);
  }

  public async refine(
    prompt: string = "",
    files: Array<string> = [],
    onProgress?: (msg: string) => void,
  ): Promise<string> {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const configEntity = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(configEntity, "Configuração não encontrada");

    const cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");
    this.assertTrue(cycle.status === "OPEN", "O ciclo atual não está aberto");

    const phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
    this.assertNotNull(phase, "Fase não encontrada");
    this.assert(phase.status === "AWAITING_APPROVAL", "A fase não está aguardando aprovação");

    const config = this.parseConfig(configEntity.content);
    onProgress?.(`[LLM] Solicitando refinamento para a fase ${phase.name}...`);
    const changeSet = await this.phaseConversationService.sendMessage(
      project,
      config,
      phase,
      prompt,
      files,
    );
    onProgress?.(`[LLM] Refinamento da fase ${phase.name} concluído com sucesso.`);

    if (changeSet === null) {
      this.phaseRepository.empty(phase.id);
    } else {
      this.phaseRepository.nonEmpty(phase.id);
    }

    const refreshedPhase = this.phaseRepository.getById(phase.id) ?? phase;
    return this.statusService.generate(project, cycle, refreshedPhase, changeSet);
  }

  public async retry(onProgress?: (msg: string) => void): Promise<string> {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const configEntity = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(configEntity, "Configuração não encontrada");

    const cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");
    this.assertTrue(cycle.status === "OPEN", "O ciclo atual não está aberto");

    let phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
    this.assertNotNull(phase, "Fase não encontrada");

    const config = this.parseConfig(configEntity.content);

    // Clean up existing data for this phase before retrying
    this.changeChunkRepository.deleteFromPhase(phase.id);
    this.changeSetRepository.deleteFromPhase(phase.id);
    this.phaseAttachmentRepository.deleteFromPhase(phase.id);
    this.phaseConversationRepository.deleteFromPhase(phase.id);

    this.phaseRepository.reset(phase.id);

    phase = this.phaseRepository.getById(phase.id) ?? phase;

    onProgress?.(`[LLM] Repetindo geração para a fase ${phase.name}...`);
    const changeSet = await this.phaseConversationService.sendMessage(
      project,
      config,
      phase,
      "",
      [],
    );
    onProgress?.(`[LLM] Geração da fase ${phase.name} concluída com sucesso.`);

    if (changeSet === null) {
      this.phaseRepository.empty(phase.id);
    } else {
      this.phaseRepository.nonEmpty(phase.id);
    }

    const refreshedPhase = this.phaseRepository.getById(phase.id) ?? phase;
    return this.statusService.generate(project, cycle, refreshedPhase, changeSet);
  }

  public commit(): string {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");
    this.assertTrue(cycle.status === "AWAITING_COMMIT", "O ciclo não está aguardando commit");

    this.clearCycle(cycle);
    cycle.status = "COMMITTED";

    return this.statusService.successCommit(project, cycle);
  }

  public rollback(): string {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");

    this.restoreBackup(cycle);
    this.clearCycle(cycle);
    cycle.status = "ROLLEDBACK";
    return this.statusService.successRollback(project, cycle);
  }

  private insertBackupArtifact(
    cycleId: number,
    canonicalName: string,
    canonicalType: string,
    artifactPath: string,
    currentDateTime: string,
  ): CycleArtifactEntity {
    const content = this.fileSystemRepository.exists(artifactPath)
      ? this.fileSystemRepository.readFile(artifactPath)
      : "";

    const artifact = new CycleArtifactEntity();
    artifact.id = 0;
    artifact.cycleId = cycleId;
    artifact.backupContent = content;
    artifact.currentContent = content;
    artifact.canonicalName = canonicalName;
    artifact.canonicalType = canonicalType;
    artifact.artifactPath = artifactPath;
    artifact.startedAt = currentDateTime;
    artifact.updatedAt = currentDateTime;

    return this.cycleArtifactRepository.insert(artifact);
  }

  private insertPhase(
    cycleId: number,
    name: string,
    index: number,
    inputFiles: string[],
    outputFile: string,
    docTypeOutput: string,
    promptName: string,
  ): PhaseEntity {
    const phase = new PhaseEntity();
    phase.id = 0;
    phase.cycleId = cycleId;
    phase.name = name;
    phase.index = index;
    phase.inputFiles = inputFiles;
    phase.outputFile = outputFile;
    phase.docTypeOutput = docTypeOutput;
    phase.promptName = promptName;
    phase.status = "REFINING";
    phase.proposalState = "NOT_GENERATED";
    phase.startedAt = this.getCurrentDateTime();
    phase.finishedAt = "";

    return this.phaseRepository.insert(phase);
  }

  private getCurrentProject(): ProjectEntity | null {
    const repository = this.projectRepository as IProjectRepository & {
      getCurrent?: () => ProjectEntity | null;
    };

    if (typeof repository.getCurrent === "function") {
      return repository.getCurrent();
    }

    const projects = this.projectRepository.list();

    if (projects.length === 0) {
      return null;
    }

    let currentProject = projects[0];

    for (const project of projects) {
      if (project.id > currentProject.id) {
        currentProject = project;
      }
    }

    return currentProject;
  }

  private getProjectById(projectId: number): ProjectEntity | null {
    const repository = this.projectRepository as IProjectRepository & {
      get?: (id: number) => ProjectEntity | null;
    };

    if (typeof repository.get === "function") {
      return repository.get(projectId);
    }

    return this.projectRepository.getById(projectId);
  }

  private getCurrentProjectConfig(projectId: number): ProjectConfigEntity | null {
    const repository = this.projectConfigRepository as IProjectConfigRepository & {
      get?: (projectId: number) => ProjectConfigEntity | null;
    };

    if (typeof repository.get === "function") {
      return repository.get(projectId);
    }

    return this.projectConfigRepository.getCurrent(projectId);
  }

  private parseConfig(content: string): MedeConfigModelEntity {
    const config = parseMedeConfig(content);
    I18n.setLanguage(config.language);
    return config;
  }

  private formatDate(date: Date): string {
    const year = `${date.getFullYear()}`;
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}${month}${day}`;
  }

  private getCurrentDateTime(): string {
    return new Date().toISOString();
  }

  private isEmpty(value: string | null | undefined): boolean {
    return value === null || value === undefined || value.trim() === "";
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(I18n.t(message));
    }
  }

  private assertTrue(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(I18n.t(message));
    }
  }

  private assertFalse(condition: boolean, message: string): void {
    if (condition) {
      throw new Error(I18n.t(message));
    }
  }

  private assertNull(value: unknown, message: string): void {
    if (value !== null) {
      throw new Error(I18n.t(message));
    }
  }

  private assertNotNull<T>(value: T | null, message: string): asserts value is T {
    if (value === null) {
      throw new Error(I18n.t(message));
    }
  }
}
