// Verifies that sendMessage() generates a short-description slug for HISTORICAL
// artifacts with non-empty content and updates the filename in the DB (phase,
// cycleArtifact, changeSet, and downstream phases' inputFiles).

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
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import { PhaseEntity } from "../../domain/entities/phase-entity.js";
import { ProjectEntity } from "../../domain/entities/project-entity.js";
import { CycleEntity } from "../../domain/entities/cycle-entity.js";

let uow: UnitOfWork;
let root: string;
let service: PhaseConversationService;
let phaseRepo: PhaseRepository;
let changeSetRepo: ChangeSetRepository;
let cycleArtifactRepo: CycleArtifactRepository;
let cycleId: number;
let projectEntity: ProjectEntity;

const VALID_DIFF = "@@ -0,0 +1,3 @@\n+# Nova ATA\n+\n+Conteúdo da reunião\n";
const SLUG_RESPONSE = "nova-ata-sprint-001";

function setup(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-slug-"));

  const defaultConfig = new MedeConfigModelEntity();
  fs.writeFileSync(path.join(root, defaultConfig.fileNames.currentState), "", "utf-8");

  uow = new UnitOfWork(new BetterSqliteConnectionFactory({ inMemory: true }));
  uow.ensureConnection();

  const projects = new ProjectRepository(uow);
  const cycles = new CycleRepository(uow);
  const conversations = new PhaseConversationRepository(uow);
  const attachments = new PhaseAttachmentRepository(uow);
  cycleArtifactRepo = new CycleArtifactRepository(uow);
  changeSetRepo = new ChangeSetRepository(uow);
  const changeChunks = new ChangeChunkRepository(uow);
  phaseRepo = new PhaseRepository(uow);
  const backlog = new BacklogRepository(uow);

  service = new PhaseConversationService(
    conversations,
    attachments,
    cycleArtifactRepo,
    changeSetRepo,
    changeChunks,
    phaseRepo,
    backlog,
  );

  const now = new Date().toISOString();

  const pe = new ProjectEntity();
  pe.name = "test-project";
  pe.rootProjectPath = root;
  pe.docsRootPath = root;
  pe.documentationLanguage = "pt-BR";
  pe.createdAt = now;
  pe.updatedAt = now;
  projectEntity = projects.insert(pe);

  const cycleEntity = new CycleEntity();
  cycleEntity.projectId = projectEntity.id;
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
  p.name = "GENERATE_MEETING";
  p.index = 1;
  p.inputFiles = [];
  p.outputFile = outputFile;
  p.docTypeOutput = docTypeOutput;
  p.promptName = "meeting";
  p.status = "REFINING";
  p.proposalState = "NOT_GENERATED";
  p.startedAt = new Date().toISOString();
  p.finishedAt = "";
  return phaseRepo.insert(p);
}

function makeConfig(slugEnabled = true): MedeConfigModelEntity {
  const config = new MedeConfigModelEntity();
  config.docsRoot = root;
  config.shortDescriptionSlug = { enabled: slugEnabled, prompt: "" };
  return config;
}

beforeEach(() => {
  generateText.mockReset();
  setup();
});

afterEach(() => {
  uow[Symbol.dispose]();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("PhaseConversationService.sendMessage — slug generation", () => {
  it("appends slug to the filename when HISTORICAL artifact has non-empty diff", async () => {
    generateText
      .mockResolvedValueOnce({ rawText: VALID_DIFF })
      .mockResolvedValueOnce({ rawText: SLUG_RESPONSE });

    const ataPath = path.join(root, "ata-20260610-001.md");
    const phase = makePhase(ataPath);
    const config = makeConfig(true);

    const changeSet = await service.sendMessage(projectEntity, config, phase, "ok", []);

    expect(generateText).toHaveBeenCalledTimes(2);

    const expectedSlug = "nova-ata-sprint-001";
    const expectedPath = path.join(root, `ata-20260610-001-${expectedSlug}.md`);

    // changeSet.fileName was updated
    expect(changeSet?.fileName).toBe(expectedPath);

    // DB: changeSet.fileName reflects the slugged path
    const dbChangeSet = changeSetRepo.getById(changeSet!.id);
    expect(dbChangeSet?.fileName).toBe(expectedPath);

    // DB: phase.outputFile reflects the slugged path
    const dbPhase = phaseRepo.getById(phase.id);
    expect(dbPhase?.outputFile).toBe(expectedPath);

    // DB: cycleArtifact.artifactPath reflects the slugged path
    const artifacts = cycleArtifactRepo.list(cycleId);
    expect(artifacts[0]?.artifactPath).toBe(expectedPath);
  });

  it("normalizes accents and special characters in slug", async () => {
    generateText
      .mockResolvedValueOnce({ rawText: VALID_DIFF })
      .mockResolvedValueOnce({ rawText: "Reunião Técnica Ágil" });

    const ataPath = path.join(root, "ata-20260610-001.md");
    const phase = makePhase(ataPath);
    const config = makeConfig(true);

    const changeSet = await service.sendMessage(projectEntity, config, phase, "ok", []);

    // Accents stripped, lowercased, spaces → hyphens
    expect(changeSet?.fileName).toContain("reuniao-tecnica-agil");
  });

  it("does NOT generate slug when diff is empty (0 chunks)", async () => {
    generateText.mockResolvedValueOnce({ rawText: "" });

    const ataPath = path.join(root, "ata-20260610-001.md");
    const phase = makePhase(ataPath);
    const config = makeConfig(true);

    await service.sendMessage(projectEntity, config, phase, "ok", []);

    // Only the content generation call — no slug call
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it("does NOT generate slug when shortDescriptionSlug.enabled is false", async () => {
    generateText
      .mockResolvedValueOnce({ rawText: VALID_DIFF })
      .mockResolvedValueOnce({ rawText: SLUG_RESPONSE });

    const ataPath = path.join(root, "ata-20260610-001.md");
    const phase = makePhase(ataPath);
    const config = makeConfig(false);

    const changeSet = await service.sendMessage(projectEntity, config, phase, "ok", []);

    // Only the content generation call
    expect(generateText).toHaveBeenCalledTimes(1);
    // Filename stays at provisional path
    expect(changeSet?.fileName).toBe(ataPath);
  });

  it("does NOT generate slug for a LIVE artifact", async () => {
    generateText.mockResolvedValueOnce({ rawText: VALID_DIFF });

    const rfPath = path.join(root, "requisitos-funcionais.md");
    const phase = makePhase(rfPath, "LIVE");
    const config = makeConfig(true);

    await service.sendMessage(projectEntity, config, phase, "ok", []);

    // Only the content generation call — no slug for LIVE
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it("uses provisional name when slug LLM call fails (graceful degradation)", async () => {
    generateText
      .mockResolvedValueOnce({ rawText: VALID_DIFF })
      .mockRejectedValueOnce(new Error("LLM timeout"));

    const ataPath = path.join(root, "ata-20260610-001.md");
    const phase = makePhase(ataPath);
    const config = makeConfig(true);

    const changeSet = await service.sendMessage(projectEntity, config, phase, "ok", []);

    expect(generateText).toHaveBeenCalledTimes(2);
    // Falls back to provisional path — no error thrown
    expect(changeSet?.fileName).toBe(ataPath);
  });

  it("updates downstream phase inputFiles when slug renames the artifact", async () => {
    generateText
      .mockResolvedValueOnce({ rawText: VALID_DIFF })
      .mockResolvedValueOnce({ rawText: SLUG_RESPONSE });

    const ataPath = path.join(root, "ata-20260610-001.md");
    const phase = makePhase(ataPath);

    // Create a downstream phase that references the provisional ATA path
    const downstream = new PhaseEntity();
    downstream.cycleId = cycleId;
    downstream.name = "GENERATE_ADR";
    downstream.index = 2;
    downstream.inputFiles = [ataPath];
    downstream.outputFile = path.join(root, "adr-20260610-001.md");
    downstream.docTypeOutput = "HISTORICAL";
    downstream.promptName = "architecturalDecisions";
    downstream.status = "PENDING";
    downstream.proposalState = "NOT_GENERATED";
    downstream.startedAt = new Date().toISOString();
    downstream.finishedAt = "";
    const savedDownstream = phaseRepo.insert(downstream);

    const config = makeConfig(true);
    await service.sendMessage(projectEntity, config, phase, "ok", []);

    const expectedPath = path.join(root, `ata-20260610-001-${SLUG_RESPONSE}.md`);

    // Downstream phase now references the slugged path
    const dbDownstream = phaseRepo.getById(savedDownstream.id);
    expect(dbDownstream?.inputFiles).toContain(expectedPath);
  });
});
