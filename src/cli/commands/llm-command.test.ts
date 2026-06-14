/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { LlmCommand } from "./llm-command.js";
import { setSharedContainer, clearSharedContainer } from "../container.js";
import { setOutputFormat } from "../output.js";

describe("LlmCommand", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    clearSharedContainer();
    setOutputFormat("text");
  });

  it("execute runs llmService.providers and prints result in text mode", () => {
    const mockLlmService = {
      providers: vi.fn().mockReturnValue("MOCK_PROVIDERS"),
      test: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    };

    setSharedContainer({
      llmService: mockLlmService,
    } as any);

    setOutputFormat("text");

    const handler = new LlmCommand();
    handler.execute();

    expect(mockLlmService.providers).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("MOCK_PROVIDERS");
  });

  it("execute runs llmService.providers and prints JSON result in json mode", () => {
    const mockLlmService = {
      providers: vi.fn().mockReturnValue("MOCK_PROVIDERS"),
      test: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    };

    setSharedContainer({
      llmService: mockLlmService,
    } as any);

    setOutputFormat("json");

    const handler = new LlmCommand();
    handler.execute();

    expect(mockLlmService.providers).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ ok: true, output: "MOCK_PROVIDERS" }));
  });

  it("executeTest runs llmService.test and prints result in text mode", async () => {
    const mockLlmService = {
      providers: vi.fn(),
      test: vi.fn().mockResolvedValue("MOCK_TEST_RESULT"),
      login: vi.fn(),
      logout: vi.fn(),
    };

    setSharedContainer({
      llmService: mockLlmService,
    } as any);

    setOutputFormat("text");

    const handler = new LlmCommand();
    await handler.executeTest("test_prompt");

    expect(mockLlmService.test).toHaveBeenCalledWith("test_prompt");
    expect(logSpy).toHaveBeenCalledWith("MOCK_TEST_RESULT");
  });

  it("executeTest runs llmService.test and prints JSON result in json mode", async () => {
    const mockLlmService = {
      providers: vi.fn(),
      test: vi.fn().mockResolvedValue("MOCK_TEST_RESULT"),
      login: vi.fn(),
      logout: vi.fn(),
    };

    setSharedContainer({
      llmService: mockLlmService,
    } as any);

    setOutputFormat("json");

    const handler = new LlmCommand();
    await handler.executeTest("test_prompt");

    expect(mockLlmService.test).toHaveBeenCalledWith("test_prompt");
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ ok: true, output: "MOCK_TEST_RESULT" }));
  });

  it("executeLogin runs llmService.login and prints result in text mode", async () => {
    const mockLlmService = {
      providers: vi.fn(),
      test: vi.fn(),
      login: vi.fn().mockImplementation((onProgress) => {
        onProgress("progress_message");
        return Promise.resolve("MOCK_LOGIN_SUCCESS");
      }),
      logout: vi.fn(),
    };

    setSharedContainer({
      llmService: mockLlmService,
    } as any);

    setOutputFormat("text");

    const handler = new LlmCommand();
    await handler.executeLogin();

    expect(mockLlmService.login).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("progress_message");
    expect(logSpy).toHaveBeenCalledWith("MOCK_LOGIN_SUCCESS");
  });

  it("executeLogin runs llmService.login and prints JSON result in json mode", async () => {
    const mockLlmService = {
      providers: vi.fn(),
      test: vi.fn(),
      login: vi.fn().mockImplementation((onProgress) => {
        onProgress("progress_message");
        return Promise.resolve("MOCK_LOGIN_SUCCESS");
      }),
      logout: vi.fn(),
    };

    setSharedContainer({
      llmService: mockLlmService,
    } as any);

    setOutputFormat("json");

    const handler = new LlmCommand();
    await handler.executeLogin();

    expect(mockLlmService.login).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("progress_message");
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ ok: true, output: "MOCK_LOGIN_SUCCESS" }));
  });

  it("executeLogout runs llmService.logout and prints result in text mode", () => {
    const mockLlmService = {
      providers: vi.fn(),
      test: vi.fn(),
      login: vi.fn(),
      logout: vi.fn().mockReturnValue("MOCK_LOGOUT_SUCCESS"),
    };

    setSharedContainer({
      llmService: mockLlmService,
    } as any);

    setOutputFormat("text");

    const handler = new LlmCommand();
    handler.executeLogout();

    expect(mockLlmService.logout).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("MOCK_LOGOUT_SUCCESS");
  });

  it("executeLogout runs llmService.logout and prints JSON result in json mode", () => {
    const mockLlmService = {
      providers: vi.fn(),
      test: vi.fn(),
      login: vi.fn(),
      logout: vi.fn().mockReturnValue("MOCK_LOGOUT_SUCCESS"),
    };

    setSharedContainer({
      llmService: mockLlmService,
    } as any);

    setOutputFormat("json");

    const handler = new LlmCommand();
    handler.executeLogout();

    expect(mockLlmService.logout).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      JSON.stringify({ ok: true, output: "MOCK_LOGOUT_SUCCESS" }),
    );
  });
});
