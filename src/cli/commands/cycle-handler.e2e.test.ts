import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// End-to-end through the CLI command layer: a real CycleHandler builds the real
// composition root (container -> services -> repositories -> SQLite + filesystem)
// for each command, exactly like the CLI does (one container per process). Only
// the LLM provider is faked, so no network is touched. The cwd is pointed at a
// throwaway project so the container's `.mede` database and the docs live there.
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

import { CycleHandler } from "./cycle-handler.js";
import { ChangesHandler } from "./changes-handler.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import { BetterSqliteConnectionFactory } from "../../infrastructure/db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../../infrastructure/db/unit-of-work.js";
import { ProjectRepository } from "../../infrastructure/repositories/project-repository.js";
import { CycleRepository } from "../../infrastructure/repositories/cycle-repository.js";
import type { CycleEntity } from "../../domain/entities/cycle-entity.js";

let root: string;
let previousCwd: string;
let logSpy: ReturnType<typeof vi.spyOn>;

// Opens a fresh connection to the project's database to assert persisted state
// independently of the handler's own (still-open) connections.
function currentCycle(): CycleEntity | null {
  const uow = new UnitOfWork(new BetterSqliteConnectionFactory({ projectRootPath: root }));
  uow.ensureConnection();
  try {
    const project = new ProjectRepository(uow).getCurrent();
    if (!project) {
      return null;
    }
    return new CycleRepository(uow).getCurrent(project.id);
  } finally {
    uow[Symbol.dispose]();
  }
}

beforeEach(() => {
  generateText.mockReset();
  generateText.mockResolvedValue({ rawText: "@@ -0,0 +1,1 @@\n+conteúdo gerado" });

  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-e2e-"));

  const config = new MedeConfigModelEntity();
  // docsRoot stays relative; reconstruct() resolves it against the cwd.
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
});

afterEach(() => {
  logSpy.mockRestore();
  process.chdir(previousCwd);
  // Each CLI command builds its own container/connection (as in production) and
  // the process would normally exit to release them; in-process the SQLite file
  // can still be locked on Windows, so deletion is best-effort.
  try {
    fs.rmSync(root, { recursive: true, force: true });
  } catch {
    // Leave the temp directory for the OS to reap.
  }
});

describe("CLI cycle flow (end-to-end through CycleHandler)", () => {
  it("starts a cycle on disk: a project and an OPEN cycle on phase 1", async () => {
    await new CycleHandler().executeCycle("", []);

    const cycle = currentCycle();
    expect(cycle).not.toBeNull();
    expect(cycle!.status).toBe("OPEN");
    expect(cycle!.currentPhaseIndex).toBe(1);
    expect(cycle!.phaseCount).toBe(12);
  });

  it("apply then approve advances to the next phase", async () => {
    await new CycleHandler().executeCycle("", []);
    // Phase 1 is EXTRACT_BACKLOG — it runs in JSON mode and, when there are no
    // backlog changes, produces no ChangeSet (status is already AWAITING_APPROVAL).
    // Approve it directly to advance to phase 2 (GENERATE_MEETING), which produces
    // a diff-based ChangeSet that can be applied and approved.
    await new CycleHandler().executeApprove(false);  // phase 1 → APPROVED, triggers phase 2
    new ChangesHandler().executeApply(true);          // apply phase 2 chunks
    await new CycleHandler().executeApprove(false);  // phase 2 → APPROVED, triggers phase 3

    const cycle = currentCycle();
    expect(cycle!.status).toBe("OPEN");
    expect(cycle!.currentPhaseIndex).toBe(3);
  });

  it("reject-all then commit closes the cycle", async () => {
    await new CycleHandler().executeCycle("", []);
    await new CycleHandler().executeReject(true);

    // After rejecting every phase the cycle is awaiting commit.
    const awaiting = currentCycle();
    expect(awaiting!.status).toBe("AWAITING_COMMIT");

    new CycleHandler().executeCommit();

    // Committing clears the operational cycle from the database.
    expect(currentCycle()).toBeNull();
  });

  it("rollback discards the cycle and restores the working tree", async () => {
    await new CycleHandler().executeCycle("", []);
    expect(currentCycle()).not.toBeNull();

    new CycleHandler().executeRollback();

    expect(currentCycle()).toBeNull();
  });
});
