export interface MedeLlmOAuthConfig {
  // Optional when a provider preset supplies them (e.g. Azure). Required for a
  // generic provider with no preset.
  deviceAuthUrl?: string;
  tokenUrl?: string;
  clientId: string;
  scope?: string;
  // Azure AD tenant (defaults to "common"); ignored by providers without a preset.
  tenant?: string;
  // Callback port for OpenRouter or other PKCE local servers.
  callbackPort?: number;
}

export class MedeLlmConfigEntity {
  public provider: string;
  public model: string;
  public endpoint: string;
  public apiKeyEnv: string;
  // Authentication mode: "apiKey" (default, env var) | "oauth" | "adc". Optional
  // for backward compatibility — configs written before Q2 omit it and fall back
  // to "apiKey". See src/shared/llm/llm-auth.ts.
  public auth?: string;
  // OAuth device-code endpoints, used when auth === "oauth". Optional; populated by
  // the user (or, later, by per-provider presets). See oauth-auth-strategy.ts.
  public oauth?: MedeLlmOAuthConfig;
  public temperature: number;
  public maxTokens: number;
  public timeoutMs: number;
  // Optional credential helper name or "system" / "keychain"
  public credentialsHelper?: string;
  constructor() {
    this.provider = "openai-compatible";
    this.model = "gpt-4.1-mini";
    this.endpoint = "https://api.openai.com/v1";
    this.apiKeyEnv = "OPENAI_API_KEY";
    this.auth = "apiKey";
    this.temperature = 0.1;
    this.maxTokens = 4000;
    this.timeoutMs = 60000;
  }
}
