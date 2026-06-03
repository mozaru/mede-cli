import { describe, it, expect } from "vitest";
import { LlmService } from "./llm-service.js";
import { MedeConfigModelEntity } from "../entities/mede-config-model-entity.js";
import { ISecretVault } from "../shared/secret-vault.js";
import { oauthVaultKey, parseTokens } from "../shared/llm/oauth-auth-strategy.js";
import type { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import type { IProjectConfigRepository } from "../repositories/interfaces/project-config-repository-interface.js";

function memoryVault(): ISecretVault {
  const store = new Map<string, string>();
  return {
    get: (k) => store.get(k),
    set: (k, v) => void store.set(k, v),
    delete: (k) => void store.delete(k),
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

// Builds a LlmService backed by stub repositories returning the given config.
function makeService(config: MedeConfigModelEntity): LlmService {
  const projectRepository = {
    getCurrent: () => ({ id: 1 }),
  } as unknown as IProjectRepository;
  const projectConfigRepository = {
    getCurrent: () => ({ content: JSON.stringify(config) }),
  } as unknown as IProjectConfigRepository;
  return new LlmService(projectRepository, projectConfigRepository);
}

describe("LlmService.login — OpenRouter PKCE branch", () => {
  it("runs PKCE, stores the provisioned key, and reports success", async () => {
    const config = new MedeConfigModelEntity();
    config.llm.provider = "openrouter";
    config.llm.auth = "oauth";
    config.llm.endpoint = "https://openrouter.ai/api/v1";

    const vault = memoryVault();
    const service = makeService(config);

    const message = await service.login(() => undefined, {
      vault,
      fetch: (async () => jsonResponse(200, { key: "sk-or-xyz" })) as unknown as typeof fetch,
      authorize: async () => "auth-code",
    });

    expect(message).toContain("OpenRouter");
    const stored = vault.get(oauthVaultKey("openrouter"));
    expect(parseTokens(stored as string)?.accessToken).toBe("sk-or-xyz");
  });
});

describe("LlmService.login — device-code branch", () => {
  it("errors clearly when oauth endpoints are not configured", async () => {
    const config = new MedeConfigModelEntity();
    config.llm.provider = "anthropic";
    config.llm.auth = "oauth";

    const service = makeService(config);

    await expect(service.login(() => undefined, { vault: memoryVault() })).rejects.toThrow(
      /OAuth não configurado/,
    );
  });

  it("stores tokens from a successful device-code flow", async () => {
    const config = new MedeConfigModelEntity();
    config.llm.provider = "azure";
    config.llm.auth = "oauth";
    config.llm.oauth = { clientId: "app-1", tenant: "contoso" };

    const responses = [
      jsonResponse(200, {
        device_code: "d",
        user_code: "CODE",
        verification_uri: "https://aad/activate",
        interval: 1,
        expires_in: 900,
      }),
      jsonResponse(200, { access_token: "at-azure", expires_in: 3600 }),
    ];

    const vault = memoryVault();
    const service = makeService(config);

    const message = await service.login(() => undefined, {
      vault,
      now: () => 1_000_000,
      sleep: async () => {
        /* no delay */
      },
      fetch: (async () => responses.shift()) as unknown as typeof fetch,
    });

    expect(message).toContain("azure");
    expect(parseTokens(vault.get(oauthVaultKey("azure")) as string)?.accessToken).toBe("at-azure");
  });
});
