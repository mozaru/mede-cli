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

const providerSchema = z
  .string()
  .refine((value) => SUPPORTED_PROVIDERS.includes(value.trim().toLowerCase()), {
    message: `provider nao suportado (use um de: ${SUPPORTED_PROVIDERS.join(", ")})`,
  });

const llmProfileSchema = z.object({
  provider: providerSchema.optional(),
  model: z.string().min(1, "model e obrigatorio").optional(),
  endpoint: z.string().optional(),
  apiKeyEnv: z.string().min(1, "apiKeyEnv e obrigatorio").optional(),
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
      clientId: z.string().min(1, "oauth.clientId e obrigatorio"),
      scope: z.string().optional(),
      tenant: z.string().optional(),
    })
    .optional(),
  temperature: z.number().min(0, "temperature nao pode ser negativa").optional(),
  maxTokens: z.number().int().positive("maxTokens deve ser um inteiro positivo").optional(),
  timeoutMs: z.number().int().positive("timeoutMs deve ser um inteiro positivo").optional(),
  credentialsHelper: z.string().optional(),
});

const llmSchema = llmProfileSchema
  .extend({
    activeProfile: z.string().min(1).optional(),
    profiles: z.record(z.string(), llmProfileSchema).optional(),
  })
  .superRefine((llm, ctx) => {
    if (llm.activeProfile && !llm.profiles?.[llm.activeProfile]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["activeProfile"],
        message: `perfil LLM ativo "${llm.activeProfile}" nao existe em llm.profiles`,
      });
    }
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

const shortDescriptionSlugSchema = z
  .object({
    enabled: z.boolean(),
    prompt: z.string(),
  })
  .partial()
  .optional();

export const medeConfigSchema = z.object({
  configVersion: z.number().optional(),
  language: z.string(),
  docsRoot: z.string().min(1, "docsRoot e obrigatorio"),
  projectName: z.string().optional(),
  clientName: z.string().optional(),
  supplierName: z.string().optional(),
  directories: directoriesSchema,
  fileNames: fileNamesSchema,
  prefixes: prefixesSchema,
  llm: llmSchema,
  llmRouting: z.record(z.string(), z.string().min(1)).optional(),
  systemPrompts: promptsSchema.optional(),
  prompts: promptsSchema.optional(),
  shortDescriptionSlug: shortDescriptionSlugSchema,
});

// Parses and validates raw mede.config.json content. Throws an Error whose
// message lists exactly which fields are wrong. Returns the original parsed
// object (unknown keys preserved) typed as MedeConfigModelEntity.
export function parseMedeConfig(content: string): MedeConfigModelEntity {
  if (content.trim() === "") {
    throw new Error("Configuracao invalida: mede.config.json esta vazio.");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new Error("Configuracao invalida: mede.config.json nao e um JSON valido.");
  }

  const result = medeConfigSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const where = issue.path.length > 0 ? issue.path.join(".") : "(raiz)";
        return `  - ${where}: ${issue.message}`;
      })
      .join("\n");

    throw new Error(`Configuracao invalida (mede.config.json):\n${issues}`);
  }

  return raw as MedeConfigModelEntity;
}
