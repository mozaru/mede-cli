import { describe, it, expect, vi } from "vitest";
import { InitService } from "./init-service.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";

describe("InitService unit tests", () => {
  it("initializes a project by creating paths, inserting prompt info, calling phaseConversationService and statusService", async () => {
    // 1. Mocks
    const mockProject = {
      id: 123,
      name: "Demo",
      rootProjectPath: "/root",
      docsRootPath: "/root/docs",
      documentationLanguage: "pt-BR",
    };

    const mockConfig: MedeConfigModelEntity = {
      configVersion: 1,
      language: "pt-BR",
      docsRoot: "docs",
      directories: {
        meetingMinutes: "atas-de-reuniao",
        architecturalDecisions: "decisoes-arquiteturais",
        systemMaintenanceSpecifications: "especificacao-manutencao-sistema",
        deliveryLog: "log-entregas",
      },
      fileNames: {
        initialUnderstanding: "entendimento-inicial.md",
        readme: "readme.md",
        currentState: "situacao-atual.md",
        scopeAndVision: "visao-e-escopo.md",
        functionalRequirements: "requisitos-funcionais.md",
        nonFunctionalRequirements: "requisitos-nao-funcionais.md",
        dataModel: "modelo-de-dados.md",
        timeline: "cronograma.md",
      },
      prefixes: {
        meetingMinutes: "ata",
        architecturalDecisions: "adr",
        systemMaintenanceSpecifications: "esm",
        deliveryLog: "leg",
      },
    } as any;

    const mockCycle = { id: 456, status: "OPEN" };
    const mockPhase = { id: 789, name: "GENERATE_MEETING", promptName: "meeting" };
    const mockChangeSet = { id: 101, changeChunkCount: 2 };

    const docsRepository = {
      reconstruct: vi.fn().mockReturnValue({ project: mockProject }),
    };

    const projectConfigRepository = {
      getCurrent: vi.fn().mockReturnValue({ content: JSON.stringify(mockConfig) }),
    };

    const cycleService = {
      beginInitialization: vi.fn().mockReturnValue({ cycle: mockCycle, phase: mockPhase }),
    } as any;

    const phaseConversationService = {
      sendMessage: vi.fn().mockResolvedValue(mockChangeSet),
    } as any;

    const statusService = {
      generate: vi.fn().mockReturnValue("formatted_status_report"),
    } as any;

    const phaseRepository = {
      empty: vi.fn(),
      nonEmpty: vi.fn(),
      getById: vi.fn().mockReturnValue({ ...mockPhase, status: "APPROVED" }),
    } as any;

    const cycleArtifactRepository = {
      insert: vi.fn(),
    } as any;

    const fileSystemRepository = {
      ensureDirectory: vi.fn(),
      ensureFile: vi.fn(),
    } as any;

    // 2. Instantiate Service
    const initService = new InitService(
      docsRepository as any,
      cycleService,
      phaseConversationService,
      statusService,
      projectConfigRepository as any,
      phaseRepository,
      cycleArtifactRepository,
      fileSystemRepository
    );

    // 3. Act
    const result = await initService.init("Custom Prompt Text", ["file1.txt", "file2.txt"]);

    // 4. Assertions
    expect(result).toBe("formatted_status_report");

    // Directory creation
    expect(fileSystemRepository.ensureDirectory).toHaveBeenCalledWith("docs/atas-de-reuniao");
    expect(fileSystemRepository.ensureDirectory).toHaveBeenCalledWith("docs/decisoes-arquiteturais");
    expect(fileSystemRepository.ensureDirectory).toHaveBeenCalledWith("docs/especificacao-manutencao-sistema");
    expect(fileSystemRepository.ensureDirectory).toHaveBeenCalledWith("docs/log-entregas");

    // Base files creation
    expect(fileSystemRepository.ensureFile).toHaveBeenCalledWith("docs/entendimento-inicial.md");
    expect(fileSystemRepository.ensureFile).toHaveBeenCalledWith("docs/readme.md");
    expect(fileSystemRepository.ensureFile).toHaveBeenCalledWith("docs/situacao-atual.md");
    expect(fileSystemRepository.ensureFile).toHaveBeenCalledWith("docs/visao-e-escopo.md");
    expect(fileSystemRepository.ensureFile).toHaveBeenCalledWith("docs/requisitos-funcionais.md");
    expect(fileSystemRepository.ensureFile).toHaveBeenCalledWith("docs/requisitos-nao-funcionais.md");
    expect(fileSystemRepository.ensureFile).toHaveBeenCalledWith("docs/modelo-de-dados.md");

    // Prompt info insertion
    expect(cycleArtifactRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        canonicalName: "prompt",
        canonicalType: "info",
        currentContent: "Custom Prompt Text",
        cycleId: mockCycle.id,
      })
    );

    // Phase conversation sendMessage call
    expect(phaseConversationService.sendMessage).toHaveBeenCalledWith(
      mockProject,
      mockConfig,
      mockPhase,
      "",
      ["file1.txt", "file2.txt"]
    );

    // Empty/NonEmpty transitions
    expect(phaseRepository.nonEmpty).toHaveBeenCalledWith(mockPhase.id);
    expect(phaseRepository.empty).not.toHaveBeenCalled();

    // Status service generation call
    expect(statusService.generate).toHaveBeenCalledWith(
      mockProject,
      mockCycle,
      expect.objectContaining({ id: mockPhase.id, status: "APPROVED" }),
      mockChangeSet
    );
  });

  it("marks the phase as empty when changeSet is null or has 0 chunks", async () => {
    // Similar setups but changeSet is null
    const mockProject = { id: 123 };
    const mockConfig = {
      language: "pt-BR",
      docsRoot: "docs",
      directories: {
        meetingMinutes: "atas-de-reuniao",
        architecturalDecisions: "decisoes-arquiteturais",
        systemMaintenanceSpecifications: "especificacao-manutencao-sistema",
        deliveryLog: "log-entregas",
      },
      fileNames: {
        initialUnderstanding: "entendimento-inicial.md",
        readme: "readme.md",
        currentState: "situacao-atual.md",
        scopeAndVision: "visao-e-escopo.md",
        functionalRequirements: "requisitos-funcionais.md",
        nonFunctionalRequirements: "requisitos-nao-funcionais.md",
        dataModel: "modelo-de-dados.md",
        timeline: "cronograma.md",
      },
    };
    const mockCycle = { id: 456 };
    const mockPhase = { id: 789 };

    const docsRepository = { reconstruct: vi.fn().mockReturnValue({ project: mockProject }) };
    const projectConfigRepository = { getCurrent: vi.fn().mockReturnValue({ content: JSON.stringify(mockConfig) }) };
    const cycleService = { beginInitialization: vi.fn().mockReturnValue({ cycle: mockCycle, phase: mockPhase }) };
    const phaseConversationService = { sendMessage: vi.fn().mockResolvedValue(null) };
    const statusService = { generate: vi.fn().mockReturnValue("empty_report") };
    const phaseRepository = { empty: vi.fn(), nonEmpty: vi.fn(), getById: vi.fn() };
    const cycleArtifactRepository = { insert: vi.fn() };
    const fileSystemRepository = { ensureDirectory: vi.fn(), ensureFile: vi.fn() };

    const initService = new InitService(
      docsRepository as any,
      cycleService as any,
      phaseConversationService as any,
      statusService as any,
      projectConfigRepository as any,
      phaseRepository as any,
      cycleArtifactRepository as any,
      fileSystemRepository as any
    );

    const result = await initService.init("", []);

    expect(result).toBe("empty_report");
    expect(phaseRepository.empty).toHaveBeenCalledWith(mockPhase.id);
    expect(phaseRepository.nonEmpty).not.toHaveBeenCalled();
    expect(cycleArtifactRepository.insert).not.toHaveBeenCalled(); // No prompt supplied
  });
});
