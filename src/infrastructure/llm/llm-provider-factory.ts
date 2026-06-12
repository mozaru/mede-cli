import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import { resolveLlmConfig } from "../../shared/llm-config-resolver.js";
import { ILlmProvider } from "./llm-provider.interface.js";
import { AnthropicLlmProvider } from "./anthropic-llm-provider.js";
import { GeminiLlmProvider } from "./gemini-llm-provider.js";
import { OllamaLlmProvider } from "./ollama-llm-provider.js";
import { OpenAiLlmProvider } from "./openai-llm-provider.js";
import { AzureOpenAiLlmProvider } from "./azure-openai-llm-provider.js";
import { LlmAuthDeps } from "./llm-auth.js";

export class LlmProviderFactory {
  public static create(
    config: MedeConfigModelEntity,
    deps?: LlmAuthDeps,
    routeKey?: string,
  ): ILlmProvider {
    const effectiveConfig = resolveLlmConfig(config, routeKey);
    const provider = effectiveConfig.llm.provider.trim().toLowerCase();

    switch (provider) {
      case "openai":
      case "openai-compatible":
      case "chatgpt":
      case "openrouter":
        return new OpenAiLlmProvider(effectiveConfig, deps);

      case "ollama":
        return new OllamaLlmProvider(effectiveConfig, deps);

      case "anthropic":
      case "claude":
        return new AnthropicLlmProvider(effectiveConfig, deps);

      case "gemini":
      case "google":
        return new GeminiLlmProvider(effectiveConfig, deps);

      case "azure":
      case "azure-openai":
      case "azure-openia":
        return new AzureOpenAiLlmProvider(effectiveConfig, deps);

      case "bart":
      case "bard":
        throw new Error(
          `Provider "${effectiveConfig.llm.provider}" is ambiguous/not implemented. Se voce quis dizer Bard, use "gemini".`,
        );

      default:
        throw new Error(`Unsupported LLM provider: ${effectiveConfig.llm.provider}`);
    }
  }
}
