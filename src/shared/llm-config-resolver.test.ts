import { describe, expect, it } from "vitest";
import { MedeConfigModelEntity } from "../domain/entities/mede-config-model-entity.js";
import { resolveLlmConfig } from "./llm-config-resolver.js";

describe("resolveLlmConfig", () => {
  it("uses legacy llm fields with default fallbacks", () => {
    const config = new MedeConfigModelEntity();
    config.llm = {
      provider: "openai",
      model: "gpt-5.4",
      maxTokens: 12000,
      timeoutMs: 180000,
    } as any;

    const resolved = resolveLlmConfig(config);

    expect(resolved.llm).toMatchObject({
      provider: "openai",
      model: "gpt-5.4",
      endpoint: "https://api.openai.com/v1",
      apiKeyEnv: "OPENAI_API_KEY",
      temperature: 0.1,
      maxTokens: 12000,
      timeoutMs: 180000,
    });
  });

  it("applies the active profile over legacy defaults", () => {
    const config = new MedeConfigModelEntity();
    config.llm.activeProfile = "highQuality";
    config.llm.profiles = {
      highQuality: {
        model: "gpt-5.5",
        maxTokens: 16000,
        timeoutMs: 240000,
      },
    };

    const resolved = resolveLlmConfig(config);

    expect(resolved.llm.model).toBe("gpt-5.5");
    expect(resolved.llm.provider).toBe("openai");
    expect(resolved.llm.maxTokens).toBe(16000);
    expect(resolved.llm.timeoutMs).toBe(240000);
  });

  it("routes a phase to a specific profile when llmRouting is configured", () => {
    const config = new MedeConfigModelEntity();
    config.llm.activeProfile = "default";
    config.llm.profiles = {
      default: { model: "gpt-5.4" },
      highQuality: { model: "gpt-5.5" },
    };
    config.llmRouting = {
      extractBacklog: "highQuality",
    };

    expect(resolveLlmConfig(config, "extractBacklog").llm.model).toBe("gpt-5.5");
    expect(resolveLlmConfig(config, "meeting").llm.model).toBe("gpt-5.4");
  });

  it("throws when a selected profile does not exist", () => {
    const config = new MedeConfigModelEntity();
    config.llm.activeProfile = "missing";

    expect(() => resolveLlmConfig(config)).toThrow(/Perfil LLM "missing"/);
  });

  it("does not leak OpenAI default endpoint to non-OpenAI providers", () => {
    const config = new MedeConfigModelEntity();
    config.llm.activeProfile = "gemini";
    config.llm.profiles = {
      gemini: {
        provider: "gemini",
        model: "gemini-1.5-flash",
      },
    };

    const resolved = resolveLlmConfig(config);
    expect(resolved.llm.provider).toBe("gemini");
    expect(resolved.llm.endpoint).toBeUndefined();
  });
});
