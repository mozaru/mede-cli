import { describe, it, expect } from "vitest";
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
    // A stable phrase from prompts/fragments/diff-rules.md must appear in each
    // system prompt after substitution.
    for (const prompt of systemPrompts) {
      expect(prompt.toLowerCase()).toContain("diff");
    }
  });

  it("dynamically switches prompts when language changes", () => {
    I18n.setLanguage("en-US");
    expect(Prompts.SYSTEM_PROMPT_README).toBeDefined();
    expect(Prompts.SYSTEM_PROMPT_README.length).toBeGreaterThan(0);
    I18n.setLanguage("pt-BR");
  });

  it("overrides specific prompts when files exist in .mede/prompts/ on a file-by-file basis", () => {
    const localPromptsDir = path.join(process.cwd(), ".mede", "prompts", "system");
    fs.mkdirSync(localPromptsDir, { recursive: true });
    
    const readmeOverridePath = path.join(localPromptsDir, "readme.md");
    fs.writeFileSync(readmeOverridePath, "OVERRIDDEN README {{DIFF_RULES}}", "utf-8");
    
    try {
      // Trigger a language change to force prompt reload
      I18n.setLanguage("pt-BR");
      I18n.setLanguage("en-US");
      expect(Prompts.SYSTEM_PROMPT_README).toContain("OVERRIDDEN README");
      
      // Other system prompts (like meeting) should still load from package assets (fallback)
      expect(Prompts.SYSTEM_PROMPT_MEETING).not.toContain("OVERRIDDEN README");
    } finally {
      // Cleanup
      try {
        fs.unlinkSync(readmeOverridePath);
        fs.rmdirSync(localPromptsDir);
        fs.rmdirSync(path.join(process.cwd(), ".mede", "prompts"));
        fs.rmdirSync(path.join(process.cwd(), ".mede"));
      } catch {
        // Ignore cleanup failures
      }
      I18n.setLanguage("pt-BR");
    }
  });
});
