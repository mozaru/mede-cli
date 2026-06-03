import type { IProjectRepository } from "../../domain/interfaces/repositories/project-repository-interface.js";
import type { IProjectConfigRepository } from "../../domain/interfaces/repositories/project-config-repository-interface.js";
import { LlmProviderFactory } from "../../infrastructure/llm/llm-provider-factory.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import { parseMedeConfig } from "../../shared/mede-config-schema.js";
import { withRetry } from "../../shared/retry.js";
import { logger } from "../../shared/logger.js";
import { ISecretVault, createSecretVault } from "../../shared/secret-vault.js";
import { DeviceCodeFlow } from "../../infrastructure/llm/oauth-device-code-flow.js";
import {
  buildDeviceCodeConfig,
  oauthVaultKey,
  serializeTokens,
} from "../../infrastructure/llm/oauth-auth-strategy.js";
import { OpenRouterPkceFlow, createBrowserAuthorize } from "../../infrastructure/llm/openrouter-pkce-flow.js";

export interface LlmLoginDeps {
  vault?: ISecretVault;
  fetch?: typeof fetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  // OpenRouter PKCE: overrides the browser+callback step (tests).
  authorize?: (authUrl: string, callbackUrl: string) => Promise<string>;
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

    const config = this.parseConfig(configEntity.content);

    const anthropicModel =
      config.llm.provider === "anthropic-compatible" ? config.llm.model : "None";

    const azureModel = config.llm.provider === "azure-compatible" ? config.llm.model : "None";

    const geminiModel = config.llm.provider === "gemini-compatible" ? config.llm.model : "None";

    const ollamaModel = config.llm.provider === "ollama-compatible" ? config.llm.model : "None";

    const openaiModel = config.llm.provider === "openai-compatible" ? config.llm.model : "None";

    return `
  LLM - Providers Status
  anthropic       - ${anthropicModel}
  azure(openai)   - ${azureModel}
  gemini          - ${geminiModel}
  ollama          - ${ollamaModel}
  openai          - ${openaiModel}
`;
  }

  public async test(prompt: string): Promise<string> {
    const project = this.projectRepository.getCurrent();
    this.assertNotNull(project, "Project not found");

    const configEntity = this.projectConfigRepository.getCurrent(project.id);
    this.assertNotNull(configEntity, "Config not found");

    const config = parseMedeConfig(configEntity.content);
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

    return this.parseConfig(configEntity.content);
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
