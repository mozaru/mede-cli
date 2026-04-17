import type { PhaseEntity } from "../entities/phase-entity.js";
import { ChangeSetEntity } from "../entities/change-set-entity.js";
import { ChangeChunkEntity } from "../entities/change-chunk-entity.js";
import { CycleArtifactEntity } from "../entities/cycle-artifact-entity.js";
import { PhaseConversationEntity } from "../entities/phase-conversation-entity.js";
import { PhaseAttachmentEntity } from "../entities/phase-attachment-entity.js";
import { ChunkModelEntity } from "../entities/chunk-model-entity.js";

import type { IFileSystemRepository } from "../repositories/interfaces/file-system-repository-interface.js";
import type { IPhaseConversationRepository } from "../repositories/interfaces/phase-conversation-repository-interface.js";
import type { IPhaseAttachmentRepository } from "../repositories/interfaces/phase-attachment-repository-interface.js";
import type { ICycleArtifactRepository } from "../repositories/interfaces/cycle-artifact-repository-interface.js";
import type { IChangeSetRepository } from "../repositories/interfaces/change-set-repository-interface.js";
import type { IChangeChunkRepository } from "../repositories/interfaces/change-chunk-repository-interface.js";
import type { IPhaseRepository } from "../repositories/interfaces/phase-repository-interface.js";

import { FileSystemRepository } from "../repositories/file-system-repository.js";
import { LlmProviderFactory } from "../shared/llm/llm-provider-factory.js";
import { MedeConfigModelEntity } from "../entities/mede-config-model-entity.js";
import * as Diff from "../shared/diff.js";
import * as LlmPrompts from "../shared/llm/llm-prompts-provider.js";
import { LlmRole } from "../shared/llm/llm-provider.interface.js";
import { IPhaseConversationService } from "./interfaces/phase-conversation-service-interface.js";
import { PromptPlaceholderBuilder } from "../shared/prompt-place-holder-builder.js";
import { IBacklogRepository } from "../repositories/interfaces/backlog-repository-interface.js";
import { ProjectEntity } from "../entities/project-entity.js";
import { date } from "zod";

export class PhaseConversationService implements IPhaseConversationService 
{
    private readonly fileSystemRepository: IFileSystemRepository;
    private readonly phaseConversationRepository: IPhaseConversationRepository;
    private readonly phaseAttachmentRepository: IPhaseAttachmentRepository;
    private readonly cycleArtifactRepository: ICycleArtifactRepository;
    private readonly changeSetRepository: IChangeSetRepository;
    private readonly changeChunkRepository: IChangeChunkRepository;
    private readonly phaseRepository: IPhaseRepository;
    private readonly applyDiff : Diff.ApplyFunction;
    private readonly promptPlaceholderBuilder : PromptPlaceholderBuilder;

    constructor(
        phaseConversationRepository: IPhaseConversationRepository,
        phaseAttachmentRepository: IPhaseAttachmentRepository,
        cycleArtifactRepository: ICycleArtifactRepository,
        changeSetRepository: IChangeSetRepository,
        changeChunkRepository: IChangeChunkRepository,
        phaseRepository: IPhaseRepository,
        backlogRepository: IBacklogRepository,
        fileSystemRepository: IFileSystemRepository | null = null,
        applyDiff: Diff.ApplyFunction | null = null,        
    )
    {
        this.phaseConversationRepository = phaseConversationRepository;
        this.phaseAttachmentRepository = phaseAttachmentRepository;
        this.cycleArtifactRepository = cycleArtifactRepository;
        this.changeSetRepository = changeSetRepository;
        this.changeChunkRepository = changeChunkRepository;
        this.phaseRepository = phaseRepository;

        this.fileSystemRepository = fileSystemRepository ?? new FileSystemRepository();
        this.applyDiff = applyDiff ?? Diff.applyDiff ;


        this.promptPlaceholderBuilder = new PromptPlaceholderBuilder(backlogRepository);
    }

    public getSystemPrompt(
        config: MedeConfigModelEntity,
        promptName: string
    ): string
    {
        switch (promptName)
        {
            case "meeting":
                return this.getConfigOrDefault(
                    config.systemPrompts.meeting,
                    LlmPrompts.SYSTEM_PROMPT_MEETING
                );

            case "architecturalDecisions":
                return this.getConfigOrDefault(
                    config.systemPrompts.architecturalDecisions,
                    LlmPrompts.SYSTEM_PROMPT_ADR
                );

            case "systemMaintenanceSpecifications":
                return this.getConfigOrDefault(
                    config.systemPrompts.systemMaintenanceSpecifications,
                    LlmPrompts.SYSTEM_PROMPT_ESM
                );

            case "deliveryLog":
                return this.getConfigOrDefault(
                    config.systemPrompts.deliveryLog,
                    LlmPrompts.SYSTEM_PROMPT_DELIVERY_LOG
                );

            case "functionalRequirements":
                return this.getConfigOrDefault(
                    config.systemPrompts.functionalRequirements,
                    LlmPrompts.SYSTEM_PROMPT_FUNCTIONAL_REQUIREMENTS
                );

            case "nonFunctionalRequirements":
                return this.getConfigOrDefault(
                    config.systemPrompts.nonFunctionalRequirements,
                    LlmPrompts.SYSTEM_PROMPT_NON_FUNCTIONAL_REQUIREMENTS
                );

            case "dataModel":
                return this.getConfigOrDefault(
                    config.systemPrompts.dataModel,
                    LlmPrompts.SYSTEM_PROMPT_DATA_MODEL
                );

            case "timeline":
                return this.getConfigOrDefault(
                    config.systemPrompts.timeline,
                    LlmPrompts.SYSTEM_PROMPT_TIMELINE
                );

            case "scopeAndVision":
                return this.getConfigOrDefault(
                    config.systemPrompts.scopeAndVision,
                    LlmPrompts.SYSTEM_PROMPT_SCOPE_AND_VISION
                );

            case "readme":
                return this.getConfigOrDefault(
                    config.systemPrompts.readme,
                    LlmPrompts.SYSTEM_PROMPT_README
                );

            case "currentState":
                return this.getConfigOrDefault(
                    config.systemPrompts.currentState,
                    LlmPrompts.SYSTEM_PROMPT_CURRENT_STATE
                );

            case "initialUnderstanding":
                return this.getConfigOrDefault(
                    config.systemPrompts.initialUnderstanding,
                    LlmPrompts.SYSTEM_PROMPT_INITIAL_UNDERSTANDING
                );

            default:
                return "";
        }
    }

    public getPrompt(
        config: MedeConfigModelEntity,
        promptName: string
    ): string
    {
        switch (promptName)
        {
            case "meeting":
                return this.getConfigOrDefault(
                    config.prompts.meeting,
                    LlmPrompts.USER_PROMPT_MEETING
                );

            case "architecturalDecisions":
                return this.getConfigOrDefault(
                    config.prompts.architecturalDecisions,
                    LlmPrompts.USER_PROMPT_ADR
                );

            case "systemMaintenanceSpecifications":
                return this.getConfigOrDefault(
                    config.prompts.systemMaintenanceSpecifications,
                    LlmPrompts.USER_PROMPT_ESM
                );

            case "deliveryLog":
                return this.getConfigOrDefault(
                    config.prompts.deliveryLog,
                    LlmPrompts.USER_PROMPT_DELIVERY_LOG
                );

            case "functionalRequirements":
                return this.getConfigOrDefault(
                    config.prompts.functionalRequirements,
                    LlmPrompts.USER_PROMPT_FUNCTIONAL_REQUIREMENTS
                );

            case "nonFunctionalRequirements":
                return this.getConfigOrDefault(
                    config.prompts.nonFunctionalRequirements,
                    LlmPrompts.USER_PROMPT_NON_FUNCTIONAL_REQUIREMENTS
                );

            case "dataModel":
                return this.getConfigOrDefault(
                    config.prompts.dataModel,
                    LlmPrompts.USER_PROMPT_DATA_MODEL
                );

            case "timeline":
                return this.getConfigOrDefault(
                    config.prompts.timeline,
                    LlmPrompts.USER_PROMPT_TIMELINE
                );

            case "scopeAndVision":
                return this.getConfigOrDefault(
                    config.prompts.scopeAndVision,
                    LlmPrompts.USER_PROMPT_SCOPE_AND_VISION
                );

            case "readme":
                return this.getConfigOrDefault(
                    config.prompts.readme,
                    LlmPrompts.USER_PROMPT_README
                );

            case "currentState":
                return this.getConfigOrDefault(
                    config.prompts.currentState,
                    LlmPrompts.USER_PROMPT_CURRENT_STATE
                );

            case "initialUnderstanding":
                return this.getConfigOrDefault(
                    config.prompts.initialUnderstanding,
                    LlmPrompts.USER_PROMPT_INITIAL_UNDERSTANDING
                );

            default:
                return "";
        }
    }

    public async sendMessage(
        project: ProjectEntity,
        config: MedeConfigModelEntity,
        phase: PhaseEntity,
        customPrompt: string = "",
        attachments: string[] = []
    ): Promise<ChangeSetEntity | null>
    {
        const previousCurrentStateFilePath = this.fileSystemRepository.combinePath(config.docsRoot, config.fileNames.currentState);
        const placeholders = this.promptPlaceholderBuilder.buildAll(project.id, previousCurrentStateFilePath);

        const systemPrompt = this.promptPlaceholderBuilder.replacePlaceholders(this.getSystemPrompt(config, phase.promptName), placeholders);
        const prompt = this.promptPlaceholderBuilder.replacePlaceholders(this.isEmpty(customPrompt) ? this.getPrompt(config, phase.promptName) : customPrompt, placeholders);

        for (const filePath of attachments)
        {
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
        {
                llm.addAttachment(attachment.fileName, attachment.contentText);
        }

        for (const inputFile of phase.inputFiles)
        {
            const cycleArtifact = this.cycleArtifactRepository.getFromPath(phase.cycleId, inputFile);
            if (cycleArtifact != null)
            {
                llm.addInputDoc(cycleArtifact.id, cycleArtifact.artifactPath, cycleArtifact.currentContent)
            }
        }

        let info="";
        for (const doc of this.cycleArtifactRepository.list(phase.cycleId))
        {
            if (doc.canonicalType=="info")
                info = info+doc.currentContent;
        }
        llm.setExtraInfo(info);
        
        let cycleArtifactOutput = this.cycleArtifactRepository.getFromPath(phase.cycleId, phase.outputFile);
        if (cycleArtifactOutput != null)
        {
            llm.addOutputDoc(cycleArtifactOutput.id, cycleArtifactOutput.artifactPath, cycleArtifactOutput.currentContent)
        }
        else
        {
            cycleArtifactOutput = this.cycleArtifactRepository.insert({
                id:0,
                artifactPath:phase.outputFile,
                backupContent:"",
                currentContent:"",
                canonicalName:phase.outputFile,
                canonicalType:phase.docTypeOutput,
                cycleId: phase.cycleId,
                startedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            llm.addOutputDoc(cycleArtifactOutput.id, cycleArtifactOutput.artifactPath, cycleArtifactOutput.currentContent)
        }

        llm.setUserPrompt(prompt);

        const response = await llm.generateText();

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
        assistantMessage.content = response.rawText;
        this.phaseConversationRepository.insert(assistantMessage);

        let cycleArtifact =
            this.cycleArtifactRepository.getFromPath(phase.cycleId, phase.outputFile);

        if (cycleArtifact === null)
        {
            const backupContent =
                this.fileSystemRepository.exists(phase.outputFile)
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
        const chunks : Array<Diff.ChunkModel> = this.parseTextToDiff(response.rawText);        
        const changeSet = new ChangeSetEntity();
        changeSet.id = 0;
        changeSet.phaseId = phase.id;
        changeSet.cycleArtifactId = cycleArtifact.id;
        changeSet.fileName = cycleArtifact.artifactPath;
        changeSet.completed = false;
        changeSet.currentChangeChunkIndex = 1;
        changeSet.changeChunkCount = chunks.length;
        changeSet.startedAt = this.getCurrentDateTime();
        changeSet.updatedAt = this.getCurrentDateTime();
        const insertedChangeSet = this.changeSetRepository.insert(changeSet);

        for (const chunk of chunks)
        {
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

        return insertedChangeSet;
    }

    public async sendMessageWithoutPrompt(
        project: ProjectEntity,
        config: MedeConfigModelEntity,
        phase: PhaseEntity
    ): Promise<ChangeSetEntity | null>
    {
        return await this.sendMessage(project, config, phase, "", []);
    }

    public applyAll(
        phase: PhaseEntity,
        changeSet: ChangeSetEntity
    ): ChangeSetEntity
    {
        this.assert(phase.status === "REFINING", "Phase not in refining state");
        const doc = this.cycleArtifactRepository.getById(changeSet.cycleArtifactId);
        this.assertNotNull(doc, "Cycle artifact not found");

        let newContent = doc.currentContent;
        for (const chunk of this.changeChunkRepository.list(changeSet.id))
        {
            if (
                chunk.status === "AWAITING_APPROVAL" &&
                chunk.index >= changeSet.currentChangeChunkIndex
            )
            {
                const chunkModel = new ChunkModelEntity();
                chunkModel.index = chunk.index;
                chunkModel.location = chunk.blockLocation;

                const result = this.applyDiff(newContent, {
                    ...chunkModel,
                    offset: changeSet.currentOffset,
                    content: chunk.changeContent
                });
                changeSet.currentOffset += result.addedCount - result.removedCount;     
                newContent = result.newContent;
                this.changeChunkRepository.approve(chunk.id);
            }
        }

        this.cycleArtifactRepository.updateContent(doc.id, newContent);
        this.fileSystemRepository.writeFile(changeSet.fileName, newContent);
        this.changeSetRepository.updateChunkIndex(
            changeSet.id,
            changeSet.changeChunkCount,
            changeSet.currentOffset
        );
        this.changeSetRepository.updateComplete(changeSet.id);
        this.phaseRepository.awaitingApproval(phase.id);

        const currentChangeSet = this.changeSetRepository.getById(changeSet.id);
        this.assertNotNull(currentChangeSet, "ChangeSet not found after applyAll");

        return currentChangeSet;
    }

    public apply(
        phase: PhaseEntity,
        changeSet: ChangeSetEntity
    ): ChangeSetEntity | null
    {
        this.assert(phase.status === "REFINING", "Phase not in refining state");
        const chunk = this.changeChunkRepository.getByIndex(changeSet.id, changeSet.currentChangeChunkIndex);
        this.assertNotNull(chunk, "Diff chunk not found");
        this.assert(chunk.status === "AWAITING_APPROVAL", "diff not in awaiting approval" );

        const doc = this.cycleArtifactRepository.getById(changeSet.cycleArtifactId);
        this.assertNotNull(doc, "Cycle artifact not found");

        const result = this.applyDiff(
            doc.currentContent,
            {
                index: chunk.index,
                location: chunk.blockLocation,
                content: chunk.changeContent,
                offset: changeSet.currentOffset,
            }
        );
        changeSet.currentOffset += result.addedCount - result.removedCount;

        this.cycleArtifactRepository.updateContent(doc.id, result.newContent);
        this.changeChunkRepository.approve(chunk.id);

        if (changeSet.currentChangeChunkIndex >= changeSet.changeChunkCount)
        {
            this.changeSetRepository.updateChunkIndex(
                changeSet.id,
                changeSet.changeChunkCount,
                changeSet.currentOffset
            );
            this.changeSetRepository.updateComplete(changeSet.id);
            this.phaseRepository.awaitingApproval(phase.id);
        }
        else
        {
            this.changeSetRepository.updateChunkIndex(
                changeSet.id,
                changeSet.currentChangeChunkIndex + 1,
                changeSet.currentOffset
            );
        }

        this.fileSystemRepository.writeFile(changeSet.fileName, result.newContent);
        return this.changeSetRepository.getCurrent(phase.id);
    }

    public discardAll(
        phase: PhaseEntity,
        changeSet: ChangeSetEntity
    ): ChangeSetEntity
    {
        this.assert(phase.status === "REFINING", "Phase not in refining state");
        for (const chunk of this.changeChunkRepository.list(changeSet.id))
        {
            if (
                chunk.status === "AWAITING_APPROVAL" &&
                chunk.index >= changeSet.currentChangeChunkIndex
            )
            {
                this.changeChunkRepository.reject(chunk.id);
            }
        }

        this.changeSetRepository.updateChunkIndex(
            changeSet.id,
            changeSet.changeChunkCount,
            changeSet.currentOffset
        );
        this.changeSetRepository.updateComplete(changeSet.id);
        this.phaseRepository.awaitingApproval(phase.id);
        
        const currentChangeSet = this.changeSetRepository.getById(changeSet.id);
        this.assertNotNull(currentChangeSet, "ChangeSet not found after discardAll");

        return currentChangeSet;
    }

    public discard(
        phase: PhaseEntity,
        changeSet: ChangeSetEntity
    ): ChangeSetEntity | null
    {
        this.assert(phase.status === "REFINING", "Phase not in refining state");
        const chunk = this.changeChunkRepository.getByIndex(changeSet.id, changeSet.currentChangeChunkIndex);
        this.assertNotNull(chunk, "Diff chunk not found");
        this.assert(chunk.status === "AWAITING_APPROVAL", "diff not in awaiting approval");

        this.changeChunkRepository.reject(chunk.id);

        if (changeSet.currentChangeChunkIndex >= changeSet.changeChunkCount)
        {
            this.changeSetRepository.updateChunkIndex(
                changeSet.id,
                changeSet.changeChunkCount,
                changeSet.currentOffset
            );
            this.changeSetRepository.updateComplete(changeSet.id);
            this.phaseRepository.awaitingApproval(phase.id);
        }
        else
        {
            this.changeSetRepository.updateChunkIndex(
                changeSet.id,
                changeSet.currentChangeChunkIndex + 1,
                changeSet.currentOffset
            );
        }

        return this.changeSetRepository.getCurrent(phase.id);
    }

    private parseTextToDiff(value: string): Array<Diff.ChunkModel>
    {
        const resp: Array<Diff.ChunkModel> = [];
            
        // Divide o texto onde encontrar o marcador de início de chunk "@@"
        // O lookahead (?=@@) mantém o marcador na string resultante
        const parts = value.split(/(?=@@.*@@\n)/);

        let currentIndex = 0;

        for (const part of parts) {
            const trimmedPart = part.trim();
            if (!trimmedPart.startsWith('@@')) continue;

            // A primeira linha é a location (@@ -x,y +a,b @@)
            // O restante é o conteúdo
            const lines = trimmedPart.split(/\r?\n/);
            const location = lines[0];
            const content = lines.slice(1).join('\n');

            resp.push({
                index: ++currentIndex,
                offset: 0,
                location: location,
                content: content
            });
        }

        return resp;
    }

    private getConfigOrDefault(value: string | undefined, fallback: string): string
    {
        return this.isEmpty(value ?? "") ? fallback : (value ?? "");
    }

    private isEmpty(value: string): boolean
    {
        return value.trim() === "";
    }

    private getCurrentDateTime(): string
    {
        return new Date().toISOString();
    }

    private assert(condition: boolean, message: string): void
    {
        if (!condition)
        {
            throw new Error(message);
        }
    }

    private assertNotNull<T>(value: T | null, message: string): asserts value is T
    {
        if (value === null)
        {
            throw new Error(message);
        }
    }
}