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
import { ChangeChunkRepository } from "./change-chunk-repository.js";
import { ProjectEntity } from "../../domain/entities/project-entity.js";
import { CycleEntity } from "../../domain/entities/cycle-entity.js";
import { PhaseEntity } from "../../domain/entities/phase-entity.js";
import { CycleArtifactEntity } from "../../domain/entities/cycle-artifact-entity.js";
import { ChangeSetEntity } from "../../domain/entities/change-set-entity.js";
import { ChangeChunkEntity } from "../../domain/entities/change-chunk-entity.js";

// ---------------------------------------------------------------------------
// Integration tests for ChangeChunkRepository against a real SQLite database.
// A ChangeChunk sits at the bottom of the FK chain
// (Project -> Cycle -> Phase / CycleArtifact -> ChangeSet -> ChangeChunk).
// ---------------------------------------------------------------------------

let uow: UnitOfWork;
let root: string;
let chunks: ChangeChunkRepository;
let phaseId: number;
let changeSetId: number;

function freshDatabase(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-chunk-repo-"));
  const factory = new BetterSqliteConnectionFactory({ inMemory: true });
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
  artifact.canonicalType = "ATA";
  artifact.artifactPath = "docs/atas/min-001.md";
  artifact.startedAt = now;
  artifact.updatedAt = now;
  const cycleArtifactId = new CycleArtifactRepository(uow).insert(artifact).id;

  const changeSet = new ChangeSetEntity();
  changeSet.phaseId = phaseId;
  changeSet.cycleArtifactId = cycleArtifactId;
  changeSet.fileName = "docs/atas/min-001.md";
  changeSet.completed = false;
  changeSet.currentChangeChunkIndex = 1;
  changeSet.changeChunkCount = 0;
  changeSet.currentOffset = 0;
  changeSet.startedAt = now;
  changeSet.updatedAt = now;
  changeSetId = new ChangeSetRepository(uow).insert(changeSet).id;

  chunks = new ChangeChunkRepository(uow);
}

function insertChunk(index: number, status = "AWAITING_APPROVAL"): ChangeChunkEntity {
  const chunk = new ChangeChunkEntity();
  chunk.phaseId = phaseId;
  chunk.changeSetId = changeSetId;
  chunk.index = index;
  chunk.status = status;
  chunk.blockLocation = `@@ -${index},1 +${index},2 @@`;
  chunk.changeContent = `+linha ${index}`;
  chunk.startedAt = new Date().toISOString();
  chunk.updatedAt = chunk.startedAt;
  return chunks.insert(chunk);
}

beforeEach(() => {
  freshDatabase();
  buildChain();
});

afterEach(() => {
  uow[Symbol.dispose]();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("ChangeChunkRepository CRUD", () => {
  it("insert returns the entity with a generated id", () => {
    const inserted = insertChunk(1);

    expect(inserted.id).toBeGreaterThan(0);
    expect(inserted.index).toBe(1);
  });

  it("getById returns the persisted chunk and null when missing", () => {
    const inserted = insertChunk(1);

    const found = chunks.getById(inserted.id);
    expect(found).not.toBeNull();
    expect(found!.status).toBe("AWAITING_APPROVAL");
    expect(found!.blockLocation).toBe("@@ -1,1 +1,2 @@");

    expect(chunks.getById(999999)).toBeNull();
  });

  it("getByIndex returns the chunk at a given index within the change-set", () => {
    insertChunk(1);
    const second = insertChunk(2);

    const found = chunks.getByIndex(changeSetId, 2);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(second.id);

    expect(chunks.getByIndex(changeSetId, 99)).toBeNull();
  });

  it("list and listFromPhase return all chunks", () => {
    insertChunk(1);
    insertChunk(2);

    expect(chunks.list(changeSetId)).toHaveLength(2);
    expect(chunks.listFromPhase(phaseId)).toHaveLength(2);
  });
});

// Pins the `return result.changes > 0` fix for the chunk approval flow.
describe("ChangeChunkRepository approval flow", () => {
  it("approve sets status to APPROVED and returns true; false for a missing id", () => {
    const chunk = insertChunk(1);

    expect(chunks.approve(chunk.id)).toBe(true);
    expect(chunks.getById(chunk.id)!.status).toBe("APPROVED");

    expect(chunks.approve(999999)).toBe(false);
  });

  it("reject sets status to REJECTED and returns true; false for a missing id", () => {
    const chunk = insertChunk(1);

    expect(chunks.reject(chunk.id)).toBe(true);
    expect(chunks.getById(chunk.id)!.status).toBe("REJECTED");

    expect(chunks.reject(999999)).toBe(false);
  });

  it("deleteFromChangeSet and deleteFromPhase remove the chunks", () => {
    insertChunk(1);
    expect(chunks.deleteFromChangeSet(changeSetId)).toBe(true);
    expect(chunks.list(changeSetId)).toHaveLength(0);

    insertChunk(2);
    expect(chunks.deleteFromPhase(phaseId)).toBe(true);
    expect(chunks.listFromPhase(phaseId)).toHaveLength(0);
  });
});

describe("ChangeChunkRepository.getCurrent", () => {
  it("returns the chunk awaiting approval in the change-set", () => {
    const awaiting = insertChunk(1, "AWAITING_APPROVAL");

    const current = chunks.getCurrent(changeSetId);
    expect(current).not.toBeNull();
    expect(current!.id).toBe(awaiting.id);
  });

  it("ignores chunks already approved or rejected", () => {
    insertChunk(1, "APPROVED");
    insertChunk(2, "REJECTED");

    expect(chunks.getCurrent(changeSetId)).toBeNull();
  });

  it("stops returning a chunk once it has been approved", () => {
    const chunk = insertChunk(1, "AWAITING_APPROVAL");
    expect(chunks.getCurrent(changeSetId)).not.toBeNull();

    chunks.approve(chunk.id);
    expect(chunks.getCurrent(changeSetId)).toBeNull();
  });
});
