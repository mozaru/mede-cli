import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { ProjectRepository } from "./project-repository.js";
import { CycleRepository } from "./cycle-repository.js";
import { PhaseRepository } from "./phase-repository.js";
import { CycleArtifactRepository } from "./cycle-artifact-repository.js";
import { ChangeSetRepository } from "./change-set-repository.js";
import { ProjectEntity } from "../entities/project-entity.js";
import { CycleEntity } from "../entities/cycle-entity.js";
import { PhaseEntity } from "../entities/phase-entity.js";
import { CycleArtifactEntity } from "../entities/cycle-artifact-entity.js";
import { ChangeSetEntity } from "../entities/change-set-entity.js";

// ---------------------------------------------------------------------------
// Integration tests for ChangeSetRepository against a real SQLite database.
// A ChangeSet sits at the bottom of a FK chain (Project -> Cycle -> Phase /
// CycleArtifact), so each test builds the full chain before exercising the repo.
// ---------------------------------------------------------------------------

let uow: UnitOfWork;
let root: string;
let changeSets: ChangeSetRepository;
let phaseId: number;
let cycleArtifactId: number;

function freshDatabase(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-changeset-repo-"));
  const factory = new BetterSqliteConnectionFactory({ projectRootPath: root });
  uow = new UnitOfWork(factory);
  uow.ensureConnection();
}

// Provisions Project -> Cycle -> Phase + CycleArtifact and returns the repo.
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
  const cycleId = new CycleRepository(uow).insert(cycle).id;

  const phase = new PhaseEntity();
  phase.cycleId = cycleId;
  phase.name = "GENERATE_MEETING";
  phase.index = 1;
  phase.inputFiles = [];
  phase.outputFile = "docs/atas/min-001.md";
  phase.docTypeOutput = "ATA";
  phase.promptName = "meeting";
  phase.status = "REFINING";
  phase.proposalState = "NOT_GENERATED";
  phase.startedAt = now;
  phase.finishedAt = "";
  phaseId = new PhaseRepository(uow).insert(phase).id;

  const artifact = new CycleArtifactEntity();
  artifact.cycleId = cycleId;
  artifact.backupContent = "";
  artifact.currentContent = "";
  artifact.canonicalName = "";
  artifact.canonicalType = "ATA";
  artifact.artifactPath = "docs/atas/min-001.md";
  artifact.startedAt = now;
  artifact.updatedAt = now;
  cycleArtifactId = new CycleArtifactRepository(uow).insert(artifact).id;

  changeSets = new ChangeSetRepository(uow);
}

function newChangeSet(chunkCount: number): ChangeSetEntity {
  const changeSet = new ChangeSetEntity();
  changeSet.phaseId = phaseId;
  changeSet.cycleArtifactId = cycleArtifactId;
  changeSet.fileName = "docs/atas/min-001.md";
  changeSet.completed = false;
  changeSet.currentChangeChunkIndex = 1;
  changeSet.changeChunkCount = chunkCount;
  changeSet.currentOffset = 0;
  changeSet.startedAt = new Date().toISOString();
  changeSet.updatedAt = changeSet.startedAt;
  return changeSet;
}

beforeEach(() => {
  freshDatabase();
  buildChain();
});

afterEach(() => {
  uow[Symbol.dispose]();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("ChangeSetRepository CRUD", () => {
  it("insert returns the entity with a generated id", () => {
    const inserted = changeSets.insert(newChangeSet(3));

    expect(inserted.id).toBeGreaterThan(0);
    expect(inserted.changeChunkCount).toBe(3);
  });

  it("getById returns the persisted change-set and null when missing", () => {
    const inserted = changeSets.insert(newChangeSet(2));

    const found = changeSets.getById(inserted.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(inserted.id);
    expect(found!.completed).toBeFalsy();

    expect(changeSets.getById(999999)).toBeNull();
  });

  it("getCurrent returns the open (not completed) change-set of a phase", () => {
    const inserted = changeSets.insert(newChangeSet(1));

    const current = changeSets.getCurrent(phaseId);
    expect(current).not.toBeNull();
    expect(current!.id).toBe(inserted.id);
  });
});

// Pins the fix that replaced hardcoded `return true` with `return result.changes > 0`.
describe("ChangeSetRepository updates report real row changes", () => {
  it("updateComplete marks completed and excludes it from getCurrent", () => {
    const inserted = changeSets.insert(newChangeSet(1));

    expect(changeSets.updateComplete(inserted.id)).toBe(true);
    expect(changeSets.getById(inserted.id)!.completed).toBeTruthy();
    expect(changeSets.getCurrent(phaseId)).toBeNull();

    expect(changeSets.updateComplete(999999)).toBe(false);
  });

  it("updateChunkIndex persists index/offset and returns true; false for a missing id", () => {
    const inserted = changeSets.insert(newChangeSet(3));

    expect(changeSets.updateChunkIndex(inserted.id, 2, 5)).toBe(true);
    const updated = changeSets.getById(inserted.id)!;
    expect(updated.currentChangeChunkIndex).toBe(2);
    expect(updated.currentOffset).toBe(5);

    expect(changeSets.updateChunkIndex(999999, 2, 5)).toBe(false);
  });

  it("deleteFromPhase removes the change-sets of the phase", () => {
    changeSets.insert(newChangeSet(1));
    changeSets.insert(newChangeSet(2));

    expect(changeSets.deleteFromPhase(phaseId)).toBe(true);
    expect(changeSets.list(phaseId)).toHaveLength(0);
    expect(changeSets.deleteFromPhase(phaseId)).toBe(false);
  });
});
