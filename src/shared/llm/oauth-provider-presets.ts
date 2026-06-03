import { MedeLlmOAuthConfig } from "../../entities/mede-llm-config-entity.js";
import { DeviceCodeConfig } from "./oauth-device-code-flow.js";

// Per-provider OAuth presets. They spare the user from hand-writing endpoint URLs
// for the "clean" providers (those whose OAuth yields a Bearer valid on the same
// REST endpoint we already call). The user supplies only the account-specific
// bits (clientId, and tenant for Azure); explicit values in mede.config.json
// always win over the preset.

type OAuthPreset = (oauth: MedeLlmOAuthConfig) => DeviceCodeConfig | undefined;

// Azure Entra ID (AAD) device-code. Token is a Bearer accepted by the Azure
// OpenAI REST endpoint in place of the api-key. Scope defaults to Cognitive
// Services + offline_access (so a refresh token is issued).
const azurePreset: OAuthPreset = (oauth) => {
  const clientId = oauth.clientId?.trim();
  if (!clientId) {
    return undefined;
  }

  const tenant = oauth.tenant?.trim() || "common";
  const base = `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0`;

  return {
    deviceAuthUrl: oauth.deviceAuthUrl?.trim() || `${base}/devicecode`,
    tokenUrl: oauth.tokenUrl?.trim() || `${base}/token`,
    clientId,
    scope: oauth.scope?.trim() || "https://cognitiveservices.azure.com/.default offline_access",
  };
};

const PRESETS: Record<string, OAuthPreset> = {
  azure: azurePreset,
  "azure-openai": azurePreset,
  "azure-openia": azurePreset,
};

// Resolves the effective device-code config for a provider: applies the preset
// when one exists, otherwise requires the three core fields to be present
// explicitly. Returns undefined when the result is still incomplete (callers turn
// that into an actionable error).
export function resolveDeviceCodeConfig(
  provider: string,
  oauth: MedeLlmOAuthConfig,
): DeviceCodeConfig | undefined {
  const preset = PRESETS[provider.trim().toLowerCase()];
  if (preset) {
    return preset(oauth);
  }

  const deviceAuthUrl = oauth.deviceAuthUrl?.trim();
  const tokenUrl = oauth.tokenUrl?.trim();
  const clientId = oauth.clientId?.trim();

  if (!deviceAuthUrl || !tokenUrl || !clientId) {
    return undefined;
  }

  return { deviceAuthUrl, tokenUrl, clientId, scope: oauth.scope?.trim() || undefined };
}
