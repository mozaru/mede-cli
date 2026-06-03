import type { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import type { IProjectConfigRepository } from "../repositories/interfaces/project-config-repository-interface.js";
import { LlmProviderFactory } from "../shared/llm/llm-provider-factory.js";
import { MedeConfigModelEntity } from "../entities/mede-config-model-entity.js";
import { parseMedeConfig } from "../shared/mede-config-schema.js";
import { withRetry } from "../shared/retry.js";
import { logger } from "../shared/logger.js";
import { FileSecretVault, ISecretVault } from "../shared/secret-vault.js";
import { DeviceCodeFlow } from "../shared/llm/oauth-device-code-flow.js";
import {
  buildDeviceCodeConfig,
  oauthVaultKey,
  serializeTokens,
} from "../shared/llm/oauth-auth-strategy.js";

export interface LlmLoginDeps {
  vault?: ISecretVault;
  fetch?: typeof fetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
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
    const vault = deps?.vault ?? new FileSecretVault();
    vault.set(oauthVaultKey(config.llm.provider), serializeTokens(tokens));

    const reminder =
      (config.llm.auth ?? "apiKey").trim().toLowerCase() === "oauth"
        ? ""
        : '\nLembrete: defina "llm.auth": "oauth" no mede.config.json para usar estas credenciais.';

    return `Login OAuth concluído para o provider ${config.llm.provider}.${reminder}`;
  }

  // Removes any stored OAuth tokens for the configured provider.
  public logout(deps?: { vault?: ISecretVault }): string {
    const config = this.getCurrentConfig();
    const vault = deps?.vault ?? new FileSecretVault();
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
