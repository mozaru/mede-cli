import { describe, it, expect, afterEach, vi } from "vitest";
import { setOutputFormat, getOutputFormat, emitResult } from "./output.js";
import { reportCliError } from "./error-handler.js";

afterEach(() => {
  setOutputFormat("text");
  vi.restoreAllMocks();
  process.exitCode = 0;
});

describe("emitResult", () => {
  it("prints the raw string in text mode", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    setOutputFormat("text");

    emitResult("hello");

    expect(log).toHaveBeenCalledWith("hello");
  });

  it("wraps the output in a JSON envelope in json mode", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    setOutputFormat("json");

    emitResult("hello");

    expect(log).toHaveBeenCalledWith(JSON.stringify({ ok: true, output: "hello" }));
  });
});

describe("reportCliError", () => {
  it("prints a friendly prefixed message in text mode and sets a non-zero exit code", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    setOutputFormat("text");

    reportCliError(new Error("algo falhou"));

    expect(err).toHaveBeenCalledWith("Erro: algo falhou");
    expect(process.exitCode).toBe(1);
  });

  it("prints a JSON error envelope in json mode", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    setOutputFormat("json");

    reportCliError(new Error("algo falhou"));

    expect(err).toHaveBeenCalledWith(JSON.stringify({ ok: false, error: "algo falhou" }));
    expect(process.exitCode).toBe(1);
  });
});

describe("output format state", () => {
  it("defaults back to text after reset", () => {
    setOutputFormat("text");
    expect(getOutputFormat()).toBe("text");
  });
});
