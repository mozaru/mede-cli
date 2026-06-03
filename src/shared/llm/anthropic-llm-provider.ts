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
  private systemPrompt: string = "";
  private userPrompt: string = "";
  private extraInfo: string = "";

  constructor(config: MedeConfigModelEntity) {
    this.config = config;
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
    const apiKey = this.resolveApiKey();
    const timeoutMs = this.options.timeoutMs ?? this.config.llm.timeoutMs ?? 60000;

    const { system, anthropicMessages } = this.buildRequestMessages();

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
          max_tokens: this.options.maxTokens ?? this.config.llm.maxTokens ?? 4096,
          temperature: this.options.temperature ?? this.config.llm.temperature ?? 0.1,
          system,
          messages: anthropicMessages,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Anthropic request failed with status ${response.status}: ${errorBody}`);
      }

      const data = (await response.json()) as AnthropicMessageResponse;

      const rawText = (data.content ?? [])
        .filter((block) => block.type === "text" && typeof block.text === "string")
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
        throw new Error(`Anthropic request aborted due to timeout after ${timeoutMs}ms.`);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private resolveEndpoint(): string {
    const baseEndpoint = this.config.llm.endpoint?.trim() || "https://api.anthropic.com";

    return `${baseEndpoint.replace(/\/$/, "")}/v1/messages`;
  }

  private resolveApiKey(): string {
    const apiKeyEnv = this.config.llm.apiKeyEnv?.trim();

    if (!apiKeyEnv) {
      throw new Error("LLM apiKeyEnv is not configured for Anthropic provider.");
    }

    const apiKey = process.env[apiKeyEnv];

    if (!apiKey?.trim()) {
      throw new Error(`Environment variable "${apiKeyEnv}" is not set or is empty.`);
    }

    return apiKey;
  }

  private buildRequestMessages(): {
    system?: string;
    anthropicMessages: AnthropicRequestMessage[];
  } {
    const anthropicMessages: AnthropicRequestMessage[] = this.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: (message.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: message.content?.trim() ?? "",
      }))
      .filter((message) => Boolean(message.content));

    if (this.extraInfo) {
      anthropicMessages.push({ role: "user", content: this.extraInfo });
    }

    if (this.userPrompt) {
      anthropicMessages.push({ role: "user", content: this.userPrompt });
    }

    return {
      system: this.systemPrompt || undefined,
      anthropicMessages,
    };
  }

  private isAbortError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === "AbortError" || error.message.toLowerCase().includes("abort"))
    );
  }
}
