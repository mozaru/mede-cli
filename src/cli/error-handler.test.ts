import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatCliError, reportCliError } from "./error-handler.js";
import { setOutputFormat } from "./output.js";

describe("formatCliError", () => {
  it("formats Error, string, serializable object, and circular object values", () => {
    const namedError = new Error("");
    namedError.name = "NamedError";
    const circular: any = {};
    circular.self = circular;

    expect(formatCliError(new Error("boom"))).toBe("boom");
    expect(formatCliError(namedError)).toBe("NamedError");
    expect(formatCliError("plain")).toBe("plain");
    expect(formatCliError({ code: "E_TEST" })).toBe('{"code":"E_TEST"}');
    expect(formatCliError(circular)).toBe("[object Object]");
  });
});

describe("reportCliError", () => {
  const previousExitCode = process.exitCode;
  const previousDebug = process.env.MEDE_DEBUG;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setOutputFormat("text");
    process.exitCode = undefined;
    delete process.env.MEDE_DEBUG;
    consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
    process.exitCode = previousExitCode;
    if (previousDebug === undefined) {
      delete process.env.MEDE_DEBUG;
    } else {
      process.env.MEDE_DEBUG = previousDebug;
    }
    setOutputFormat("text");
  });

  it("prints text errors and sets a failing exit code", () => {
    reportCliError("failed");

    expect(consoleError).toHaveBeenCalledWith("Erro: failed");
    expect(process.exitCode).toBe(1);
  });

  it("prints JSON errors when JSON output is active", () => {
    setOutputFormat("json");

    reportCliError(new Error("bad"));

    expect(consoleError).toHaveBeenCalledWith(JSON.stringify({ ok: false, error: "bad" }));
    expect(process.exitCode).toBe(1);
  });

  it("prints stack traces only when debug mode is enabled", () => {
    process.env.MEDE_DEBUG = "1";
    const error = new Error("bad");
    error.stack = "stack trace";

    reportCliError(error);

    expect(consoleError).toHaveBeenCalledWith("Erro: bad");
    expect(consoleError).toHaveBeenCalledWith("stack trace");
  });
});
