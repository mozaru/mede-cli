import type { MedeConfigModelEntity } from "../domain/entities/mede-config-model-entity.js";
import type { MedeLlmProfileConfig } from "../domain/entities/mede-llm-config-entity.js";

export const DEFAULT_LLM_PROFILE: Required<
  Pick<
    MedeLlmProfileConfig,
    | "provider"
    | "model"
    | "endpoint"
    | "apiKeyEnv"
    | "auth"
    | "temperature"
    | "maxTokens"
    | "timeoutMs"
  >
> = {
  provider: "openai",
  model: "gpt-5.4",
  endpoint: "https://api.openai.com/v1",
  apiKeyEnv: "OPENAI_API_KEY",
  auth: "apiKey",
  temperature: 0.1,
  maxTokens: 12000,
  timeoutMs: 180000,
};

export function resolveLlmConfig(
  config: MedeConfigModelEntity,
  routeKey?: string,
): MedeConfigModelEntity {
  const routeProfileName = routeKey ? config.llmRouting?.[routeKey] : undefined;
  const profileName = routeProfileName ?? config.llm.activeProfile;
  const profile = resolveProfile(config, profileName);
  const llm = mergeDefined(DEFAULT_LLM_PROFILE, config.llm, profile);

  const provider = (llm.provider ?? "").trim().toLowerCase();
  const isOpenAiCompatible = ["openai", "openai-compatible", "chatgpt", "openrouter"].includes(
    provider,
  );

  if (!isOpenAiCompatible && llm.endpoint === "https://api.openai.com/v1") {
    delete (llm as any).endpoint;
  }

  return {
    ...config,
    llm: {
      ...llm,
      activeProfile: profileName,
      profiles: config.llm.profiles,
    },
  } as MedeConfigModelEntity;
}

function resolveProfile(
  config: MedeConfigModelEntity,
  profileName: string | undefined,
): MedeLlmProfileConfig | undefined {
  if (!profileName) {
    return undefined;
  }

  const profile = config.llm.profiles?.[profileName];
  if (!profile) {
    throw new Error(`Perfil LLM "${profileName}" não encontrado em llm.profiles.`);
  }

  return profile;
}

function mergeDefined(...configs: Array<object | undefined>): MedeLlmProfileConfig {
  const merged: Record<string, unknown> = {};

  for (const config of configs) {
    if (!config) {
      continue;
    }

    for (const [key, value] of Object.entries(config) as Array<[string, unknown]>) {
      if (value !== undefined) {
        merged[key] = value;
      }
    }
  }

  return merged as MedeLlmProfileConfig;
}
