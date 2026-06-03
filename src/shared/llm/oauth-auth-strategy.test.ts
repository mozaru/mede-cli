import { describe, it, expect, vi } from "vitest";
import { MedeConfigModelEntity } from "../../entities/mede-config-model-entity.js";
import { ISecretVault } from "../secret-vault.js";
import {
  OAuthAuthStrategy,
  oauthVaultKey,
  serializeTokens,
  parseTokens,
} from "./oauth-auth-strategy.js";

function memoryVault(initial: Record<string, string> = {}): ISecretVault {
  const store = new Map(Object.entries(initial));
  return {
    get: (key) => store.get(key),
    set: (key, value) => void store.set(key, value),
    delete: (key) => void store.delete(key),
  };
}

function makeConfig(withOAuth = true): MedeConfigModelEntity {
  const config = new MedeConfigModelEntity();
  config.llm.provider = "azure";
  config.llm.auth = "oauth";
  if (withOAuth) {
    config.llm.oauth = {
      deviceAuthUrl: "https://idp.test/devicecode",
      tokenUrl: "https://idp.test/token",
      clientId: "client-123",
    };
  }
  return config;
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

const KEY = oauthVaultKey("azure");

describe("OAuthAuthStrategy", () => {
  it("returns a Bearer header from a valid stored token", async () => {
    const vault = memoryVault({
      [KEY]: serializeTokens({ accessToken: "at-1", expiresAt: 2_000_000 }),
    });
    const strategy = new OAuthAuthStrategy(makeConfig(), "Azure OpenAI", vault, {
      fetch: vi.fn() as unknown as typeof fetch,
      now: () => 1_000_000,
    });

    await expect(strategy.resolveAuthHeaders()).resolves.toEqual({
      Authorization: "Bearer at-1",
    });
  });

  it("tells the user to log in when no token is stored", async () => {
    const strategy = new OAuthAuthStrategy(makeConfig(), "Azure OpenAI", memoryVault(), {
      fetch: vi.fn() as unknown as typeof fetch,
      now: () => 1_000_000,
    });

    await expect(strategy.resolveAuthHeaders()).rejects.toThrow(/mede-cli llm login/);
  });

  it("refreshes an expired token and persists the new one", async () => {
    const vault = memoryVault({
      [KEY]: serializeTokens({ accessToken: "old", refreshToken: "rt-1", expiresAt: 500_000 }),
    });
    const fetchStub = vi.fn(async () =>
      jsonResponse(200, { access_token: "at-refreshed", expires_in: 3600 }),
    ) as unknown as typeof fetch;

    const strategy = new OAuthAuthStrategy(makeConfig(), "Azure OpenAI", vault, {
      fetch: fetchStub,
      now: () => 1_000_000,
    });

    await expect(strategy.resolveAuthHeaders()).resolves.toEqual({
      Authorization: "Bearer at-refreshed",
    });

    const stored = parseTokens(vault.get(KEY) as string);
    expect(stored?.accessToken).toBe("at-refreshed");
  });

  it("requires re-login when the token expired and there is no refresh token", async () => {
    const vault = memoryVault({
      [KEY]: serializeTokens({ accessToken: "old", expiresAt: 500_000 }),
    });
    const strategy = new OAuthAuthStrategy(makeConfig(), "Azure OpenAI", vault, {
      fetch: vi.fn() as unknown as typeof fetch,
      now: () => 1_000_000,
    });

    await expect(strategy.resolveAuthHeaders()).rejects.toThrow(/expirou/);
  });
});
