import { MedeConfigModelEntity } from "../../entities/mede-config-model-entity.js";
import {
  ILlmProvider,
  LlmGenerationOptions,
  LlmMessage,
  LlmRole,
  LlmTextGenerationResult,
} from "./llm-provider.interface.js";

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

  constructor(config: MedeConfigModelEntity) {
    this.config = config;
  }

  public setSystemPrompt(prompt: string): void {
    const normalized = prompt?.trim();
    this.removeMessagesByRole("system");

    if (normalized) {
      this.messages.unshift({
        role: "system",
        content: normalized,
      });
    }
  }

  public setUserPrompt(prompt: string): void {
    const normalized = prompt?.trim();
    this.removeMessagesByRole("user");

    if (normalized) {
      this.messages.push({
        role: "user",
        content: normalized,
      });
    }
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

  public addInputDoc(
    id: number,
    artifactPath: string,
    currentContent: string,
  ): void {
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

  public addOutputDoc(
    id: number,
    artifactPath: string,
    currentContent: string,
  ): void {
    const safePath = artifactPath?.trim() || `artifact-${id}`;
    const safeContent = currentContent?.trim();

    if (!safeContent) {
      return;
    }

    this.messages.push({
      role: "user",
      content: [
        `Documento de saida o diff eh em cima desse conteudo #${id}`,
        `Origem: ${safePath}`,
        "",
        "Conteúdo atual do documento:",
        "```text",
        safeContent,
        "```",
      ].join("\n"),
    });
  }


  public async generateText(): Promise<LlmTextGenerationResult> {
    const endpoint = this.resolveEndpoint();
    const apiKey = this.resolveApiKey();
    const timeoutMs =
      this.options.timeoutMs ?? this.config.llm.timeoutMs ?? 60000;

    const requestMessages = this.buildRequestMessages();

    if (requestMessages.length === 0) {
      throw new Error(
        "No messages were provided to AzureOpenAiLlmProvider before generateText().",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          model: this.config.llm.model,
          messages: requestMessages,
          temperature:
            this.options.temperature ?? this.config.llm.temperature,
          max_tokens:
            this.options.maxTokens ?? this.config.llm.maxTokens,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Azure OpenAI request failed with status ${response.status}: ${errorBody}`,
        );
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
        throw new Error(
          `Azure OpenAI request aborted due to timeout after ${timeoutMs}ms.`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildRequestMessages(): LlmMessage[] {
    return this.messages
      .map((message) => ({
        role: message.role,
        content: message.content?.trim() ?? "",
      }))
      .filter((message) => Boolean(message.content));
  }

  private removeMessagesByRole(role: LlmRole): void {
    for (let i = this.messages.length - 1; i >= 0; i -= 1) {
      if (this.messages[i]?.role === role) {
        this.messages.splice(i, 1);
      }
    }
  }

  private resolveEndpoint(): string {
    const rawEndpoint = this.config.llm.endpoint?.trim();

    if (!rawEndpoint) {
      throw new Error(
        "LLM endpoint is required for Azure OpenAI provider.",
      );
    }

    const normalizedEndpoint = rawEndpoint.replace(/\/$/, "");

    const hasApiVersion = /[?&]api-version=/.test(normalizedEndpoint);
    if (hasApiVersion) {
      return normalizedEndpoint;
    }

    const separator = normalizedEndpoint.includes("?") ? "&" : "?";
    return `${normalizedEndpoint}${separator}api-version=2024-10-21`;
  }

  private resolveApiKey(): string {
    const apiKeyEnv = this.config.llm.apiKeyEnv?.trim();

    if (!apiKeyEnv) {
      throw new Error(
        "LLM apiKeyEnv is not configured for Azure OpenAI provider.",
      );
    }

    const apiKey = process.env[apiKeyEnv];

    if (!apiKey?.trim()) {
      throw new Error(
        `Environment variable "${apiKeyEnv}" is not set or is empty.`,
      );
    }

    return apiKey;
  }

  private isAbortError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message.toLowerCase().includes("abort"))
    );
  }
}