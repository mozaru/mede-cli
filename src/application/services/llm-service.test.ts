import { beforeEach, describe, expect, it, vi } from "vitest";
import { LlmService } from "./llm-service.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";

const generateText = vi.hoisted(() => vi.fn());
const setOptions = vi.hoisted(() => vi.fn());
const setUserPrompt = vi.hoisted(() => vi.fn());

vi.mock("../../infrastructure/llm/llm-provider-factory.js", () => ({
  LlmProviderFactory: {
    create: vi.fn(() => ({
      setOptions,
      setUserPrompt,
      generateText,
    })),
  },
}));

function makeConfig(provider = "openai-compatible", model = "gpt-4.1"): MedeConfigModelEntity {
  const config = new MedeConfigModelEntity();
  config.llm.provider = provider;
  config.llm.model = model;
  return config;
}

function makeService(config: MedeConfigModelEntity, overrides: Record<string, unknown> = {}) {
  const projectRepository = overrides.projectRepository ?? {
    getCurrent: vi.fn(() => ({ id: 1 })),
  };
  const projectConfigRepository = overrides.projectConfigRepository ?? {
    getCurrent: vi.fn(() => ({ content: JSON.stringify(config) })),
  };

  return new LlmService(projectRepository as any, projectConfigRepository as any);
}

describe("LlmService.providers", () => {
  beforeEach(() => {
    generateText.mockReset();
    setOptions.mockReset();
    setUserPrompt.mockReset();
  });

  it("marks only the configured provider as active", () => {
    const output = makeService(makeConfig("openai-compatible", "gpt-4.1")).providers();

    expect(output).toMatch(/openai\s+- Status: Configured \(gpt-4\.1\)/);
    expect(output).toMatch(/anthropic\s+- Status: Not Configured/);
    expect(output).toMatch(/azure\(openai\)\s+- Status: Not Configured/);
    expect(output).toMatch(/gemini\s+- Status: Not Configured/);
    expect(output).toMatch(/ollama\s+- Status: Not Configured/);
  });

  it("keeps OpenAI inactive when another provider is selected", () => {
    const output = makeService(makeConfig("azure", "deploy")).providers();

    expect(output).toMatch(/azure\(openai\)\s+- Status: Configured \(deploy\)/);
    expect(output).toMatch(/openai\s+- Status: Not Configured/);
  });

  it("marks compatible non-OpenAI providers as active", () => {
    const cases: Array<[string, string, RegExp]> = [
      ["anthropic", "claude", /anthropic\s+- Status: Configured \(claude\)/],
      ["azure", "deploy", /azure\(openai\)\s+- Status: Configured \(deploy\)/],
      ["gemini", "gemini-2", /gemini\s+- Status: Configured \(gemini-2\)/],
      ["ollama", "llama", /ollama\s+- Status: Configured \(llama\)/],
    ];

    for (const [provider, model, expectedRegex] of cases) {
      const output = makeService(makeConfig(provider, model)).providers();

      expect(output).toMatch(expectedRegex as RegExp);
    }
  });

  it("rejects missing project or config", () => {
    expect(() =>
      makeService(makeConfig(), { projectRepository: { getCurrent: () => null } }).providers(),
    ).toThrow(/Project not found/);

    expect(() =>
      makeService(makeConfig(), {
        projectConfigRepository: { getCurrent: () => null },
      }).providers(),
    ).toThrow(/Config not found/);
  });

  it("renders multiple profiles listing with active marker when profiles are configured", () => {
    const config = makeConfig();
    config.llm.activeProfile = "gemini-perfil";
    config.llm.profiles = {
      "openai-perfil": {
        provider: "openai",
        model: "gpt-4o-mini",
      },
      "gemini-perfil": {
        provider: "gemini",
        model: "gemini-1.5-flash",
      },
    };
    config.llmRouting = {
      meeting: "gemini-perfil",
    };

    const output = makeService(config).providers();

    expect(output).toContain("openai-perfil (openai)");
    expect(output).toContain("gemini-perfil (gemini) [Ativo]");
    expect(output).toContain("- gpt-4o-mini");
    expect(output).toContain("- gemini-1.5-flash");
    expect(output).toContain("meeting                             -> gemini-perfil");
  });
});

describe("LlmService.test and logout", () => {
  beforeEach(() => {
    generateText.mockReset();
    setOptions.mockReset();
    setUserPrompt.mockReset();
  });

  it("sends the prompt to the configured provider and returns raw text", async () => {
    generateText.mockResolvedValueOnce({ rawText: "pong" });
    const config = makeConfig();
    const service = makeService(config);

    await expect(service.test("ping")).resolves.toBe("pong");

    expect(setOptions).toHaveBeenCalledWith(expect.objectContaining({ model: "gpt-4.1" }));
    expect(setUserPrompt).toHaveBeenCalledWith("ping");
  });

  it("retries transient provider failures", async () => {
    generateText.mockRejectedValueOnce(new Error("timeout")).mockResolvedValueOnce({
      rawText: "after retry",
    });

    await expect(makeService(makeConfig()).test("retry")).resolves.toBe("after retry");
    expect(generateText).toHaveBeenCalledTimes(2);
  });

  it("deletes OAuth credentials from the supplied vault", () => {
    const deleted: string[] = [];
    const config = makeConfig("openai-compatible");
    const message = makeService(config).logout({
      vault: {
        get: () => undefined,
        set: () => undefined,
        delete: (key) => deleted.push(key),
      },
    });

    expect(message).toContain("openai-compatible");
    expect(deleted).toEqual(["oauth:openai-compatible"]);
  });
});
