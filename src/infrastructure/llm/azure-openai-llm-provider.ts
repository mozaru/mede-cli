import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import {
  ILlmProvider,
  LlmGenerationOptions,
  LlmMessage,
  LlmRole,
  LlmTextGenerationResult,
} from "./llm-provider.interface.js";
import { ILlmAuthStrategy, createLlmAuthStrategy, LlmAuthDeps } from "./llm-auth.js";

interface AzureChatCompletionChoice {
  index: number;
  finish_reason: string | null;
  message: {
    role: string;
    content: string | null;
  };
}

interface AzureChatCompletionUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface AzureChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: AzureChatCompletionChoice[];
  usage?: AzureChatCompletionUsage;
}

export class AzureOpenAiLlmProvider implements ILlmProvider {
  private readonly config: MedeConfigModelEntity;
  private readonly messages: LlmMessage[] = [];
  private options: LlmGenerationOptions = {};
  private systemPrompt: string = "";
  private userPrompt: string = "";
  private extraInfo: string = "";
  private readonly authStrategy: ILlmAuthStrategy;

  constructor(config: MedeConfigModelEntity, deps?: LlmAuthDeps) {
    this.config = config;
    this.authStrategy = createLlmAuthStrategy(
      config,
      "Azure OpenAI",
      (apiKey) => ({
        "api-key": apiKey,
      }),
      deps,
    );
  }

  public setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt?.trim() ?? "";
  }

  public setUserPrompt(prompt: string): void {
    this.userPrompt = prompt?.trim() ?? "";
  }

  public setExtraInfo(info: string): void {
    this.extraInfo = info?.trim() ?? "";
  }

  public setOptions(options: LlmGenerationOptions): void {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  public addMessage(actor: LlmRole, content: string): void {
    const normalized = content?.trim();
    if (!normalized) {
      return;
    }

    this.messages.push({
      role: actor,
      content: normalized,
    });
  }

  public addAttachment(fileName: string, contentText: string): void {
    const safeFileName = fileName?.trim() || "attachment.txt";
    const safeContent = contentText?.trim();

    if (!safeContent) {
      return;
    }

    this.messages.push({
      role: "user",
      content: [
        `Anexo textual recebido: ${safeFileName}`,
        "",
        "Conteúdo do anexo:",
        "```text",
        safeContent,
        "```",
      ].join("\n"),
    });
  }

  public addInputDoc(id: number, artifactPath: string, currentContent: string): void {
    const safePath = artifactPath?.trim() || `artifact-${id}`;
    const safeContent = currentContent?.trim();

    if (!safeContent) {
      return;
    }

    this.messages.push({
      role: "user",
      content: [
        `Documento de entrada #${id}`,
        `Origem: ${safePath}`,
        "",
        "Conteúdo atual do documento:",
        "```text",
        safeContent,
        "```",
      ].join("\n"),
    });
  }

  public addOutputDoc(id: number, artifactPath: string, currentContent: string): void {
    const safePath = artifactPath?.trim() || `artifact-${id}`;
    const safeContent = currentContent?.trim() ?? "";

    this.messages.push({
      role: "user",
      content: [
        `Documento de saida #${id}`,
        `Origem: ${safePath}`,
        "",
        "O diff a ser gerado deve ser em cima desse conteúdo atual do documento:",
        "```text",
        safeContent,
        "```",
      ].join("\n"),
    });
  }

  public async generateText(): Promise<LlmTextGenerationResult> {
    const endpoint = this.resolveEndpoint();
    const authHeaders = await this.authStrategy.resolveAuthHeaders();
    const timeoutMs = this.options.timeoutMs ?? this.config.llm.timeoutMs ?? 60000;

    const requestMessages = this.buildRequestMessages();

    if (requestMessages.length === 0) {
      throw new Error("No messages were provided to AzureOpenAiLlmProvider before generateText().");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          model: this.config.llm.model,
          messages: requestMessages,
          temperature: this.options.temperature ?? this.config.llm.temperature,
          max_tokens: this.options.maxTokens ?? this.config.llm.maxTokens,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Azure OpenAI request failed with status ${response.status}: ${errorBody}`);
      }

      const data = (await response.json()) as AzureChatCompletionResponse;
      const firstChoice = data.choices?.[0];
      const rawText = firstChoice?.message?.content?.trim();

      if (!rawText) {
        throw new Error("Azure OpenAI response did not contain text content.");
      }

      return {
        rawText,
        inputTokens: data.usage?.prompt_tokens ?? null,
        outputTokens: data.usage?.completion_tokens ?? null,
        finishReason: firstChoice?.finish_reason ?? null,
        model: data.model ?? null,
      };
    } catch (error) {
      if (this.isAbortError(error)) {
        throw new Error(`Azure OpenAI request aborted due to timeout after ${timeoutMs}ms.`);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildRequestMessages(): LlmMessage[] {
    const result: LlmMessage[] = [];

    if (this.systemPrompt) {
      result.push({ role: "system", content: this.systemPrompt });
    }

    for (const message of this.messages) {
      const content = message.content?.trim();
      if (content) {
        result.push({ role: message.role, content });
      }
    }

    if (this.extraInfo) {
      result.push({ role: "user", content: this.extraInfo });
    }

    if (this.userPrompt) {
      result.push({ role: "user", content: this.userPrompt });
    }

    return result;
  }

  private resolveEndpoint(): string {
    const rawEndpoint = this.config.llm.endpoint?.trim();

    if (!rawEndpoint) {
      throw new Error("LLM endpoint is required for Azure OpenAI provider.");
    }

    const normalizedEndpoint = rawEndpoint.replace(/\/$/, "");

    const hasApiVersion = /[?&]api-version=/.test(normalizedEndpoint);
    if (hasApiVersion) {
      return normalizedEndpoint;
    }

    const separator = normalizedEndpoint.includes("?") ? "&" : "?";
    return `${normalizedEndpoint}${separator}api-version=2024-10-21`;
  }

  private isAbortError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === "AbortError" || error.message.toLowerCase().includes("abort"))
    );
  }
}
