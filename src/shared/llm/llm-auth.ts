import { MedeConfigModelEntity } from "../../entities/mede-config-model-entity.js";

// Authentication strategy for LLM providers (Q2). Decouples *where the credential
// comes from* (env var, OAuth token, Google ADC) from *how a provider injects it
// into the request headers*. In this first slice only "apiKey" is implemented —
// the exact behavior every provider had inline before — but the seam lets "oauth"
// and "adc" be added later without touching the providers' request code again.
export type AuthMode = "apiKey" | "oauth" | "adc";

// Builds the provider-specific header(s) that carry an API key. Each provider has
// its own convention (OpenAI: `Authorization: Bearer`, Anthropic: `x-api-key`,
// Gemini: `x-goog-api-key`, Azure: `api-key`), so the provider supplies this and
// the apiKey strategy just feeds it the resolved key.
export type ApiKeyHeaderBuilder = (apiKey: string) => Record<string, string>;

export interface ILlmAuthStrategy {
  // Resolves the authentication headers to merge into the outgoing request.
  // Async on purpose: oauth/adc strategies will need to fetch/refresh tokens.
  resolveAuthHeaders(): Promise<Record<string, string>>;
}

// Reads the credential from the environment variable named by `apiKeyEnv` and
// hands it to the provider's header builder. Preserves the exact error messages
// the providers used before, so existing behavior (and any callers relying on
// them) is unchanged.
export class ApiKeyAuthStrategy implements ILlmAuthStrategy {
  private readonly config: MedeConfigModelEntity;
  private readonly providerLabel: string;
  private readonly buildHeader: ApiKeyHeaderBuilder;

  public constructor(
    config: MedeConfigModelEntity,
    providerLabel: string,
    buildHeader: ApiKeyHeaderBuilder,
  ) {
    this.config = config;
    this.providerLabel = providerLabel;
    this.buildHeader = buildHeader;
  }

  public async resolveAuthHeaders(): Promise<Record<string, string>> {
    return this.buildHeader(this.resolveApiKey());
  }

  private resolveApiKey(): string {
    const apiKeyEnv = this.config.llm.apiKeyEnv?.trim();

    if (!apiKeyEnv) {
      throw new Error(`LLM apiKeyEnv is not configured for ${this.providerLabel} provider.`);
    }

    const apiKey = process.env[apiKeyEnv];

    if (!apiKey?.trim()) {
      throw new Error(`Environment variable "${apiKeyEnv}" is not set or is empty.`);
    }

    return apiKey;
  }
}

// Picks the auth strategy for a provider based on `config.llm.auth` (default
// "apiKey"). oauth/adc are accepted by the config schema but not wired yet, so
// they fail with a clear, actionable message instead of silently doing nothing.
export function createLlmAuthStrategy(
  config: MedeConfigModelEntity,
  providerLabel: string,
  buildApiKeyHeader: ApiKeyHeaderBuilder,
): ILlmAuthStrategy {
  const mode = (config.llm.auth ?? "apiKey").trim().toLowerCase();

  switch (mode) {
    case "apikey":
      return new ApiKeyAuthStrategy(config, providerLabel, buildApiKeyHeader);

    case "oauth":
    case "adc":
      throw new Error(
        `O modo de autenticação "${config.llm.auth}" ainda não está disponível para o provider ` +
          `${providerLabel} (será habilitado nas próximas fases da Q2). Use auth "apiKey" por enquanto.`,
      );

    default:
      throw new Error(
        `Modo de autenticação desconhecido: "${config.llm.auth}". Use "apiKey", "oauth" ou "adc".`,
      );
  }
}
