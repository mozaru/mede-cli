import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { ProjectRepository } from "./project-repository.js";
import { CycleRepository } from "./cycle-repository.js";
import { PhaseRepository } from "./phase-repository.js";
import { ProjectEntity } from "../entities/project-entity.js";
import { CycleEntity } from "../entities/cycle-entity.js";
import { PhaseEntity } from "../entities/phase-entity.js";

// ---------------------------------------------------------------------------
// Integration tests for PhaseRepository against a real SQLite database.
// A Phase belongs to a Cycle (Project -> Cycle -> Phase), so the chain is
// provisioned before each test using the production migration/schema.
// ---------------------------------------------------------------------------

let uow: UnitOfWork;
let root: string;
let phases: PhaseRepository;
let cycleId: number;

function freshDatabase(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-phase-repo-"));
  const factory = new BetterSqliteConnectionFactory({ projectRootPath: root });
  uow = new UnitOfWork(factory);
  uow.ensureConnection();
}

function buildChain(): void {
  const now = new Date().toISOString();

  const project = new ProjectEntity();
  project.name = "demo";
  project.rootProjectPath = root;
  project.docsRootPath = "docs";
  project.documentationLanguage = "pt-BR";
  project.createdAt = now;
  project.updatedAt = now;
  const projectId = new ProjectRepository(uow).insert(project).id;

  const cycle = new CycleEntity();
  cycle.projectId = projectId;
  cycle.status = "OPEN";
  cycle.currentPhaseIndex = 0;
  cycle.phaseCount = 11;
  cycle.autoMode = "NONE";
  cycle.startedAt = now;
  cycle.finishedAt = "";
  cycleId = new CycleRepository(uow).insert(cycle).id;

  phases = new PhaseRepository(uow);
}

function newPhase(index: number, name = "GENERATE_MEETING"): PhaseEntity {
  const phase = new PhaseEntity();
  phase.cycleId = cycleId;
  phase.name = name;
  phase.index = index;
  phase.inputFiles = [];
  phase.outputFile = `docs/atas/min-00${index}.md`;
  phase.docTypeOutput = "ATA";
  phase.promptName = "meeting";
  phase.status = "REFINING";
  phase.proposalState = "NOT_GENERATED";
  phase.startedAt = new Date().toISOString();
  phase.finishedAt = "";
  return phase;
}

beforeEach(() => {
  freshDatabase();
  buildChain();
});

afterEach(() => {
  uow[Symbol.dispose]();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("PhaseRepository CRUD", () => {
  it("insert returns the entity with a generated id", () => {
    const inserted = phases.insert(newPhase(1));

    expect(inserted.id).toBeGreaterThan(0);
    expect(inserted.index).toBe(1);
  });

  it("getById returns the persisted phase and null when missing", () => {
    const inserted = phases.insert(newPhase(1));

    const found = phases.getById(inserted.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("GENERATE_MEETING");
    expect(found!.docTypeOutput).toBe("ATA");

    expect(phases.getById(999999)).toBeNull();
  });

  it("getByIndex returns the phase at a given index within the cycle", () => {
    phases.insert(newPhase(1));
    const second = phases.insert(newPhase(2, "GENERATE_ADR"));

    const found = phases.getByIndex(cycleId, 2);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(second.id);
    expect(found!.name).toBe("GENERATE_ADR");

    expect(phases.getByIndex(cycleId, 99)).toBeNull();
  });

  it("list returns every phase of the cycle", () => {
    phases.insert(newPhase(1));
    phases.insert(newPhase(2));

    expect(phases.list(cycleId)).toHaveLength(2);
  });

  it("deleteFromCycle removes all phases of the cycle", () => {
    phases.insert(newPhase(1));
    phases.insert(newPhase(2));

    expect(phases.deleteFromCycle(cycleId)).toBe(true);
    expect(phases.list(cycleId)).toHaveLength(0);
    expect(phases.deleteFromCycle(cycleId)).toBe(false);
  });
});

// Each transition method updates status/proposalState and now reports whether a
// row actually changed (the `return result.changes > 0` fix).
describe("PhaseRepository state transitions", () => {
  const transitions: Array<{
    method: "empty" | "nonEmpty" | "approve" | "reject" | "skip" | "awaitingApproval" | "reset";
    status: string;
    proposalState?: string;
  }> = [
    { method: "empty", status: "AWAITING_APPROVAL", proposalState: "EMPTY" },
    { method: "nonEmpty", status: "REFINING", proposalState: "NON_EMPTY" },
    { method: "approve", status: "APPROVED" },
    { method: "reject", status: "REJECTED" },
    { method: "skip", status: "SKIPPED" },
    { method: "awaitingApproval", status: "AWAITING_APPROVAL" },
    { method: "reset", status: "REFINING", proposalState: "NOT_GENERATED" },
  ];

  it.each(transitions)(
    "$method sets status to $status and returns true",
    ({ method, status, proposalState }) => {
      const phase = phases.insert(newPhase(1));

      expect(phases[method](phase.id)).toBe(true);

      const updated = phases.getById(phase.id)!;
      expect(updated.status).toBe(status);
      if (proposalState !== undefined) {
        expect(updated.proposalState).toBe(proposalState);
      }
    },
  );

  it.each(transitions)("$method returns false for a missing id", ({ method }) => {
    expect(phases[method](999999)).toBe(false);
  });
});
