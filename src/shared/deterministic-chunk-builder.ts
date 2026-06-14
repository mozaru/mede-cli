import { generateDiff } from "./diff.js";
import { extractPlaceholderBlocks } from "./placeholder-block-extractor.js";
import type { PromptPlaceholderBuilder } from "./prompt-place-holder-builder.js";
import type { MedeConfigModelEntity } from "../domain/entities/mede-config-model-entity.js";
import { ChangeChunkEntity } from "../domain/entities/change-chunk-entity.js";

export interface DeterministicChunkBuilderOptions {
  projectId: number;
  config: MedeConfigModelEntity;
  cycleNumber: number;
  referenceDate: string;
  previousCurrentStateFilePath: string;
  startChunkIndex: number;
}

type PlaceholderResolver = (
  builder: PromptPlaceholderBuilder,
  opts: DeterministicChunkBuilderOptions,
) => string;

const PLACEHOLDER_REGISTRY: Record<string, PlaceholderResolver> = {
  TABELA_ENTREGUES: (b, o) =>
    b.buildEntreguesTableFromProject(o.projectId, o.previousCurrentStateFilePath),
  TABELA_PENDENTES: (b, o) => b.buildPendentesTableFromProject(o.projectId),
  TABELA_NOVOS_CICLO: (b, o) =>
    b.buildNovosCicloTableFromProject(o.projectId, o.previousCurrentStateFilePath),
  TABELA_SITUACAO_ATUAL: (b, o) => b.buildCurrentStateTableFromProject(o.projectId),
  TABELA_BACKLOG_INICIAL: (b, o) => b.buildInitialBacklogTableFromProject(o.projectId),
  TOTAL_ENTREGUES: (b, o) => b.buildTotalEntreguesFromProject(o.projectId),
  TOTAL_PENDENTES: (b, o) => b.buildTotalPendentesFromProject(o.projectId),
  TOTAL_ENTREGUES_CICLO: (b, o) =>
    b.buildTotalEntreguesCicloFromProject(o.projectId, o.previousCurrentStateFilePath),
  NOVOS_CICLO: (b, o) =>
    b.buildNovosCicloCountFromProject(o.projectId, o.previousCurrentStateFilePath),
  PERCENTUAL_ENTREGA: (b, o) => b.buildPercentualEntregaFromProject(o.projectId),
  CICLO_CORRENTE: (_, o) => String(o.cycleNumber).padStart(3, "0"),
  DATA_REFERENCIA: (_, o) => o.referenceDate,
  NOME_PROJETO: (_, o) => o.config.projectName ?? "—",
  CLIENTE: (_, o) => o.config.clientName ?? "—",
  FORNECEDOR: (_, o) => o.config.supplierName ?? "—",
};

function offsetHunkLocation(location: string, offsetLine: number): string {
  const match = /@@ -(\d+)((?:,\d+)?) \+(\d+)((?:,\d+)?) @@/.exec(location);
  if (!match) return location;
  const oldStart = Number(match[1]) + offsetLine;
  const oldCount = match[2];
  const newStart = Number(match[3]) + offsetLine;
  const newCount = match[4];
  return `@@ -${oldStart}${oldCount} +${newStart}${newCount} @@`;
}

export function buildDeterministicChunks(
  docAfterLlm: string,
  options: DeterministicChunkBuilderOptions,
  placeholderBuilder: PromptPlaceholderBuilder,
): ChangeChunkEntity[] {
  const blocks = extractPlaceholderBlocks(docAfterLlm);
  const result: ChangeChunkEntity[] = [];
  let nextIndex = options.startChunkIndex;
  const lines = docAfterLlm.split(/\r?\n/);

  for (const block of blocks) {
    const resolver = PLACEHOLDER_REGISTRY[block.name];
    if (!resolver) {
      console.warn(
        `[DeterministicChunkBuilder] Placeholder ${block.name} não registrado — bloco ignorado.`,
      );
      continue;
    }

    const freshContent = resolver(placeholderBuilder, options);
    let diffs;
    let offsetLine;

    if (block.startLine === block.endLine) {
      const oldLine = lines[block.startLine];
      const inlineRe = new RegExp(`<!-- BEGIN-${block.name} -->.*?<!-- END-${block.name} -->`, "g");
      const newLine = oldLine.replace(
        inlineRe,
        `<!-- BEGIN-${block.name} -->${freshContent}<!-- END-${block.name} -->`,
      );
      diffs = generateDiff(oldLine, newLine);
      offsetLine = block.startLine;
    } else {
      diffs = generateDiff(block.innerContent, freshContent);
      offsetLine = block.startLine + 1;
    }

    for (const diff of diffs) {
      const chunk = new ChangeChunkEntity();
      chunk.index = nextIndex++;
      chunk.status = "AWAITING_APPROVAL";
      chunk.blockLocation = offsetHunkLocation(diff.location, offsetLine);
      chunk.changeContent = diff.content;
      result.push(chunk);
    }
  }

  return result;
}

export function buildDeterministicContent(
  docAfterLlm: string,
  options: DeterministicChunkBuilderOptions,
  placeholderBuilder: PromptPlaceholderBuilder,
): string {
  const blocks = extractPlaceholderBlocks(docAfterLlm);
  if (blocks.length === 0) {
    return docAfterLlm;
  }

  const lines = docAfterLlm.split(/\r?\n/);

  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    const resolver = PLACEHOLDER_REGISTRY[block.name];
    if (!resolver) {
      continue;
    }

    const freshContent = resolver(placeholderBuilder, options);

    if (block.startLine === block.endLine) {
      const inlineRe = new RegExp(`<!-- BEGIN-${block.name} -->.*?<!-- END-${block.name} -->`, "g");
      lines[block.startLine] = lines[block.startLine].replace(
        inlineRe,
        `<!-- BEGIN-${block.name} -->${freshContent}<!-- END-${block.name} -->`,
      );
    } else {
      lines.splice(block.startLine + 1, block.innerLineCount, ...freshContent.split("\n"));
    }
  }

  return lines.join("\n");
}
