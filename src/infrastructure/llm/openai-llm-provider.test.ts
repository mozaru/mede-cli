import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OpenAiLlmProvider } from "./openai-llm-provider.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";

function makeConfig(model = "gpt-4.1"): MedeConfigModelEntity {
  const config = new MedeConfigModelEntity();
  config.llm.model = model;
  config.llm.endpoint = "https://example.test/v1/";
  config.llm.apiKeyEnv = "OPENAI_TEST_KEY";
  config.llm.temperature = 0.1;
  config.llm.maxTokens = 100;
  config.llm.timeoutMs = 1000;
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

describe("OpenAiLlmProvider", () => {
  const env = { OPENAI_TEST_KEY: "sk-test" };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends normalized messages and returns token metadata", async () => {
    fetchMock.mockResolvedValueOnce(
      response(true, {
        model: "gpt-4.1",
        choices: [
          { index: 0, finish_reason: "stop", message: { role: "assistant", content: " ok " } },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 3 },
      }),
    );
    const provider = new OpenAiLlmProvider(makeConfig(), { env });
    provider.setSystemPrompt(" system ");
    provider.addMessage("system", "policy");
    provider.addMessage("assistant", "previous answer");
    provider.addMessage("user", "   ");
    provider.addAttachment("notes.txt", "attachment body");
    provider.addInputDoc(7, "docs/in.md", "input body");
    provider.addOutputDoc(8, "docs/out.md", "");
    provider.setExtraInfo(" extra ");
    provider.setUserPrompt(" prompt ");

    const result = await provider.generateText();

    expect(result).toMatchObject({
      rawText: "ok",
      inputTokens: 10,
      outputTokens: 3,
      finishReason: "stop",
      model: "gpt-4.1",
    });
    const [, init] = fetchMock.mock.calls[0];
    expect(fetchMock.mock.calls[0][0]).toBe("https://example.test/v1/chat/completions");
    expect(init.headers.Authorization).toBe("Bearer sk-test");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("gpt-4.1");
    expect(body.temperature).toBe(0.1);
    expect(body.max_tokens).toBe(100);
    expect(body.messages[0]).toEqual({ role: "developer", content: "system" });
    expect(body.messages.some((m: any) => m.content.includes("attachment body"))).toBe(true);
    expect(body.messages.some((m: any) => m.content.includes("input body"))).toBe(true);
    expect(body.messages.at(-1)).toEqual({ role: "user", content: "prompt" });
  });

  it("uses system role for older models and options override config values", async () => {
    fetchMock.mockResolvedValueOnce(
      response(true, {
        model: "gpt-4o",
        choices: [{ finish_reason: null, message: { content: "done" } }],
      }),
    );
    const provider = new OpenAiLlmProvider(makeConfig("gpt-4o"), { env });
    provider.setOptions({ temperature: 0.9, maxTokens: 55, timeoutMs: 2000 });
    provider.setSystemPrompt("sys");
    provider.setUserPrompt("user");

    await provider.generateText();

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages[0].role).toBe("system");
    expect(body.temperature).toBe(0.9);
    expect(body.max_tokens).toBe(55);
  });

  it("uses GPT-5 token parameter names and omits temperature", async () => {
    fetchMock.mockResolvedValueOnce(
      response(true, {
        model: "gpt-5.4",
        choices: [{ finish_reason: "stop", message: { content: "done" } }],
      }),
    );
    const provider = new OpenAiLlmProvider(makeConfig("gpt-5.4"), { env });
    provider.setUserPrompt("user");

    await provider.generateText();

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("gpt-5.4");
    expect(body.max_completion_tokens).toBe(100);
    expect(body.max_tokens).toBeUndefined();
    expect(body.temperature).toBeUndefined();
  });

  it("throws on missing messages, HTTP failures, empty content, and aborts", async () => {
    await expect(new OpenAiLlmProvider(makeConfig(), { env }).generateText()).rejects.toThrow(
      /No messages/,
    );

    fetchMock.mockResolvedValueOnce(response(false, "bad request", 400));
    const httpProvider = new OpenAiLlmProvider(makeConfig(), { env });
    httpProvider.setUserPrompt("x");
    await expect(httpProvider.generateText()).rejects.toThrow(/status 400: bad request/);

    fetchMock.mockResolvedValueOnce(
      response(true, { model: "m", choices: [{ message: { content: " " } }] }),
    );
    const emptyProvider = new OpenAiLlmProvider(makeConfig(), { env });
    emptyProvider.setUserPrompt("x");
    await expect(emptyProvider.generateText()).rejects.toThrow(/did not contain text/);

    fetchMock.mockRejectedValueOnce(Object.assign(new Error("aborted"), { name: "AbortError" }));
    const abortProvider = new OpenAiLlmProvider(makeConfig(), { env });
    abortProvider.setUserPrompt("x");
    await expect(abortProvider.generateText()).rejects.toThrow(/timeout after 1000ms/);
  });

  it("uses defaults, nullable metadata, and ignores empty context", async () => {
    fetchMock.mockResolvedValueOnce(
      response(true, {
        choices: [{ finish_reason: null, message: { content: " ok " } }],
      }),
    );
    const config = makeConfig();
    config.llm.endpoint = undefined as any;
    config.llm.maxTokens = undefined as any;
    config.llm.temperature = undefined as any;
    config.llm.timeoutMs = undefined as any;
    const provider = new OpenAiLlmProvider(config, { env });
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
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.openai.com/v1/chat/completions");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.temperature).toBeUndefined();
    expect(body.max_tokens).toBeUndefined();
    expect(body.messages.some((message: any) => message.content.includes("docs/out.md"))).toBe(
      true,
    );
  });
});
