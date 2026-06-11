const BEGIN_RE = /^<!-- BEGIN-([A-Z0-9_]+) -->$/;
const END_RE = /^<!-- END-([A-Z0-9_]+) -->$/;
// Matches inline blocks: <!-- BEGIN-X -->CONTENT<!-- END-X --> on a single line
const INLINE_RE = /<!-- BEGIN-([A-Z0-9_]+) -->(.*?)<!-- END-\1 -->/g;

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
    const line = lines[i].replace(/\r$/, "");

    // Check for inline blocks first: <!-- BEGIN-X -->CONTENT<!-- END-X --> on one line
    let inlineMatch: RegExpExecArray | null;
    INLINE_RE.lastIndex = 0;
    let hasInline = false;
    while ((inlineMatch = INLINE_RE.exec(line)) !== null) {
      hasInline = true;
      blocks.push({
        name: inlineMatch[1],
        startLine: i,
        endLine: i,
        innerContent: inlineMatch[2],
        innerLineCount: 0,
      });
    }
    if (hasInline) continue;

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
  const inlineRe = (name: string) =>
    new RegExp(`<!-- BEGIN-${name} -->.*?<!-- END-${name} -->`, "g");

  // Process blocks from bottom to top to preserve line positions
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    if (block.innerLineCount === 0 && block.startLine === block.endLine) {
      // Inline block: replace content within the line
      lines[block.startLine] = lines[block.startLine].replace(
        inlineRe(block.name),
        `<!-- BEGIN-${block.name} -->##${block.name}##<!-- END-${block.name} -->`,
      );
    } else {
      // Multi-line block: replace inner lines with a single placeholder line
      lines.splice(block.startLine + 1, block.innerLineCount, `##${block.name}##`);
    }
  }

  return { compressedContent: lines.join("\n"), blocks };
}
