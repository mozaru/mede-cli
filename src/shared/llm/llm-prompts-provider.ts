import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The methodology prompts are *content*, not logic, so they live as versioned
// Markdown assets under `prompts/` instead of inline string literals. This module
// loads them at startup and re-exports the same constants the rest of the code
// already imports, so consumers are unaffected.
//
// Layout:
//   prompts/fragments/diff-rules.md   shared diff instructions
//   prompts/templates/<phase>.md      per-phase document template
//   prompts/system/<phase>.md         system prompt, with {{DIFF_RULES}} / {{TEMPLATE}} placeholders
//   prompts/user/<phase>.md           user prompt (plain text)

// Walks up from this module until it finds the shipped `prompts/` directory.
// Works both in dev (src tree) and in the bundled dist artifact, since `prompts/`
// is published at the package root.
function findPromptsDir(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));

  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = path.join(dir, "prompts");
    if (fs.existsSync(path.join(candidate, "fragments", "diff-rules.md"))) {
      return candidate;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  throw new Error("MEDE-CLI: diretório de prompts não encontrado (assets de prompt ausentes).");
}

const PROMPTS_DIR = findPromptsDir();

function readPrompt(relativePath: string): string {
  return fs.readFileSync(path.join(PROMPTS_DIR, relativePath), "utf-8");
}

const DIFF_RULES = readPrompt("fragments/diff-rules.md");

function loadSystemPrompt(base: string, hasTemplate: boolean): string {
  let content = readPrompt(`system/${base}.md`).split("{{DIFF_RULES}}").join(DIFF_RULES);

  if (hasTemplate) {
    content = content.split("{{TEMPLATE}}").join(readPrompt(`templates/${base}.md`));
  }

  return content;
}

function loadUserPrompt(base: string): string {
  return readPrompt(`user/${base}.md`);
}

const SYSTEM_PROMPT_README = loadSystemPrompt("readme", false);
const SYSTEM_PROMPT_INITIAL_UNDERSTANDING = loadSystemPrompt("initial-understanding", true);
const SYSTEM_PROMPT_MEETING = loadSystemPrompt("meeting", true);
const SYSTEM_PROMPT_ADR = loadSystemPrompt("adr", true);
const SYSTEM_PROMPT_ESM = loadSystemPrompt("esm", true);
const SYSTEM_PROMPT_DELIVERY_LOG = loadSystemPrompt("delivery-log", true);
const SYSTEM_PROMPT_FUNCTIONAL_REQUIREMENTS = loadSystemPrompt("functional-requirements", true);
const SYSTEM_PROMPT_NON_FUNCTIONAL_REQUIREMENTS = loadSystemPrompt(
  "non-functional-requirements",
  true,
);
const SYSTEM_PROMPT_DATA_MODEL = loadSystemPrompt("data-model", true);
const SYSTEM_PROMPT_TIMELINE = loadSystemPrompt("timeline", true);
const SYSTEM_PROMPT_SCOPE_AND_VISION = loadSystemPrompt("scope-and-vision", true);
const SYSTEM_PROMPT_CURRENT_STATE = loadSystemPrompt("current-state", true);

const USER_PROMPT_README = loadUserPrompt("readme");
const USER_PROMPT_INITIAL_UNDERSTANDING = loadUserPrompt("initial-understanding");
const USER_PROMPT_MEETING = loadUserPrompt("meeting");
const USER_PROMPT_ADR = loadUserPrompt("adr");
const USER_PROMPT_ESM = loadUserPrompt("esm");
const USER_PROMPT_DELIVERY_LOG = loadUserPrompt("delivery-log");
const USER_PROMPT_FUNCTIONAL_REQUIREMENTS = loadUserPrompt("functional-requirements");
const USER_PROMPT_NON_FUNCTIONAL_REQUIREMENTS = loadUserPrompt("non-functional-requirements");
const USER_PROMPT_DATA_MODEL = loadUserPrompt("data-model");
const USER_PROMPT_TIMELINE = loadUserPrompt("timeline");
const USER_PROMPT_SCOPE_AND_VISION = loadUserPrompt("scope-and-vision");
const USER_PROMPT_CURRENT_STATE = loadUserPrompt("current-state");

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
};
