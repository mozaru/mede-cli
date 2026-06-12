import fs from "node:fs";
import path from "node:path";
import { I18n, PACKAGE_LOCALES_DIR } from "../../shared/i18n.js";

function readPrompt(relativePath: string, lang: string): string {
  // 1. First, check project-level .mede/prompts/ relative to process.cwd()
  const projectPromptPath = path.join(process.cwd(), ".mede", "prompts", relativePath);
  if (fs.existsSync(projectPromptPath)) {
    return fs.readFileSync(projectPromptPath, "utf-8");
  }

  // 2. Otherwise, look inside package-level locales directory
  if (lang) {
    const cleanLang = lang.trim();
    // Try locales/xx-yy/prompts/...
    let langPath = path.join(PACKAGE_LOCALES_DIR, cleanLang, "prompts", relativePath);
    if (fs.existsSync(langPath)) {
      return fs.readFileSync(langPath, "utf-8");
    }
    // Try lowercase (e.g. locales/xx-yy/prompts/...)
    langPath = path.join(PACKAGE_LOCALES_DIR, cleanLang.toLowerCase(), "prompts", relativePath);
    if (fs.existsSync(langPath)) {
      return fs.readFileSync(langPath, "utf-8");
    }
    // Try 2-char prefix (e.g. locales/xx/prompts/...)
    const prefix = cleanLang.toLowerCase().slice(0, 2);
    if (prefix !== "pt") {
      langPath = path.join(PACKAGE_LOCALES_DIR, prefix, "prompts", relativePath);
      if (fs.existsSync(langPath)) {
        return fs.readFileSync(langPath, "utf-8");
      }
    }
  }

  // 3. Fallback to locales/pt-BR/prompts/...
  const defaultPath = path.join(PACKAGE_LOCALES_DIR, "pt-BR", "prompts", relativePath);
  if (fs.existsSync(defaultPath)) {
    return fs.readFileSync(defaultPath, "utf-8");
  }

  throw new Error(I18n.t("MEDE-CLI: Prompt padrão não encontrado para {0}", relativePath));
}

let DIFF_RULES = "";

let SYSTEM_PROMPT_README = "";
let SYSTEM_PROMPT_INITIAL_UNDERSTANDING = "";
let SYSTEM_PROMPT_MEETING = "";
let SYSTEM_PROMPT_ADR = "";
let SYSTEM_PROMPT_ESM = "";
let SYSTEM_PROMPT_DELIVERY_LOG = "";
let SYSTEM_PROMPT_FUNCTIONAL_REQUIREMENTS = "";
let SYSTEM_PROMPT_NON_FUNCTIONAL_REQUIREMENTS = "";
let SYSTEM_PROMPT_DATA_MODEL = "";
let SYSTEM_PROMPT_TIMELINE = "";
let SYSTEM_PROMPT_SCOPE_AND_VISION = "";
let SYSTEM_PROMPT_CURRENT_STATE = "";
let SYSTEM_PROMPT_EXTRACT_BACKLOG = "";

let USER_PROMPT_README = "";
let USER_PROMPT_INITIAL_UNDERSTANDING = "";
let USER_PROMPT_EXTRACT_BACKLOG = "";
let USER_PROMPT_MEETING = "";
let USER_PROMPT_ADR = "";
let USER_PROMPT_ESM = "";
let USER_PROMPT_DELIVERY_LOG = "";
let USER_PROMPT_FUNCTIONAL_REQUIREMENTS = "";
let USER_PROMPT_NON_FUNCTIONAL_REQUIREMENTS = "";
let USER_PROMPT_DATA_MODEL = "";
let USER_PROMPT_TIMELINE = "";
let USER_PROMPT_SCOPE_AND_VISION = "";
let USER_PROMPT_CURRENT_STATE = "";

function loadSystemPrompt(base: string, hasTemplate: boolean, lang: string): string {
  let content = readPrompt(`system/${base}.md`, lang).split("{{DIFF_RULES}}").join(DIFF_RULES);

  if (hasTemplate) {
    content = content.split("{{TEMPLATE}}").join(readPrompt(`templates/${base}.md`, lang));
  }

  return content;
}

function loadUserPrompt(base: string, lang: string): string {
  return readPrompt(`user/${base}.md`, lang);
}

// Reload prompts dynamically on language change
I18n.onLanguageChange((lang) => {
  DIFF_RULES = readPrompt("fragments/diff-rules.md", lang);

  SYSTEM_PROMPT_README = loadSystemPrompt("readme", false, lang);
  SYSTEM_PROMPT_INITIAL_UNDERSTANDING = loadSystemPrompt("initial-understanding", true, lang);
  SYSTEM_PROMPT_MEETING = loadSystemPrompt("meeting", true, lang);
  SYSTEM_PROMPT_ADR = loadSystemPrompt("adr", true, lang);
  SYSTEM_PROMPT_ESM = loadSystemPrompt("esm", true, lang);
  SYSTEM_PROMPT_DELIVERY_LOG = loadSystemPrompt("delivery-log", true, lang);
  SYSTEM_PROMPT_FUNCTIONAL_REQUIREMENTS = loadSystemPrompt("functional-requirements", true, lang);
  SYSTEM_PROMPT_NON_FUNCTIONAL_REQUIREMENTS = loadSystemPrompt("non-functional-requirements", true, lang);
  SYSTEM_PROMPT_DATA_MODEL = loadSystemPrompt("data-model", true, lang);
  SYSTEM_PROMPT_TIMELINE = loadSystemPrompt("timeline", true, lang);
  SYSTEM_PROMPT_SCOPE_AND_VISION = loadSystemPrompt("scope-and-vision", true, lang);
  SYSTEM_PROMPT_CURRENT_STATE = loadSystemPrompt("current-state", true, lang);
  SYSTEM_PROMPT_EXTRACT_BACKLOG = loadSystemPrompt("extract-backlog", false, lang);

  USER_PROMPT_README = loadUserPrompt("readme", lang);
  USER_PROMPT_EXTRACT_BACKLOG = loadUserPrompt("extract-backlog", lang);
  USER_PROMPT_INITIAL_UNDERSTANDING = loadUserPrompt("initial-understanding", lang);
  USER_PROMPT_MEETING = loadUserPrompt("meeting", lang);
  USER_PROMPT_ADR = loadUserPrompt("adr", lang);
  USER_PROMPT_ESM = loadUserPrompt("esm", lang);
  USER_PROMPT_DELIVERY_LOG = loadUserPrompt("delivery-log", lang);
  USER_PROMPT_FUNCTIONAL_REQUIREMENTS = loadUserPrompt("functional-requirements", lang);
  USER_PROMPT_NON_FUNCTIONAL_REQUIREMENTS = loadUserPrompt("non-functional-requirements", lang);
  USER_PROMPT_DATA_MODEL = loadUserPrompt("data-model", lang);
  USER_PROMPT_TIMELINE = loadUserPrompt("timeline", lang);
  USER_PROMPT_SCOPE_AND_VISION = loadUserPrompt("scope-and-vision", lang);
  USER_PROMPT_CURRENT_STATE = loadUserPrompt("current-state", lang);
  USER_PROMPT_EXTRACT_BACKLOG = loadUserPrompt("extract-backlog", lang);
});

export {
  SYSTEM_PROMPT_README,
  SYSTEM_PROMPT_INITIAL_UNDERSTANDING,
  SYSTEM_PROMPT_MEETING,
  SYSTEM_PROMPT_ADR,
  SYSTEM_PROMPT_ESM,
  SYSTEM_PROMPT_DELIVERY_LOG,
  SYSTEM_PROMPT_FUNCTIONAL_REQUIREMENTS,
  SYSTEM_PROMPT_NON_FUNCTIONAL_REQUIREMENTS,
  SYSTEM_PROMPT_DATA_MODEL,
  SYSTEM_PROMPT_TIMELINE,
  SYSTEM_PROMPT_SCOPE_AND_VISION,
  SYSTEM_PROMPT_CURRENT_STATE,
  SYSTEM_PROMPT_EXTRACT_BACKLOG,
  USER_PROMPT_README,
  USER_PROMPT_INITIAL_UNDERSTANDING,
  USER_PROMPT_MEETING,
  USER_PROMPT_ADR,
  USER_PROMPT_ESM,
  USER_PROMPT_DELIVERY_LOG,
  USER_PROMPT_FUNCTIONAL_REQUIREMENTS,
  USER_PROMPT_NON_FUNCTIONAL_REQUIREMENTS,
  USER_PROMPT_DATA_MODEL,
  USER_PROMPT_TIMELINE,
  USER_PROMPT_SCOPE_AND_VISION,
  USER_PROMPT_CURRENT_STATE,
  USER_PROMPT_EXTRACT_BACKLOG,
};
