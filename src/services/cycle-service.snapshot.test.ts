import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { ProjectRepository } from "../repositories/project-repository.js";
import { ProjectConfigRepository } from "../repositories/project-config-repository.js";
import { CycleRepository } from "../repositories/cycle-repository.js";
import { PhaseRepository } from "../repositories/phase-repository.js";
import { CycleArtifactRepository } from "../repositories/cycle-artifact-repository.js";
import { ChangeSetRepository } from "../repositories/change-set-repository.js";
import { ChangeChunkRepository } from "../repositories/change-chunk-repository.js";
import { PhaseAttachmentRepository } from "../repositories/phase-attachment-repository.js";
import { PhaseConversationRepository } from "../repositories/phase-conversation-repository.js";
import { BacklogRepository } from "../repositories/backlog-repository.js";
import { BacklogInterventionCountersRepository } from "../repositories/backlog-intervention-counters-repository.js";

import { ProjectReconstructionService } from "./project-reconstruction-service.js";
import { StatusService } from "./status-service.js";
import { PhaseConversationService } from "./phase-conversation-service.js";
import { CycleService } from "./cycle-service.js";

import { ProjectEntity } from "../entities/project-entity.js";
import { ProjectConfigEntity } from "../entities/project-config-entity.js";
import { CycleArtifactEntity } from "../entities/cycle-artifact-entity.js";
import { MedeConfigModelEntity } from "../entities/mede-config-model-entity.js";

// Exercises the methodology's central guarantee: starting a cycle snapshots the
// living documents, and rollback restores that snapshot (and removes historical
// artifacts created during the cycle), while commit keeps the working tree. None
// of this involves the LLM, so the flow is driven directly through CycleService.

let uow: UnitOfWork;
let root: string;
let docsRoot: string;
let service: CycleService;
let cycles: CycleRepository;
let phases: PhaseRepository;
let artifacts: CycleArtifactRepository;
let project: ProjectEntity;
let config: MedeConfigModelEntity;
let readmePath: string;

function setup(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-cycle-"));
  docsRoot = path.join(root, "docs");
  fs.mkdirSync(docsRoot, { recursive: true });

  config = new MedeConfigModelEntity();
  config.docsRoot = docsRoot;

  readmePath = path.join(docsRoot, config.fileNames.readme);
  fs.writeFileSync(readmePath, "v1", "utf-8");

  uow = new UnitOfWork(new BetterSqliteConnectionFactory({ inMemory: true }));
  uow.ensureConnection();

  const projects = new ProjectRepository(uow);
  const projectConfigs = new ProjectConfigRepository(uow);
  cycles = new CycleRepository(uow);
  phases = new PhaseRepository(uow);
  artifacts = new CycleArtifactRepository(uow);
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
  const status = new StatusService(projects, cycles, changeSets, artifacts, phases);
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
    cycles,
    phases,
    artifacts,
    changeSets,
    changeChunks,
    phaseAttachments,
    conversations,
  );
}

beforeEach(() => {
  setup();
});

afterEach(() => {
  uow[Symbol.dispose]();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("CycleService.begin", () => {
  it("opens a cycle with the 11 sequential phases and snapshots living docs", () => {
    const { cycle } = service.begin(project.id);

    expect(cycle.status).toBe("OPEN");
    expect(cycle.phaseCount).toBe(11);
    expect(phases.list(cycle.id)).toHaveLength(11);

    // The readme snapshot must capture the on-disk content at cycle start.
    const readmeArtifact = artifacts.list(cycle.id).find((a) => a.canonicalName === "readme");
    expect(readmeArtifact?.backupContent).toBe("v1");
  });

  it("refuses to open a second cycle while one is in operation", () => {
    service.begin(project.id);
    expect(() => service.begin(project.id)).toThrow(/já existe um ciclo/i);
  });
});

describe("CycleService.rollback", () => {
  it("restores living documents to the snapshot and removes historical artifacts", () => {
    const { cycle } = service.begin(project.id);

    // Simulate work done during the cycle: a living doc edited on disk...
    fs.writeFileSync(readmePath, "v2-modified", "utf-8");

    // ...and a historical artifact (e.g. an ATA) created during the cycle.
    const ataPath = path.join(docsRoot, "atas", "min-001.md");
    fs.mkdirSync(path.dirname(ataPath), { recursive: true });
    fs.writeFileSync(ataPath, "# Ata\n", "utf-8");

    const historical = new CycleArtifactEntity();
    historical.cycleId = cycle.id;
    historical.backupContent = "";
    historical.currentContent = "# Ata\n";
    historical.canonicalName = "meeting";
    historical.canonicalType = "HISTORICAL";
    historical.artifactPath = ataPath;
    historical.startedAt = new Date().toISOString();
    historical.updatedAt = new Date().toISOString();
    artifacts.insert(historical);

    service.rollback();

    // Living doc reverted to snapshot; historical artifact deleted; cycle gone.
    expect(fs.readFileSync(readmePath, "utf-8")).toBe("v1");
    expect(fs.existsSync(ataPath)).toBe(false);
    expect(cycles.getCurrent(project.id)).toBeNull();
  });
});

describe("CycleService.commit", () => {
  it("requires the cycle to be awaiting commit", () => {
    service.begin(project.id);
    expect(() => service.commit()).toThrow(/não está aguardando commit/i);
  });

  it("closes the cycle while keeping the working documents", () => {
    const { cycle } = service.begin(project.id);
    fs.writeFileSync(readmePath, "v2-kept", "utf-8");
    cycles.awaiting(cycle.id);

    service.commit();

    expect(cycles.getCurrent(project.id)).toBeNull();
    expect(fs.readFileSync(readmePath, "utf-8")).toBe("v2-kept");
  });
});
