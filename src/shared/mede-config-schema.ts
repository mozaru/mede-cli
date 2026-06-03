import { z } from "zod";
import { MedeConfigModelEntity } from "../domain/entities/mede-config-model-entity.js";

// Single source of truth for validating mede.config.json. Centralizes what was
// previously scattered, unvalidated `JSON.parse(...) as MedeConfigModelEntity`
// casts across the services, so a malformed configuration fails fast with a
// readable message instead of crashing deep inside a cycle.

// Provider names accepted by LlmProviderFactory.create (trimmed + lowercased).
const SUPPORTED_PROVIDERS = [
  "openai",
  "openai-compatible",
  "chatgpt",
  "openrouter",
  "ollama",
  "anthropic",
  "claude",
  "gemini",
  "google",
  "azure",
  "azure-openai",
  "azure-openia",
];

const directoriesSchema = z.object({
  meetingMinutes: z.string(),
  architecturalDecisions: z.string(),
  systemMaintenanceSpecifications: z.string(),
  deliveryLog: z.string(),
});

const fileNamesSchema = z.object({
  initialUnderstanding: z.string(),
  readme: z.string(),
  currentState: z.string(),
  scopeAndVision: z.string(),
  functionalRequirements: z.string(),
  nonFunctionalRequirements: z.string(),
  dataModel: z.string(),
  timeline: z.string(),
});

const prefixesSchema = z.object({
  meetingMinutes: z.string(),
  architecturalDecisions: z.string(),
  systemMaintenanceSpecifications: z.string(),
  deliveryLog: z.string(),
});

const llmSchema = z.object({
  provider: z.string().refine((value) => SUPPORTED_PROVIDERS.includes(value.trim().toLowerCase()), {
    message: `provider não suportado (use um de: ${SUPPORTED_PROVIDERS.join(", ")})`,
  }),
  model: z.string().min(1, "model é obrigatório"),
  endpoint: z.string(),
  apiKeyEnv: z.string().min(1, "apiKeyEnv é obrigatório"),
  // Optional for backward compatibility: configs written before Q2 omit it and
  // default to "apiKey". adc is accepted here but only wired in a later Q2 slice
  // (the auth strategy fails fast with a clear message until then).
  auth: z.enum(["apiKey", "oauth", "adc"]).optional(),
  // OAuth settings, used when auth === "oauth". URLs are optional because a
  // provider preset (e.g. Azure) can fill them; clientId is always required.
  oauth: z
    .object({
      deviceAuthUrl: z.string().optional(),
      tokenUrl: z.string().optional(),
      clientId: z.string().min(1, "oauth.clientId é obrigatório"),
      scope: z.string().optional(),
      tenant: z.string().optional(),
    })
    .optional(),
  temperature: z.number().min(0, "temperature não pode ser negativa"),
  maxTokens: z.number().int().positive("maxTokens deve ser um inteiro positivo"),
  timeoutMs: z.number().int().positive("timeoutMs deve ser um inteiro positivo"),
  credentialsHelper: z.string().optional(),
});

// Prompt sections are optional and only partially filled in real configs.
const promptsSchema = z
  .object({
    meeting: z.string(),
    architecturalDecisions: z.string(),
    systemMaintenanceSpecifications: z.string(),
    deliveryLog: z.string(),
    functionalRequirements: z.string(),
    nonFunctionalRequirements: z.string(),
    dataModel: z.string(),
    timeline: z.string(),
    scopeAndVision: z.string(),
    readme: z.string(),
    currentState: z.string(),
    initialUnderstanding: z.string(),
  })
  .partial();

export const medeConfigSchema = z.object({
  configVersion: z.number().optional(),
  language: z.string(),
  docsRoot: z.string().min(1, "docsRoot é obrigatório"),
  directories: directoriesSchema,
  fileNames: fileNamesSchema,
  prefixes: prefixesSchema,
  llm: llmSchema,
  systemPrompts: promptsSchema.optional(),
  prompts: promptsSchema.optional(),
});

// Parses and validates raw mede.config.json content. Throws an Error whose
// message lists exactly which fields are wrong. Returns the original parsed
// object (unknown keys preserved) typed as MedeConfigModelEntity.
export function parseMedeConfig(content: string): MedeConfigModelEntity {
  if (content.trim() === "") {
    throw new Error("Configuração inválida: mede.config.json está vazio.");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new Error("Configuração inválida: mede.config.json não é um JSON válido.");
  }

  const result = medeConfigSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const where = issue.path.length > 0 ? issue.path.join(".") : "(raiz)";
        return `  - ${where}: ${issue.message}`;
      })
      .join("\n");

    throw new Error(`Configuração inválida (mede.config.json):\n${issues}`);
  }

  return raw as MedeConfigModelEntity;
}
