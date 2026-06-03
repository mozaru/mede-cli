import { z } from "zod";
import type { ChunkModel } from "./diff.js";

// Validates the structure of the diff the LLM produced (after parseDiff). A
// malformed hunk header would otherwise silently no-op when applied, hiding the
// fact that the model returned an unusable response. An empty array is valid: it
// means "no changes".

const HUNK_HEADER = /^@@ -\d+(,\d+)? \+\d+(,\d+)? @@/;

const diffChunkSchema = z.object({
  index: z.number().int().positive(),
  offset: z.number().int(),
  location: z
    .string()
    .regex(HUNK_HEADER, "cabeçalho de hunk inválido (esperado '@@ -a,b +c,d @@')"),
  content: z.string(),
});

const diffChunksSchema = z.array(diffChunkSchema);

export function validateDiffChunks(chunks: ChunkModel[]): ChunkModel[] {
  const result = diffChunksSchema.safeParse(chunks);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const chunkIndex = typeof issue.path[0] === "number" ? issue.path[0] : "?";
        const field = issue.path.slice(1).join(".");
        const where = field ? `chunk #${chunkIndex}.${field}` : `chunk #${chunkIndex}`;
        return `  - ${where}: ${issue.message}`;
      })
      .join("\n");

    throw new Error(`Resposta da LLM com diff malformado:\n${issues}`);
  }

  return chunks;
}
