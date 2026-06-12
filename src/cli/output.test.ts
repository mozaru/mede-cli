import { afterEach, describe, expect, it, vi } from "vitest";
import { emitProgress, emitResult, getOutputFormat, setOutputFormat } from "./output.js";

describe("output helpers", () => {
  afterEach(() => {
    setOutputFormat("text");
    vi.restoreAllMocks();
  });

  it("emits human text by default", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    expect(getOutputFormat()).toBe("text");
    emitResult("ok");

    expect(log).toHaveBeenCalledWith("ok");
  });

  it("wraps successful output as JSON", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    setOutputFormat("json");

    emitResult("ok");

    expect(log).toHaveBeenCalledWith(JSON.stringify({ ok: true, output: "ok" }));
  });

  it("emits progress only in text mode", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    emitProgress("working");
    setOutputFormat("json");
    emitProgress("quiet");

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith("working");
  });
});
