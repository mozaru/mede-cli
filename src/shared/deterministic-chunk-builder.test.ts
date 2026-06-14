import { describe, it, expect, vi } from "vitest";
import { buildDeterministicChunks } from "./deterministic-chunk-builder.js";
import type { DeterministicChunkBuilderOptions } from "./deterministic-chunk-builder.js";
import type { PromptPlaceholderBuilder } from "./prompt-place-holder-builder.js";
import type { MedeConfigModelEntity } from "../domain/entities/mede-config-model-entity.js";

const DEFAULT_OPTS: DeterministicChunkBuilderOptions = {
  projectId: 1,
  config: { projectName: "Proj", clientName: "CLI", supplierName: "SUP" } as MedeConfigModelEntity,
  cycleNumber: 3,
  referenceDate: "2026-06-11",
  previousCurrentStateFilePath: "situacao-atual.md",
  startChunkIndex: 5,
};

function makeBuilder(
  overrides: Partial<Record<keyof PromptPlaceholderBuilder, unknown>> = {},
): PromptPlaceholderBuilder {
  return {
    buildEntreguesTableFromProject: vi.fn(() => "| ID | Nome |\n| --- | --- |\n| 001 | Item |"),
    buildPendentesTableFromProject: vi.fn(
      () => "| ID | Status |\n| --- | --- |\n| 002 | Pendente |",
    ),
    buildNovosCicloTableFromProject: vi.fn(() => "| ID | Nome |\n| --- | --- |"),
    buildCurrentStateTableFromProject: vi.fn(() => "| ID | Desc |\n| --- | --- |"),
    buildInitialBacklogTableFromProject: vi.fn(() => "| ID | Inicial |\n| --- | --- |"),
    ...overrides,
  } as unknown as PromptPlaceholderBuilder;
}

describe("buildDeterministicChunks", () => {
  it("returns empty array when document has no blocks", () => {
    const doc = "# Documento sem blocos";
    const result = buildDeterministicChunks(doc, DEFAULT_OPTS, makeBuilder());
    expect(result).toHaveLength(0);
  });

  it("returns empty array when block's placeholder is not in registry", () => {
    const doc = [
      "<!-- BEGIN-UNKNOWN_PLACEHOLDER -->",
      "conteudo antigo",
      "<!-- END-UNKNOWN_PLACEHOLDER -->",
    ].join("\n");

    const result = buildDeterministicChunks(doc, DEFAULT_OPTS, makeBuilder());
    expect(result).toHaveLength(0);
  });

  it("generates a chunk when block content differs from fresh content", () => {
    const doc = [
      "<!-- BEGIN-TABELA_ENTREGUES -->",
      "conteudo antigo diferente",
      "<!-- END-TABELA_ENTREGUES -->",
    ].join("\n");

    const result = buildDeterministicChunks(doc, DEFAULT_OPTS, makeBuilder());

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].status).toBe("AWAITING_APPROVAL");
    expect(result[0].index).toBe(DEFAULT_OPTS.startChunkIndex);
  });

  it("generates no chunk when block content is already identical to fresh content", () => {
    const freshTable = "| ID | Nome |\n| --- | --- |\n| 001 | Item |";
    const doc = [
      "<!-- BEGIN-TABELA_ENTREGUES -->",
      freshTable,
      "<!-- END-TABELA_ENTREGUES -->",
    ].join("\n");

    const result = buildDeterministicChunks(doc, DEFAULT_OPTS, makeBuilder());
    expect(result).toHaveLength(0);
  });

  it("assigns continuous indices starting from startChunkIndex", () => {
    // Use two blocks with different content so both generate chunks
    const doc = [
      "<!-- BEGIN-TABELA_ENTREGUES -->",
      "old entregues content that is clearly different",
      "<!-- END-TABELA_ENTREGUES -->",
      "Texto meio",
      "<!-- BEGIN-TABELA_PENDENTES -->",
      "old pendentes content that is clearly different too",
      "<!-- END-TABELA_PENDENTES -->",
    ].join("\n");

    const result = buildDeterministicChunks(doc, DEFAULT_OPTS, makeBuilder());

    const indices = result.map((c) => c.index);
    expect(indices[0]).toBe(DEFAULT_OPTS.startChunkIndex);
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBe(indices[i - 1] + 1);
    }
  });

  it("resolves CICLO_CORRENTE from options without calling the builder", () => {
    const doc = ["<!-- BEGIN-CICLO_CORRENTE -->", "000", "<!-- END-CICLO_CORRENTE -->"].join("\n");

    const builder = makeBuilder();
    const result = buildDeterministicChunks(doc, { ...DEFAULT_OPTS, cycleNumber: 7 }, builder);

    // "000" → "007": should generate a diff chunk
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].changeContent).toContain("007");
  });

  it("resolves NOME_PROJETO, CLIENTE, FORNECEDOR from config", () => {
    const doc = ["<!-- BEGIN-NOME_PROJETO -->", "old name", "<!-- END-NOME_PROJETO -->"].join("\n");

    const opts = {
      ...DEFAULT_OPTS,
      config: { projectName: "Sistema Novo" } as MedeConfigModelEntity,
    };

    const result = buildDeterministicChunks(doc, opts, makeBuilder());
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].changeContent).toContain("Sistema Novo");
  });

  it("offsets block location by block start line", () => {
    const doc = [
      "Line 0",
      "Line 1",
      "Line 2",
      "<!-- BEGIN-NOME_PROJETO -->",
      "old name",
      "<!-- END-NOME_PROJETO -->",
    ].join("\n");

    const opts = {
      ...DEFAULT_OPTS,
      config: { projectName: "Sistema Novo" } as MedeConfigModelEntity,
    };

    const result = buildDeterministicChunks(doc, opts, makeBuilder());
    expect(result).toHaveLength(1);
    // block.startLine is 3 (0-indexed). So offsetLine is 4.
    // oldStart in hunk is 1, so transformed should be 1 + 4 = 5.
    expect(result[0].blockLocation).toContain("@@ -5,1 +5,1 @@");
  });

  it("resolves TABELA_BACKLOG_INICIAL using buildInitialBacklogTableFromProject", () => {
    const doc = [
      "<!-- BEGIN-TABELA_BACKLOG_INICIAL -->",
      "old content",
      "<!-- END-TABELA_BACKLOG_INICIAL -->",
    ].join("\n");

    const result = buildDeterministicChunks(doc, DEFAULT_OPTS, makeBuilder());
    expect(result).toHaveLength(1);
    expect(result[0].changeContent).toContain("Inicial");
  });

  it("resolves inline blocks by replacing the entire line content instead of inserting lines", () => {
    const doc = ["Cliente: <!-- BEGIN-CLIENTE --><!-- END-CLIENTE -->"].join("\n");

    const opts = {
      ...DEFAULT_OPTS,
      config: { clientName: "11Tech" } as MedeConfigModelEntity,
    };

    const result = buildDeterministicChunks(doc, opts, makeBuilder());
    expect(result).toHaveLength(1);
    expect(result[0].blockLocation).toBe("@@ -1,1 +1,1 @@");
    expect(result[0].changeContent).toContain(
      "Cliente: <!-- BEGIN-CLIENTE -->11Tech<!-- END-CLIENTE -->",
    );
  });
});
