import type { IProjectRepository } from "../../domain/interfaces/repositories/project-repository-interface.js";
import type { IProjectConfigRepository } from "../../domain/interfaces/repositories/project-config-repository-interface.js";
import { LlmProviderFactory } from "../../infrastructure/llm/llm-provider-factory.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import { parseMedeConfig } from "../../shared/mede-config-schema.js";
import { resolveLlmConfig } from "../../shared/llm-config-resolver.js";
import { withRetry } from "../../shared/retry.js";
import { logger } from "../../shared/logger.js";
import { ISecretVault, createSecretVault } from "../../shared/secret-vault.js";
import { DeviceCodeFlow } from "../../infrastructure/llm/oauth-device-code-flow.js";
import {
  buildDeviceCodeConfig,
  oauthVaultKey,
  serializeTokens,
} from "../../infrastructure/llm/oauth-auth-strategy.js";
import {
  OpenRouterPkceFlow,
  createBrowserAuthorize,
} from "../../infrastructure/llm/openrouter-pkce-flow.js";

export interface LlmLoginDeps {
  vault?: ISecretVault;
  fetch?: typeof fetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  authorize?: (authUrl: string, callbackUrl: string) => Promise<string>;
}

function getFamily(providerName: string): string {
  const p = providerName.trim().toLowerCase();
  if (["openai", "openai-compatible", "chatgpt", "openrouter"].includes(p)) return "openai";
  if (["anthropic", "claude"].includes(p)) return "anthropic";
  if (["gemini", "google"].includes(p)) return "gemini";
  if (["ollama"].includes(p)) return "ollama";
  if (["azure", "azure-openai", "azure-openia"].includes(p)) return "azure";
  return p;
}

export class LlmService {
  private readonly projectRepository: IProjectRepository;
  private readonly projectConfigRepository: IProjectConfigRepository;

  constructor(
    projectRepository: IProjectRepository,
    projectConfigRepository: IProjectConfigRepository,
  ) {
    this.projectRepository = projectRepository;
    this.projectConfigRepository = projectConfigRepository;
  }

  public providers(): string {
    const project = this.projectRepository.getCurrent();
    this.assertNotNull(project, "Project not found");

    const configEntity = this.projectConfigRepository.getCurrent(project.id);
    this.assertNotNull(configEntity, "Config not found");

    const config = resolveLlmConfig(this.parseConfig(configEntity.content));

    const activeProfileName = config.llm.activeProfile;
    const profiles = config.llm.profiles ?? {};
    const routing = config.llmRouting ?? {};

    // 1. Supported Providers Status
    const families = [
      { id: "openai", label: "openai", defaultKey: "OPENAI_API_KEY" },
      { id: "anthropic", label: "anthropic", defaultKey: "ANTHROPIC_API_KEY" },
      { id: "gemini", label: "gemini", defaultKey: "GEMINI_API_KEY" },
      { id: "ollama", label: "ollama", defaultKey: "" },
      { id: "azure", label: "azure(openai)", defaultKey: "AZURE_OPENAI_API_KEY" },
    ];

    const providerStatusLines = ["", "  LLM - Supported Providers Status"];
    for (const fam of families) {
      let model = "";
      let apiKeyEnv = fam.defaultKey;

      const baseFamily = getFamily(config.llm.provider);
      if (baseFamily === fam.id) {
        model = config.llm.model;
        if (config.llm.apiKeyEnv) {
          apiKeyEnv = config.llm.apiKeyEnv;
        }
      }

      for (const prof of Object.values(profiles)) {
        const profFamily = getFamily(prof.provider ?? config.llm.provider ?? "openai");
        if (profFamily === fam.id) {
          model = prof.model ?? model;
          apiKeyEnv = prof.apiKeyEnv ?? apiKeyEnv;
        }
      }

      const isConfigured = model !== "";
      const configStr = isConfigured ? `Configured (${model})` : "Not Configured";

      let keyStr = "N/A";
      if (fam.defaultKey) {
        const keyPresent = !!process.env[apiKeyEnv];
        keyStr = keyPresent ? `Present (${apiKeyEnv})` : `Missing (${apiKeyEnv})`;
      }

      const label = `  ${fam.label}`;
      providerStatusLines.push(
        `${label.padEnd(20)} - Status: ${configStr.padEnd(35)} | Key: ${keyStr}`,
      );
    }

    // 2. Profiles Status
    const profileLines = ["", "  LLM - Profiles"];
    if (Object.keys(profiles).length > 0) {
      for (const [name, profile] of Object.entries(profiles)) {
        const provider = profile.provider ?? config.llm.provider ?? "openai";
        const model = profile.model ?? config.llm.model ?? "unknown";
        const isActive = name === activeProfileName;
        const activeLabel = isActive ? " [Ativo]" : "";
        const label = `  ${name} (${provider})${activeLabel}`;
        profileLines.push(`${label.padEnd(40)} - ${model}`);
      }
    } else {
      profileLines.push("  Nenhum perfil configurado (usando configuração legada global)");
    }

    // 3. Routing Status
    const routingLines = ["", "  LLM - Routing (llmRouting)"];
    if (Object.keys(routing).length > 0) {
      for (const [phase, profileName] of Object.entries(routing)) {
        routingLines.push(`  ${phase.padEnd(35)} -> ${profileName}`);
      }
    } else {
      routingLines.push("  Nenhum roteamento configurado (todas as fases usam o perfil ativo)");
    }

    const parts = [
      providerStatusLines.join("\n"),
      profileLines.join("\n"),
      routingLines.join("\n"),
    ];

    return parts.join("\n") + "\n";
  }

  public async test(prompt: string): Promise<string> {
    const project = this.projectRepository.getCurrent();
    this.assertNotNull(project, "Project not found");

    const configEntity = this.projectConfigRepository.getCurrent(project.id);
    this.assertNotNull(configEntity, "Config not found");

    const config = resolveLlmConfig(parseMedeConfig(configEntity.content));
    const llm = LlmProviderFactory.create(config);
    llm.setOptions(config.llm);
    llm.setUserPrompt(prompt);

    const response = await withRetry(() => llm.generateText(), {
      onRetry: (error, attempt, delayMs) =>
        logger.warn(
          `LLM falhou (tentativa ${attempt}); novo retry em ${delayMs}ms: ` +
            `${error instanceof Error ? error.message : String(error)}`,
        ),
    });

    return response.rawText;
  }

  // Runs the OAuth device-code login for the configured provider and stores the
  // resulting tokens in the secret vault. `display` is called mid-flow with the
  // verification instructions (the handler prints them so the user can authorize
  // before this resolves).
  public async login(display: (message: string) => void, deps?: LlmLoginDeps): Promise<string> {
    const config = this.getCurrentConfig();
    const vault = deps?.vault ?? createSecretVault(config.llm.credentialsHelper);

    // OpenRouter authenticates via OAuth PKCE that *provisions an API key*. Store
    // the key as a non-expiring token so OAuthAuthStrategy serves it as a Bearer.
    if (this.isOpenRouter(config)) {
      const flow = new OpenRouterPkceFlow({
        fetch: deps?.fetch ?? fetch,
        authorize: deps?.authorize ?? createBrowserAuthorize({ notify: display }),
      });
      const key = await flow.login();
      vault.set(oauthVaultKey(config.llm.provider), serializeTokens({ accessToken: key }));
      return `Login OpenRouter concluído (key provisionada e guardada no cofre).${this.authReminder(config)}`;
    }

    const deviceConfig = buildDeviceCodeConfig(config);
    if (!deviceConfig) {
      throw new Error(
        'OAuth não configurado. Defina "llm.oauth" (deviceAuthUrl, tokenUrl, clientId) no ' +
          "mede.config.json. Presets por provider (Azure/Vertex/OpenRouter) chegam na próxima fase.",
      );
    }

    const flow = new DeviceCodeFlow(deviceConfig, {
      fetch: deps?.fetch ?? fetch,
      now: deps?.now ?? Date.now,
      sleep: deps?.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms))),
      display: (verificationUri, userCode) =>
        display(
          `Para autenticar, acesse: ${verificationUri}\n` +
            `E informe o código: ${userCode}\n` +
            "Aguardando autorização...",
        ),
    });

    const tokens = await flow.authenticate();
    vault.set(oauthVaultKey(config.llm.provider), serializeTokens(tokens));

    return `Login OAuth concluído para o provider ${config.llm.provider}.${this.authReminder(config)}`;
  }

  private isOpenRouter(config: MedeConfigModelEntity): boolean {
    return (
      config.llm.provider.trim().toLowerCase() === "openrouter" ||
      (config.llm.endpoint ?? "").toLowerCase().includes("openrouter.ai")
    );
  }

  // Reminds the user to flip auth to "oauth" when they logged in but the config
  // still points at another mode (so the stored credential is actually used).
  private authReminder(config: MedeConfigModelEntity): string {
    return (config.llm.auth ?? "apiKey").trim().toLowerCase() === "oauth"
      ? ""
      : '\nLembrete: defina "llm.auth": "oauth" no mede.config.json para usar estas credenciais.';
  }

  // Removes any stored OAuth tokens for the configured provider.
  public logout(deps?: { vault?: ISecretVault }): string {
    const config = this.getCurrentConfig();
    const vault = deps?.vault ?? createSecretVault(config.llm.credentialsHelper);
    vault.delete(oauthVaultKey(config.llm.provider));
    return `Logout OAuth concluído para o provider ${config.llm.provider}.`;
  }

  private getCurrentConfig(): MedeConfigModelEntity {
    const project = this.projectRepository.getCurrent();
    this.assertNotNull(project, "Project not found");

    const configEntity = this.projectConfigRepository.getCurrent(project.id);
    this.assertNotNull(configEntity, "Config not found");

    return resolveLlmConfig(this.parseConfig(configEntity.content));
  }

  private parseConfig(content: string): MedeConfigModelEntity {
    return parseMedeConfig(content);
  }

  private assertNotNull<T>(value: T | null, message: string): asserts value is T {
    if (value === null) {
      throw new Error(message);
    }
  }
}
