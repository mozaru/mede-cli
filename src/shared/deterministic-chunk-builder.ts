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
  TABELA_ENTREGUES: (b, o) => b.buildEntreguesTableFromProject(o.projectId),
  TABELA_PENDENTES: (b, o) => b.buildPendentesTableFromProject(o.projectId),
  TABELA_NOVOS_CICLO: (b, o) =>
    b.buildNovosCicloTableFromProject(o.projectId, o.previousCurrentStateFilePath),
  TABELA_SITUACAO_ATUAL: (b, o) => b.buildCurrentStateTableFromProject(o.projectId),
  CICLO_CORRENTE: (_, o) => String(o.cycleNumber).padStart(3, "0"),
  DATA_REFERENCIA: (_, o) => o.referenceDate,
  NOME_PROJETO: (_, o) => o.config.projectName ?? "—",
  CLIENTE: (_, o) => o.config.clientName ?? "—",
  FORNECEDOR: (_, o) => o.config.supplierName ?? "—",
};

export function buildDeterministicChunks(
  docAfterLlm: string,
  options: DeterministicChunkBuilderOptions,
  placeholderBuilder: PromptPlaceholderBuilder,
): ChangeChunkEntity[] {
  const blocks = extractPlaceholderBlocks(docAfterLlm);
  const result: ChangeChunkEntity[] = [];
  let nextIndex = options.startChunkIndex;

  for (const block of blocks) {
    const resolver = PLACEHOLDER_REGISTRY[block.name];
    if (!resolver) {
      console.warn(
        `[DeterministicChunkBuilder] Placeholder ${block.name} não registrado — bloco ignorado.`,
      );
      continue;
    }

    const freshContent = resolver(placeholderBuilder, options);
    const diffs = generateDiff(block.innerContent, freshContent);

    for (const diff of diffs) {
      const chunk = new ChangeChunkEntity();
      chunk.index = nextIndex++;
      chunk.status = "AWAITING_APPROVAL";
      chunk.blockLocation = diff.location;
      chunk.changeContent = diff.content;
      result.push(chunk);
    }
  }

  return result;
}
