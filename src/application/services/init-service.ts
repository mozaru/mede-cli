import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import type { IProjectConfigRepository } from "../../domain/interfaces/repositories/project-config-repository-interface.js";
import type { IPhaseRepository } from "../../domain/interfaces/repositories/phase-repository-interface.js";
import type { IPhaseConversationService } from "../../domain/interfaces/services/phase-conversation-service-interface.js";
import type { IFileSystemRepository } from "../../domain/interfaces/repositories/file-system-repository-interface.js";
import { ICycleService } from "../../domain/interfaces/services/cycle-service-interface.js";
import { IProjectReconstructionService } from "../../domain/interfaces/services/project-reconstruction-service-interface.js";
import { IStatusService } from "../../domain/interfaces/services/status-service-interface.js";
import { IInitService } from "../../domain/interfaces/services/init-service-interface.js";
import { FileSystemRepository } from "../../infrastructure/repositories/file-system-repository.js";
import { ICycleArtifactRepository } from "../../domain/interfaces/repositories/cycle-artifact-repository-interface.js";
import { I18n } from "../../shared/i18n.js";


export class InitService implements IInitService {
  private readonly docsRepository: IProjectReconstructionService;
  private readonly projectConfigRepository: IProjectConfigRepository;
  private readonly phaseRepository: IPhaseRepository;
  private readonly fileSystemRepository: IFileSystemRepository;
  private readonly cycleService: ICycleService;
  private readonly phaseConversationService: IPhaseConversationService;
  private readonly statusService: IStatusService;
  private readonly cycleArtifactRepository: ICycleArtifactRepository;

  constructor(
    docsRepository: IProjectReconstructionService,
    cycleService: ICycleService,
    phaseConversationService: IPhaseConversationService,
    statusService: IStatusService,
    projectConfigRepository: IProjectConfigRepository,
    phaseRepository: IPhaseRepository,
    cycleArtifactRepository: ICycleArtifactRepository,
    fileSystemRepository: IFileSystemRepository | null = null,
  ) {
    this.docsRepository = docsRepository;
    this.projectConfigRepository = projectConfigRepository;
    this.phaseRepository = phaseRepository;
    this.cycleArtifactRepository = cycleArtifactRepository;
    this.fileSystemRepository = fileSystemRepository ?? new FileSystemRepository();
    this.cycleService = cycleService;
    this.phaseConversationService = phaseConversationService;
    this.statusService = statusService;
  }

  /**
   * Implementa:
   *
   * [msg:init/{prompt}{files}]
   *   project <- repository.docs.reconstructProject()
   *   config <- repository.projectConfig.getCurrent(project.id)
   *   r <- service.cycle.beginInitialization(project.id)
   *   cycle <- r.cycle
   *   phase <- r.phase
   *   ...
   *   changeSet <- service.phaseConversation.sendMessage(config, phase, prompt, files)
   *   if isnull(changeSet) then
   *      repository.phase.empty(phase.id)
   *   else
   *      repository.phase.nonEmpty(phase.id)
   *   endif
   *   success(service.status.generate(project,cycle,phase,changeSet))
   */
  public async init(prompt: string = "", files: string[] = []): Promise<string> {
    const projectResult = this.docsRepository.reconstruct();
    if (!projectResult) throw new Error(I18n.t("Projeto não reconstruído"));
    const project = projectResult.project;
    if (!project) throw new Error(I18n.t("Projeto não encontrado"));

    const resolvedConfig = this.projectConfigRepository.getCurrent(project.id);
    if (!resolvedConfig) throw new Error(I18n.t("Configuração não encontrada"));
    const config = JSON.parse(resolvedConfig?.content) as MedeConfigModelEntity;
    I18n.setLanguage(config.language);

    const result = this.cycleService.beginInitialization(project.id);
    const cycle = result.cycle;
    const phase = result.phase;

    this.fileSystemRepository.ensureDirectory(
      this.combinePath(config.docsRoot, config.directories.meetingMinutes),
    );
    this.fileSystemRepository.ensureDirectory(
      this.combinePath(config.docsRoot, config.directories.architecturalDecisions),
    );
    this.fileSystemRepository.ensureDirectory(
      this.combinePath(config.docsRoot, config.directories.systemMaintenanceSpecifications),
    );
    this.fileSystemRepository.ensureDirectory(
      this.combinePath(config.docsRoot, config.directories.deliveryLog),
    );

    this.fileSystemRepository.ensureFile(
      this.combinePath(config.docsRoot, config.fileNames.initialUnderstanding),
    );
    this.fileSystemRepository.ensureFile(
      this.combinePath(config.docsRoot, config.fileNames.readme),
    );
    this.fileSystemRepository.ensureFile(
      this.combinePath(config.docsRoot, config.fileNames.currentState),
    );
    this.fileSystemRepository.ensureFile(
      this.combinePath(config.docsRoot, config.fileNames.scopeAndVision),
    );
    this.fileSystemRepository.ensureFile(
      this.combinePath(config.docsRoot, config.fileNames.functionalRequirements),
    );
    this.fileSystemRepository.ensureFile(
      this.combinePath(config.docsRoot, config.fileNames.nonFunctionalRequirements),
    );
    this.fileSystemRepository.ensureFile(
      this.combinePath(config.docsRoot, config.fileNames.dataModel),
    );

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

    const changeSet = await this.phaseConversationService.sendMessage(
      project,
      config,
      phase,
      "",
      files,
    );

    if (changeSet === null || changeSet.changeChunkCount == 0) this.phaseRepository.empty(phase.id);
    else this.phaseRepository.nonEmpty(phase.id);

    const refreshedPhase = this.phaseRepository.getById(phase.id) ?? phase;

    return this.statusService.generate(project, cycle, refreshedPhase, changeSet);
  }

  private combinePath(basePath: string, suffixPath: string): string {
    const normalizedBase = basePath.replace(/[\\/]+$/, "");
    const normalizedSuffix = suffixPath.replace(/^[\\/]+/, "");

    return `${normalizedBase}/${normalizedSuffix}`;
  }
}
