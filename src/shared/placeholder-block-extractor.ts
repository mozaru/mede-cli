const BEGIN_RE = /^<!-- BEGIN-([A-Z0-9_]+) -->$/;
const END_RE = /^<!-- END-([A-Z0-9_]+) -->$/;

export interface PlaceholderBlock {
  name: string;
  startLine: number;
  endLine: number;
  innerContent: string;
  innerLineCount: number;
}

export interface CompressionResult {
  compressedContent: string;
  blocks: PlaceholderBlock[];
}

export function extractPlaceholderBlocks(content: string): PlaceholderBlock[] {
  const lines = content.split("\n");
  const blocks: PlaceholderBlock[] = [];
  const openStack: { name: string; startLine: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const beginMatch = BEGIN_RE.exec(line);
    if (beginMatch) {
      const name = beginMatch[1];
      if (openStack.some((s) => s.name === name)) {
        throw new Error(`Bloco BEGIN-${name} aninhado encontrado na linha ${i}`);
      }
      openStack.push({ name, startLine: i });
      continue;
    }

    const endMatch = END_RE.exec(line);
    if (endMatch) {
      const name = endMatch[1];
      const openIndex = openStack.findIndex((s) => s.name === name);
      if (openIndex === -1) {
        throw new Error(`END-${name} sem BEGIN correspondente na linha ${i}`);
      }
      const { startLine } = openStack.splice(openIndex, 1)[0];
      const endLine = i;
      const innerLines = lines.slice(startLine + 1, endLine);
      blocks.push({
        name,
        startLine,
        endLine,
        innerContent: innerLines.join("\n"),
        innerLineCount: innerLines.length,
      });
    }
  }

  if (openStack.length > 0) {
    const unclosed = openStack.map((s) => `BEGIN-${s.name}`).join(", ");
    throw new Error(`Bloco(s) sem END correspondente: ${unclosed}`);
  }

  return blocks.sort((a, b) => a.startLine - b.startLine);
}

export function compressDocument(content: string): CompressionResult {
  const blocks = extractPlaceholderBlocks(content);
  if (blocks.length === 0) {
    return { compressedContent: content, blocks };
  }

  const lines = content.split("\n");

  // Process blocks from bottom to top to preserve line positions
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    // Replace inner lines (startLine+1 .. endLine-1) with a single placeholder line
    lines.splice(block.startLine + 1, block.innerLineCount, `##${block.name}##`);
  }

  return { compressedContent: lines.join("\n"), blocks };
}
