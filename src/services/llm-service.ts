import type { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import type { IProjectConfigRepository } from "../repositories/interfaces/project-config-repository-interface.js";
import { LlmProviderFactory } from "../shared/llm/llm-provider-factory.js";
import { MedeConfigModelEntity } from "../entities/mede-config-model-entity.js";
import { parseMedeConfig } from "../shared/mede-config-schema.js";
import { withRetry } from "../shared/retry.js";
import { logger } from "../shared/logger.js";

export class LlmService
{
    private readonly projectRepository: IProjectRepository;
    private readonly projectConfigRepository: IProjectConfigRepository;

    constructor(
        projectRepository: IProjectRepository,
        projectConfigRepository: IProjectConfigRepository
    )
    {
        this.projectRepository = projectRepository;
        this.projectConfigRepository = projectConfigRepository;
    }

    public providers(): string
    {
        const project = this.projectRepository.getCurrent();
        this.assertNotNull(project, "Project not found");

        const configEntity = this.projectConfigRepository.getCurrent(project.id);
        this.assertNotNull(configEntity, "Config not found");

        const config = this.parseConfig(configEntity.content);

        const anthropicModel =
            config.llm.provider === "anthropic-compatible"
                ? config.llm.model
                : "None";

        const azureModel =
            config.llm.provider === "azure-compatible"
                ? config.llm.model
                : "None";

        const geminiModel =
            config.llm.provider === "gemini-compatible"
                ? config.llm.model
                : "None";

        const ollamaModel =
            config.llm.provider === "ollama-compatible"
                ? config.llm.model
                : "None";

        const openaiModel =
            config.llm.provider === "openai-compatible"
                ? config.llm.model
                : "None";

        return `
  LLM - Providers Status
  anthropic       - ${anthropicModel}
  azure(openai)   - ${azureModel}
  gemini          - ${geminiModel}
  ollama          - ${ollamaModel}
  openai          - ${openaiModel}
`;
    }

    public async test(prompt: string): Promise<string>
    {
        const project = this.projectRepository.getCurrent();
        this.assertNotNull(project, "Project not found");

        const configEntity = this.projectConfigRepository.getCurrent(project.id);
        this.assertNotNull(configEntity, "Config not found");

        const config = parseMedeConfig(configEntity.content);
        const llm = LlmProviderFactory.create(config);
        llm.setOptions(config.llm);
        llm.setUserPrompt(prompt);

        const response = await withRetry(() => llm.generateText(), {
            onRetry: (error, attempt, delayMs) =>
                logger.warn(
                    `LLM falhou (tentativa ${attempt}); novo retry em ${delayMs}ms: ` +
                        `${error instanceof Error ? error.message : String(error)}`,
                ),
        });

        return response.rawText;
    }

    private parseConfig(content: string): MedeConfigModelEntity
    {
        return parseMedeConfig(content);
    }

    private assertNotNull<T>(value: T | null, message: string): asserts value is T
    {
        if (value === null)
        {
            throw new Error(message);
        }
    }
}