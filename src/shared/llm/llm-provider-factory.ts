import { MedeConfigModelEntity } from "../../entities/mede-config-model-entity.js";
import { ILlmProvider } from "./llm-provider.interface.js";
import { AnthropicLlmProvider } from "./anthropic-llm-provider.js";
import { GeminiLlmProvider } from "./gemini-llm-provider.js";
import { OllamaLlmProvider } from "./ollama-llm-provider.js";
import { OpenAiLlmProvider } from "./openai-llm-provider.js";
import { AzureOpenAiLlmProvider } from "./azure-openai-llm-provider.js";

export class LlmProviderFactory {
  public static create(config: MedeConfigModelEntity): ILlmProvider {
    const provider = config.llm.provider.trim().toLowerCase();

    switch (provider) {
      case "openai":
      case "openai-compatible":
      case "chatgpt":
        return new OpenAiLlmProvider(config);

      case "ollama":
        return new OllamaLlmProvider(config);

      case "anthropic":
      case "claude":
        return new AnthropicLlmProvider(config);

      case "gemini":
      case "google":
        return new GeminiLlmProvider(config);

      case "azure":
      case "azure-openai":
      case "azure-openia":
        return new AzureOpenAiLlmProvider(config);

      case "bart":
      case "bard":
        throw new Error(
          `Provider "${config.llm.provider}" is ambiguous/not implemented. Se você quis dizer Bard, use "gemini".`,
        );

      default:
        throw new Error(`Unsupported LLM provider: ${config.llm.provider}`);
    }
  }
}