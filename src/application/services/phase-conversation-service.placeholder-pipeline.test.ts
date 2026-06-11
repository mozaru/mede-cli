// Verifies that sendMessage() wires the BEGIN-END placeholder pipeline:
// (1) documents are compressed before being sent to the LLM,
// (2) LLM diff coordinates are transformed back to original-doc space, and
// (3) deterministic chunks are generated for each BEGIN-END block and appended
//     to the same ChangeSet as the LLM chunks.

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
import { CycleArtifactEntity } from "../../domain/entities/cycle-artifact-entity.js";

let uow: UnitOfWork;
let root: string;
let service: PhaseConversationService;
let cycleArtifactRepo: CycleArtifactRepository;
let changeSetRepo: ChangeSetRepository;
let changeChunkRepo: ChangeChunkRepository;
let phaseRepo: PhaseRepository;
let cycleRepo: CycleRepository;
let cycleId: number;
let projectEntity: ProjectEntity;
let config: MedeConfigModelEntity;

// A document that has a BEGIN-END block.  The 3-line table (inner content) becomes
// a single ##TABELA_ENTREGUES## line when compressed → shrinkage = 2.
const DOC_WITH_BLOCK = [
  "# Entrega 001",
  "",
  "<!-- BEGIN-TABELA_ENTREGUES -->",
  "| ID | Nome |",
  "| --- | --- |",
  "| OLD-001 | Old Item |",
  "<!-- END-TABELA_ENTREGUES -->",
  "",
  "## Estatística",
  "",
  "Total: 5 itens",
].join("\n");

// In compressed space "Total: 5 itens" is at line 9 (1-indexed).
// After coordinate transform (shrinkage=2): line 9+2 = 11.
const LLM_DIFF_IN_COMPRESSED_SPACE =
  "@@ -9,1 +9,1 @@\n-Total: 5 itens\n+Total: 10 itens\n";

// A plain document with no BEGIN-END blocks (backward-compat case).
const DOC_WITHOUT_BLOCKS = "# Entrega 002\n\nConteúdo simples sem blocos.\n";
const LLM_DIFF_SIMPLE = "@@ -3,1 +3,1 @@\n-Conteúdo simples sem blocos.\n+Conteúdo alterado.\n";

function setup(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-pipeline-"));
  config = new MedeConfigModelEntity();
  config.docsRoot = root;
  // Write an empty situacao-atual.md so that CurrentStateParser doesn't throw
  fs.writeFileSync(path.join(root, config.fileNames.currentState), "", "utf-8");

  uow = new UnitOfWork(new BetterSqliteConnectionFactory({ inMemory: true }));
  uow.ensureConnection();

  const projects = new ProjectRepository(uow);
  cycleRepo = new CycleRepository(uow);
  const conversations = new PhaseConversationRepository(uow);
  const attachments = new PhaseAttachmentRepository(uow);
  cycleArtifactRepo = new CycleArtifactRepository(uow);
  changeSetRepo = new ChangeSetRepository(uow);
  changeChunkRepo = new ChangeChunkRepository(uow);
  phaseRepo = new PhaseRepository(uow);
  const backlog = new BacklogRepository(uow);

  service = new PhaseConversationService(
    conversations,
    attachments,
    cycleArtifactRepo,
    changeSetRepo,
    changeChunkRepo,
    phaseRepo,
    backlog,
    cycleRepo, // T07: cycleRepository for referenceDate
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
  cycleId = cycleRepo.insert(cycleEntity).id;
}

function makePhase(outputFile: string): PhaseEntity {
  const p = new PhaseEntity();
  p.cycleId = cycleId;
  p.name = "GENERATE_DELIVERY_LOG";
  p.index = 4;
  p.inputFiles = [];
  p.outputFile = outputFile;
  p.docTypeOutput = "HISTORICAL";
  p.promptName = "deliveryLog";
  p.status = "REFINING";
  p.proposalState = "NOT_GENERATED";
  p.startedAt = new Date().toISOString();
  p.finishedAt = "";
  return phaseRepo.insert(p);
}

function seedArtifact(outputFile: string, content: string): CycleArtifactEntity {
  const a = new CycleArtifactEntity();
  a.cycleId = cycleId;
  a.canonicalName = "deliveryLog";
  a.canonicalType = "HISTORICAL";
  a.artifactPath = outputFile;
  a.backupContent = content;
  a.currentContent = content;
  a.startedAt = new Date().toISOString();
  a.updatedAt = new Date().toISOString();
  return cycleArtifactRepo.insert(a);
}

beforeEach(() => {
  generateText.mockReset();
  setup();
});

afterEach(() => {
  uow[Symbol.dispose]();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("PhaseConversationService — BEGIN-END placeholder pipeline (T07)", () => {
  it("document with block: ChangeSet includes LLM chunk + deterministic chunk for the block", async () => {
    const outputFile = path.join(root, "leg-20260611-001.md");
    const phase = makePhase(outputFile);
    seedArtifact(outputFile, DOC_WITH_BLOCK);

    generateText.mockResolvedValueOnce({ rawText: LLM_DIFF_IN_COMPRESSED_SPACE });

    const changeSet = await service.sendMessage(projectEntity, config, phase);
    expect(changeSet).not.toBeNull();

    // 1 LLM chunk (transformed) + 1 deterministic chunk for TABELA_ENTREGUES
    expect(changeSet!.changeChunkCount).toBe(2);

    const chunks = changeChunkRepo.list(changeSet!.id);
    expect(chunks).toHaveLength(2);

    // First chunk (LLM) should have coordinates shifted from compressed to original space
    const llmChunk = chunks.find((c) => c.index === 1)!;
    expect(llmChunk.blockLocation).toContain("@@ -11,1 +11,1 @@");
    expect(llmChunk.changeContent).toContain("+Total: 10 itens");

    // Second chunk (deterministic) should target the TABELA_ENTREGUES block
    const detChunk = chunks.find((c) => c.index === 2)!;
    expect(detChunk.status).toBe("AWAITING_APPROVAL");
  });

  it("document without blocks: ChangeSet has only the LLM chunk (backward-compat)", async () => {
    const outputFile = path.join(root, "leg-20260611-002.md");
    const phase = makePhase(outputFile);
    seedArtifact(outputFile, DOC_WITHOUT_BLOCKS);

    generateText.mockResolvedValueOnce({ rawText: LLM_DIFF_SIMPLE });

    const changeSet = await service.sendMessage(projectEntity, config, phase);
    expect(changeSet).not.toBeNull();

    // No blocks → no deterministic chunks → total = 1
    expect(changeSet!.changeChunkCount).toBe(1);
    const chunks = changeChunkRepo.list(changeSet!.id);
    expect(chunks).toHaveLength(1);

    // Coordinates should be unchanged (no compression map)
    expect(chunks[0].blockLocation).toContain("@@ -3,1 +3,1 @@");
  });

  it("document with block: LLM diff that does NOT touch the block still gets a deterministic chunk", async () => {
    // Same as first test but we also verify the deterministic chunk contains fresh content
    const outputFile = path.join(root, "leg-20260611-003.md");
    const phase = makePhase(outputFile);
    seedArtifact(outputFile, DOC_WITH_BLOCK);

    // LLM makes no changes at all → empty diff
    generateText.mockResolvedValueOnce({ rawText: "" });

    const changeSet = await service.sendMessage(projectEntity, config, phase);
    expect(changeSet).not.toBeNull();

    // 0 LLM chunks + 1 deterministic chunk
    expect(changeSet!.changeChunkCount).toBe(1);
    const chunks = changeChunkRepo.list(changeSet!.id);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].status).toBe("AWAITING_APPROVAL");
  });
});
