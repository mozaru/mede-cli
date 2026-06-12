// End-to-end tests for the slug feature in the cycle flow.
// Verifies that HISTORICAL artifact filenames include the slug when
// shortDescriptionSlug.enabled is true, and use the provisional name when false.
// Only the LLM is mocked; real SQLite, real filesystem, real handlers.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const { generateText } = vi.hoisted(() => ({ generateText: vi.fn() }));

vi.mock("../../infrastructure/llm/llm-provider-factory.js", () => ({
  LlmProviderFactory: {
    create: () => ({
      setSystemPrompt: vi.fn(),
      setExtraInfo: vi.fn(),
      setUserPrompt: vi.fn(),
      setOptions: vi.fn(),
      addMessage: vi.fn(),
      addAttachment: vi.fn(),
      addInputDoc: vi.fn(),
      addOutputDoc: vi.fn(),
      generateText,
    }),
  },
}));

import { CycleCommand } from "./cycle-command.js";
import { ChangesCommand } from "./changes-command.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";

let root: string;
let previousCwd: string;
let logSpy: ReturnType<typeof vi.spyOn>;
let config: MedeConfigModelEntity;

const ATA_DIFF = "@@ -0,0 +1,3 @@\n+# Ata de Reunião\n+\n+Decisão aprovada\n";
const SLUG_RESPONSE = "sprint-001";

function setupProject(slugEnabled: boolean): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-slug-e2e-"));

  config = new MedeConfigModelEntity();
  config.shortDescriptionSlug = { enabled: slugEnabled, prompt: "" };

  fs.writeFileSync(path.join(root, "mede.config.json"), JSON.stringify(config), "utf-8");

  const docsRoot = path.join(root, config.docsRoot);
  fs.mkdirSync(docsRoot, { recursive: true });
  fs.writeFileSync(path.join(docsRoot, config.fileNames.readme), "# Projeto\n", "utf-8");
  fs.writeFileSync(
    path.join(docsRoot, config.fileNames.currentState),
    "# Situação Atual\n",
    "utf-8",
  );

  previousCwd = process.cwd();
  process.chdir(root);

  logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
}

afterEach(() => {
  logSpy.mockRestore();
  process.chdir(previousCwd);
  try {
    fs.rmSync(root, { recursive: true, force: true });
  } catch {
    // Leave temp dir for OS cleanup on Windows lock
  }
});

function listAtaFiles(): string[] {
  const ataDir = path.join(root, config.docsRoot, config.directories.meetingMinutes);
  if (!fs.existsSync(ataDir)) return [];
  return fs.readdirSync(ataDir);
}

describe("Slug e2e — shortDescriptionSlug.enabled = true", () => {
  beforeEach(() => {
    generateText.mockReset();
    setupProject(true);
    // call 1: EXTRACT_BACKLOG (JSON mode, no changes); call 2: ATA diff content; call 3: slug
    generateText
      .mockResolvedValueOnce({ rawText: '{"statusChanges":[],"newItems":[]}' })
      .mockResolvedValueOnce({ rawText: ATA_DIFF })
      .mockResolvedValue({ rawText: SLUG_RESPONSE });
  });

  it("writes the ATA file with the slug appended to the filename", async () => {
    await new CycleCommand().executeCycle("", []);   // call 1: EXTRACT_BACKLOG
    await new CycleCommand().executeApprove(false);  // approve phase 1, call 2: ATA → REFINING
    new ChangesCommand().executeApply(true);          // apply ATA chunks (call 3: slug)

    const files = listAtaFiles();
    expect(files.length).toBeGreaterThan(0);

    const ataFile = files.find((f) => f.startsWith(config.prefixes.meetingMinutes + "-"));
    expect(ataFile).toBeDefined();
    expect(ataFile).toMatch(new RegExp(`^ata-\\d{8}-001-${SLUG_RESPONSE}\\.md$`));
  });

  it("does NOT write a provisional file without the slug", async () => {
    await new CycleCommand().executeCycle("", []);
    await new CycleCommand().executeApprove(false);
    new ChangesCommand().executeApply(true);

    const files = listAtaFiles();
    // All ATA files must contain the slug — no bare provisional name
    const provisionalFiles = files.filter((f) =>
      /^ata-\d{8}-\d{3}\.md$/.test(f),
    );
    expect(provisionalFiles).toHaveLength(0);
  });

  it("makes exactly 3 LLM calls: one for EXTRACT_BACKLOG, one for ATA content, one for slug", async () => {
    await new CycleCommand().executeCycle("", []);   // call 1: EXTRACT_BACKLOG

    expect(generateText).toHaveBeenCalledTimes(1);

    await new CycleCommand().executeApprove(false);  // call 2: ATA content
    new ChangesCommand().executeApply(true);          // call 3: slug generation

    expect(generateText).toHaveBeenCalledTimes(3);
  });
});

describe("Slug e2e — shortDescriptionSlug.enabled = false", () => {
  beforeEach(() => {
    generateText.mockReset();
    setupProject(false);
    // call 1: EXTRACT_BACKLOG (JSON mode); call 2: ATA content (no slug call)
    generateText
      .mockResolvedValueOnce({ rawText: '{"statusChanges":[],"newItems":[]}' })
      .mockResolvedValue({ rawText: ATA_DIFF });
  });

  it("writes the ATA file with the provisional filename (no slug)", async () => {
    await new CycleCommand().executeCycle("", []);   // call 1: EXTRACT_BACKLOG
    await new CycleCommand().executeApprove(false);  // approve phase 1, call 2: ATA → REFINING
    new ChangesCommand().executeApply(true);          // apply ATA chunks (no slug)

    const files = listAtaFiles();
    expect(files.length).toBeGreaterThan(0);

    const ataFile = files.find((f) => f.startsWith(config.prefixes.meetingMinutes + "-"));
    expect(ataFile).toBeDefined();
    // Exactly: ata-YYYYMMDD-001.md with no extra suffix
    expect(ataFile).toMatch(/^ata-\d{8}-001\.md$/);
  });

  it("makes exactly 2 LLM calls: one for EXTRACT_BACKLOG, one for ATA content", async () => {
    await new CycleCommand().executeCycle("", []);   // call 1: EXTRACT_BACKLOG
    await new CycleCommand().executeApprove(false);  // call 2: ATA content

    expect(generateText).toHaveBeenCalledTimes(2);
  });
});
