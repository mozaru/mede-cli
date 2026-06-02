import { MedeConfigModelEntity } from "../../entities/mede-config-model-entity.js";
import {
  ILlmProvider,
  LlmGenerationOptions,
  LlmMessage,
  LlmRole,
  LlmTextGenerationResult,
} from "./llm-provider.interface.js";

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  role?: string;
  parts?: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
  finishReason?: string;
}

interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

interface GeminiGenerateContentResponse {
  candidates?: GeminiCandidate[];
  usageMetadata?: GeminiUsageMetadata;
  modelVersion?: string;
}

interface GeminiSystemInstruction {
  parts: Array<{ text: string }>;
}

interface GeminiRequestContent {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export class GeminiLlmProvider implements ILlmProvider {
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
    const { endpoint, apiKey } = this.resolveEndpointAndApiKey();
    const timeoutMs =
      this.options.timeoutMs ?? this.config.llm.timeoutMs ?? 60000;

    const { systemInstruction, contents } = this.buildRequestMessages();

    if (contents.length === 0) {
      throw new Error(
        "No user/assistant messages were provided to GeminiLlmProvider before generateText().",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction,
          contents,
          generationConfig: {
            temperature:
              this.options.temperature ?? this.config.llm.temperature ?? 0.1,
            maxOutputTokens:
              this.options.maxTokens ?? this.config.llm.maxTokens ?? 4096,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Gemini request failed with status ${response.status}: ${errorBody}`,
        );
      }

      const data = (await response.json()) as GeminiGenerateContentResponse;
      const firstCandidate = data.candidates?.[0];

      const rawText = (firstCandidate?.content?.parts ?? [])
        .map((part) => part.text?.trim() ?? "")
        .filter(Boolean)
        .join("\n")
        .trim();

      if (!rawText) {
        throw new Error("Gemini response did not contain text content.");
      }

      return {
        rawText,
        inputTokens: data.usageMetadata?.promptTokenCount ?? null,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? null,
        finishReason: firstCandidate?.finishReason ?? null,
        model: data.modelVersion ?? this.config.llm.model ?? null,
      };
    } catch (error) {
      if (this.isAbortError(error)) {
        throw new Error(
          `Gemini request aborted due to timeout after ${timeoutMs}ms.`,
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private resolveEndpointAndApiKey(): { endpoint: string; apiKey: string } {
    const apiKeyEnv = this.config.llm.apiKeyEnv?.trim();

    if (!apiKeyEnv) {
      throw new Error("LLM apiKeyEnv is not configured for Gemini provider.");
    }

    const apiKey = process.env[apiKeyEnv];

    if (!apiKey?.trim()) {
      throw new Error(
        `Environment variable "${apiKeyEnv}" is not set or is empty.`,
      );
    }

    const baseEndpoint =
      this.config.llm.endpoint?.trim() ||
      "https://generativelanguage.googleapis.com/v1beta";

    const model = this.config.llm.model?.trim();

    if (!model) {
      throw new Error("LLM model is required for Gemini provider.");
    }

    return {
      endpoint:
        `${baseEndpoint.replace(/\/$/, "")}` +
        `/models/${encodeURIComponent(model)}:generateContent`,
      apiKey,
    };
  }

  private buildRequestMessages(): {
    systemInstruction?: GeminiSystemInstruction;
    contents: GeminiRequestContent[];
  } {
    const contents: GeminiRequestContent[] = this.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: (message.role === "assistant" ? "model" : "user") as "user" | "model",
        parts: [{ text: message.content?.trim() ?? "" }],
      }))
      .filter((message) => message.parts[0].text.length > 0);

    if (this.extraInfo) {
      contents.push({ role: "user", parts: [{ text: this.extraInfo }] });
    }

    if (this.userPrompt) {
      contents.push({ role: "user", parts: [{ text: this.userPrompt }] });
    }

    return {
      systemInstruction: this.systemPrompt
        ? { parts: [{ text: this.systemPrompt }] }
        : undefined,
      contents,
    };
  }

  private isAbortError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message.toLowerCase().includes("abort"))
    );
  }
}