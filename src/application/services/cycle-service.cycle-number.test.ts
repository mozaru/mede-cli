// Verifies that begin() derives the cycle number from the count of pre-existing
// ATA files on disk and formats historical artifact filenames as
// "prefix-YYYYMMDD-NNN.md" per CLAUDE.md convention.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { BetterSqliteConnectionFactory } from "../../infrastructure/db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../../infrastructure/db/unit-of-work.js";
import { ProjectRepository } from "../../infrastructure/repositories/project-repository.js";
import { ProjectConfigRepository } from "../../infrastructure/repositories/project-config-repository.js";
import { CycleRepository } from "../../infrastructure/repositories/cycle-repository.js";
import { PhaseRepository } from "../../infrastructure/repositories/phase-repository.js";
import { CycleArtifactRepository } from "../../infrastructure/repositories/cycle-artifact-repository.js";
import { ChangeSetRepository } from "../../infrastructure/repositories/change-set-repository.js";
import { ChangeChunkRepository } from "../../infrastructure/repositories/change-chunk-repository.js";
import { PhaseAttachmentRepository } from "../../infrastructure/repositories/phase-attachment-repository.js";
import { PhaseConversationRepository } from "../../infrastructure/repositories/phase-conversation-repository.js";
import { BacklogRepository } from "../../infrastructure/repositories/backlog-repository.js";
import { BacklogInterventionCountersRepository } from "../../infrastructure/repositories/backlog-intervention-counters-repository.js";

import { ProjectReconstructionService } from "./project-reconstruction-service.js";
import { StatusService } from "./status-service.js";
import { PhaseConversationService } from "./phase-conversation-service.js";
import { CycleService } from "./cycle-service.js";

import { ProjectEntity } from "../../domain/entities/project-entity.js";
import { ProjectConfigEntity } from "../../domain/entities/project-config-entity.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";

let uow: UnitOfWork;
let root: string;
let docsRoot: string;
let service: CycleService;
let phases: PhaseRepository;
let project: ProjectEntity;
let config: MedeConfigModelEntity;

function setup(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-cyclenum-"));
  docsRoot = path.join(root, "docs");
  fs.mkdirSync(docsRoot, { recursive: true });

  config = new MedeConfigModelEntity();
  config.docsRoot = docsRoot;

  fs.mkdirSync(path.join(docsRoot, config.directories.meetingMinutes), { recursive: true });
  fs.mkdirSync(path.join(docsRoot, config.directories.architecturalDecisions), { recursive: true });
  fs.mkdirSync(path.join(docsRoot, config.directories.systemMaintenanceSpecifications), {
    recursive: true,
  });
  fs.mkdirSync(path.join(docsRoot, config.directories.deliveryLog), { recursive: true });
  fs.writeFileSync(path.join(docsRoot, config.fileNames.readme), "# Projeto\n", "utf-8");

  uow = new UnitOfWork(new BetterSqliteConnectionFactory({ inMemory: true }));
  uow.ensureConnection();

  const projects = new ProjectRepository(uow);
  const projectConfigs = new ProjectConfigRepository(uow);
  const cycleRepo = new CycleRepository(uow);
  phases = new PhaseRepository(uow);
  const artifacts = new CycleArtifactRepository(uow);
  const changeSets = new ChangeSetRepository(uow);
  const changeChunks = new ChangeChunkRepository(uow);
  const phaseAttachments = new PhaseAttachmentRepository(uow);
  const conversations = new PhaseConversationRepository(uow);
  const backlog = new BacklogRepository(uow);
  const backlogCounters = new BacklogInterventionCountersRepository(uow);

  const now = new Date().toISOString();

  const projectEntity = new ProjectEntity();
  projectEntity.name = "demo";
  projectEntity.rootProjectPath = root;
  projectEntity.docsRootPath = docsRoot;
  projectEntity.documentationLanguage = "pt-BR";
  projectEntity.createdAt = now;
  projectEntity.updatedAt = now;
  project = projects.insert(projectEntity);

  const configEntity = new ProjectConfigEntity();
  configEntity.projectId = project.id;
  configEntity.medeConfigPath = path.join(root, "mede.config.json");
  configEntity.hashContent = "";
  configEntity.content = JSON.stringify(config);
  configEntity.createdAt = now;
  configEntity.updatedAt = now;
  projectConfigs.insert(configEntity);

  const reconstruction = new ProjectReconstructionService(
    projectConfigs,
    projects,
    backlog,
    backlogCounters,
  );
  const status = new StatusService(projects, cycleRepo, changeSets, artifacts, phases);
  const phaseConversation = new PhaseConversationService(
    conversations,
    phaseAttachments,
    artifacts,
    changeSets,
    changeChunks,
    phases,
    backlog,
  );

  service = new CycleService(
    uow,
    reconstruction,
    phaseConversation,
    status,
    projects,
    projectConfigs,
    cycleRepo,
    phases,
    artifacts,
    changeSets,
    changeChunks,
    phaseAttachments,
    conversations,
  );
}

function writeAta(filename: string): void {
  fs.writeFileSync(
    path.join(docsRoot, config.directories.meetingMinutes, filename),
    "# Ata\n",
    "utf-8",
  );
}

beforeEach(setup);

afterEach(() => {
  uow[Symbol.dispose]();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("CycleService.begin — cycle number derivation and filename convention", () => {
  it("starts at cycle 001 when the ATAs directory is empty", () => {
    const { cycle } = service.begin(project.id);
    const ataPhase = phases.list(cycle.id).find((p) => p.name === "GENERATE_MEETING");
    expect(ataPhase?.outputFile).toMatch(/ata-\d{8}-001\.md$/);
  });

  it("uses YYYYMMDD (no dashes) format for the date part of filenames", () => {
    const { cycle } = service.begin(project.id);
    const ataPhase = phases.list(cycle.id).find((p) => p.name === "GENERATE_MEETING");
    expect(ataPhase?.outputFile).toMatch(/ata-\d{8}-\d{3}\.md$/);
    expect(ataPhase?.outputFile).not.toMatch(/ata-\d{4}-\d{2}-\d{2}/);
  });

  it("derives cycle 002 when one ATA file already exists", () => {
    writeAta("ata-20260101-001.md");
    const { cycle } = service.begin(project.id);
    const ataPhase = phases.list(cycle.id).find((p) => p.name === "GENERATE_MEETING");
    expect(ataPhase?.outputFile).toMatch(/ata-\d{8}-002\.md$/);
  });

  it("derives cycle 003 when two ATA files already exist", () => {
    writeAta("ata-20260101-001.md");
    writeAta("ata-20260201-002.md");
    const { cycle } = service.begin(project.id);
    const ataPhase = phases.list(cycle.id).find((p) => p.name === "GENERATE_MEETING");
    expect(ataPhase?.outputFile).toMatch(/ata-\d{8}-003\.md$/);
  });

  it("pads the cycle number to 3 digits — cycle 10 produces '010'", () => {
    for (let i = 1; i <= 9; i++) {
      writeAta(`ata-202601${String(i).padStart(2, "0")}-00${i}.md`);
    }
    const { cycle } = service.begin(project.id);
    const ataPhase = phases.list(cycle.id).find((p) => p.name === "GENERATE_MEETING");
    expect(ataPhase?.outputFile).toMatch(/ata-\d{8}-010\.md$/);
  });

  it("ignores files with a different prefix when counting ATAs", () => {
    const ataDir = path.join(docsRoot, config.directories.meetingMinutes);
    fs.writeFileSync(path.join(ataDir, "README.md"), "# Atas\n", "utf-8");
    fs.writeFileSync(path.join(ataDir, "adr-20260101-001.md"), "# ADR\n", "utf-8");

    const { cycle } = service.begin(project.id);
    const ataPhase = phases.list(cycle.id).find((p) => p.name === "GENERATE_MEETING");
    expect(ataPhase?.outputFile).toMatch(/ata-\d{8}-001\.md$/);
  });

  it("applies the same cycle number to ADR, ESM and LEG filenames", () => {
    writeAta("ata-20260101-001.md");
    const { cycle } = service.begin(project.id);
    const allPhases = phases.list(cycle.id);

    const adrPhase = allPhases.find((p) => p.name === "GENERATE_ADR");
    const esmPhase = allPhases.find((p) => p.name === "GENERATE_ESM");
    const legPhase = allPhases.find((p) => p.name === "GENERATE_DELIVERY_LOG");

    expect(adrPhase?.outputFile).toMatch(/adr-\d{8}-002\.md$/);
    expect(esmPhase?.outputFile).toMatch(/esm-\d{8}-002\.md$/);
    expect(legPhase?.outputFile).toMatch(/leg-\d{8}-002\.md$/);
  });

  it("recovers the correct cycle number after .mede is deleted and recreated", () => {
    // Simulate two previous cycles existing on disk (DB was lost)
    writeAta("ata-20260101-001.md");
    writeAta("ata-20260201-002.md");

    // A fresh DB (like after deleting .mede) still counts ATAs from the filesystem
    const { cycle } = service.begin(project.id);
    const ataPhase = phases.list(cycle.id).find((p) => p.name === "GENERATE_MEETING");
    expect(ataPhase?.outputFile).toMatch(/ata-\d{8}-003\.md$/);
  });
});
