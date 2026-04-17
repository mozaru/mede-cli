import { MedeConfigModelEntity } from "../../entities/mede-config-model-entity.js";
import {
  ILlmProvider,
  LlmGenerationOptions,
  LlmMessage,
  LlmRole,
  LlmTextGenerationResult,
} from "./llm-provider.interface.js";

interface OllamaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaChatResponse {
  model?: string;
  created_at?: string;
  message?: {
    role?: string;
    content?: string;
  };
  done?: boolean;
  done_reason?: string | null;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaLlmProvider implements ILlmProvider {
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
    const timeoutMs =
      this.options.timeoutMs ?? this.config.llm.timeoutMs ?? 60000;

    const requestMessages = this.buildRequestMessages();

    if (requestMessages.length === 0) {
      throw new Error(
        "No messages were provided to OllamaLlmProvider before generateText().",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.llm.model,
          messages: requestMessages,
          stream: false,
          options: {
            temperature:
              this.options.temperature ?? this.config.llm.temperature,
            num_predict:
              this.options.maxTokens ?? this.config.llm.maxTokens,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Ollama request failed with status ${response.status}: ${errorBody}`,
        );
      }

      const data = (await response.json()) as OllamaChatResponse;
      const rawText = data.message?.content?.trim();

      if (!rawText) {
        throw new Error("Ollama response did not contain text content.");
      }

      return {
        rawText,
        inputTokens: data.prompt_eval_count ?? null,
        outputTokens: data.eval_count ?? null,
        finishReason: data.done_reason ?? null,
        model: data.model ?? null,
      };
    } catch (error) {
      if (this.isAbortError(error)) {
        throw new Error(
          `Ollama request aborted due to timeout after ${timeoutMs}ms.`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildRequestMessages(): OllamaChatMessage[] {
    const requestMessages: OllamaChatMessage[] = [];

    for (const message of this.messages) {
      const content = message.content?.trim();
      if (!content) {
        continue;
      }

      requestMessages.push({
        role: message.role,
        content,
      });
    }

    return requestMessages;
  }

  private removeMessagesByRole(role: LlmRole): void {
    for (let i = this.messages.length - 1; i >= 0; i -= 1) {
      if (this.messages[i]?.role === role) {
        this.messages.splice(i, 1);
      }
    }
  }

  private resolveEndpoint(): string {
    const baseEndpoint =
      this.config.llm.endpoint?.trim() || "http://localhost:11434";

    return `${baseEndpoint.replace(/\/$/, "")}/api/chat`;
  }

  private isAbortError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message.toLowerCase().includes("abort"))
    );
  }
}
