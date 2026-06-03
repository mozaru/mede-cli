import { describe, it, expect } from "vitest";
import { parseMedeConfig } from "./mede-config-schema.js";
import { MedeConfigModelEntity } from "../domain/entities/mede-config-model-entity.js";
import { jsonToStr } from "./json.js";

// A fully-populated default config is, by construction, a valid config.
function validConfigJson(): string {
  return jsonToStr(new MedeConfigModelEntity());
}

describe("parseMedeConfig", () => {
  it("accepts a complete, well-formed configuration", () => {
    const config = parseMedeConfig(validConfigJson());

    expect(config.llm.provider).toBe("openai-compatible");
    expect(config.docsRoot).toBe("docs");
    expect(config.fileNames.readme).toBe("readme.md");
  });

  it("rejects empty content", () => {
    expect(() => parseMedeConfig("   ")).toThrow(/vazio/);
  });

  it("rejects content that is not valid JSON", () => {
    expect(() => parseMedeConfig("{ not json")).toThrow(/não é um JSON válido/);
  });

  it("rejects an unsupported LLM provider", () => {
    const raw = JSON.parse(validConfigJson());
    raw.llm.provider = "banana";

    expect(() => parseMedeConfig(jsonToStr(raw))).toThrow(/provider não suportado/);
  });

  it("reports the offending path when a required section is missing", () => {
    const raw = JSON.parse(validConfigJson());
    delete raw.fileNames;

    expect(() => parseMedeConfig(jsonToStr(raw))).toThrow(/fileNames/);
  });

  it("rejects a non-positive maxTokens with a clear message", () => {
    const raw = JSON.parse(validConfigJson());
    raw.llm.maxTokens = 0;

    expect(() => parseMedeConfig(jsonToStr(raw))).toThrow(/maxTokens/);
  });

  it("accepts a config whose prompt sections are only partially filled", () => {
    const raw = JSON.parse(validConfigJson());
    raw.systemPrompts = { meeting: "algum prompt" };
    delete raw.prompts;

    expect(() => parseMedeConfig(jsonToStr(raw))).not.toThrow();
  });

  it("preserves unknown forward-compatible keys", () => {
    const raw = JSON.parse(validConfigJson());
    raw.futureField = "mantido";

    const config = parseMedeConfig(jsonToStr(raw)) as MedeConfigModelEntity & {
      futureField?: string;
    };
    expect(config.futureField).toBe("mantido");
  });
});
