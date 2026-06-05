import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as Prompts from "./llm-prompts-provider.js";
import { I18n } from "../../shared/i18n.js";
import fs from "node:fs";
import path from "node:path";

const systemPrompts = [
  Prompts.SYSTEM_PROMPT_README,
  Prompts.SYSTEM_PROMPT_INITIAL_UNDERSTANDING,
  Prompts.SYSTEM_PROMPT_MEETING,
  Prompts.SYSTEM_PROMPT_ADR,
  Prompts.SYSTEM_PROMPT_ESM,
  Prompts.SYSTEM_PROMPT_DELIVERY_LOG,
  Prompts.SYSTEM_PROMPT_FUNCTIONAL_REQUIREMENTS,
  Prompts.SYSTEM_PROMPT_NON_FUNCTIONAL_REQUIREMENTS,
  Prompts.SYSTEM_PROMPT_DATA_MODEL,
  Prompts.SYSTEM_PROMPT_TIMELINE,
  Prompts.SYSTEM_PROMPT_SCOPE_AND_VISION,
  Prompts.SYSTEM_PROMPT_CURRENT_STATE,
];

const userPrompts = [
  Prompts.USER_PROMPT_README,
  Prompts.USER_PROMPT_INITIAL_UNDERSTANDING,
  Prompts.USER_PROMPT_MEETING,
  Prompts.USER_PROMPT_ADR,
  Prompts.USER_PROMPT_ESM,
  Prompts.USER_PROMPT_DELIVERY_LOG,
  Prompts.USER_PROMPT_FUNCTIONAL_REQUIREMENTS,
  Prompts.USER_PROMPT_NON_FUNCTIONAL_REQUIREMENTS,
  Prompts.USER_PROMPT_DATA_MODEL,
  Prompts.USER_PROMPT_TIMELINE,
  Prompts.USER_PROMPT_SCOPE_AND_VISION,
  Prompts.USER_PROMPT_CURRENT_STATE,
];

describe("llm prompt assets loader", () => {
  let originalLanguage: string;

  beforeEach(() => {
    originalLanguage = I18n.language;
  });

  afterEach(() => {
    I18n.setLanguage(originalLanguage);
  });

  it("loads all 12 system and 12 user prompts as non-empty strings", () => {
    expect(systemPrompts).toHaveLength(12);
    expect(userPrompts).toHaveLength(12);

    for (const prompt of [...systemPrompts, ...userPrompts]) {
      expect(typeof prompt).toBe("string");
      expect(prompt.trim().length).toBeGreaterThan(0);
    }
  });

  it("substitutes the shared fragments into system prompts (no leftover placeholders)", () => {
    for (const prompt of systemPrompts) {
      expect(prompt).not.toContain("{{DIFF_RULES}}");
      expect(prompt).not.toContain("{{TEMPLATE}}");
    }
  });

  it("injects the shared diff rules into every system prompt", () => {
    for (const prompt of systemPrompts) {
      expect(prompt.toLowerCase()).toContain("diff");
    }
  });

  it("dynamically switches prompts when language changes", () => {
    I18n.setLanguage("en-US");
    expect(Prompts.SYSTEM_PROMPT_README).toBeDefined();
    expect(Prompts.SYSTEM_PROMPT_README.length).toBeGreaterThan(0);
  });

  describe("Resolution hierarchy: .mede/prompts -> locales/<lang> -> fallback pt-BR", () => {
    const medeDir = path.join(process.cwd(), ".mede");
    const localPromptsDir = path.join(medeDir, "prompts");
    const systemOverrideDir = path.join(localPromptsDir, "system");
    const readmeOverridePath = path.join(systemOverrideDir, "readme.md");

    afterEach(() => {
      // Cleanup files
      try {
        if (fs.existsSync(readmeOverridePath)) {
          fs.unlinkSync(readmeOverridePath);
        }
        if (fs.existsSync(systemOverrideDir)) {
          fs.rmdirSync(systemOverrideDir);
        }
        if (fs.existsSync(localPromptsDir)) {
          fs.rmdirSync(localPromptsDir);
        }
        if (fs.existsSync(medeDir)) {
          fs.rmdirSync(medeDir);
        }
      } catch {
        // Ignore cleanup failures
      }
    });

    it("Nível 1 (Customização Local): resolves local prompt in .mede/prompts/", () => {
      fs.mkdirSync(systemOverrideDir, { recursive: true });
      fs.writeFileSync(readmeOverridePath, "NIVEL 1 LOCAL OVERRIDE {{DIFF_RULES}}", "utf-8");

      I18n.setLanguage("en-US");
      expect(Prompts.SYSTEM_PROMPT_README).toContain("NIVEL 1 LOCAL OVERRIDE");

      I18n.setLanguage("pt-BR");
      expect(Prompts.SYSTEM_PROMPT_README).toContain("NIVEL 1 LOCAL OVERRIDE");
    });

    it("Nível 2 (Pacote/Idioma Selecionado): resolves package prompt for active language when no local override", () => {
      // Ensure no local override file
      if (fs.existsSync(readmeOverridePath)) {
        fs.unlinkSync(readmeOverridePath);
      }

      I18n.setLanguage("en-US");
      // Since it's English, check it has english key text
      expect(Prompts.SYSTEM_PROMPT_README).toContain("documentary engineering assistant");
      expect(Prompts.SYSTEM_PROMPT_README).not.toContain("NIVEL 1 LOCAL OVERRIDE");
    });

    it("Nível 3 (Fallback Default): falls back to pt-BR if active language is not supported or missing", () => {
      // Ensure no local override file
      if (fs.existsSync(readmeOverridePath)) {
        fs.unlinkSync(readmeOverridePath);
      }

      // Set language to unsupported language 'fr-FR'
      I18n.setLanguage("fr-FR");
      // It should fall back to pt-BR prompts
      expect(Prompts.SYSTEM_PROMPT_README).toContain("assistente de engenharia documental");
    });
  });
});
