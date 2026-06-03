import { describe, it, expect, vi } from "vitest";
import { ProjectReconstructionService } from "./project-reconstruction-service.js";
import type { IProjectRepository } from "../../domain/interfaces/repositories/project-repository-interface.js";
import type { IProjectConfigRepository } from "../../domain/interfaces/repositories/project-config-repository-interface.js";
import type { IBacklogRepository } from "../../domain/interfaces/repositories/backlog-repository-interface.js";
import type { IBacklogInterventionCountersRepository } from "../../domain/interfaces/repositories/backlog-intervention-counters-repository-interface.js";
import type { IFileSystemRepository } from "../../domain/interfaces/repositories/file-system-repository-interface.js";
import { ProjectEntity } from "../../domain/entities/project-entity.js";
import { ProjectConfigEntity } from "../../domain/entities/project-config-entity.js";
import { BacklogEntity } from "../../domain/entities/backlog-entity.js";
import { BacklogInterventionCountersEntity } from "../../domain/entities/backlog-intervention-counters-entity.js";

const DEFAULT_CONFIG = `{
  "docsRoot": ".mede",
  "language": "pt-BR",
  "fileNames": {
    "readme": "README.md",
    "initialUnderstanding": "entendimento-inicial.md",
    "currentState": "situacao-atual.md"
  }
}`;

const MOCK_README = `# Meu Projeto`;

const MOCK_INITIAL_UNDERSTANDING = `# Entendimento Inicial
**Sistema:** TesteReconstrucao
**Objetivo:** Reconstruir estado do backlog.

## Backlog Inicial
| ID | Tipo | Nome | Origem | Status Inicial |
| --- | --- | --- | --- | --- |
| DEI-0001 | BLI | Item Um | Reunião | Pendente |
`;

const MOCK_CURRENT_STATE = `# Situação Atual
**Sistema:** TesteReconstrucao
**Data de referência:** 2026-02-01

| ID | Descrição | Tags | Ata | Origem | Entrega | Status |
| --- | --- | --- | --- | --- | --- | --- |
| DEI-20260201-RF-BLI-0001 | Item Um Atualizado | SEC | ata-1 | reunião | | Concluído |
`;

describe("ProjectReconstructionService", () => {
  it("reconstructs project from initial understanding when no current state is found", () => {
    // Setup fakes & mocks
    const mockProjectRepo = {
      list: () => [] as ProjectEntity[],
      insert: (p: ProjectEntity) => ({ ...p, id: 10 }),
      update: (p: ProjectEntity) => p,
    } as unknown as IProjectRepository;

    const mockConfigRepo = {
      getCurrent: () => null as unknown as ProjectConfigEntity,
      insert: (c: ProjectConfigEntity) => c,
    } as unknown as IProjectConfigRepository;

    const insertedBacklog: BacklogEntity[] = [];
    const mockBacklogRepo = {
      deleteFromProject: vi.fn(),
      insert: (b: BacklogEntity) => {
        insertedBacklog.push(b);
        return b;
      },
    } as unknown as IBacklogRepository;

    const insertedCounters: BacklogInterventionCountersEntity[] = [];
    const mockCountersRepo = {
      deleteFromProject: vi.fn(),
      insert: (c: BacklogInterventionCountersEntity) => {
        insertedCounters.push(c);
        return c;
      },
    } as unknown as IBacklogInterventionCountersRepository;

    const mockFs = {
      exists: (filePath: string) => {
        if (filePath.endsWith("mede.config.json")) return true;
        if (filePath.endsWith("README.md")) return true;
        if (filePath.endsWith("entendimento-inicial.md")) return true;
        if (filePath.endsWith("situacao-atual.md")) return false; // Current state missing
        return false;
      },
      readFile: (filePath: string) => {
        if (filePath.endsWith("mede.config.json")) return DEFAULT_CONFIG;
        if (filePath.endsWith("README.md")) return MOCK_README;
        if (filePath.endsWith("entendimento-inicial.md")) return MOCK_INITIAL_UNDERSTANDING;
        return "";
      },
      readJsonFile: (filePath: string) => {
        if (filePath.endsWith("mede.config.json")) return JSON.parse(DEFAULT_CONFIG);
        return null;
      },
    } as unknown as IFileSystemRepository;

    const service = new ProjectReconstructionService(
      mockConfigRepo,
      mockProjectRepo,
      mockBacklogRepo,
      mockCountersRepo,
      undefined,
      undefined,
      "D:/project-root",
      mockFs,
    );

    const result = service.reconstruct();

    expect(result.projectCreated).toBe(true);
    expect(result.project.id).toBe(10);
    expect(result.project.name).toBe("TesteReconstrucao"); // derived from Initial Understanding
    expect(result.initialUnderstandingFound).toBe(true);
    expect(result.currentStateFound).toBe(false);

    expect(mockBacklogRepo.deleteFromProject).toHaveBeenCalledWith(10);
    expect(insertedBacklog).toHaveLength(1);
    expect(insertedBacklog[0].immutableId).toBe("DEI-0001");
    expect(insertedBacklog[0].description).toBe("Item Um");
    expect(insertedBacklog[0].projectId).toBe(10);
  });

  it("reconstructs and overrides backlog from current state when found", () => {
    // Setup fakes & mocks
    const mockProjectRepo = {
      list: () => [{ id: 10, name: "Antigo", rootProjectPath: "D:/project-root" }] as ProjectEntity[],
      update: (p: ProjectEntity) => p,
    } as unknown as IProjectRepository;

    const mockConfigRepo = {
      getCurrent: () => ({ id: 5, projectId: 10, content: "{}" }) as ProjectConfigEntity,
      updateContent: vi.fn(),
      getById: (id: number) => ({ id, projectId: 10 } as ProjectConfigEntity),
    } as unknown as IProjectConfigRepository;

    const insertedBacklog: BacklogEntity[] = [];
    const mockBacklogRepo = {
      deleteFromProject: vi.fn(),
      insert: (b: BacklogEntity) => {
        insertedBacklog.push(b);
        return b;
      },
    } as unknown as IBacklogRepository;

    const insertedCounters: BacklogInterventionCountersEntity[] = [];
    const mockCountersRepo = {
      deleteFromProject: vi.fn(),
      insert: (c: BacklogInterventionCountersEntity) => {
        insertedCounters.push(c);
        return c;
      },
    } as unknown as IBacklogInterventionCountersRepository;

    const mockFs = {
      exists: (filePath: string) => {
        if (filePath.endsWith("mede.config.json")) return true;
        if (filePath.endsWith("README.md")) return true;
        if (filePath.endsWith("entendimento-inicial.md")) return true;
        if (filePath.endsWith("situacao-atual.md")) return true; // Current state found!
        return false;
      },
      readFile: (filePath: string) => {
        if (filePath.endsWith("mede.config.json")) return DEFAULT_CONFIG;
        if (filePath.endsWith("README.md")) return MOCK_README;
        if (filePath.endsWith("entendimento-inicial.md")) return MOCK_INITIAL_UNDERSTANDING;
        if (filePath.endsWith("situacao-atual.md")) return MOCK_CURRENT_STATE;
        return "";
      },
      readJsonFile: (filePath: string) => {
        if (filePath.endsWith("mede.config.json")) return JSON.parse(DEFAULT_CONFIG);
        return null;
      },
    } as unknown as IFileSystemRepository;

    const service = new ProjectReconstructionService(
      mockConfigRepo,
      mockProjectRepo,
      mockBacklogRepo,
      mockCountersRepo,
      undefined,
      undefined,
      "D:/project-root",
      mockFs,
    );

    const result = service.reconstruct();

    expect(result.projectCreated).toBe(false);
    expect(result.initialUnderstandingFound).toBe(true);
    expect(result.currentStateFound).toBe(true);
    expect(result.project.name).toBe("TesteReconstrucao");

    // Replaced by current state items
    expect(insertedBacklog).toHaveLength(1);
    expect(insertedBacklog[0].immutableId).toBe("DEI-20260201-RF-BLI-0001");
    expect(insertedBacklog[0].description).toBe("Item Um Atualizado");

    // Verification of classification counters (from DEI-20260201-RF-BLI-0001 -> DEI-RF-BLI -> 1)
    expect(insertedCounters).toHaveLength(1);
    expect(insertedCounters[0].name).toBe("DEI-RF-BLI");
    expect(insertedCounters[0].lastNumber).toBe(1);
  });
});
