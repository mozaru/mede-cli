import type { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import type { IProjectConfigRepository } from "../repositories/interfaces/project-config-repository-interface.js";
import { LlmProviderFactory } from "../shared/llm/llm-provider-factory.js";
import { MedeConfigModelEntity } from "../entities/mede-config-model-entity.js";
import { strToJson } from "../shared/json.js";
import { MedeLlmConfigEntity } from "../entities/mede-llm-config-entity.js";

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

        const config = strToJson(configEntity.content) as MedeConfigModelEntity;
        const llm = LlmProviderFactory.create(config);
        llm.setOptions(config.llm);
        llm.setUserPrompt(prompt);

        return (await llm.generateText()).rawText;
    }

    private parseConfig(content: string): MedeConfigModelEntity
    {
        if (content.trim() === "")
        {
            throw new Error("Config content is empty");
        }

        let parsed: MedeConfigModelEntity;

        try
        {
            parsed = JSON.parse(content) as MedeConfigModelEntity;
        }
        catch
        {
            throw new Error("Config content is not valid JSON");
        }

        if (!this.isLlmConfigModel(parsed.llm))
        {
            throw new Error("Config content has invalid LLM structure");
        }

        return parsed;
    }

    private isLlmConfigModel(value: unknown): value is MedeLlmConfigEntity
    {
        if (typeof value !== "object" || value === null)
        {
            return false;
        }

        const obj = value as Record<string, unknown>;

        if (typeof obj.llm !== "object" || obj.llm === null)
        {
            return false;
        }

        const llm = obj.llm as Record<string, unknown>;

        return (
            typeof llm.provider === "string" &&
            typeof llm.model === "string" &&
            typeof llm.endpoint === "string" &&
            typeof llm.apiKeyEnv === "string" &&
            typeof llm.temperature === "number" &&
            typeof llm.maxTokens === "number" &&
            typeof llm.timeoutMs === "number"
        );
    }

    private assertNotNull<T>(value: T | null, message: string): asserts value is T
    {
        if (value === null)
        {
            throw new Error(message);
        }
    }
}