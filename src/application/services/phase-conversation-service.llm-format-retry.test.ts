// Verifies that a malformed diff returned by the LLM triggers an automatic
// retry rather than an immediate failure. The format validation
// (validateDiffChunks) must be inside the withRetry wrapper so that parse
// errors are treated like transient LLM failures and retried.

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
let phases: PhaseRepository;
let cycleId: number;

function setup(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-llm-retry-"));

  // sendMessage builds prompt placeholders by reading situacao-atual.md
  const defaultConfig = new MedeConfigModelEntity();
  fs.writeFileSync(path.join(root, defaultConfig.fileNames.currentState), "", "utf-8");

  uow = new UnitOfWork(new BetterSqliteConnectionFactory({ inMemory: true }));
  uow.ensureConnection();

  const projects = new ProjectRepository(uow);
  const cycles = new CycleRepository(uow);
  const conversations = new PhaseConversationRepository(uow);
  const attachments = new PhaseAttachmentRepository(uow);
  const artifacts = new CycleArtifactRepository(uow);
  const changeSets = new ChangeSetRepository(uow);
  const changeChunks = new ChangeChunkRepository(uow);
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

  const now = new Date().toISOString();

  const projectEntity = new ProjectEntity();
  projectEntity.name = "test-project";
  projectEntity.rootProjectPath = root;
  projectEntity.docsRootPath = root;
  projectEntity.documentationLanguage = "pt-BR";
  projectEntity.createdAt = now;
  projectEntity.updatedAt = now;
  const projectId = projects.insert(projectEntity).id;

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

function makePhase(outputFile: string): PhaseEntity {
  const p = new PhaseEntity();
  p.cycleId = cycleId;
  p.name = "GENERATE_MEETING";
  p.index = 1;
  p.inputFiles = [];
  p.outputFile = outputFile;
  p.docTypeOutput = "HISTORICAL";
  p.promptName = "meeting";
  p.status = "REFINING";
  p.proposalState = "NOT_GENERATED";
  p.startedAt = new Date().toISOString();
  p.finishedAt = "";
  return phases.insert(p);
}

beforeEach(() => {
  generateText.mockReset();
  setup();
});

afterEach(() => {
  uow[Symbol.dispose]();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("PhaseConversationService.sendMessage — LLM format error retry", () => {
  it("retries when the LLM returns a malformed diff and succeeds on the second attempt", async () => {
    // First call: hunk header is syntactically invalid → validateDiffChunks throws
    generateText
      .mockResolvedValueOnce({ rawText: "@@ INVALID FORMAT @@\n+conteúdo\n" })
      // Second call: valid empty diff (no changes)
      .mockResolvedValueOnce({ rawText: "" });

    const ataPath = path.join(root, "ata-20260610-001.md");
    const phase = makePhase(ataPath);
    const project = new ProjectEntity();
    const config = new MedeConfigModelEntity();
    config.docsRoot = root;

    const changeSet = await service.sendMessage(project, config, phase, "prompt de teste", []);

    expect(generateText).toHaveBeenCalledTimes(2);
    expect(changeSet).not.toBeNull();
    expect(changeSet?.changeChunkCount).toBe(0);
  });

  it("propagates the error after exhausting all retries", async () => {
    // All calls return malformed diff
    generateText.mockResolvedValue({ rawText: "@@ BAD HEADER @@\n+linha\n" });

    const ataPath = path.join(root, "ata-20260610-001.md");
    const phase = makePhase(ataPath);
    const project = new ProjectEntity();
    const config = new MedeConfigModelEntity();
    config.docsRoot = root;

    // MEDE_LLM_RETRIES=0 disables retries to keep the test fast
    const originalEnv = process.env.MEDE_LLM_RETRIES;
    process.env.MEDE_LLM_RETRIES = "0";
    try {
      await expect(
        service.sendMessage(project, config, phase, "prompt de teste", []),
      ).rejects.toThrow(/diff malformado/i);
    } finally {
      if (originalEnv === undefined) {
        delete process.env.MEDE_LLM_RETRIES;
      } else {
        process.env.MEDE_LLM_RETRIES = originalEnv;
      }
    }

    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it("does not retry when the LLM returns a valid empty diff (no format error)", async () => {
    generateText.mockResolvedValue({ rawText: "" });

    const ataPath = path.join(root, "ata-20260610-001.md");
    const phase = makePhase(ataPath);
    const project = new ProjectEntity();
    const config = new MedeConfigModelEntity();
    config.docsRoot = root;

    const changeSet = await service.sendMessage(project, config, phase, "ok", []);

    expect(generateText).toHaveBeenCalledTimes(1);
    expect(changeSet?.changeChunkCount).toBe(0);
  });

  it("does not retry a permanent auth failure (401/forbidden)", async () => {
    generateText.mockRejectedValue(new Error("401 invalid api key"));

    const ataPath = path.join(root, "ata-20260610-001.md");
    const phase = makePhase(ataPath);
    const project = new ProjectEntity();
    const config = new MedeConfigModelEntity();
    config.docsRoot = root;

    const originalEnv = process.env.MEDE_LLM_RETRIES;
    process.env.MEDE_LLM_RETRIES = "3";
    try {
      await expect(
        service.sendMessage(project, config, phase, "ok", []),
      ).rejects.toThrow(/401/);
    } finally {
      if (originalEnv === undefined) {
        delete process.env.MEDE_LLM_RETRIES;
      } else {
        process.env.MEDE_LLM_RETRIES = originalEnv;
      }
    }

    // Must not have retried — permanent failure
    expect(generateText).toHaveBeenCalledTimes(1);
  });
});
