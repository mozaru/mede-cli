import type { IFileSystemRepository } from "../repositories/interfaces/file-system-repository-interface.js";
import type { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import type { IProjectConfigRepository } from "../repositories/interfaces/project-config-repository-interface.js";
import type { ICycleRepository } from "../repositories/interfaces/cycle-repository-interface.js";
import { FileSystemRepository } from "../repositories/file-system-repository.js";
import { ListFilesOptionsEntity } from "../entities/list-files-options-entity.js";
import * as LlmPrompts from "../shared/llm/llm-prompts-provider.js";
import { MedeConfigModelEntity } from "../entities/mede-config-model-entity.js";
import { jsonToStr, strToJson } from "../shared/json.js";
import { calculateHashFromContent } from "../shared/crypto.js";

export class ConfigService
{
    private readonly fileSystemRepository: IFileSystemRepository;
    private readonly projectRepository: IProjectRepository;
    private readonly projectConfigRepository: IProjectConfigRepository;
    private readonly cycleRepository: ICycleRepository;

    constructor(
        projectRepository: IProjectRepository,
        projectConfigRepository: IProjectConfigRepository,
        cycleRepository: ICycleRepository,
        fileSystemRepository: IFileSystemRepository | null = null,
    )
    {
        this.fileSystemRepository = fileSystemRepository ??  new FileSystemRepository();
        this.projectRepository = projectRepository;
        this.projectConfigRepository = projectConfigRepository;
        this.cycleRepository = cycleRepository;
    }

    public getConfig(): string
    {
        this.assert(
            this.fileSystemRepository.exists("mede.config.json"),
            "mede.config.json not found"
        );

        return this.fileSystemRepository.readFile("mede.config.json");
    }

    public init(): void
    {
        this.assertFalse(
            this.fileSystemRepository.exists("mede.config.json"),
            "mede.config.json already exist"
        );

        const config = this.buildDefaultConfig();
        this.fileSystemRepository.writeJsonFile("mede.config.json", config);
    }

    public apply(): void
    {
        const project = this.projectRepository.getCurrent();
        this.assertNotNull(project, "Project not found");

        const configEntity = this.projectConfigRepository.getCurrent(project.id);
        this.assertNotNull(configEntity, "Config not found");

        const configOld = this.parseConfig(configEntity.content);

        this.assert(
            this.fileSystemRepository.exists("mede.config.json"),
            "mede.config.json not found"
        );

        const config = this.readConfigFile("mede.config.json");

        const cycle = this.cycleRepository.getCurrent(project.id);
        this.assertNull(cycle, "Cannot apply config while a cycle is active");

        this.renameBaseFiles(configOld, config);
        this.renamePrefixedHistoricalFilesAndDirectories(configOld, config);
        this.renameDocsRootIfNeeded(configOld.docsRoot, config.docsRoot);

        const content = jsonToStr(config);
        const hashContent = calculateHashFromContent(content);
        this.projectConfigRepository.updateContent(configEntity.id, content, hashContent);
    }

    private buildDefaultConfig(): MedeConfigModelEntity
    {
        return {
            configVersion: 1,
            language: "pt-BR",
            docsRoot: "docs",
            directories: {
                meetingMinutes: "atas-de-reuniao",
                architecturalDecisions: "decisoes-arquiteturais",
                systemMaintenanceSpecifications: "especificacao-manutencao-sistema",
                deliveryLog: "log-entregas"
            },
            fileNames: {
                initialUnderstanding: "entendimento-inicial.md",
                readme: "readme.md",
                currentState: "situacao-atual.md",
                scopeAndVision: "visao-e-escopo.md",
                functionalRequirements: "requisitos-funcionais.md",
                nonFunctionalRequirements: "requisitos-nao-funcionais.md",
                dataModel: "modelo-de-dados.md",
                timeline: "cronograma.md"
            },
            prefixes: {
                meetingMinutes: "ata",
                architecturalDecisions: "adr",
                systemMaintenanceSpecifications: "esm",
                deliveryLog: "leg"
            },
            llm: {
                provider: "openai-compatible",
                model: "gpt-4.1-mini",
                endpoint: "https://api.openai.com/v1",
                apiKeyEnv: "OPENAI_API_KEY",
                temperature: 0.1,
                maxTokens: 4000,
                timeoutMs: 60000
            },
            systemPrompts: {
                readme: LlmPrompts.SYSTEM_PROMPT_README,
                initialUnderstanding: LlmPrompts.SYSTEM_PROMPT_INITIAL_UNDERSTANDING,
                meeting: LlmPrompts.SYSTEM_PROMPT_MEETING,
                architecturalDecisions: LlmPrompts.SYSTEM_PROMPT_ADR,
                systemMaintenanceSpecifications: LlmPrompts.SYSTEM_PROMPT_ESM,
                deliveryLog: LlmPrompts.SYSTEM_PROMPT_DELIVERY_LOG,
                functionalRequirements: LlmPrompts.SYSTEM_PROMPT_FUNCTIONAL_REQUIREMENTS,
                nonFunctionalRequirements: LlmPrompts.SYSTEM_PROMPT_NON_FUNCTIONAL_REQUIREMENTS,
                dataModel: LlmPrompts.SYSTEM_PROMPT_DATA_MODEL,
                timeline: LlmPrompts.SYSTEM_PROMPT_TIMELINE,
                scopeAndVision: LlmPrompts.SYSTEM_PROMPT_SCOPE_AND_VISION,
                currentState: LlmPrompts.SYSTEM_PROMPT_CURRENT_STATE
            },
            prompts: {
                readme: LlmPrompts.USER_PROMPT_README,
                initialUnderstanding: LlmPrompts.USER_PROMPT_INITIAL_UNDERSTANDING,
                meeting: LlmPrompts.USER_PROMPT_MEETING,
                architecturalDecisions: LlmPrompts.USER_PROMPT_ADR,
                systemMaintenanceSpecifications: LlmPrompts.USER_PROMPT_ESM,
                deliveryLog: LlmPrompts.USER_PROMPT_DELIVERY_LOG,
                functionalRequirements: LlmPrompts.USER_PROMPT_FUNCTIONAL_REQUIREMENTS,
                nonFunctionalRequirements: LlmPrompts.USER_PROMPT_NON_FUNCTIONAL_REQUIREMENTS,
                dataModel: LlmPrompts.USER_PROMPT_DATA_MODEL,
                timeline: LlmPrompts.USER_PROMPT_TIMELINE,
                scopeAndVision: LlmPrompts.USER_PROMPT_SCOPE_AND_VISION,
                currentState: LlmPrompts.USER_PROMPT_CURRENT_STATE
            }
        };
    }

    private renameBaseFiles(configOld: MedeConfigModelEntity, config: MedeConfigModelEntity): void
    {
        this.renameFileIfExists(
            this.fileSystemRepository.combinePath(configOld.docsRoot, configOld.fileNames.initialUnderstanding),
            this.fileSystemRepository.combinePath(configOld.docsRoot, config.fileNames.initialUnderstanding)
        );

        this.renameFileIfExists(
            this.fileSystemRepository.combinePath(configOld.docsRoot, configOld.fileNames.readme),
            this.fileSystemRepository.combinePath(configOld.docsRoot, config.fileNames.readme)
        );

        this.renameFileIfExists(
            this.fileSystemRepository.combinePath(configOld.docsRoot, configOld.fileNames.currentState),
            this.fileSystemRepository.combinePath(configOld.docsRoot, config.fileNames.currentState)
        );

        this.renameFileIfExists(
            this.fileSystemRepository.combinePath(configOld.docsRoot, configOld.fileNames.scopeAndVision),
            this.fileSystemRepository.combinePath(configOld.docsRoot, config.fileNames.scopeAndVision)
        );

        this.renameFileIfExists(
            this.fileSystemRepository.combinePath(configOld.docsRoot, configOld.fileNames.functionalRequirements),
            this.fileSystemRepository.combinePath(configOld.docsRoot, config.fileNames.functionalRequirements)
        );

        this.renameFileIfExists(
            this.fileSystemRepository.combinePath(configOld.docsRoot, configOld.fileNames.nonFunctionalRequirements),
            this.fileSystemRepository.combinePath(configOld.docsRoot, config.fileNames.nonFunctionalRequirements)
        );

        this.renameFileIfExists(
            this.fileSystemRepository.combinePath(configOld.docsRoot, configOld.fileNames.dataModel),
            this.fileSystemRepository.combinePath(configOld.docsRoot, config.fileNames.dataModel)
        );

        this.renameFileIfExists(
            this.fileSystemRepository.combinePath(configOld.docsRoot, configOld.fileNames.timeline),
            this.fileSystemRepository.combinePath(configOld.docsRoot, config.fileNames.timeline)
        );
    }

    private renamePrefixedHistoricalFilesAndDirectories(
        configOld: MedeConfigModelEntity,
        config: MedeConfigModelEntity
    ): void
    {
        this.renameHistoricalDirectory(
            configOld.docsRoot,
            configOld.directories.meetingMinutes,
            configOld.prefixes.meetingMinutes,
            config.docsRoot,
            config.directories.meetingMinutes,
            config.prefixes.meetingMinutes
        );

        this.renameHistoricalDirectory(
            configOld.docsRoot,
            configOld.directories.architecturalDecisions,
            configOld.prefixes.architecturalDecisions,
            config.docsRoot,
            config.directories.architecturalDecisions,
            config.prefixes.architecturalDecisions
        );

        this.renameHistoricalDirectory(
            configOld.docsRoot,
            configOld.directories.systemMaintenanceSpecifications,
            configOld.prefixes.systemMaintenanceSpecifications,
            config.docsRoot,
            config.directories.systemMaintenanceSpecifications,
            config.prefixes.systemMaintenanceSpecifications
        );

        this.renameHistoricalDirectory(
            configOld.docsRoot,
            configOld.directories.deliveryLog,
            configOld.prefixes.deliveryLog,
            config.docsRoot,
            config.directories.deliveryLog,
            config.prefixes.deliveryLog
        );
    }

    private renameHistoricalDirectory(
        oldDocsRoot: string,
        oldDirectoryName: string,
        oldPrefix: string,
        newDocsRoot: string,
        newDirectoryName: string,
        newPrefix: string
    ): void
    {
        const oldDirectoryPath = this.fileSystemRepository.combinePath(oldDocsRoot, oldDirectoryName);
        if (!this.fileSystemRepository.exists(oldDirectoryPath)) {
            return;
        }

        const options = new ListFilesOptionsEntity();
        options.recursive = false;
        options.extensions = [".md"];

        const filePaths = this.fileSystemRepository.listFiles(oldDirectoryPath, options);

        for (const filePath of filePaths)
        {
            const fileName = this.fileSystemRepository.basename(filePath);

            if (!fileName.startsWith(oldPrefix)) {
                continue;
            }

            const suffix = fileName.substring(oldPrefix.length);
            const newFileName = `${newPrefix}${suffix}`;
            const newFilePath = this.fileSystemRepository.combinePath(oldDirectoryPath, newFileName);

            if (filePath !== newFilePath) {
                this.fileSystemRepository.renameFile(filePath, newFileName);
            }
        }

        const targetParent = newDocsRoot === oldDocsRoot
            ? oldDocsRoot
            : newDocsRoot;

        if (newDocsRoot !== oldDocsRoot) {
            this.fileSystemRepository.ensureDirectory(newDocsRoot);
        }

        const currentRenamedPath = this.fileSystemRepository.combinePath(oldDocsRoot, oldDirectoryName);
        if (!this.fileSystemRepository.exists(currentRenamedPath)) {
            return;
        }

        if (targetParent === oldDocsRoot) {
            this.fileSystemRepository.renameDirectory(currentRenamedPath, newDirectoryName);
            return;
        }

        const targetPath = this.fileSystemRepository.combinePath(targetParent, newDirectoryName);
        this.fileSystemRepository.moveFile(currentRenamedPath, targetPath);
    }

    private renameDocsRootIfNeeded(oldDocsRoot: string, newDocsRoot: string): void
    {
        if (oldDocsRoot === newDocsRoot) {
            return;
        }

        if (!this.fileSystemRepository.exists(oldDocsRoot)) {
            return;
        }

        const parentPath = this.fileSystemRepository.dirname(oldDocsRoot);
        const newDirName = this.fileSystemRepository.basename(newDocsRoot);

        if (this.fileSystemRepository.dirname(oldDocsRoot) === this.fileSystemRepository.dirname(newDocsRoot)) {
            this.fileSystemRepository.renameDirectory(oldDocsRoot, newDirName);
            return;
        }

        this.fileSystemRepository.ensureDirectory(this.fileSystemRepository.dirname(newDocsRoot));
        this.fileSystemRepository.moveFile(oldDocsRoot, newDocsRoot);
    }

    private renameFileIfExists(sourcePath: string, targetPath: string): void
    {
        if (!this.fileSystemRepository.exists(sourcePath)) {
            return;
        }

        const targetDirectory = this.fileSystemRepository.dirname(targetPath);
        this.fileSystemRepository.ensureDirectory(targetDirectory);

        this.fileSystemRepository.moveFile(sourcePath, targetPath);
    }

    private readConfigFile(filePath: string): MedeConfigModelEntity
    {
        const json = this.fileSystemRepository.readJsonFile(filePath);
        return json as MedeConfigModelEntity;
    }

    private parseConfig(content: string): MedeConfigModelEntity
    {
        return strToJson(content) as MedeConfigModelEntity;
    }

    private assert(condition: boolean, message: string): void
    {
        if (!condition) {
            throw new Error(message);
        }
    }

    private assertFalse(condition: boolean, message: string): void
    {
        if (condition) {
            throw new Error(message);
        }
    }

    private assertNull(value: unknown, message: string): void
    {
        if (value !== null) {
            throw new Error(message);
        }
    }

    private assertNotNull<T>(value: T | null, message: string): asserts value is T
    {
        if (value === null) {
            throw new Error(message);
        }
    }
}