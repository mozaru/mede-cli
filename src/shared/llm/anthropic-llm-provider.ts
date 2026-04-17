import { MedeConfigModelEntity } from "../../entities/mede-config-model-entity.js";
import {
  ILlmProvider,
  LlmGenerationOptions,
  LlmMessage,
  LlmRole,
  LlmTextGenerationResult,
} from "./llm-provider.interface.js";

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicMessageResponse {
  id: string;
  type: string;
  role: string;
  model: string;
  content: AnthropicContentBlock[];
  stop_reason?: string | null;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

interface AnthropicRequestMessage {
  role: "user" | "assistant";
  content: string;
}

export class AnthropicLlmProvider implements ILlmProvider {
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

    const { system, anthropicMessages } = this.normalizeMessages(this.messages);

    if (anthropicMessages.length === 0) {
      throw new Error(
        "No user/assistant messages were provided to AnthropicLlmProvider before generateText().",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.config.llm.model,
          max_tokens:
            this.options.maxTokens ?? this.config.llm.maxTokens ?? 4096,
          temperature:
            this.options.temperature ?? this.config.llm.temperature ?? 0.1,
          system,
          messages: anthropicMessages,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Anthropic request failed with status ${response.status}: ${errorBody}`,
        );
      }

      const data = (await response.json()) as AnthropicMessageResponse;

      const rawText = (data.content ?? [])
        .filter(
          (block) => block.type === "text" && typeof block.text === "string",
        )
        .map((block) => block.text?.trim() ?? "")
        .filter(Boolean)
        .join("\n")
        .trim();

      if (!rawText) {
        throw new Error("Anthropic response did not contain text content.");
      }

      return {
        rawText,
        inputTokens: data.usage?.input_tokens ?? null,
        outputTokens: data.usage?.output_tokens ?? null,
        finishReason: data.stop_reason ?? null,
        model: data.model ?? null,
      };
    } catch (error) {
      if (this.isAbortError(error)) {
        throw new Error(
          `Anthropic request aborted due to timeout after ${timeoutMs}ms.`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private resolveEndpoint(): string {
    const baseEndpoint =
      this.config.llm.endpoint?.trim() || "https://api.anthropic.com";

    return `${baseEndpoint.replace(/\/$/, "")}/v1/messages`;
  }

  private resolveApiKey(): string {
    const apiKeyEnv = this.config.llm.apiKeyEnv?.trim();

    if (!apiKeyEnv) {
      throw new Error(
        "LLM apiKeyEnv is not configured for Anthropic provider.",
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

  private normalizeMessages(messages: LlmMessage[]): {
    system?: string;
    anthropicMessages: AnthropicRequestMessage[];
  } {
    const systemMessages = messages
      .filter((message) => message.role === "system")
      .map((message) => message.content?.trim() ?? "")
      .filter(Boolean);

    const anthropicMessages: AnthropicRequestMessage[] = messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: (message.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: message.content?.trim() ?? "",
      }))
      .filter((message) => Boolean(message.content));

    return {
      system: systemMessages.length > 0 ? systemMessages.join("\n\n") : undefined,
      anthropicMessages,
    };
  }

  private removeMessagesByRole(role: LlmRole): void {
    for (let i = this.messages.length - 1; i >= 0; i -= 1) {
      if (this.messages[i]?.role === role) {
        this.messages.splice(i, 1);
      }
    }
  }

  private isAbortError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message.toLowerCase().includes("abort"))
    );
  }
}