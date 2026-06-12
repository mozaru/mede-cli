import { describe, it, expect } from "vitest";
import { parseMedeConfig } from "./mede-config-schema.js";
import { MedeConfigModelEntity } from "../domain/entities/mede-config-model-entity.js";
import { jsonToStr } from "./json.js";

function validConfigJson(): string {
  return jsonToStr(new MedeConfigModelEntity());
}

describe("parseMedeConfig", () => {
  it("accepts a complete, well-formed configuration", () => {
    const config = parseMedeConfig(validConfigJson());

    expect(config.llm.provider).toBe("openai");
    expect(config.llm.model).toBe("gpt-5.4");
    expect(config.docsRoot).toBe("docs");
    expect(config.fileNames.readme).toBe("readme.md");
  });

  it("rejects empty content", () => {
    expect(() => parseMedeConfig("   ")).toThrow(/vazio/);
  });

  it("rejects content that is not valid JSON", () => {
    expect(() => parseMedeConfig("{ not json")).toThrow(/nao e um JSON valido/);
  });

  it("rejects an unsupported LLM provider", () => {
    const raw = JSON.parse(validConfigJson());
    raw.llm.provider = "banana";

    expect(() => parseMedeConfig(jsonToStr(raw))).toThrow(/provider nao suportado/);
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

  it("accepts optional LLM profiles and routing", () => {
    const raw = JSON.parse(validConfigJson());
    raw.llm.activeProfile = "default";
    raw.llm.profiles = {
      default: { model: "gpt-5.4" },
      highQuality: { model: "gpt-5.5", maxTokens: 16000 },
    };
    raw.llmRouting = {
      extractBacklog: "highQuality",
    };

    expect(() => parseMedeConfig(jsonToStr(raw))).not.toThrow();
  });

  it("rejects an unknown active LLM profile", () => {
    const raw = JSON.parse(validConfigJson());
    raw.llm.activeProfile = "missing";
    raw.llm.profiles = {};

    expect(() => parseMedeConfig(jsonToStr(raw))).toThrow(/activeProfile/);
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

  it("accepts a config without projectName, clientName, supplierName (all optional)", () => {
    const raw = JSON.parse(validConfigJson());
    delete raw.projectName;
    delete raw.clientName;
    delete raw.supplierName;

    expect(() => parseMedeConfig(jsonToStr(raw))).not.toThrow();
  });

  it("parses projectName, clientName and supplierName when present", () => {
    const raw = JSON.parse(validConfigJson());
    raw.projectName = "Sistema X";
    raw.clientName = "Empresa Y";
    raw.supplierName = "11Tech";

    const config = parseMedeConfig(jsonToStr(raw));

    expect((config as MedeConfigModelEntity).projectName).toBe("Sistema X");
    expect((config as MedeConfigModelEntity).clientName).toBe("Empresa Y");
    expect((config as MedeConfigModelEntity).supplierName).toBe("11Tech");
  });
});
