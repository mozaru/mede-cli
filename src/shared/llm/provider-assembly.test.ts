import { describe, it, expect, beforeEach } from "vitest";
import { AnthropicLlmProvider } from "./anthropic-llm-provider.js";
import { OpenAiLlmProvider } from "./openai-llm-provider.js";
import { OllamaLlmProvider } from "./ollama-llm-provider.js";
import { GeminiLlmProvider } from "./gemini-llm-provider.js";
import { AzureOpenAiLlmProvider } from "./azure-openai-llm-provider.js";
import { MedeConfigModelEntity } from "../../entities/mede-config-model-entity.js";
import type { ILlmProvider } from "./llm-provider.interface.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeConfig(): MedeConfigModelEntity {
  return new MedeConfigModelEntity();
}

// Simulate the exact call sequence that PhaseConversationService.sendMessage() uses
function simulateSendMessage(provider: ILlmProvider): void {
  provider.setSystemPrompt("SYSTEM PROMPT");
  // conversation history (prior assistant turn)
  provider.addMessage("assistant", "previous assistant turn");
  // attachments
  provider.addAttachment("notes.txt", "attachment content");
  // input documents (e.g., ATA used by ADR phase)
  provider.addInputDoc(1, "ata-2026-06-01.md", "input document content");
  // extra info (cycle artifacts of type "info")
  provider.setExtraInfo("extra cycle info");
  // output document (the file being edited, may be empty on first generation)
  provider.addOutputDoc(2, "adr-2026-06-02.md", "current output content");
  // user prompt is set LAST — this is what used to wipe everything
  provider.setUserPrompt("please generate the document");
}

// Access private fields for verification
function getPrivate(provider: ILlmProvider, field: string): unknown {
  return (provider as unknown as Record<string, unknown>)[field];
}

// Invoke the provider's private buildRequestMessages() without leaking `any`.
// Each provider returns a different shape, so the caller supplies the type.
function buildRequest<T>(provider: ILlmProvider): T {
  return (provider as unknown as { buildRequestMessages(): T }).buildRequestMessages();
}

// ---------------------------------------------------------------------------
// Shared assertion: context messages must survive setUserPrompt
// ---------------------------------------------------------------------------

function assertContextPreserved(provider: ILlmProvider): void {
  const messages = getPrivate(provider, "messages") as Array<{ role: string; content: string }>;

  expect(getPrivate(provider, "systemPrompt")).toBe("SYSTEM PROMPT");
  expect(getPrivate(provider, "userPrompt")).toBe("please generate the document");
  expect(getPrivate(provider, "extraInfo")).toBe("extra cycle info");

  // messages[] must contain: assistant history + attachment + inputDoc + outputDoc = 4 items
  expect(messages).toHaveLength(4);

  const contents = messages.map((m) => m.content);
  expect(contents.some((c) => c.includes("previous assistant turn"))).toBe(true);
  expect(contents.some((c) => c.includes("attachment content"))).toBe(true);
  expect(contents.some((c) => c.includes("input document content"))).toBe(true);
  expect(contents.some((c) => c.includes("current output content"))).toBe(true);
}

// ---------------------------------------------------------------------------
// Shared assertion: build order — context before extraInfo before userPrompt
// ---------------------------------------------------------------------------

function assertBuildOrder(allContent: string[]): void {
  const extraIdx = allContent.findIndex((c) => c.includes("extra cycle info"));
  const promptIdx = allContent.findIndex((c) => c.includes("please generate the document"));
  const inputDocIdx = allContent.findIndex((c) => c.includes("input document content"));
  const outputDocIdx = allContent.findIndex((c) => c.includes("current output content"));

  expect(inputDocIdx).toBeGreaterThanOrEqual(0);
  expect(outputDocIdx).toBeGreaterThanOrEqual(0);
  expect(extraIdx).toBeGreaterThanOrEqual(0);
  expect(promptIdx).toBeGreaterThanOrEqual(0);

  // extraInfo and userPrompt must come after context documents
  expect(extraIdx).toBeGreaterThan(inputDocIdx);
  expect(extraIdx).toBeGreaterThan(outputDocIdx);
  expect(promptIdx).toBeGreaterThan(extraIdx);
}

// ---------------------------------------------------------------------------
// Anthropic
// ---------------------------------------------------------------------------

describe("AnthropicLlmProvider message assembly", () => {
  let provider: AnthropicLlmProvider;

  beforeEach(() => {
    provider = new AnthropicLlmProvider(makeConfig());
    simulateSendMessage(provider);
  });

  it("preserves all context after setUserPrompt", () => {
    assertContextPreserved(provider);
  });

  it("system prompt is separate from context messages", () => {
    const { system, anthropicMessages } = buildRequest<{
      system: string;
      anthropicMessages: Array<{ content: string }>;
    }>(provider);
    expect(system).toBe("SYSTEM PROMPT");
    // system must not appear in the messages array
    expect(anthropicMessages.every((m) => m.content !== "SYSTEM PROMPT")).toBe(true);
  });

  it("builds messages in correct order: context → extraInfo → userPrompt", () => {
    const { anthropicMessages } = buildRequest<{ anthropicMessages: Array<{ content: string }> }>(
      provider,
    );
    const contents: string[] = anthropicMessages.map((m) => m.content);
    assertBuildOrder(contents);
  });

  it("userPrompt is the last message", () => {
    const { anthropicMessages } = buildRequest<{ anthropicMessages: Array<{ content: string }> }>(
      provider,
    );
    const last = anthropicMessages[anthropicMessages.length - 1];
    expect(last.content).toContain("please generate the document");
  });
});

// ---------------------------------------------------------------------------
// OpenAI
// ---------------------------------------------------------------------------

describe("OpenAiLlmProvider message assembly", () => {
  let provider: OpenAiLlmProvider;

  beforeEach(() => {
    provider = new OpenAiLlmProvider(makeConfig());
    simulateSendMessage(provider);
  });

  it("preserves all context after setUserPrompt", () => {
    assertContextPreserved(provider);
  });

  it("builds messages in correct order: system → context → extraInfo → userPrompt", () => {
    const messages = buildRequest<Array<{ role: string; content: string }>>(provider);
    const [first] = messages;
    expect(first.content).toBe("SYSTEM PROMPT");

    const contents = messages.map((m) => m.content);
    assertBuildOrder(contents);
  });

  it("userPrompt is the last message", () => {
    const messages = buildRequest<Array<{ role: string; content: string }>>(provider);
    const last = messages[messages.length - 1];
    expect(last.content).toContain("please generate the document");
  });
});

// ---------------------------------------------------------------------------
// Ollama
// ---------------------------------------------------------------------------

describe("OllamaLlmProvider message assembly", () => {
  let provider: OllamaLlmProvider;

  beforeEach(() => {
    provider = new OllamaLlmProvider(makeConfig());
    simulateSendMessage(provider);
  });

  it("preserves all context after setUserPrompt", () => {
    assertContextPreserved(provider);
  });

  it("builds messages in correct order: system → context → extraInfo → userPrompt", () => {
    const messages = buildRequest<Array<{ role: string; content: string }>>(provider);
    const [first] = messages;
    expect(first.role).toBe("system");
    expect(first.content).toBe("SYSTEM PROMPT");

    const contents = messages.map((m) => m.content);
    assertBuildOrder(contents);
  });

  it("userPrompt is the last message", () => {
    const messages = buildRequest<Array<{ role: string; content: string }>>(provider);
    const last = messages[messages.length - 1];
    expect(last.content).toContain("please generate the document");
  });
});

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------

describe("GeminiLlmProvider message assembly", () => {
  let provider: GeminiLlmProvider;

  beforeEach(() => {
    provider = new GeminiLlmProvider(makeConfig());
    simulateSendMessage(provider);
  });

  it("preserves all context after setUserPrompt", () => {
    assertContextPreserved(provider);
  });

  it("system prompt is in systemInstruction (separate from contents)", () => {
    const { systemInstruction, contents } = buildRequest<{
      systemInstruction: { parts: Array<{ text: string }> };
      contents: Array<{ parts: Array<{ text: string }> }>;
    }>(provider);
    expect(systemInstruction.parts[0].text).toBe("SYSTEM PROMPT");
    expect(contents.every((c) => c.parts[0].text !== "SYSTEM PROMPT")).toBe(true);
  });

  it("builds contents in correct order: context → extraInfo → userPrompt", () => {
    const { contents } = buildRequest<{ contents: Array<{ parts: Array<{ text: string }> }> }>(
      provider,
    );
    const texts: string[] = contents.map((c) => c.parts[0].text);
    assertBuildOrder(texts);
  });

  it("userPrompt is the last content entry", () => {
    const { contents } = buildRequest<{ contents: Array<{ parts: Array<{ text: string }> }> }>(
      provider,
    );
    const last = contents[contents.length - 1];
    expect(last.parts[0].text).toContain("please generate the document");
  });
});

// ---------------------------------------------------------------------------
// Azure OpenAI
// ---------------------------------------------------------------------------

describe("AzureOpenAiLlmProvider message assembly", () => {
  let provider: AzureOpenAiLlmProvider;

  beforeEach(() => {
    provider = new AzureOpenAiLlmProvider(makeConfig());
    simulateSendMessage(provider);
  });

  it("preserves all context after setUserPrompt", () => {
    assertContextPreserved(provider);
  });

  it("builds messages in correct order: system → context → extraInfo → userPrompt", () => {
    const messages = buildRequest<Array<{ role: string; content: string }>>(provider);
    const [first] = messages;
    expect(first.role).toBe("system");
    expect(first.content).toBe("SYSTEM PROMPT");

    const contents = messages.map((m) => m.content);
    assertBuildOrder(contents);
  });

  it("userPrompt is the last message", () => {
    const messages = buildRequest<Array<{ role: string; content: string }>>(provider);
    const last = messages[messages.length - 1];
    expect(last.content).toContain("please generate the document");
  });
});
