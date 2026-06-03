import { describe, it, expect } from "vitest";
import { PromptPlaceholderBuilder } from "./prompt-place-holder-builder.js";
import { CurrentStateParser } from "./current-state-parser.js";
import type { IBacklogRepository } from "../domain/interfaces/repositories/backlog-repository-interface.js";
import type { IFileSystemRepository } from "../domain/interfaces/repositories/file-system-repository-interface.js";
import { BacklogEntity } from "../domain/entities/backlog-entity.js";

const PREVIOUS_SITUACAO_ATUAL = `# Situação Atual
**Sistema:** TestSystem
**Data de referência:** 2026-01-01

| ID | Descrição | Tags | Ata | Origem | Entrega | Status |
| --- | --- | --- | --- | --- | --- | --- |
| DEI-20260101-RF-BLI-0001 | Item Um | SEC | ata-1 | origem-1 | | Pendente |
| DEI-20260101-RF-BLI-0002 | Item Dois | | ata-1 | origem-1 | | Pendente |
`;

describe("PromptPlaceholderBuilder", () => {
  it("builds the statistics correctly", () => {
    const mockBacklogRepo = {
      list: () => [
        { status: "Concluído" },
        { status: "Pendente" },
        { status: "Cancelado" },
      ] as BacklogEntity[],
    } as unknown as IBacklogRepository;

    const builder = new PromptPlaceholderBuilder(mockBacklogRepo);
    const stats = builder.buildDeliveryStatisticsFromProject(1);

    expect(stats).toContain("Total itens entregues: **1**");
    expect(stats).toContain("Total itens pendentes: **1**");
    expect(stats).toContain("Percentual de entrega: **50,0%**");
  });

  it("builds the intervention table for ESM document types only", () => {
    const mockBacklogRepo = {
      list: () => [
        {
          immutableId: "ESM-20260101-RF-BLI-0001",
          documentType: "ESM",
          nature: "RF",
          interventionType: "BLI",
          description: "Criar endpoint",
          source: "ata-1",
          deliver: "doc-1",
          status: "Pendente",
        },
        {
          immutableId: "DEI-20260101-RF-BLI-0002",
          documentType: "DEI",
          nature: "RF",
          interventionType: "BLI",
          description: "Ignorar este no ESM",
          source: "ata-1",
          deliver: "doc-1",
          status: "Pendente",
        },
      ] as BacklogEntity[],
    } as unknown as IBacklogRepository;

    const builder = new PromptPlaceholderBuilder(mockBacklogRepo);
    const table = builder.buildInterventionTableFromProject(1);

    expect(table).toContain("ESM-20260101-RF-BLI-0001");
    expect(table).not.toContain("DEI-20260101-RF-BLI-0002");
  });

  it("builds recent backlog table identifying new, changed, and completed items", () => {
    const currentItems = [
      {
        immutableId: "DEI-20260101-RF-BLI-0001",
        documentType: "DEI",
        nature: "RF",
        interventionType: "BLI",
        description: "Item Um Modificado", // Changed description
        source: "origem-1",
        deliver: "evidencia-1",
        status: "Concluído", // Changed status to completed
        updatedAt: "2026-01-02T12:00:00Z",
      },
      {
        immutableId: "DEI-20260101-RF-BLI-0002",
        documentType: "DEI",
        nature: "RF",
        interventionType: "BLI",
        description: "Item Dois", // Unchanged
        source: "origem-1",
        deliver: "",
        status: "Pendente",
        updatedAt: "2026-01-01T00:00:00Z",
      },
      {
        immutableId: "DEI-20260102-RF-BLI-0003",
        documentType: "DEI",
        nature: "RF",
        interventionType: "BLI",
        description: "Item Novo", // New item
        source: "origem-2",
        deliver: "",
        status: "Pendente",
        updatedAt: "2026-01-02T12:00:00Z",
      },
    ] as BacklogEntity[];

    const mockBacklogRepo = {
      list: () => currentItems,
    } as unknown as IBacklogRepository;

    const fakeFs = {
      readFile: () => PREVIOUS_SITUACAO_ATUAL,
    } as unknown as IFileSystemRepository;
    const parser = new CurrentStateParser(fakeFs);

    const builder = new PromptPlaceholderBuilder(mockBacklogRepo, parser);
    const table = builder.buildRecentBacklogTableFromProject(1, "situacao-atual.md");

    // Item 1 changed and was completed
    expect(table).toContain("DEI-20260101-RF-BLI-0001");
    expect(table).toContain("Sim"); // New or completed? Check table columns

    // Item 3 is new
    expect(table).toContain("DEI-20260102-RF-BLI-0003");

    // Item 2 is unchanged, should NOT be in the recent backlog table
    expect(table).not.toContain("DEI-20260101-RF-BLI-0002");
  });

  it("replaces all placeholders in a template string", () => {
    const mockBacklogRepo = {
      list: () => [] as BacklogEntity[],
    } as unknown as IBacklogRepository;

    const builder = new PromptPlaceholderBuilder(mockBacklogRepo);
    const result = builder.replacePlaceholders("Test: ##TABELA_ESTATISTICA_ENTREGA##", {
      "##TABELA_ESTATISTICA_ENTREGA##": "StatsHere",
    });

    expect(result).toBe("Test: StatsHere");
  });
});
