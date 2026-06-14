import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import { AnthropicLlmProvider } from "./anthropic-llm-provider.js";
import { AzureOpenAiLlmProvider } from "./azure-openai-llm-provider.js";
import { GeminiLlmProvider } from "./gemini-llm-provider.js";
import { OllamaLlmProvider } from "./ollama-llm-provider.js";

function makeConfig(overrides: Partial<MedeConfigModelEntity["llm"]> = {}): MedeConfigModelEntity {
  const config = new MedeConfigModelEntity();
  config.llm.model = "test-model";
  config.llm.endpoint = "https://example.test/";
  config.llm.apiKeyEnv = "LLM_TEST_KEY";
  config.llm.temperature = 0.2;
  config.llm.maxTokens = 123;
  config.llm.timeoutMs = 1000;
  Object.assign(config.llm, overrides);
  return config;
}

function response(ok: boolean, body: unknown, status = ok ? 200 : 500): Response {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  } as unknown as Response;
}

function lastRequestBody(fetchMock: ReturnType<typeof vi.fn>): any {
  const calls = fetchMock.mock.calls;
  return JSON.parse(calls[calls.length - 1][1].body);
}

describe("other LLM providers", () => {
  const env = { LLM_TEST_KEY: "secret-key" };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends Anthropic messages and maps text response metadata", async () => {
    fetchMock.mockResolvedValueOnce(
      response(true, {
        id: "msg_1",
        type: "message",
        role: "assistant",
        model: "claude-test",
        content: [
          { type: "text", text: " first " },
          { type: "image", text: "ignored" },
          { type: "text", text: "second" },
        ],
        stop_reason: "end_turn",
        usage: { input_tokens: 11, output_tokens: 7 },
      }),
    );
    const provider = new AnthropicLlmProvider(makeConfig({ endpoint: "https://anthropic.test/" }), {
      env,
    });
    provider.setSystemPrompt(" system ");
    provider.addMessage("system", "discarded system message");
    provider.addMessage("assistant", " previous ");
    provider.addAttachment("", " attachment ");
    provider.addInputDoc(3, "", " input doc ");
    provider.addOutputDoc(4, "docs/out.md", "");
    provider.setExtraInfo(" extra ");
    provider.setUserPrompt(" prompt ");
    provider.setOptions({ temperature: 0.8, maxTokens: 50 });

    const result = await provider.generateText();

    expect(result).toEqual({
      rawText: "first\nsecond",
      inputTokens: 11,
      outputTokens: 7,
      finishReason: "end_turn",
      model: "claude-test",
    });
    expect(fetchMock.mock.calls[0][0]).toBe("https://anthropic.test/v1/messages");
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers["x-api-key"]).toBe("secret-key");
    expect(init.headers["anthropic-version"]).toBe("2023-06-01");
    const body = lastRequestBody(fetchMock);
    expect(body).toMatchObject({
      model: "test-model",
      max_tokens: 50,
      temperature: 0.8,
      system: "system",
    });
    expect(body.messages[0]).toEqual({ role: "assistant", content: "previous" });
    expect(body.messages.some((message: any) => message.content.includes("attachment"))).toBe(true);
    expect(body.messages[body.messages.length - 1]).toEqual({ role: "user", content: "prompt" });
  });

  it("handles Anthropic request failures and empty responses", async () => {
    await expect(new AnthropicLlmProvider(makeConfig(), { env }).generateText()).rejects.toThrow(
      /No user\/assistant messages/,
    );

    fetchMock.mockResolvedValueOnce(response(false, "nope", 429));
    const httpProvider = new AnthropicLlmProvider(makeConfig(), { env });
    httpProvider.setUserPrompt("x");
    await expect(httpProvider.generateText()).rejects.toThrow(/status 429: nope/);

    fetchMock.mockResolvedValueOnce(response(true, { content: [{ type: "text", text: " " }] }));
    const emptyProvider = new AnthropicLlmProvider(makeConfig(), { env });
    emptyProvider.setUserPrompt("x");
    await expect(emptyProvider.generateText()).rejects.toThrow(/did not contain text/);
  });

  it("uses Anthropic defaults and nullable response metadata", async () => {
    fetchMock.mockResolvedValueOnce(
      response(true, {
        id: "msg_1",
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: " ok " }],
      }),
    );
    const provider = new AnthropicLlmProvider(
      makeConfig({
        endpoint: undefined as any,
        maxTokens: undefined as any,
        temperature: undefined as any,
        timeoutMs: undefined as any,
      }),
      { env },
    );
    provider.setSystemPrompt(undefined as any);
    provider.setExtraInfo(undefined as any);
    provider.setUserPrompt("prompt");
    provider.addMessage("user", " ");
    provider.addAttachment("empty.txt", " ");
    provider.addInputDoc(1, "docs/in.md", " ");
    provider.addOutputDoc(2, "", undefined as any);

    const result = await provider.generateText();

    expect(result).toMatchObject({
      rawText: "ok",
      inputTokens: null,
      outputTokens: null,
      finishReason: null,
      model: null,
    });
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.anthropic.com/v1/messages");
    const body = lastRequestBody(fetchMock);
    expect(body.max_tokens).toBe(4096);
    expect(body.temperature).toBe(0.1);
    expect(body.system).toBeUndefined();
    expect(body.messages.some((message: any) => message.content.includes("artifact-2"))).toBe(true);
  });

  it("maps Anthropic aborts when fetch rejects", async () => {
    fetchMock.mockRejectedValueOnce(Object.assign(new Error("abort"), { name: "AbortError" }));
    const provider = new AnthropicLlmProvider(makeConfig(), { env });
    provider.setUserPrompt("x");

    await expect(provider.generateText()).rejects.toThrow(/timeout after 1000ms/);
  });

  it("sends Gemini contents and maps candidate metadata", async () => {
    fetchMock.mockResolvedValueOnce(
      response(true, {
        candidates: [
          {
            content: { parts: [{ text: " answer " }, { text: "line two" }] },
            finishReason: "STOP",
          },
        ],
        usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 4 },
        modelVersion: "gemini-test",
      }),
    );
    const provider = new GeminiLlmProvider(makeConfig({ model: "gemini 2" }), { env });
    provider.setSystemPrompt(" sys ");
    provider.addMessage("system", "ignored");
    provider.addMessage("assistant", " assistant ");
    provider.addMessage("user", " user ");
    provider.addAttachment("a.txt", "attachment");
    provider.addInputDoc(1, "docs/in.md", "input");
    provider.addOutputDoc(2, "", "");
    provider.setExtraInfo("extra");
    provider.setUserPrompt("prompt");

    const result = await provider.generateText();

    expect(result).toEqual({
      rawText: "answer\nline two",
      inputTokens: 5,
      outputTokens: 4,
      finishReason: "STOP",
      model: "gemini-test",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://example.test/models/gemini%202:generateContent",
    );
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers["x-goog-api-key"]).toBe("secret-key");
    const body = lastRequestBody(fetchMock);
    expect(body.systemInstruction).toEqual({ parts: [{ text: "sys" }] });
    expect(body.generationConfig).toEqual({ temperature: 0.2, maxOutputTokens: 123 });
    expect(body.contents[0]).toEqual({ role: "model", parts: [{ text: "assistant" }] });
    expect(body.contents[body.contents.length - 1]).toEqual({
      role: "user",
      parts: [{ text: "prompt" }],
    });
  });

  it("handles Gemini validation, request failures, empty responses, and aborts", async () => {
    const missingModel = new GeminiLlmProvider(makeConfig({ model: "" }), { env });
    missingModel.setUserPrompt("x");
    await expect(missingModel.generateText()).rejects.toThrow(/model is required/);

    await expect(new GeminiLlmProvider(makeConfig(), { env }).generateText()).rejects.toThrow(
      /No user\/assistant messages/,
    );

    fetchMock.mockResolvedValueOnce(response(false, "bad", 400));
    const httpProvider = new GeminiLlmProvider(makeConfig(), { env });
    httpProvider.setUserPrompt("x");
    await expect(httpProvider.generateText()).rejects.toThrow(/status 400: bad/);

    fetchMock.mockResolvedValueOnce(response(true, { candidates: [{ content: { parts: [] } }] }));
    const emptyProvider = new GeminiLlmProvider(makeConfig(), { env });
    emptyProvider.setUserPrompt("x");
    await expect(emptyProvider.generateText()).rejects.toThrow(/did not contain text/);

    fetchMock.mockRejectedValueOnce(Object.assign(new Error("abort"), { name: "AbortError" }));
    const abortProvider = new GeminiLlmProvider(makeConfig(), { env });
    abortProvider.setUserPrompt("x");
    await expect(abortProvider.generateText()).rejects.toThrow(/timeout after 1000ms/);
  });

  it("uses Gemini defaults and nullable response metadata", async () => {
    fetchMock.mockResolvedValueOnce(
      response(true, {
        candidates: [{ content: { parts: [{}, { text: " ok " }] } }],
      }),
    );
    const provider = new GeminiLlmProvider(
      makeConfig({
        endpoint: undefined as any,
        maxTokens: undefined as any,
        temperature: undefined as any,
        timeoutMs: undefined as any,
      }),
      { env },
    );
    provider.setSystemPrompt(undefined as any);
    provider.setExtraInfo(undefined as any);
    provider.setUserPrompt("prompt");
    provider.addMessage("user", " ");
    provider.addAttachment("", " ");
    provider.addInputDoc(1, "", " ");
    provider.addOutputDoc(2, "docs/out.md", undefined as any);

    const result = await provider.generateText();

    expect(result).toMatchObject({
      rawText: "ok",
      inputTokens: null,
      outputTokens: null,
      finishReason: null,
      model: "test-model",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/test-model:generateContent",
    );
    const body = lastRequestBody(fetchMock);
    expect(body.systemInstruction).toBeUndefined();
    expect(body.generationConfig).toEqual({ temperature: 0.1, maxOutputTokens: 4096 });
    expect(body.contents.some((item: any) => item.parts[0].text.includes("docs/out.md"))).toBe(
      true,
    );
  });

  it("sends Ollama chat requests and maps local response metadata", async () => {
    fetchMock.mockResolvedValueOnce(
      response(true, {
        model: "llama-test",
        message: { role: "assistant", content: " local answer " },
        done_reason: "stop",
        prompt_eval_count: 8,
        eval_count: 6,
      }),
    );
    const provider = new OllamaLlmProvider(makeConfig({ endpoint: "http://ollama.test/" }));
    provider.setSystemPrompt("sys");
    provider.addMessage("assistant", "assistant");
    provider.addMessage("user", "user");
    provider.addAttachment("a.txt", "attachment");
    provider.addInputDoc(1, "docs/in.md", "input");
    provider.addOutputDoc(2, "", "");
    provider.setExtraInfo("extra");
    provider.setUserPrompt("prompt");
    provider.setOptions({ maxTokens: 9, temperature: 0.6 });

    const result = await provider.generateText();

    expect(result).toEqual({
      rawText: "local answer",
      inputTokens: 8,
      outputTokens: 6,
      finishReason: "stop",
      model: "llama-test",
    });
    expect(fetchMock.mock.calls[0][0]).toBe("http://ollama.test/api/chat");
    const body = lastRequestBody(fetchMock);
    expect(body.stream).toBe(false);
    expect(body.options).toEqual({ temperature: 0.6, num_predict: 9 });
    expect(body.messages[0]).toEqual({ role: "system", content: "sys" });
    expect(body.messages[body.messages.length - 1]).toEqual({ role: "user", content: "prompt" });
  });

  it("handles Ollama request failures, empty responses, and aborts", async () => {
    await expect(new OllamaLlmProvider(makeConfig()).generateText()).rejects.toThrow(/No messages/);

    fetchMock.mockResolvedValueOnce(response(false, "down", 503));
    const httpProvider = new OllamaLlmProvider(makeConfig());
    httpProvider.setUserPrompt("x");
    await expect(httpProvider.generateText()).rejects.toThrow(/status 503: down/);

    fetchMock.mockResolvedValueOnce(response(true, { message: { content: " " } }));
    const emptyProvider = new OllamaLlmProvider(makeConfig());
    emptyProvider.setUserPrompt("x");
    await expect(emptyProvider.generateText()).rejects.toThrow(/did not contain text/);

    fetchMock.mockRejectedValueOnce(new Error("request aborted"));
    const abortProvider = new OllamaLlmProvider(makeConfig());
    abortProvider.setUserPrompt("x");
    await expect(abortProvider.generateText()).rejects.toThrow(/timeout after 1000ms/);
  });

  it("uses Ollama defaults and nullable response metadata", async () => {
    fetchMock.mockResolvedValueOnce(response(true, { message: { content: " ok " } }));
    const provider = new OllamaLlmProvider(
      makeConfig({
        endpoint: undefined as any,
        maxTokens: undefined as any,
        temperature: undefined as any,
        timeoutMs: undefined as any,
      }),
    );
    provider.setSystemPrompt(undefined as any);
    provider.setExtraInfo(undefined as any);
    provider.setUserPrompt("prompt");
    provider.addMessage("user", " ");
    provider.addAttachment("", " ");
    provider.addInputDoc(1, "", " ");
    provider.addOutputDoc(2, "docs/out.md", undefined as any);

    const result = await provider.generateText();

    expect(result).toMatchObject({
      rawText: "ok",
      inputTokens: null,
      outputTokens: null,
      finishReason: null,
      model: null,
    });
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:11434/api/chat");
    const body = lastRequestBody(fetchMock);
    expect(body.options).toEqual({});
    expect(body.messages.some((message: any) => message.content.includes("docs/out.md"))).toBe(
      true,
    );
  });

  it("sends Azure OpenAI requests and preserves endpoints that already have api-version", async () => {
    fetchMock.mockResolvedValue(
      response(true, {
        id: "chat",
        object: "chat.completion",
        created: 1,
        model: "azure-test",
        choices: [
          { index: 0, finish_reason: "stop", message: { role: "assistant", content: " ok " } },
        ],
        usage: { prompt_tokens: 4, completion_tokens: 2 },
      }),
    );
    const provider = new AzureOpenAiLlmProvider(
      makeConfig({ endpoint: "https://azure.test/openai/deployments/d/chat/completions?x=1" }),
      { env },
    );
    provider.setSystemPrompt("sys");
    provider.addMessage("assistant", "assistant");
    provider.addMessage("user", "user");
    provider.addAttachment("a.txt", "attachment");
    provider.addInputDoc(1, "docs/in.md", "input");
    provider.addOutputDoc(2, "", "");
    provider.setExtraInfo("extra");
    provider.setUserPrompt("prompt");
    provider.setOptions({ maxTokens: 33, temperature: 0.7 });

    const result = await provider.generateText();

    expect(result).toEqual({
      rawText: "ok",
      inputTokens: 4,
      outputTokens: 2,
      finishReason: "stop",
      model: "azure-test",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://azure.test/openai/deployments/d/chat/completions?x=1&api-version=2024-10-21",
    );
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers["api-key"]).toBe("secret-key");
    const body = lastRequestBody(fetchMock);
    expect(body.temperature).toBe(0.7);
    expect(body.max_tokens).toBe(33);
    expect(body.messages[0]).toEqual({ role: "system", content: "sys" });

    const versionedProvider = new AzureOpenAiLlmProvider(
      makeConfig({ endpoint: "https://azure.test/chat?api-version=2024-05-01-preview" }),
      { env },
    );
    versionedProvider.setUserPrompt("x");
    await versionedProvider.generateText();
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://azure.test/chat?api-version=2024-05-01-preview",
    );
  });

  it("handles Azure validation, request failures, empty responses, and aborts", async () => {
    const missingEndpoint = new AzureOpenAiLlmProvider(makeConfig({ endpoint: "" }), { env });
    missingEndpoint.setUserPrompt("x");
    await expect(missingEndpoint.generateText()).rejects.toThrow(/endpoint is required/);

    await expect(new AzureOpenAiLlmProvider(makeConfig(), { env }).generateText()).rejects.toThrow(
      /No messages/,
    );

    fetchMock.mockResolvedValueOnce(response(false, "blocked", 403));
    const httpProvider = new AzureOpenAiLlmProvider(makeConfig(), { env });
    httpProvider.setUserPrompt("x");
    await expect(httpProvider.generateText()).rejects.toThrow(/status 403: blocked/);

    fetchMock.mockResolvedValueOnce(
      response(true, { choices: [{ message: { content: " " }, finish_reason: null }] }),
    );
    const emptyProvider = new AzureOpenAiLlmProvider(makeConfig(), { env });
    emptyProvider.setUserPrompt("x");
    await expect(emptyProvider.generateText()).rejects.toThrow(/did not contain text/);

    fetchMock.mockRejectedValueOnce(Object.assign(new Error("aborted"), { name: "AbortError" }));
    const abortProvider = new AzureOpenAiLlmProvider(makeConfig(), { env });
    abortProvider.setUserPrompt("x");
    await expect(abortProvider.generateText()).rejects.toThrow(/timeout after 1000ms/);
  });

  it("uses Azure nullable response metadata and ignores blank messages", async () => {
    fetchMock.mockResolvedValueOnce(
      response(true, {
        choices: [
          { index: 0, finish_reason: null, message: { role: "assistant", content: " ok " } },
        ],
      }),
    );
    const provider = new AzureOpenAiLlmProvider(
      makeConfig({
        endpoint: "https://azure.test/openai/deployments/d/chat/completions/",
        maxTokens: undefined as any,
        temperature: undefined as any,
        timeoutMs: undefined as any,
      }),
      { env },
    );
    provider.setSystemPrompt(undefined as any);
    provider.setExtraInfo(undefined as any);
    provider.setUserPrompt("prompt");
    provider.addMessage("user", " ");
    provider.addAttachment("", " ");
    provider.addInputDoc(1, "", " ");
    provider.addOutputDoc(2, "docs/out.md", undefined as any);

    const result = await provider.generateText();

    expect(result).toMatchObject({
      rawText: "ok",
      inputTokens: null,
      outputTokens: null,
      finishReason: null,
      model: null,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://azure.test/openai/deployments/d/chat/completions?api-version=2024-10-21",
    );
    const body = lastRequestBody(fetchMock);
    expect(body.temperature).toBeUndefined();
    expect(body.max_tokens).toBeUndefined();
    expect(body.messages.some((message: any) => message.content.includes("docs/out.md"))).toBe(
      true,
    );
  });
});
