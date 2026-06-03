import { describe, it, expect, afterEach } from "vitest";
import { MedeConfigModelEntity } from "../../entities/mede-config-model-entity.js";
import { ApiKeyAuthStrategy, createLlmAuthStrategy } from "./llm-auth.js";

function makeConfig(overrides?: Partial<MedeConfigModelEntity["llm"]>): MedeConfigModelEntity {
  const config = new MedeConfigModelEntity();
  config.llm.apiKeyEnv = "TEST_AUTH_KEY";
  Object.assign(config.llm, overrides);
  return config;
}

const ENV_KEY = "TEST_AUTH_KEY";

describe("ApiKeyAuthStrategy", () => {
  afterEach(() => {
    delete process.env[ENV_KEY];
  });

  it("reads the env var named by apiKeyEnv and feeds it to the provider header builder", async () => {
    process.env[ENV_KEY] = "secret-123";
    const strategy = new ApiKeyAuthStrategy(makeConfig(), "OpenAI", (key) => ({
      Authorization: `Bearer ${key}`,
    }));

    await expect(strategy.resolveAuthHeaders()).resolves.toEqual({
      Authorization: "Bearer secret-123",
    });
  });

  it("supports provider-specific header shapes", async () => {
    process.env[ENV_KEY] = "secret-123";
    const strategy = new ApiKeyAuthStrategy(makeConfig(), "Anthropic", (key) => ({
      "x-api-key": key,
    }));

    await expect(strategy.resolveAuthHeaders()).resolves.toEqual({ "x-api-key": "secret-123" });
  });

  it("fails with a clear message when apiKeyEnv is blank", async () => {
    const strategy = new ApiKeyAuthStrategy(makeConfig({ apiKeyEnv: "  " }), "Gemini", (key) => ({
      "x-goog-api-key": key,
    }));

    await expect(strategy.resolveAuthHeaders()).rejects.toThrow(
      "LLM apiKeyEnv is not configured for Gemini provider.",
    );
  });

  it("fails when the environment variable is not set", async () => {
    const strategy = new ApiKeyAuthStrategy(makeConfig(), "Azure OpenAI", (key) => ({
      "api-key": key,
    }));

    await expect(strategy.resolveAuthHeaders()).rejects.toThrow(
      `Environment variable "${ENV_KEY}" is not set or is empty.`,
    );
  });
});

describe("createLlmAuthStrategy", () => {
  afterEach(() => {
    delete process.env[ENV_KEY];
  });

  it("defaults to the apiKey strategy when auth is omitted", async () => {
    process.env[ENV_KEY] = "k";
    const config = makeConfig();
    config.llm.auth = undefined;

    const strategy = createLlmAuthStrategy(config, "OpenAI", (key) => ({ Authorization: key }));

    expect(strategy).toBeInstanceOf(ApiKeyAuthStrategy);
    await expect(strategy.resolveAuthHeaders()).resolves.toEqual({ Authorization: "k" });
  });

  it("builds the apiKey strategy for auth=apiKey (case-insensitive)", () => {
    const strategy = createLlmAuthStrategy(makeConfig({ auth: "APIKEY" }), "OpenAI", (key) => ({
      Authorization: key,
    }));

    expect(strategy).toBeInstanceOf(ApiKeyAuthStrategy);
  });

  it("builds an OAuth strategy for auth=oauth (no throw at construction)", () => {
    const strategy = createLlmAuthStrategy(
      makeConfig({ auth: "oauth" }),
      "Azure OpenAI",
      (key) => ({ "api-key": key }),
      {
        vault: {
          get: () => undefined,
          set: () => {
            /* unused */
          },
          delete: () => {
            /* unused */
          },
        },
      },
    );

    expect(strategy.constructor.name).toBe("OAuthAuthStrategy");
  });

  it("builds an ADC strategy for auth=adc", () => {
    const strategy = createLlmAuthStrategy(
      makeConfig({ auth: "adc" }),
      "Gemini",
      (key) => ({ "x-goog-api-key": key }),
      { adcTokenFetcher: async () => "adc-token", now: () => 0 },
    );

    expect(strategy.constructor.name).toBe("AdcAuthStrategy");
  });

  it("rejects an unknown auth mode", () => {
    expect(() =>
      createLlmAuthStrategy(makeConfig({ auth: "magic" }), "OpenAI", (key) => ({
        Authorization: key,
      })),
    ).toThrow(/Modo de autenticação desconhecido/);
  });
});
