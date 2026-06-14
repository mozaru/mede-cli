import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { I18n, PACKAGE_LOCALES_DIR } from "./i18n.js";

describe("I18n Localization & Translation Sweeper", () => {
  let tempDir: string;

  beforeAll(() => {
    // Create a temporary directory for testing dynamic locales loading
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mede-locales-test-"));

    // Create subdirectories
    fs.mkdirSync(path.join(tempDir, "pt-BR"), { recursive: true });
    fs.mkdirSync(path.join(tempDir, "en-US"), { recursive: true });
    fs.mkdirSync(path.join(tempDir, "es"), { recursive: true });

    // Write test locale files
    fs.writeFileSync(
      path.join(tempDir, "pt-BR", "messages.json"),
      JSON.stringify({ "Test Key": "Chave de Teste", "Only In PT": "Apenas em PT" }),
      "utf-8",
    );
    fs.writeFileSync(
      path.join(tempDir, "en-US", "messages.json"),
      JSON.stringify({ "Test Key": "Test Key Translated", "Only In EN": "Only in EN" }),
      "utf-8",
    );
    fs.writeFileSync(
      path.join(tempDir, "es", "messages.json"),
      JSON.stringify({ "Test Key": "Clave de Prueba", "Only In ES": "Solo en ES" }),
      "utf-8",
    );
  });

  afterAll(() => {
    // Clean up temporary files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup failures
    }
  });

  it("should detect all available languages from locales directory", () => {
    const langs = I18n.getAvailableLanguages(tempDir);
    expect(langs).toContain("pt-BR");
    expect(langs).toContain("en-US");
    expect(langs).toContain("es");
  });

  it("should load translations dynamically from the locales directory", () => {
    I18n.loadLocalesFromDir(tempDir);

    // Test Spanish translation
    I18n.setLanguage("es");
    expect(I18n.language).toBe("es");
    expect(I18n.t("Test Key")).toBe("Clave de Prueba");
    expect(I18n.t("Only In ES")).toBe("Solo en ES");

    // Test pt-BR translation
    I18n.setLanguage("pt-BR");
    expect(I18n.language).toBe("pt-BR");
    expect(I18n.t("Test Key")).toBe("Chave de Teste");

    // Test en-US translation
    I18n.setLanguage("en-US");
    expect(I18n.language).toBe("en-US");
    expect(I18n.t("Test Key")).toBe("Test Key Translated");
  });

  it("should sweep across all detected languages to check key translation", () => {
    I18n.loadLocalesFromDir(tempDir);
    const languages = I18n.getAvailableLanguages(tempDir);

    for (const lang of languages) {
      I18n.setLanguage(lang);
      expect(I18n.language).toBe(lang);

      const translation = I18n.t("Test Key");
      expect(translation).toBeDefined();
      expect(translation).not.toBe("Test Key"); // Should be translated
    }
  });

  it("should fall back to English or Portuguese when translation is missing in the current language", () => {
    I18n.loadLocalesFromDir(tempDir);

    // Switch to Spanish
    I18n.setLanguage("es");

    // "Only In PT" is not in es.json. It should fallback to Portuguese/English default value
    expect(I18n.t("Only In PT")).toBe("Apenas em PT");

    // "Only In EN" is not in es.json. It should fallback to English/Portuguese default value
    expect(I18n.t("Only In EN")).toBe("Only in EN");
  });

  it("should ensure static dictionaries (pt-BR/messages.json and en-US/messages.json) are fully aligned in translation keys", () => {
    const ptContent = fs.readFileSync(
      path.join(PACKAGE_LOCALES_DIR, "pt-BR", "messages.json"),
      "utf-8",
    );
    const enContent = fs.readFileSync(
      path.join(PACKAGE_LOCALES_DIR, "en-US", "messages.json"),
      "utf-8",
    );

    const ptKeys = Object.keys(JSON.parse(ptContent)).sort();
    const enKeys = Object.keys(JSON.parse(enContent)).sort();

    expect(ptKeys).toEqual(enKeys);
  });
});
