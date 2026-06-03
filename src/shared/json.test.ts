import { describe, it, expect, vi, afterEach } from "vitest";
import { strToJson, jsonToStr } from "./json.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("strToJson", () => {
  it("parses valid JSON into an object", () => {
    expect(strToJson('{"a":1,"b":"x"}')).toEqual({ a: 1, b: "x" });
  });

  it("returns null and logs on invalid JSON", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(strToJson("{ not json")).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });
});

describe("jsonToStr", () => {
  it("serializes an object with 2-space indentation", () => {
    expect(jsonToStr({ a: 1 })).toBe('{\n  "a": 1\n}');
  });

  it("returns an empty string when serialization fails (circular reference)", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(jsonToStr(circular)).toBe("");
    expect(errorSpy).toHaveBeenCalled();
  });

  it("round-trips through strToJson", () => {
    const original = { name: "mede", cycles: [1, 2, 3], nested: { ok: true } };
    expect(strToJson(jsonToStr(original))).toEqual(original);
  });
});
