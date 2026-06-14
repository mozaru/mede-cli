import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const translations: Record<string, Record<string, string>> = {};

function findPackageLocalesDir(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));

  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = path.join(dir, "locales");
    if (fs.existsSync(path.join(candidate, "pt-BR", "messages.json"))) {
      return candidate;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  throw new Error("MEDE-CLI: diretório de locales não encontrado no pacote.");
}

export const PACKAGE_LOCALES_DIR = findPackageLocalesDir();

export class I18n {
  private static _currentLanguage = "en";
  private static _onLanguageChange: ((lang: string) => void)[] = [];

  public static get language(): string {
    return this._currentLanguage;
  }

  public static onLanguageChange(callback: (lang: string) => void): void {
    this._onLanguageChange.push(callback);
    try {
      callback(this._currentLanguage);
    } catch {
      // Ignore initial callback failures
    }
  }

  public static setLanguage(lang: string): void {
    if (!lang) return;
    const cleanLang = lang.trim();
    const changed = this._currentLanguage !== cleanLang;
    this._currentLanguage = cleanLang;
    if (changed) {
      for (const cb of this._onLanguageChange) {
        try {
          cb(cleanLang);
        } catch {
          // Ignore subscriber notification failures
        }
      }
    }
  }

  public static loadLocalesFromDir(localesDir: string): void {
    if (!localesDir) return;
    try {
      const normalizedDir = path.resolve(path.normalize(localesDir));
      if (fs.existsSync(normalizedDir) && fs.statSync(normalizedDir).isDirectory()) {
        const entries = fs.readdirSync(normalizedDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const langName = entry.name.toLowerCase();
            const messagesPath = path.join(normalizedDir, entry.name, "messages.json");
            if (fs.existsSync(messagesPath)) {
              try {
                const content = fs.readFileSync(messagesPath, "utf-8");
                const json = JSON.parse(content);
                if (json && typeof json === "object") {
                  translations[langName] = { ...translations[langName], ...json };
                  // Also merge into/support the 2-character prefix
                  const prefix = langName.slice(0, 2);
                  translations[prefix] = { ...translations[prefix], ...translations[langName] };
                }
              } catch {
                // Ignore malformed json file errors
              }
            }
          }
        }
      }
    } catch {
      // Ignore filesystem access errors
    }
  }

  public static getAvailableLanguages(localesDir?: string): string[] {
    const langs = new Set<string>();
    // Include keys from translations
    for (const key of Object.keys(translations)) {
      if (key === "pt" || key === "en" || key === "pt-br" || key === "en-us") {
        langs.add(key === "pt" ? "pt-BR" : key === "en" ? "en-US" : key);
      }
    }
    const checkDir = localesDir || PACKAGE_LOCALES_DIR;
    if (checkDir) {
      try {
        const normalizedDir = path.resolve(path.normalize(checkDir));
        if (fs.existsSync(normalizedDir) && fs.statSync(normalizedDir).isDirectory()) {
          const entries = fs.readdirSync(normalizedDir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory()) {
              const messagesPath = path.join(normalizedDir, entry.name, "messages.json");
              if (fs.existsSync(messagesPath)) {
                langs.add(entry.name);
              }
            }
          }
        }
      } catch {
        // Ignore directory scanning errors
      }
    }
    return Array.from(langs);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static t(key: string, ...args: any[]): string {
    const lang = this._currentLanguage.toLowerCase();
    const dict =
      translations[lang] ||
      translations[lang.slice(0, 2)] ||
      translations["pt-br"] ||
      translations["pt"] ||
      translations["en-us"] ||
      translations["en"] ||
      {};

    let translation = dict[key];

    if (!translation) {
      // Try fallback dictionaries in order
      const fallbacks = ["en", "en-us", "pt", "pt-br"];
      for (const f of fallbacks) {
        if (translations[f] && translations[f][key]) {
          translation = translations[f][key];
          break;
        }
      }
    }

    translation = translation || key;

    for (let i = 0; i < args.length; i++) {
      translation = translation.replace(`{${i}}`, String(args[i]));
    }

    return translation;
  }
}

// Automatically load package locales at startup
I18n.loadLocalesFromDir(PACKAGE_LOCALES_DIR);
