import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import type { ISecretVault } from "../../shared/secret-vault.js";
import type { ILlmAuthStrategy } from "./llm-auth.js";
import { DeviceCodeConfig, DeviceCodeFlow, OAuthTokens } from "./oauth-device-code-flow.js";
import { resolveDeviceCodeConfig } from "./oauth-provider-presets.js";

// Refresh a little before the real expiry so an in-flight request doesn't race
// the clock.
const EXPIRY_SKEW_MS = 60_000;

// Vault key for a provider's OAuth tokens. Scoped by provider so the same user
// account is reused across projects, but Azure tokens never collide with Gemini's.
export function oauthVaultKey(provider: string): string {
  return `oauth:${provider.trim().toLowerCase()}`;
}

export function serializeTokens(tokens: OAuthTokens): string {
  return JSON.stringify(tokens);
}

export function parseTokens(raw: string): OAuthTokens | undefined {
  try {
    const parsed = JSON.parse(raw) as Partial<OAuthTokens>;
    if (parsed && typeof parsed.accessToken === "string") {
      return {
        accessToken: parsed.accessToken,
        refreshToken: typeof parsed.refreshToken === "string" ? parsed.refreshToken : undefined,
        expiresAt: typeof parsed.expiresAt === "number" ? parsed.expiresAt : undefined,
      };
    }
  } catch {
    // fall through
  }
  return undefined;
}

// Builds the device-code/refresh endpoint config from the user's mede.config.json
// (`llm.oauth`). Returns undefined when the block is absent/incomplete — callers
// turn that into an actionable error. Provider presets (Azure/Vertex/OpenRouter)
// will layer on top of this in the next slice.
export function buildDeviceCodeConfig(config: MedeConfigModelEntity): DeviceCodeConfig | undefined {
  const oauth = config.llm.oauth;
  if (!oauth) {
    return undefined;
  }

  return resolveDeviceCodeConfig(config.llm.provider, oauth);
}

export interface OAuthAuthStrategyDeps {
  fetch: typeof fetch;
  now: () => number;
}

// Uses tokens previously stored by `mede-cli llm login`. Transparently refreshes
// an expired access token when a refresh token + endpoints are available;
// otherwise tells the user to log in again. Never starts an interactive device
// flow here — request time is the wrong place to block on a browser.
export class OAuthAuthStrategy implements ILlmAuthStrategy {
  private readonly config: MedeConfigModelEntity;
  private readonly providerLabel: string;
  private readonly vault: ISecretVault;
  private readonly deps: OAuthAuthStrategyDeps;

  public constructor(
    config: MedeConfigModelEntity,
    providerLabel: string,
    vault: ISecretVault,
    deps: OAuthAuthStrategyDeps,
  ) {
    this.config = config;
    this.providerLabel = providerLabel;
    this.vault = vault;
    this.deps = deps;
  }

  public async resolveAuthHeaders(): Promise<Record<string, string>> {
    const key = oauthVaultKey(this.config.llm.provider);
    const raw = this.vault.get(key);

    if (!raw) {
      throw new Error(
        `Nenhuma credencial OAuth encontrada para o provider ${this.providerLabel}. ` +
          `Rode "mede-cli llm login" para autenticar.`,
      );
    }

    const tokens = parseTokens(raw);
    if (!tokens) {
      throw new Error(
        `Credencial OAuth de ${this.providerLabel} está corrompida. ` +
          `Rode "mede-cli llm login" novamente.`,
      );
    }

    const accessToken = await this.ensureFreshToken(key, tokens);
    return { Authorization: `Bearer ${accessToken}` };
  }

  private async ensureFreshToken(key: string, tokens: OAuthTokens): Promise<string> {
    const isExpired =
      typeof tokens.expiresAt === "number" && this.deps.now() >= tokens.expiresAt - EXPIRY_SKEW_MS;

    if (!isExpired) {
      return tokens.accessToken;
    }

    const deviceConfig = buildDeviceCodeConfig(this.config);
    if (!tokens.refreshToken || !deviceConfig) {
      throw new Error(
        `A sessão OAuth de ${this.providerLabel} expirou. Rode "mede-cli llm login" novamente.`,
      );
    }

    const flow = new DeviceCodeFlow(deviceConfig, {
      fetch: this.deps.fetch,
      now: this.deps.now,
      // Refresh is a single non-interactive token exchange — no polling, no prompt.
      sleep: async () => {
        /* not used by refresh() */
      },
      display: () => {
        /* not used by refresh() */
      },
    });

    const refreshed = await flow.refresh(tokens.refreshToken);
    this.vault.set(key, serializeTokens(refreshed));
    return refreshed.accessToken;
  }
}
