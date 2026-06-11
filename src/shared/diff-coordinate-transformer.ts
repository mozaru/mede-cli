import type { PlaceholderBlock } from "./placeholder-block-extractor.js";

export interface CompressionMapBlock {
  name: string;
  startLineCompressed: number;
  endLineCompressed: number;
  /** innerLineCount - 1; how many fewer lines the compressed doc has vs original in this block area */
  shrinkage: number;
}

export interface CompressionMap {
  blocks: CompressionMapBlock[];
}

interface ChunkModel {
  index: number;
  offset: number;
  location: string;
  content: string;
}

const HUNK_RE = /@@ -(\d+)((?:,\d+)?) \+(\d+)((?:,\d+)?) @@/;

/** Builds a CompressionMap from the PlaceholderBlocks returned by extractPlaceholderBlocks. */
export function buildCompressionMap(blocks: PlaceholderBlock[]): CompressionMap {
  let accumulatedShrinkage = 0;
  return {
    blocks: blocks.map((block) => {
      const shrinkage = Math.max(0, block.innerLineCount - 1);
      const startLineCompressed = block.startLine - accumulatedShrinkage;
      const endLineCompressed = block.endLine - accumulatedShrinkage - shrinkage;
      accumulatedShrinkage += shrinkage;
      return { name: block.name, startLineCompressed, endLineCompressed, shrinkage };
    }),
  };
}

/**
 * Transforms diff hunk line-numbers from compressed-document space back to
 * original-document space.  For each hunk at line L (1-indexed), the offset
 * equals the sum of shrinkages of all blocks whose BEGIN marker appears before
 * that line in the compressed document.
 */
export function transformDiffCoordinates(
  chunks: ChunkModel[],
  compressionMap: CompressionMap,
): ChunkModel[] {
  if (compressionMap.blocks.length === 0) return chunks;

  return chunks.map((chunk) => {
    const match = HUNK_RE.exec(chunk.location);
    if (!match) return chunk;

    const oldStart = Number(match[1]); // 1-indexed, old-file (compressed) start line
    const newStart = Number(match[2]); // groups[2..4] are comma-count and new start/count
    const oldCount = match[2]; // e.g. ",3"
    const newCount = match[4]; // e.g. ",4"
    const newStartNum = Number(match[3]);

    let lineOffset = 0;
    for (const block of compressionMap.blocks) {
      // block.startLineCompressed is 0-indexed; oldStart is 1-indexed
      if (block.startLineCompressed + 1 < oldStart) {
        lineOffset += block.shrinkage;
      }
    }

    const newLocation = `@@ -${oldStart + lineOffset}${oldCount} +${newStartNum + lineOffset}${newCount} @@`;
    return { ...chunk, location: newLocation };
  });
}
