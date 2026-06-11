import * as Diff from "diff";

interface ChunkModel {
  index: number;
  offset: number;
  location: string; // Ex: "@@ -1,3 +1,4 @@"
  content: string;
}

interface ChunkApplyModel {
  removedCount: number;
  addedCount: number;
  currentLine: number;
  newContent: string;
}

type DiffFunction = (contentOld: string, contentNew: string) => Array<ChunkModel>;
type ApplyFunction = (content: string, chunk: ChunkModel) => ChunkApplyModel;

function cleanHunkLines(lines: string[]): string[] {
  const validLines: string[] = [];
  for (const line of lines) {
    if (
      line === "" ||
      line.startsWith("+") ||
      line.startsWith("-") ||
      line.startsWith(" ") ||
      line.startsWith("\\")
    ) {
      validLines.push(line);
    } else {
      break;
    }
  }
  while (validLines.length > 0 && validLines[validLines.length - 1] === "") {
    validLines.pop();
  }
  return validLines;
}

const HUNK_HEADER_RE = /@@ -\d+(,\d+)? \+\d+(,\d+)? @@/;

function parseDiff(value: string): Array<ChunkModel> {
  const resp: Array<ChunkModel> = [];

  // Split on lines that start with "@@" (handles both "@@...@@\n" and bare "@@\n")
  const parts = value.split(/(?=^@@)/m);
  let currentIndex = 0;

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart.startsWith("@@")) continue;

    const lines = trimmedPart.split(/\r?\n/);
    let location = lines[0].trim();
    const rawContentLines = lines.slice(1);
    const cleanContentLines = cleanHunkLines(rawContentLines);
    const content = cleanContentLines.join("\n");

    // Normalize bare "@@" (LLM omitted the range, e.g. just "@@" on its own line).
    // Only do this for exactly "@@" — headers like "@@ BAD @@" are kept as-is so that
    // validateDiffChunks can detect them as malformed and trigger a retry.
    if (!HUNK_HEADER_RE.test(location) && location === "@@") {
      const addedCount = cleanContentLines.filter((l) => l.startsWith("+")).length;
      location = `@@ -0,0 +1,${addedCount} @@`;
    }

    if (content.trim()) {
      resp.push({ index: ++currentIndex, offset: 0, location, content });
    }
  }

  // Fallback: no @@ headers at all — try to extract content from --- / +++ blocks
  // (handles diffs where the LLM emitted --- / +++ but forgot the @@ hunk header entirely)
  if (resp.length === 0) {
    const lines = value.split(/\r?\n/);
    const rawContentLines: string[] = [];
    let inContent = false;

    for (const line of lines) {
      if (
        line === "---" ||
        line.startsWith("--- ") ||
        line === "+++" ||
        line.startsWith("+++ ")
      ) {
        inContent = true;
        continue;
      }
      if (inContent) {
        rawContentLines.push(line);
      }
    }

    const cleanedLines = cleanHunkLines(rawContentLines);
    if (cleanedLines.length > 0) {
      const addedCount = cleanedLines.filter((l) => l.startsWith("+")).length;
      resp.push({
        index: 1,
        offset: 0,
        location: `@@ -0,0 +1,${addedCount} @@`,
        content: cleanedLines.join("\n"),
      });
    }
  }

  return resp;
}

function generateDiff(contentOld: string, contentNew: string): Array<ChunkModel> {
  const patchString = Diff.createPatch("memoria", contentOld, contentNew);

  const parsedDiff = Diff.parsePatch(patchString);
  const chunks: Array<ChunkModel> = [];

  if (parsedDiff.length > 0 && parsedDiff[0].hunks) {
    parsedDiff[0].hunks.forEach((hunk, idx) => {
      chunks.push({
        index: idx,
        offset: 0,
        location: `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`,
        content: hunk.lines.join("\n"),
      });
    });
  }

  return chunks;
}

function applyDiff(content: string, chunk: ChunkModel): ChunkApplyModel {
  const match = chunk.location.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
  if (!match) {
    console.error("Formato de location inválido:", chunk.location);
    return {
      removedCount: 0,
      addedCount: 0,
      currentLine: 0,
      newContent: content,
    };
  }

  const startOld = parseInt(match[1]) + chunk.offset;
  const startNew = parseInt(match[2]) + chunk.offset;

  // 2. Recalcular a contagem real baseada no conteúdo fornecido pela IA
  const lines = chunk.content.split("\n");
  const removedCount = lines.filter((l) => l.startsWith("-") || l.startsWith(" ")).length;
  const addedCount = lines.filter((l) => l.startsWith("+") || l.startsWith(" ")).length;

  // 3. Montar o novo cabeçalho corrigido
  const correctedLocation = `@@ -${startOld},${removedCount} +${startNew},${addedCount} @@`;

  const header = `Index: file.txt\n===\n--- file.txt\n+++ file.txt\n`;
  const patchToApply = header + correctedLocation + "\n" + chunk.content + "\n";
  const result = Diff.applyPatch(content, patchToApply);

  return {
    removedCount,
    addedCount,
    currentLine: startOld,
    newContent: typeof result === "string" ? result : content,
  };
}

export { ApplyFunction, DiffFunction, ChunkModel, generateDiff, applyDiff, parseDiff };
