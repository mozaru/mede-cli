import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Mocks the LLM provider to avoid calling external networks during tests.
// Registers the last output document being generated to return realistic diff content based on templates.
const { generateText, lastDocState } = vi.hoisted(() => ({
  generateText: vi.fn(),
  lastDocState: { path: "" }
}));

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
      addOutputDoc: (id: number, artifactPath: string, currentContent: string) => {
        lastDocState.path = artifactPath;
      },
      generateText,
    }),
  },
}));

import { InitHandler } from "./init-handler.js";
import { ConfigHandler } from "./config-handler.js";
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

// Helper to assert database cycle state independently
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

// Evaluation algorithm to score generated markdown files against structural templates
function evaluateMarkdownQuality(templateContent: string, generatedContent: string): {
  score: number;
  totalModel: number;
  present: number;
  missing: number;
  extra: number;
} {
  const extractHeaders = (content: string): string[] => {
    const lines = content.split(/\r?\n/);
    return lines
      .filter((line) => line.startsWith("## "))
      .map((line) => line.replace(/^##\s+/, "").trim());
  };

  const normalize = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const expectedHeaders = extractHeaders(templateContent);
  const generatedHeaders = extractHeaders(generatedContent);

  const normalizedExpected = expectedHeaders.map(normalize);
  const normalizedGenerated = generatedHeaders.map(normalize);

  let presentCount = 0;
  let extraCount = 0;

  const foundExpected = new Set<string>();

  for (const gen of normalizedGenerated) {
    const expectedMatch = normalizedExpected.find(
      (exp) => exp === gen || gen.includes(exp) || exp.includes(gen)
    );

    if (expectedMatch) {
      if (!foundExpected.has(expectedMatch)) {
        foundExpected.add(expectedMatch);
        presentCount += 1;
      }
    } else {
      extraCount += 1;
    }
  }

  const missingCount = expectedHeaders.length - presentCount;
  const totalModel = expectedHeaders.length;

  const score = totalModel > 0
    ? Math.max(0, Math.min(100, (presentCount / (totalModel + extraCount)) * 100))
    : 100;

  return {
    score,
    totalModel,
    present: presentCount,
    missing: missingCount,
    extra: extraCount,
  };
}

function assertDocumentQuality(generatedFilename: string, templateFilename: string): void {
  const templatePath = path.join(previousCwd, "locales", "pt-BR", "prompts", "templates", templateFilename);
  const generatedPath = path.join(root, "docs", generatedFilename);

  expect(fs.existsSync(templatePath)).toBe(true);
  expect(fs.existsSync(generatedPath)).toBe(true);

  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const generatedContent = fs.readFileSync(generatedPath, "utf-8");

  const result = evaluateMarkdownQuality(templateContent, generatedContent);

  const minQuality = Number(process.env.MEDE_TEST_MIN_QUALITY) || 70;

  if (result.score < minQuality) {
    console.error(`[QUALIDADE FALHOU] ${generatedFilename} vs ${templateFilename}`);
    console.error(`[QUALIDADE FALHOU] Score obtido: ${result.score.toFixed(1)}% (Mínimo: ${minQuality}%)`);
    console.error(`[QUALIDADE FALHOU] Conteúdo gerado:\n"${generatedContent}"`);
  }

  expect(result.score).toBeGreaterThanOrEqual(minQuality);
}

beforeEach(() => {
  generateText.mockReset();
  lastDocState.path = "";

  // Mock implementation generating realistic diff insertions from template files
  generateText.mockImplementation(async () => {
    if (lastDocState.path) {
      let templateName = "";
      const basename = path.basename(lastDocState.path);

      switch (basename) {
        case "entendimento-inicial.md":
          templateName = "initial-understanding.md";
          break;
        case "visao-e-escopo.md":
          templateName = "scope-and-vision.md";
          break;
        case "requisitos-funcionais.md":
          templateName = "functional-requirements.md";
          break;
        case "requisitos-nao-funcionais.md":
          templateName = "non-functional-requirements.md";
          break;
        case "modelo-de-dados.md":
          templateName = "data-model.md";
          break;
        case "cronograma.md":
          templateName = "timeline.md";
          break;
        case "situacao-atual.md":
          templateName = "current-state.md";
          break;
        default:
          if (basename.startsWith("ata")) {
            templateName = "meeting.md";
          } else if (basename.startsWith("adr")) {
            templateName = "adr.md";
          } else if (basename.startsWith("esm")) {
            templateName = "esm.md";
          } else if (basename.startsWith("leg")) {
            templateName = "delivery-log.md";
          }
      }

      if (templateName) {
        const templatePath = path.join(previousCwd, "locales", "pt-BR", "prompts", "templates", templateName);
        if (fs.existsSync(templatePath)) {
          const templateContent = fs.readFileSync(templatePath, "utf-8");
          const lines = templateContent.split(/\r?\n/);
          const diffLines = [
            `@@ -0,0 +1,${lines.length} @@`,
            ...lines.map((line) => `+${line}`),
          ];
          return { rawText: diffLines.join("\n") };
        }
      }
    }

    return { rawText: "@@ -0,0 +1,1 @@\n+conteúdo e2e" };
  });

  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-e2e-scenarios-"));
  previousCwd = process.cwd();
  process.chdir(root);

  logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
});

afterEach(() => {
  logSpy.mockRestore();
  process.chdir(previousCwd);
  try {
    fs.rmSync(root, { recursive: true, force: true });
  } catch {
    // Left for the OS to reap if locked on Windows
  }
});

describe("MEDE-CLI Complete E2E Scenarios", () => {
  // ---------------------------------------------------------------------------
  // Cenário 1: Diretório totalmente vazio (criação e ciclo do zero)
  // ---------------------------------------------------------------------------
  it("Scenario 1: initializes in a completely empty directory, creates config and runs a full cycle", async () => {
    // Assert that the directory is empty
    expect(fs.readdirSync(root)).toHaveLength(0);

    // 1. Generate config file
    await new ConfigHandler().executeInit();
    expect(fs.existsSync(path.join(root, "mede.config.json"))).toBe(true);

    const configContent = fs.readFileSync(path.join(root, "mede.config.json"), "utf-8");
    const config = JSON.parse(configContent);
    const docsRoot = path.join(root, config.docsRoot);

    // 2. Initialize the project via InitService (creates .mede/ and documents)
    await new InitHandler().execute("Meu Projeto do Zero", []);

    expect(fs.existsSync(path.join(root, ".mede", "mede.db"))).toBe(true);
    expect(fs.existsSync(docsRoot)).toBe(true);
    expect(fs.existsSync(path.join(docsRoot, config.fileNames.readme))).toBe(true);

    // Assert a project and an open initialization cycle exist
    const cycle = currentCycle();
    expect(cycle).not.toBeNull();
    expect(cycle!.status).toBe("OPEN");
    expect(cycle!.currentPhaseIndex).toBe(1);

    // 3. Process the initialization cycle to the end (approve-all)
    new ChangesHandler().executeApply(true);
    await new CycleHandler().executeApprove(true);

    const awaitingCommit = currentCycle();
    expect(awaitingCommit!.status).toBe("AWAITING_COMMIT");

    // 4. Commit the initialization cycle
    new CycleHandler().executeCommit();
    expect(currentCycle()).toBeNull(); // Cycle completed

    // 5. Run a full causal cycle (which generates all the documents)
    await new CycleHandler().executeCycle("Criar a especificação completa", []);
    new ChangesHandler().executeApply(true);
    await new CycleHandler().executeApprove(true);
    new CycleHandler().executeCommit();

    // 6. Assert quality on all generated structural documents
    assertDocumentQuality(config.fileNames.initialUnderstanding, "initial-understanding.md");
    assertDocumentQuality(config.fileNames.scopeAndVision, "scope-and-vision.md");
    assertDocumentQuality(config.fileNames.currentState, "current-state.md");
    assertDocumentQuality(config.fileNames.functionalRequirements, "functional-requirements.md");
    assertDocumentQuality(config.fileNames.nonFunctionalRequirements, "non-functional-requirements.md");
    assertDocumentQuality(config.fileNames.dataModel, "data-model.md");
  });

  // ---------------------------------------------------------------------------
  // Cenário 2: Projeto existente sem MEDE (com readme.md e visao-e-escopo.md)
  // ---------------------------------------------------------------------------
  it("Scenario 2: initializes in a directory containing pre-existing documents and uses them as context", async () => {
    // 1. Generate config file
    await new ConfigHandler().executeInit();

    const configContent = fs.readFileSync(path.join(root, "mede.config.json"), "utf-8");
    const config = JSON.parse(configContent);
    const docsRoot = path.join(root, config.docsRoot);
    fs.mkdirSync(docsRoot, { recursive: true });

    // Create pre-existing files with specific content
    const readmeContent = "# Meu Sistema Existente\nReadme prévio.";
    const scopeContent = "# Visão e Escopo\nEscopo prévio.";
    
    fs.writeFileSync(path.join(docsRoot, config.fileNames.readme), readmeContent, "utf-8");
    fs.writeFileSync(path.join(docsRoot, config.fileNames.scopeAndVision), scopeContent, "utf-8");

    // 2. Run initialization passing the files as context
    await new InitHandler().execute("iniciar", [
      `docs/${config.fileNames.readme}`,
      `docs/${config.fileNames.scopeAndVision}`
    ]);

    // Check that missing required files were created
    expect(fs.existsSync(path.join(docsRoot, config.fileNames.currentState))).toBe(true);
    expect(fs.existsSync(path.join(docsRoot, config.fileNames.initialUnderstanding))).toBe(true);

    // Assert that the database registered the correct project name from the pre-existing readme.md
    const uow = new UnitOfWork(new BetterSqliteConnectionFactory({ projectRootPath: root }));
    uow.ensureConnection();
    const project = new ProjectRepository(uow).getCurrent();
    expect(project).not.toBeNull();
    expect(project!.name).toBe("Meu Sistema Existente"); // Extracted name
    uow[Symbol.dispose]();

    // 3. Run and commit the init cycle
    new ChangesHandler().executeApply(true);
    await new CycleHandler().executeApprove(true);
    new CycleHandler().executeCommit();

    expect(currentCycle()).toBeNull();

    // 4. Run a full causal cycle (which generates all the documents)
    await new CycleHandler().executeCycle("Criar a especificação completa", []);
    new ChangesHandler().executeApply(true);
    await new CycleHandler().executeApprove(true);
    new CycleHandler().executeCommit();

    // 5. Assert quality on all generated structural documents
    assertDocumentQuality(config.fileNames.initialUnderstanding, "initial-understanding.md");
    assertDocumentQuality(config.fileNames.scopeAndVision, "scope-and-vision.md");
    assertDocumentQuality(config.fileNames.currentState, "current-state.md");
    assertDocumentQuality(config.fileNames.functionalRequirements, "functional-requirements.md");
    assertDocumentQuality(config.fileNames.nonFunctionalRequirements, "non-functional-requirements.md");
    assertDocumentQuality(config.fileNames.dataModel, "data-model.md");
  });

  // ---------------------------------------------------------------------------
  // Cenário 3: Projeto existente com MEDE (Ciclo com Refinamento, Reset e Rollback)
  // ---------------------------------------------------------------------------
  it("Scenario 3: runs cycles on an existing MEDE project demonstrating refinement, reset, commit and rollback", async () => {
    // 1. Setup config
    await new ConfigHandler().executeInit();

    const configContent = fs.readFileSync(path.join(root, "mede.config.json"), "utf-8");
    const config = JSON.parse(configContent);
    const docsRoot = path.join(root, config.docsRoot);
    fs.mkdirSync(docsRoot, { recursive: true });
    fs.writeFileSync(path.join(docsRoot, config.fileNames.readme), "# Sistema MEDE\n", "utf-8");
    fs.writeFileSync(path.join(docsRoot, config.fileNames.currentState), "# Situação Atual\n", "utf-8");

    // 2. Setup init and commit
    await new InitHandler().execute("init", []);
    new ChangesHandler().executeApply(true);
    await new CycleHandler().executeApprove(true);
    new CycleHandler().executeCommit();

    // --- Subcenário A: Ciclo com Refinamento e Commit ---
    // Start a new causal cycle
    await new CycleHandler().executeCycle("Adicionar nova funcionalidade", []);
    let cycle = currentCycle();
    expect(cycle).not.toBeNull();
    expect(cycle!.status).toBe("OPEN");

    // Apply the pending chunks to transition the phase to AWAITING_APPROVAL
    new ChangesHandler().executeApply(true);

    // Request refinement
    await new CycleHandler().executeRefine("Refinar a proposta detalhando o modelo de dados", []);
    
    // Apply and approve all
    new ChangesHandler().executeApply(true);
    await new CycleHandler().executeApprove(true);
    
    // Commit the cycle
    new CycleHandler().executeCommit();
    expect(currentCycle()).toBeNull(); // Committed and closed

    // Assert quality on all generated structural documents
    assertDocumentQuality(config.fileNames.initialUnderstanding, "initial-understanding.md");
    assertDocumentQuality(config.fileNames.scopeAndVision, "scope-and-vision.md");
    assertDocumentQuality(config.fileNames.currentState, "current-state.md");

    // --- Subcenário B: Ciclo com Reset e Rollback ---
    // Start a third cycle
    await new CycleHandler().executeCycle("Outra funcionalidade", []);
    expect(currentCycle()).not.toBeNull();

    // Perform a reset (discards proposal, returns to generator status of phase 1)
    await new CycleHandler().executeReset();
    cycle = currentCycle();
    expect(cycle!.currentPhaseIndex).toBe(1);

    // Perform a rollback (cancels the entire cycle, restoring repository to pre-cycle state)
    new CycleHandler().executeRollback();
    expect(currentCycle()).toBeNull(); // Discarded
  });
});
