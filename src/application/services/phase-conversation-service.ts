import type { PhaseEntity } from "../../domain/entities/phase-entity.js";
import { ChangeSetEntity } from "../../domain/entities/change-set-entity.js";
import { ChangeChunkEntity } from "../../domain/entities/change-chunk-entity.js";
import { CycleArtifactEntity } from "../../domain/entities/cycle-artifact-entity.js";
import { PhaseConversationEntity } from "../../domain/entities/phase-conversation-entity.js";
import { PhaseAttachmentEntity } from "../../domain/entities/phase-attachment-entity.js";
import { ChunkModelEntity } from "../../domain/entities/chunk-model-entity.js";
import { ListFilesOptionsEntity } from "../../domain/entities/list-files-options-entity.js";

import type { IFileSystemRepository } from "../../domain/interfaces/repositories/file-system-repository-interface.js";
import type { IPhaseConversationRepository } from "../../domain/interfaces/repositories/phase-conversation-repository-interface.js";
import type { IPhaseAttachmentRepository } from "../../domain/interfaces/repositories/phase-attachment-repository-interface.js";
import type { ICycleArtifactRepository } from "../../domain/interfaces/repositories/cycle-artifact-repository-interface.js";
import type { IChangeSetRepository } from "../../domain/interfaces/repositories/change-set-repository-interface.js";
import type { IChangeChunkRepository } from "../../domain/interfaces/repositories/change-chunk-repository-interface.js";
import type { IPhaseRepository } from "../../domain/interfaces/repositories/phase-repository-interface.js";
import type { ICycleRepository } from "../../domain/interfaces/repositories/cycle-repository-interface.js";

import { FileSystemRepository } from "../../infrastructure/repositories/file-system-repository.js";
import { LlmProviderFactory } from "../../infrastructure/llm/llm-provider-factory.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import * as Diff from "../../shared/diff.js";
import { validateDiffChunks } from "../../shared/diff-schema.js";
import { withRetry } from "../../shared/retry.js";
import { logger } from "../../shared/logger.js";
import * as LlmPrompts from "../../infrastructure/llm/llm-prompts-provider.js";
import { LlmRole } from "../../infrastructure/llm/llm-provider.interface.js";
import { IPhaseConversationService } from "../../domain/interfaces/services/phase-conversation-service-interface.js";
import { PromptPlaceholderBuilder } from "../../shared/prompt-place-holder-builder.js";
import { IBacklogRepository } from "../../domain/interfaces/repositories/backlog-repository-interface.js";
import { ProjectEntity } from "../../domain/entities/project-entity.js";
import { compressDocument } from "../../shared/placeholder-block-extractor.js";
import {
  ExtractBacklogResponseSchema,
  BacklogSyncService,
} from "./backlog-sync-service.js";
import {
  buildCompressionMap,
  transformDiffCoordinates,
} from "../../shared/diff-coordinate-transformer.js";
import { buildDeterministicContent } from "../../shared/deterministic-chunk-builder.js";
import { collapseDuplicateRootDocumentAppend } from "../../shared/markdown-document-normalizer.js";

export class PhaseConversationService implements IPhaseConversationService {
  private readonly fileSystemRepository: IFileSystemRepository;
  private readonly phaseConversationRepository: IPhaseConversationRepository;
  private readonly phaseAttachmentRepository: IPhaseAttachmentRepository;
  private readonly cycleArtifactRepository: ICycleArtifactRepository;
  private readonly changeSetRepository: IChangeSetRepository;
  private readonly changeChunkRepository: IChangeChunkRepository;
  private readonly phaseRepository: IPhaseRepository;
  private readonly cycleRepository: ICycleRepository | null;
  private readonly backlogSyncService: BacklogSyncService | null;
  private readonly applyDiff: Diff.ApplyFunction;
  private readonly promptPlaceholderBuilder: PromptPlaceholderBuilder;

  constructor(
    phaseConversationRepository: IPhaseConversationRepository,
    phaseAttachmentRepository: IPhaseAttachmentRepository,
    cycleArtifactRepository: ICycleArtifactRepository,
    changeSetRepository: IChangeSetRepository,
    changeChunkRepository: IChangeChunkRepository,
    phaseRepository: IPhaseRepository,
    backlogRepository: IBacklogRepository,
    cycleRepository: ICycleRepository | null = null,
    fileSystemRepository: IFileSystemRepository | null = null,
    applyDiff: Diff.ApplyFunction | null = null,
    backlogSyncService: BacklogSyncService | null = null,
  ) {
    this.phaseConversationRepository = phaseConversationRepository;
    this.phaseAttachmentRepository = phaseAttachmentRepository;
    this.cycleArtifactRepository = cycleArtifactRepository;
    this.changeSetRepository = changeSetRepository;
    this.changeChunkRepository = changeChunkRepository;
    this.phaseRepository = phaseRepository;
    this.cycleRepository = cycleRepository;
    this.backlogSyncService = backlogSyncService;

    this.fileSystemRepository = fileSystemRepository ?? new FileSystemRepository();
    this.applyDiff = applyDiff ?? Diff.applyDiff;

    this.promptPlaceholderBuilder = new PromptPlaceholderBuilder(backlogRepository);
  }

  public getSystemPrompt(config: MedeConfigModelEntity, promptName: string): string {
    switch (promptName) {
      case "meeting":
        return this.getConfigOrDefault(
          config.systemPrompts?.meeting,
          LlmPrompts.SYSTEM_PROMPT_MEETING,
        );

      case "architecturalDecisions":
        return this.getConfigOrDefault(
          config.systemPrompts?.architecturalDecisions,
          LlmPrompts.SYSTEM_PROMPT_ADR,
        );

      case "systemMaintenanceSpecifications":
        return this.getConfigOrDefault(
          config.systemPrompts?.systemMaintenanceSpecifications,
          LlmPrompts.SYSTEM_PROMPT_ESM,
        );

      case "deliveryLog":
        return this.getConfigOrDefault(
          config.systemPrompts?.deliveryLog,
          LlmPrompts.SYSTEM_PROMPT_DELIVERY_LOG,
        );

      case "functionalRequirements":
        return this.getConfigOrDefault(
          config.systemPrompts?.functionalRequirements,
          LlmPrompts.SYSTEM_PROMPT_FUNCTIONAL_REQUIREMENTS,
        );

      case "nonFunctionalRequirements":
        return this.getConfigOrDefault(
          config.systemPrompts?.nonFunctionalRequirements,
          LlmPrompts.SYSTEM_PROMPT_NON_FUNCTIONAL_REQUIREMENTS,
        );

      case "dataModel":
        return this.getConfigOrDefault(
          config.systemPrompts?.dataModel,
          LlmPrompts.SYSTEM_PROMPT_DATA_MODEL,
        );

      case "timeline":
        return this.getConfigOrDefault(
          config.systemPrompts?.timeline,
          LlmPrompts.SYSTEM_PROMPT_TIMELINE,
        );

      case "scopeAndVision":
        return this.getConfigOrDefault(
          config.systemPrompts?.scopeAndVision,
          LlmPrompts.SYSTEM_PROMPT_SCOPE_AND_VISION,
        );

      case "readme":
        return this.getConfigOrDefault(
          config.systemPrompts?.readme,
          LlmPrompts.SYSTEM_PROMPT_README,
        );

      case "currentState":
        return this.getConfigOrDefault(
          config.systemPrompts?.currentState,
          LlmPrompts.SYSTEM_PROMPT_CURRENT_STATE,
        );

      case "initialUnderstanding":
        return this.getConfigOrDefault(
          config.systemPrompts?.initialUnderstanding,
          LlmPrompts.SYSTEM_PROMPT_INITIAL_UNDERSTANDING,
        );

      case "extractBacklog":
        return LlmPrompts.SYSTEM_PROMPT_EXTRACT_BACKLOG;

      default:
        return "";
    }
  }

  public getPrompt(config: MedeConfigModelEntity, promptName: string): string {
    switch (promptName) {
      case "meeting":
        return this.getConfigOrDefault(config.prompts?.meeting, LlmPrompts.USER_PROMPT_MEETING);

      case "architecturalDecisions":
        return this.getConfigOrDefault(
          config.prompts?.architecturalDecisions,
          LlmPrompts.USER_PROMPT_ADR,
        );

      case "systemMaintenanceSpecifications":
        return this.getConfigOrDefault(
          config.prompts?.systemMaintenanceSpecifications,
          LlmPrompts.USER_PROMPT_ESM,
        );

      case "deliveryLog":
        return this.getConfigOrDefault(
          config.prompts?.deliveryLog,
          LlmPrompts.USER_PROMPT_DELIVERY_LOG,
        );

      case "functionalRequirements":
        return this.getConfigOrDefault(
          config.prompts?.functionalRequirements,
          LlmPrompts.USER_PROMPT_FUNCTIONAL_REQUIREMENTS,
        );

      case "nonFunctionalRequirements":
        return this.getConfigOrDefault(
          config.prompts?.nonFunctionalRequirements,
          LlmPrompts.USER_PROMPT_NON_FUNCTIONAL_REQUIREMENTS,
        );

      case "dataModel":
        return this.getConfigOrDefault(config.prompts?.dataModel, LlmPrompts.USER_PROMPT_DATA_MODEL);

      case "timeline":
        return this.getConfigOrDefault(config.prompts?.timeline, LlmPrompts.USER_PROMPT_TIMELINE);

      case "scopeAndVision":
        return this.getConfigOrDefault(
          config.prompts?.scopeAndVision,
          LlmPrompts.USER_PROMPT_SCOPE_AND_VISION,
        );

      case "readme":
        return this.getConfigOrDefault(config.prompts?.readme, LlmPrompts.USER_PROMPT_README);

      case "currentState":
        return this.getConfigOrDefault(
          config.prompts?.currentState,
          LlmPrompts.USER_PROMPT_CURRENT_STATE,
        );

      case "initialUnderstanding":
        return this.getConfigOrDefault(
          config.prompts?.initialUnderstanding,
          LlmPrompts.USER_PROMPT_INITIAL_UNDERSTANDING,
        );

      case "extractBacklog":
        return LlmPrompts.USER_PROMPT_EXTRACT_BACKLOG;

      default:
        return "";
    }
  }

  public async sendMessage(
    project: ProjectEntity,
    config: MedeConfigModelEntity,
    phase: PhaseEntity,
    customPrompt: string = "",
    attachments: string[] = [],
  ): Promise<ChangeSetEntity | null> {
    if (phase.promptName === "extractBacklog") {
      return this.sendExtractBacklogMessage(project, config, phase, customPrompt, attachments);
    }

    const previousCurrentStateFilePath = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.fileNames.currentState,
    );

    const cycleNumber = this.computeCycleNumber(config);
    const cycle = this.cycleRepository?.getById(phase.cycleId) ?? null;
    const referenceDate = cycle?.startedAt
      ? cycle.startedAt.split("T")[0]
      : new Date().toISOString().split("T")[0];

    const placeholders = this.promptPlaceholderBuilder.buildAll(
      project.id,
      previousCurrentStateFilePath,
      { config, cycleNumber, referenceDate },
    );

    const systemPrompt = this.promptPlaceholderBuilder.replacePlaceholders(
      this.getSystemPrompt(config, phase.promptName),
      placeholders,
    );
    const prompt = this.promptPlaceholderBuilder.replacePlaceholders(
      this.isEmpty(customPrompt) ? this.getPrompt(config, phase.promptName) : customPrompt,
      placeholders,
    );

    for (const filePath of attachments) {
      const content = this.fileSystemRepository.readFile(filePath);

      const attachment = new PhaseAttachmentEntity();
      attachment.id = 0;
      attachment.phaseId = phase.id;
      attachment.createdAt = this.getCurrentDateTime();
      attachment.actor = "user";
      attachment.filePath = filePath;
      attachment.fileName = filePath;
      attachment.content = content;
      attachment.contentText = content;

      this.phaseAttachmentRepository.insert(attachment);
    }

    const llm = LlmProviderFactory.create(config);
    llm.setSystemPrompt(systemPrompt);
    for (const message of this.phaseConversationRepository.list(phase.id))
      llm.addMessage(message.actor as LlmRole, message.content);

    for (const attachment of this.phaseAttachmentRepository.list(phase.id)) {
      llm.addAttachment(attachment.fileName, attachment.contentText);
    }

    for (const inputFile of phase.inputFiles) {
      const cycleArtifact = this.cycleArtifactRepository.getFromPath(phase.cycleId, inputFile);
      if (cycleArtifact != null) {
        llm.addInputDoc(cycleArtifact.id, cycleArtifact.artifactPath, cycleArtifact.currentContent);
      }
    }

    let info = "";
    for (const doc of this.cycleArtifactRepository.list(phase.cycleId)) {
      if (doc.canonicalType == "info") info = info + doc.currentContent;
    }
    llm.setExtraInfo(info);

    let cycleArtifactOutput = this.cycleArtifactRepository.getFromPath(
      phase.cycleId,
      phase.outputFile,
    );
    if (cycleArtifactOutput == null) {
      cycleArtifactOutput = this.cycleArtifactRepository.insert({
        id: 0,
        artifactPath: phase.outputFile,
        backupContent: "",
        currentContent: "",
        canonicalName: phase.outputFile,
        canonicalType: phase.docTypeOutput,
        cycleId: phase.cycleId,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const originalContent = cycleArtifactOutput.currentContent;
    const { compressedContent, blocks } = compressDocument(originalContent);
    const compressionMap = buildCompressionMap(blocks);

    llm.addOutputDoc(
      cycleArtifactOutput.id,
      cycleArtifactOutput.artifactPath,
      compressedContent,
    );

    llm.setUserPrompt(prompt);

    // Format validation is included in the retry so that a malformed diff from
    // the LLM triggers a new generation attempt, not just an immediate failure.
    const { rawText, chunks } = await withRetry(
      async () => {
        const r = await llm.generateText();
        return { rawText: r.rawText, chunks: validateDiffChunks(Diff.parseDiff(r.rawText)) };
      },
      {
        onRetry: (error, attempt, delayMs) =>
          logger.warn(
            `LLM falhou (tentativa ${attempt}); novo retry em ${delayMs}ms: ` +
              `${error instanceof Error ? error.message : String(error)}`,
          ),
      },
    );

    const userMessage = new PhaseConversationEntity();
    userMessage.id = 0;
    userMessage.phaseId = phase.id;
    userMessage.createdAt = this.getCurrentDateTime();
    userMessage.actor = "user";
    userMessage.content = prompt;
    this.phaseConversationRepository.insert(userMessage);

    const assistantMessage = new PhaseConversationEntity();
    assistantMessage.id = 0;
    assistantMessage.phaseId = phase.id;
    assistantMessage.createdAt = this.getCurrentDateTime();
    assistantMessage.actor = "assistant";
    assistantMessage.content = rawText;
    this.phaseConversationRepository.insert(assistantMessage);

    let cycleArtifact = this.cycleArtifactRepository.getFromPath(phase.cycleId, phase.outputFile);

    if (cycleArtifact === null) {
      const backupContent = this.fileSystemRepository.exists(phase.outputFile)
        ? this.fileSystemRepository.readFile(phase.outputFile)
        : "";

      const artifact = new CycleArtifactEntity();
      artifact.id = 0;
      artifact.cycleId = phase.cycleId;
      artifact.backupContent = backupContent;
      artifact.currentContent = "";
      artifact.canonicalName = "";
      artifact.canonicalType = phase.docTypeOutput;
      artifact.artifactPath = phase.outputFile;
      artifact.startedAt = this.getCurrentDateTime();
      artifact.updatedAt = this.getCurrentDateTime();

      cycleArtifact = this.cycleArtifactRepository.insert(artifact);
    }
    // Transform diff coordinates from compressed-doc space to original-doc space
    const transformedChunks = transformDiffCoordinates(chunks, compressionMap);

    // Apply transformed chunks in memory to obtain the document after LLM edits
    const docAfterLlm = this.applyChunksInMemory(originalContent, transformedChunks);

    const deterministicOptions = {
      projectId: project.id,
      config,
      cycleNumber,
      referenceDate,
      previousCurrentStateFilePath,
      startChunkIndex: transformedChunks.length + 1,
    };

    const contentAfterDeterministic = buildDeterministicContent(
      docAfterLlm,
      deterministicOptions,
      this.promptPlaceholderBuilder,
    );
    let finalContent =
      cycleArtifact.canonicalType === "LIVE"
        ? collapseDuplicateRootDocumentAppend(contentAfterDeterministic)
        : contentAfterDeterministic;
    if (phase.promptName === "currentState") {
      finalContent = this.replaceCurrentStateIndicators(
        finalContent,
        project.id,
        previousCurrentStateFilePath,
      );
    }
    const finalChunks = Diff.generateDiff(originalContent, finalContent);

    const changeSet = new ChangeSetEntity();
    changeSet.id = 0;
    changeSet.phaseId = phase.id;
    changeSet.cycleArtifactId = cycleArtifact.id;
    changeSet.fileName = cycleArtifact.artifactPath;
    changeSet.completed = false;
    changeSet.currentChangeChunkIndex = 1;
    changeSet.changeChunkCount = finalChunks.length;
    changeSet.startedAt = this.getCurrentDateTime();
    changeSet.updatedAt = this.getCurrentDateTime();
    const insertedChangeSet = this.changeSetRepository.insert(changeSet);

    for (const chunk of finalChunks) {
      const changeChunk = new ChangeChunkEntity();
      changeChunk.id = 0;
      changeChunk.phaseId = phase.id;
      changeChunk.changeSetId = insertedChangeSet.id;
      changeChunk.index = chunk.index;
      changeChunk.status = "AWAITING_APPROVAL";
      changeChunk.blockLocation = chunk.location;
      changeChunk.changeContent = chunk.content;
      changeChunk.startedAt = this.getCurrentDateTime();
      changeChunk.updatedAt = this.getCurrentDateTime();

      this.changeChunkRepository.insert(changeChunk);
    }

    await this.maybeFinalizeSlug(config, phase, cycleArtifact, insertedChangeSet, finalChunks);
    return this.changeSetRepository.getById(insertedChangeSet.id) ?? insertedChangeSet;
  }

  public async sendMessageWithoutPrompt(
    project: ProjectEntity,
    config: MedeConfigModelEntity,
    phase: PhaseEntity,
  ): Promise<ChangeSetEntity | null> {
    return await this.sendMessage(project, config, phase, "", []);
  }

  private async sendExtractBacklogMessage(
    project: ProjectEntity,
    config: MedeConfigModelEntity,
    phase: PhaseEntity,
    customPrompt: string,
    attachments: string[],
  ): Promise<ChangeSetEntity | null> {
    const previousCurrentStateFilePath = this.fileSystemRepository.combinePath(
      config.docsRoot,
      config.fileNames.currentState,
    );

    const cycleNumber = this.computeCycleNumber(config);
    const cycle = this.cycleRepository?.getById(phase.cycleId) ?? null;
    const referenceDate = cycle?.startedAt
      ? cycle.startedAt.split("T")[0]
      : new Date().toISOString().split("T")[0];

    const placeholders = this.promptPlaceholderBuilder.buildAll(
      project.id,
      previousCurrentStateFilePath,
      { config, cycleNumber, referenceDate },
    );

    const systemPrompt = this.promptPlaceholderBuilder.replacePlaceholders(
      this.getSystemPrompt(config, phase.promptName),
      placeholders,
    );
    const prompt = this.promptPlaceholderBuilder.replacePlaceholders(
      this.isEmpty(customPrompt) ? this.getPrompt(config, phase.promptName) : customPrompt,
      placeholders,
    );

    for (const filePath of attachments) {
      const content = this.fileSystemRepository.readFile(filePath);
      const attachment = new PhaseAttachmentEntity();
      attachment.id = 0;
      attachment.phaseId = phase.id;
      attachment.createdAt = this.getCurrentDateTime();
      attachment.actor = "user";
      attachment.filePath = filePath;
      attachment.fileName = filePath;
      attachment.content = content;
      attachment.contentText = content;
      this.phaseAttachmentRepository.insert(attachment);
    }

    const llm = LlmProviderFactory.create(config);
    llm.setSystemPrompt(systemPrompt);
    for (const message of this.phaseConversationRepository.list(phase.id))
      llm.addMessage(message.actor as LlmRole, message.content);
    for (const attachment of this.phaseAttachmentRepository.list(phase.id))
      llm.addAttachment(attachment.fileName, attachment.contentText);
    llm.setUserPrompt(prompt);

    const r = await llm.generateText();
    const rawText = r.rawText.trim();

    const userMessage = new PhaseConversationEntity();
    userMessage.id = 0;
    userMessage.phaseId = phase.id;
    userMessage.createdAt = this.getCurrentDateTime();
    userMessage.actor = "user";
    userMessage.content = prompt;
    this.phaseConversationRepository.insert(userMessage);

    const assistantMessage = new PhaseConversationEntity();
    assistantMessage.id = 0;
    assistantMessage.phaseId = phase.id;
    assistantMessage.createdAt = this.getCurrentDateTime();
    assistantMessage.actor = "assistant";
    assistantMessage.content = rawText;
    this.phaseConversationRepository.insert(assistantMessage);

    let parsed: ReturnType<typeof ExtractBacklogResponseSchema.parse>;
    try {
      parsed = ExtractBacklogResponseSchema.parse(JSON.parse(rawText));
    } catch (e) {
      logger.warn(`[EXTRACT_BACKLOG] JSON inválido do LLM: ${e instanceof Error ? e.message : String(e)}`);
      return null;
    }

    // Store raw JSON + metadata for later SQLite application on phase approval.
    this.cycleArtifactRepository.insert({
      id: 0,
      cycleId: phase.cycleId,
      canonicalName: "extractBacklogRaw",
      canonicalType: "info",
      artifactPath: "",
      backupContent: "",
      currentContent: JSON.stringify({ projectId: project.id, cycleNumber, referenceDate, response: parsed }),
      startedAt: this.getCurrentDateTime(),
      updatedAt: this.getCurrentDateTime(),
    });

    return null;
  }

  public applyExtractBacklog(phase: PhaseEntity): void {
    if (phase.promptName !== "extractBacklog" || !this.backlogSyncService) {
      return;
    }

    const rawArtifact = this.cycleArtifactRepository
      .list(phase.cycleId)
      .find((a) => a.canonicalName === "extractBacklogRaw");
    if (!rawArtifact) {
      return;
    }

    try {
      const meta = JSON.parse(rawArtifact.currentContent) as {
        projectId: number;
        cycleNumber: number;
        referenceDate: string;
        applied?: boolean;
        response: unknown;
      };
      if (meta.applied) {
        return;
      }

      const parsed = ExtractBacklogResponseSchema.parse(meta.response);
      this.backlogSyncService.applyExtraction(
        meta.projectId,
        meta.cycleNumber,
        meta.referenceDate,
        parsed,
      );
      this.cycleArtifactRepository.updateContent(
        rawArtifact.id,
        JSON.stringify({ ...meta, applied: true }),
      );
    } catch {
      logger.warn("[PhaseConversationService] Falha ao aplicar extração de backlog no SQLite.");
    }
  }

  public applyAll(phase: PhaseEntity, changeSet: ChangeSetEntity): ChangeSetEntity {
    this.assert(phase.status === "REFINING", "A fase não está em refinamento");
    const doc = this.cycleArtifactRepository.getById(changeSet.cycleArtifactId);
    this.assertNotNull(doc, "Artefato do ciclo não encontrado");

    let newContent = doc.currentContent;
    for (const chunk of this.changeChunkRepository.list(changeSet.id)) {
      if (
        chunk.status === "AWAITING_APPROVAL" &&
        chunk.index >= changeSet.currentChangeChunkIndex
      ) {
        const chunkModel = new ChunkModelEntity();
        chunkModel.index = chunk.index;
        chunkModel.location = chunk.blockLocation;

        const result = this.applyDiff(newContent, {
          ...chunkModel,
          offset: changeSet.currentOffset,
          content: chunk.changeContent,
        });
        changeSet.currentOffset += result.addedCount - result.removedCount;
        newContent = result.newContent;
        this.changeChunkRepository.approve(chunk.id);
      }
    }

    this.cycleArtifactRepository.updateContent(doc.id, newContent);

    // Don't create an empty HISTORICAL artifact on disk when the LLM produced no
    // changes (e.g. an ESM/ADR that genuinely has nothing to record this cycle).
    const isNewHistorical =
      doc.canonicalType === "HISTORICAL" && doc.backupContent.trim() === "";
    if (newContent.trim() !== "" || !isNewHistorical) {
      this.fileSystemRepository.writeFile(changeSet.fileName, newContent);
    }

    this.changeSetRepository.updateChunkIndex(
      changeSet.id,
      changeSet.changeChunkCount,
      changeSet.currentOffset,
    );
    this.changeSetRepository.updateComplete(changeSet.id);
    this.phaseRepository.awaitingApproval(phase.id);

    this.syncBacklogFromAppliedEsm(phase, newContent);

    const currentChangeSet = this.changeSetRepository.getById(changeSet.id);
    this.assertNotNull(currentChangeSet, "Change-set não encontrado após aplicar tudo");

    return currentChangeSet;
  }

  public apply(phase: PhaseEntity, changeSet: ChangeSetEntity): ChangeSetEntity | null {
    this.assert(phase.status === "REFINING", "A fase não está em refinamento");
    const chunk = this.changeChunkRepository.getByIndex(
      changeSet.id,
      changeSet.currentChangeChunkIndex,
    );
    this.assertNotNull(chunk, "Trecho-diff não encontrado");
    this.assert(chunk.status === "AWAITING_APPROVAL", "trecho-diff não está aguardando aprovação");

    const doc = this.cycleArtifactRepository.getById(changeSet.cycleArtifactId);
    this.assertNotNull(doc, "Artefato do ciclo não encontrado");

    const result = this.applyDiff(doc.currentContent, {
      index: chunk.index,
      location: chunk.blockLocation,
      content: chunk.changeContent,
      offset: changeSet.currentOffset,
    });
    changeSet.currentOffset += result.addedCount - result.removedCount;

    this.cycleArtifactRepository.updateContent(doc.id, result.newContent);
    this.changeChunkRepository.approve(chunk.id);

    if (changeSet.currentChangeChunkIndex >= changeSet.changeChunkCount) {
      this.changeSetRepository.updateChunkIndex(
        changeSet.id,
        changeSet.changeChunkCount,
        changeSet.currentOffset,
      );
      this.changeSetRepository.updateComplete(changeSet.id);
      this.phaseRepository.awaitingApproval(phase.id);
      this.syncBacklogFromAppliedEsm(phase, result.newContent);
    } else {
      this.changeSetRepository.updateChunkIndex(
        changeSet.id,
        changeSet.currentChangeChunkIndex + 1,
        changeSet.currentOffset,
      );
    }

    this.fileSystemRepository.writeFile(changeSet.fileName, result.newContent);
    return this.changeSetRepository.getCurrent(phase.id);
  }

  public discardAll(phase: PhaseEntity, changeSet: ChangeSetEntity): ChangeSetEntity {
    this.assert(phase.status === "REFINING", "A fase não está em refinamento");
    for (const chunk of this.changeChunkRepository.list(changeSet.id)) {
      if (
        chunk.status === "AWAITING_APPROVAL" &&
        chunk.index >= changeSet.currentChangeChunkIndex
      ) {
        this.changeChunkRepository.reject(chunk.id);
      }
    }

    this.changeSetRepository.updateChunkIndex(
      changeSet.id,
      changeSet.changeChunkCount,
      changeSet.currentOffset,
    );
    this.changeSetRepository.updateComplete(changeSet.id);
    this.phaseRepository.awaitingApproval(phase.id);

    const currentChangeSet = this.changeSetRepository.getById(changeSet.id);
    this.assertNotNull(currentChangeSet, "Change-set não encontrado após descartar tudo");

    return currentChangeSet;
  }

  public discard(phase: PhaseEntity, changeSet: ChangeSetEntity): ChangeSetEntity | null {
    this.assert(phase.status === "REFINING", "A fase não está em refinamento");
    const chunk = this.changeChunkRepository.getByIndex(
      changeSet.id,
      changeSet.currentChangeChunkIndex,
    );
    this.assertNotNull(chunk, "Trecho-diff não encontrado");
    this.assert(chunk.status === "AWAITING_APPROVAL", "trecho-diff não está aguardando aprovação");

    this.changeChunkRepository.reject(chunk.id);

    if (changeSet.currentChangeChunkIndex >= changeSet.changeChunkCount) {
      this.changeSetRepository.updateChunkIndex(
        changeSet.id,
        changeSet.changeChunkCount,
        changeSet.currentOffset,
      );
      this.changeSetRepository.updateComplete(changeSet.id);
      this.phaseRepository.awaitingApproval(phase.id);
    } else {
      this.changeSetRepository.updateChunkIndex(
        changeSet.id,
        changeSet.currentChangeChunkIndex + 1,
        changeSet.currentOffset,
      );
    }

    return this.changeSetRepository.getCurrent(phase.id);
  }

  private computeCycleNumber(config: MedeConfigModelEntity): number {
    try {
      const ataDir = this.fileSystemRepository.combinePath(
        config.docsRoot,
        config.directories?.meetingMinutes ?? "atas-de-reuniao",
      );
      if (!this.fileSystemRepository.exists(ataDir)) return 1;

      const opts = new ListFilesOptionsEntity();
      opts.recursive = false;
      opts.extensions = [".md"];

      const ataPrefix = config.prefixes?.meetingMinutes ?? "ata";
      const existingAtas = this.fileSystemRepository
        .listFiles(ataDir, opts)
        .filter((f) => this.fileSystemRepository.basename(f).startsWith(ataPrefix));

      return existingAtas.length + 1;
    } catch {
      return 1;
    }
  }

  private applyChunksInMemory(baseContent: string, chunks: Diff.ChunkModel[]): string {
    let content = baseContent;
    let offset = 0;
    for (const chunk of chunks) {
      const result = this.applyDiff(content, { ...chunk, offset });
      offset += result.addedCount - result.removedCount;
      content = result.newContent;
    }
    return content;
  }

  private syncBacklogFromAppliedEsm(phase: PhaseEntity, content: string): void {
    if (phase.promptName !== "systemMaintenanceSpecifications" || !this.backlogSyncService) {
      return;
    }

    const cycle = this.cycleRepository?.getById(phase.cycleId) ?? null;
    if (!cycle) {
      return;
    }

    this.backlogSyncService.applyEsmInterventions(cycle.projectId, content);
  }

  private replaceCurrentStateIndicators(
    content: string,
    projectId: number,
    previousCurrentStateFilePath: string,
  ): string {
    const indicators = this.promptPlaceholderBuilder.buildCurrentStateIndicatorsFromProject(
      projectId,
      previousCurrentStateFilePath,
    );
    const sectionRe =
      /## 2\. Indicadores Consolidados[\s\S]*?(?=\n### Situa[çc][ãa]o geral consolidada|\n---\n\n## 3\.|\n## 3\.)/i;

    if (sectionRe.test(content)) {
      return content.replace(sectionRe, indicators);
    }

    return content;
  }

  private normalizeSlug(raw: string): string {
    return raw
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)
      .replace(/-+$/, "");
  }

  private buildSluggedPath(currentPath: string, slug: string): string {
    const dir = this.fileSystemRepository.dirname(currentPath);
    const base = this.fileSystemRepository.basename(currentPath);
    const withoutExt = base.endsWith(".md") ? base.slice(0, -3) : base;
    return this.fileSystemRepository.combinePath(dir, `${withoutExt}-${slug}.md`);
  }

  private async generateSlug(config: MedeConfigModelEntity, content: string): Promise<string> {
    const DEFAULT_PROMPT =
      "Retorne APENAS uma descrição curta em kebab-case (máximo 40 caracteres, sem acentos, somente letras minúsculas e hífens) que resume o documento abaixo. Não inclua mais nada além da descrição.";
    const systemPrompt =
      config.shortDescriptionSlug?.prompt && config.shortDescriptionSlug.prompt.trim() !== ""
        ? config.shortDescriptionSlug.prompt
        : DEFAULT_PROMPT;
    const llm = LlmProviderFactory.create(config);
    llm.setSystemPrompt(systemPrompt);
    llm.setUserPrompt(content);
    const result = await llm.generateText();
    return this.normalizeSlug(result.rawText.trim());
  }

  private async maybeFinalizeSlug(
    config: MedeConfigModelEntity,
    phase: PhaseEntity,
    cycleArtifact: CycleArtifactEntity,
    insertedChangeSet: ChangeSetEntity,
    chunks: Diff.ChunkModel[],
  ): Promise<void> {
    const slugEnabled = config.shortDescriptionSlug?.enabled ?? true;
    if (!slugEnabled || cycleArtifact.canonicalType !== "HISTORICAL" || chunks.length === 0) {
      return;
    }
    const appliedContent = this.applyChunksInMemory(cycleArtifact.currentContent, chunks);
    if (appliedContent.trim() === "") {
      return;
    }
    let slug: string;
    try {
      slug = await this.generateSlug(config, appliedContent);
    } catch (err) {
      logger.warn(
        `Falha ao gerar slug para ${cycleArtifact.artifactPath}: ${err instanceof Error ? err.message : String(err)}. Usando nome provisório.`,
      );
      return;
    }
    if (!slug) {
      return;
    }
    const oldPath = cycleArtifact.artifactPath;
    const newPath = this.buildSluggedPath(oldPath, slug);
    this.phaseRepository.updateOutputFile(phase.id, newPath);
    this.cycleArtifactRepository.updateArtifactPath(cycleArtifact.id, newPath);
    this.changeSetRepository.updateFileName(insertedChangeSet.id, newPath);
    this.phaseRepository.updateInputFilePath(phase.cycleId, oldPath, newPath);
  }

  private getConfigOrDefault(value: string | undefined, fallback: string): string {
    return this.isEmpty(value ?? "") ? fallback : (value ?? "");
  }

  private isEmpty(value: string): boolean {
    return value.trim() === "";
  }

  private getCurrentDateTime(): string {
    return new Date().toISOString();
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  private assertNotNull<T>(value: T | null, message: string): asserts value is T {
    if (value === null) {
      throw new Error(message);
    }
  }
}
