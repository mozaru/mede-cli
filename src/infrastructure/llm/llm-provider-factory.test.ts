/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { LlmProviderFactory } from "./llm-provider-factory.js";
import { OpenAiLlmProvider } from "./openai-llm-provider.js";
import { AnthropicLlmProvider } from "./anthropic-llm-provider.js";
import { GeminiLlmProvider } from "./gemini-llm-provider.js";
import { OllamaLlmProvider } from "./ollama-llm-provider.js";
import { AzureOpenAiLlmProvider } from "./azure-openai-llm-provider.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";

describe("LlmProviderFactory", () => {
  const makeConfig = (provider: string): MedeConfigModelEntity => {
    const config = new MedeConfigModelEntity();
    config.llm.provider = provider;
    return config;
  };

  it("instantiates OpenAI providers correctly", () => {
    const providers = ["openai", "openai-compatible", "chatgpt", "openrouter"];
    for (const provider of providers) {
      const config = makeConfig(provider);
      const instance = LlmProviderFactory.create(config);
      expect(instance).toBeInstanceOf(OpenAiLlmProvider);
    }
  });

  it("instantiates Ollama provider correctly", () => {
    const config = makeConfig("ollama");
    const instance = LlmProviderFactory.create(config);
    expect(instance).toBeInstanceOf(OllamaLlmProvider);
  });

  it("instantiates Anthropic/Claude provider correctly", () => {
    const providers = ["anthropic", "claude"];
    for (const provider of providers) {
      const config = makeConfig(provider);
      const instance = LlmProviderFactory.create(config);
      expect(instance).toBeInstanceOf(AnthropicLlmProvider);
    }
  });

  it("instantiates Gemini/Google provider correctly", () => {
    const providers = ["gemini", "google"];
    for (const provider of providers) {
      const config = makeConfig(provider);
      const instance = LlmProviderFactory.create(config);
      expect(instance).toBeInstanceOf(GeminiLlmProvider);
    }
  });

  it("instantiates Azure OpenAI provider correctly", () => {
    const providers = ["azure", "azure-openai", "azure-openia"];
    for (const provider of providers) {
      const config = makeConfig(provider);
      const instance = LlmProviderFactory.create(config);
      expect(instance).toBeInstanceOf(AzureOpenAiLlmProvider);
    }
  });

  it("throws specific exception for bard/bart providers", () => {
    const config = makeConfig("bard");
    expect(() => LlmProviderFactory.create(config)).toThrow(
      'Provider "bard" is ambiguous/not implemented. Se voce quis dizer Bard, use "gemini".',
    );
  });

  it("throws exception for unsupported providers", () => {
    const config = makeConfig("unsupported-llm");
    expect(() => LlmProviderFactory.create(config)).toThrow(
      "Unsupported LLM provider: unsupported-llm",
    );
  });

  it("injects dependencies (env and vault) to resolved providers", async () => {
    const config = makeConfig("openai");
    config.llm.auth = "apiKey";
    config.llm.apiKeyEnv = "MOCK_KEY_VAR";

    const instance = LlmProviderFactory.create(config, {
      env: { MOCK_KEY_VAR: "my-mock-api-key" },
    });

    expect(instance).toBeInstanceOf(OpenAiLlmProvider);
    const authHeaders = await (instance as any).authStrategy.resolveAuthHeaders();
    expect(authHeaders.Authorization).toBe("Bearer my-mock-api-key");
  });

  it("uses the routed LLM profile before instantiating the provider", () => {
    const config = makeConfig("openai");
    config.llm.activeProfile = "default";
    config.llm.profiles = {
      default: { provider: "openai", model: "gpt-5.4" },
      local: { provider: "ollama", model: "llama3" },
    };
    config.llmRouting = {
      extractBacklog: "local",
    };

    const instance = LlmProviderFactory.create(config, undefined, "extractBacklog");

    expect(instance).toBeInstanceOf(OllamaLlmProvider);
  });
});
