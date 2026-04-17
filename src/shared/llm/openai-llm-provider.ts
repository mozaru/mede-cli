import { MedeConfigModelEntity } from "../../entities/mede-config-model-entity.js";
import {
  ILlmProvider,
  LlmGenerationOptions,
  LlmMessage,
  LlmRole,
  LlmTextGenerationResult,
} from "./llm-provider.interface.js";

type OpenAiRequestRole = "developer" | "system" | "user" | "assistant";

interface OpenAiChatCompletionMessage {
  role: OpenAiRequestRole;
  content: string;
}

interface OpenAiChatCompletionChoice {
  index: number;
  finish_reason: string | null;
  message: {
    role: string;
    content: string | null;
  };
}

interface OpenAiChatCompletionUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface OpenAiChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAiChatCompletionChoice[];
  usage?: OpenAiChatCompletionUsage;
}

export class OpenAiLlmProvider implements ILlmProvider {
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
    const timeoutMs =
      this.options.timeoutMs ?? this.config.llm.timeoutMs ?? 60000;

    const requestMessages = this.buildRequestMessages();

    if (requestMessages.length === 0) {
      throw new Error(
        "No messages were provided to OpenAiLlmProvider before generateText().",
      );
    }

    console.log(requestMessages);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
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
          `OpenAI request failed with status ${response.status}: ${errorBody}`,
        );
      }

      const data = (await response.json()) as OpenAiChatCompletionResponse;
      const firstChoice = data.choices?.[0];
      const rawText = firstChoice?.message?.content?.trim();

      if (!rawText) {
        throw new Error("OpenAI response did not contain text content.");
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
          `OpenAI request aborted due to timeout after ${timeoutMs}ms.`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildRequestMessages(): OpenAiChatCompletionMessage[] {
    const useDeveloperRole = this.shouldUseDeveloperRole();
    const requestMessages: OpenAiChatCompletionMessage[] = [];


    if (this.systemPrompt)
      requestMessages.push
        requestMessages.push({
          role: useDeveloperRole ? "developer" : "system",
          content: this.systemPrompt,
        });

    for (const message of this.messages) {
      const content = message.content?.trim();
      if (!content) {
        continue;
      }

      if (message.role === "system") {
        requestMessages.push({
          role: useDeveloperRole ? "developer" : "system",
          content,
        });
        continue;
      }

      requestMessages.push({
        role: message.role,
        content,
      });
    }

    if (this.extraInfo)
      requestMessages.push({
        role: "user",
        content: this.extraInfo,
      });


    if (this.userPrompt)
      requestMessages.push({
        role: "user",
        content: this.userPrompt,
      });

    return requestMessages;
  }

  private shouldUseDeveloperRole(): boolean {
    const model = this.config.llm.model?.trim().toLowerCase() ?? "";

    // Modelos "o*" mais novos preferem developer messages.
    return /^o\d|^o[1-9]-|^gpt-5|^gpt-4\.1/.test(model);
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
      this.config.llm.endpoint?.trim() || "https://api.openai.com/v1";

    return `${baseEndpoint.replace(/\/$/, "")}/chat/completions`;
  }

  private resolveApiKey(): string {
    const apiKeyEnv = this.config.llm.apiKeyEnv?.trim();

    if (!apiKeyEnv) {
      throw new Error(
        "LLM apiKeyEnv is not configured for OpenAI provider.",
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