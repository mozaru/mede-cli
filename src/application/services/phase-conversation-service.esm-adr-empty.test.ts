// Verifies that applyAll() does not create a HISTORICAL artifact file on disk
// when the LLM produced no changes for a document that did not previously exist.
// This covers the ESM/ADR case: if the ATA warrants no architectural decisions
// or maintenance specs, the corresponding file must not be created at all.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { BetterSqliteConnectionFactory } from "../../infrastructure/db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../../infrastructure/db/unit-of-work.js";
import { ProjectRepository } from "../../infrastructure/repositories/project-repository.js";
import { CycleRepository } from "../../infrastructure/repositories/cycle-repository.js";
import { CycleArtifactRepository } from "../../infrastructure/repositories/cycle-artifact-repository.js";
import { ChangeSetRepository } from "../../infrastructure/repositories/change-set-repository.js";
import { ChangeChunkRepository } from "../../infrastructure/repositories/change-chunk-repository.js";
import { PhaseAttachmentRepository } from "../../infrastructure/repositories/phase-attachment-repository.js";
import { PhaseConversationRepository } from "../../infrastructure/repositories/phase-conversation-repository.js";
import { PhaseRepository } from "../../infrastructure/repositories/phase-repository.js";
import { BacklogRepository } from "../../infrastructure/repositories/backlog-repository.js";

import { PhaseConversationService } from "./phase-conversation-service.js";

import { ProjectEntity } from "../../domain/entities/project-entity.js";
import { CycleEntity } from "../../domain/entities/cycle-entity.js";
import { CycleArtifactEntity } from "../../domain/entities/cycle-artifact-entity.js";
import { ChangeSetEntity } from "../../domain/entities/change-set-entity.js";
import { ChangeChunkEntity } from "../../domain/entities/change-chunk-entity.js";
import { PhaseEntity } from "../../domain/entities/phase-entity.js";

let uow: UnitOfWork;
let root: string;
let service: PhaseConversationService;
let projectId: number;
let cycleId: number;
let artifacts: CycleArtifactRepository;
let changeSets: ChangeSetRepository;
let changeChunks: ChangeChunkRepository;
let phases: PhaseRepository;

function setup(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-esm-empty-"));

  uow = new UnitOfWork(new BetterSqliteConnectionFactory({ inMemory: true }));
  uow.ensureConnection();

  const projects = new ProjectRepository(uow);
  const cycles = new CycleRepository(uow);
  const conversations = new PhaseConversationRepository(uow);
  const attachments = new PhaseAttachmentRepository(uow);
  artifacts = new CycleArtifactRepository(uow);
  changeSets = new ChangeSetRepository(uow);
  changeChunks = new ChangeChunkRepository(uow);
  phases = new PhaseRepository(uow);
  const backlog = new BacklogRepository(uow);

  service = new PhaseConversationService(
    conversations,
    attachments,
    artifacts,
    changeSets,
    changeChunks,
    phases,
    backlog,
  );

  // Seed the minimum required parent records
  const now = new Date().toISOString();

  const projectEntity = new ProjectEntity();
  projectEntity.name = "test-project";
  projectEntity.rootProjectPath = root;
  projectEntity.docsRootPath = root;
  projectEntity.documentationLanguage = "pt-BR";
  projectEntity.createdAt = now;
  projectEntity.updatedAt = now;
  projectId = projects.insert(projectEntity).id;

  const cycleEntity = new CycleEntity();
  cycleEntity.projectId = projectId;
  cycleEntity.status = "OPEN";
  cycleEntity.currentPhaseIndex = 1;
  cycleEntity.phaseCount = 11;
  cycleEntity.autoMode = "NONE";
  cycleEntity.startedAt = now;
  cycleEntity.finishedAt = "";
  cycleId = cycles.insert(cycleEntity).id;
}

function makePhase(outputFile: string, docTypeOutput = "HISTORICAL"): PhaseEntity {
  const p = new PhaseEntity();
  p.cycleId = cycleId;
  p.name = "GENERATE_ESM";
  p.index = 3;
  p.inputFiles = [];
  p.outputFile = outputFile;
  p.docTypeOutput = docTypeOutput;
  p.promptName = "systemMaintenanceSpecifications";
  p.status = "REFINING";
  p.proposalState = "NOT_GENERATED";
  p.startedAt = new Date().toISOString();
  p.finishedAt = "";
  return phases.insert(p);
}

function makeArtifact(
  artifactPath: string,
  canonicalType: string,
  backupContent = "",
  currentContent = "",
): CycleArtifactEntity {
  const a = new CycleArtifactEntity();
  a.cycleId = cycleId;
  a.canonicalName = "systemMaintenanceSpecifications";
  a.canonicalType = canonicalType;
  a.artifactPath = artifactPath;
  a.backupContent = backupContent;
  a.currentContent = currentContent;
  a.startedAt = new Date().toISOString();
  a.updatedAt = new Date().toISOString();
  return artifacts.insert(a);
}

function makeChangeSet(
  phaseId: number,
  artifactId: number,
  artifactPath: string,
  chunkCount: number,
): ChangeSetEntity {
  const cs = new ChangeSetEntity();
  cs.phaseId = phaseId;
  cs.cycleArtifactId = artifactId;
  cs.fileName = artifactPath;
  cs.completed = false;
  cs.currentChangeChunkIndex = 1;
  cs.changeChunkCount = chunkCount;
  cs.currentOffset = 0;
  cs.startedAt = new Date().toISOString();
  cs.updatedAt = new Date().toISOString();
  return changeSets.insert(cs);
}

beforeEach(setup);

afterEach(() => {
  uow[Symbol.dispose]();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("PhaseConversationService.applyAll — HISTORICAL artifacts with empty content", () => {
  it("does NOT create the ESM file when the LLM produced an empty diff (0 chunks)", () => {
    const esmPath = path.join(root, "esm-20260610-001.md");
    const phase = makePhase(esmPath);
    const artifact = makeArtifact(esmPath, "HISTORICAL");
    const changeSet = makeChangeSet(phase.id, artifact.id, esmPath, 0);

    service.applyAll(phase, changeSet);

    expect(fs.existsSync(esmPath)).toBe(false);
  });

  it("does NOT create the ADR file when the LLM produced an empty diff (0 chunks)", () => {
    const adrPath = path.join(root, "adr-20260610-001.md");
    const phase = makePhase(adrPath);
    const artifact = makeArtifact(adrPath, "HISTORICAL");
    const changeSet = makeChangeSet(phase.id, artifact.id, adrPath, 0);

    service.applyAll(phase, changeSet);

    expect(fs.existsSync(adrPath)).toBe(false);
  });

  it("DOES write a HISTORICAL file when the artifact has content to apply", () => {
    const esmPath = path.join(root, "esm-20260610-001.md");
    const phase = makePhase(esmPath);
    const content = "# ESM\n\n## Manutenções\n\n- Atualização do módulo X\n";
    const artifact = makeArtifact(esmPath, "HISTORICAL", "", content);
    const changeSet = makeChangeSet(phase.id, artifact.id, esmPath, 0);

    service.applyAll(phase, changeSet);

    expect(fs.existsSync(esmPath)).toBe(true);
    expect(fs.readFileSync(esmPath, "utf-8")).toContain("Manutenções");
  });

  it("DOES write a LIVE artifact even when the applied content is empty", () => {
    const rfPath = path.join(root, "requisitos-funcionais.md");
    fs.writeFileSync(rfPath, "# RF\n\n- RF-001: ...\n", "utf-8");

    const phase = makePhase(rfPath, "LIVE");
    const artifact = makeArtifact(rfPath, "LIVE", "# RF\n\n- RF-001: ...\n", "");
    const changeSet = makeChangeSet(phase.id, artifact.id, rfPath, 0);

    service.applyAll(phase, changeSet);

    // LIVE artifacts are always written (even empty) to keep the document in sync
    expect(fs.existsSync(rfPath)).toBe(true);
  });

  it("does NOT create the file when the single chunk was discarded before applyAll", () => {
    const esmPath = path.join(root, "esm-20260610-001.md");
    const phase = makePhase(esmPath);
    const artifact = makeArtifact(esmPath, "HISTORICAL");
    const changeSet = makeChangeSet(phase.id, artifact.id, esmPath, 1);

    const chunk = new ChangeChunkEntity();
    chunk.phaseId = phase.id;
    chunk.changeSetId = changeSet.id;
    chunk.index = 1;
    chunk.status = "DISCARDED";
    chunk.blockLocation = "@@ -0,0 +1,3 @@";
    chunk.changeContent = "+# ESM\n";
    chunk.startedAt = new Date().toISOString();
    chunk.updatedAt = new Date().toISOString();
    changeChunks.insert(chunk);

    service.applyAll(phase, changeSet);

    expect(fs.existsSync(esmPath)).toBe(false);
  });
});
