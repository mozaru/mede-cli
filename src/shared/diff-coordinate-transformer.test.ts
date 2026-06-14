import { describe, it, expect } from "vitest";
import { buildCompressionMap, transformDiffCoordinates } from "./diff-coordinate-transformer.js";
import type { PlaceholderBlock } from "./placeholder-block-extractor.js";

function chunk(location: string): {
  index: number;
  offset: number;
  location: string;
  content: string;
} {
  return { index: 1, offset: 0, location, content: "+new line" };
}

function block(
  name: string,
  startLine: number,
  endLine: number,
  innerLineCount: number,
): PlaceholderBlock {
  const lines = Array.from({ length: innerLineCount }, (_, i) => `inner${i + 1}`);
  return { name, startLine, endLine, innerContent: lines.join("\n"), innerLineCount };
}

describe("buildCompressionMap", () => {
  it("returns empty map for no blocks", () => {
    const map = buildCompressionMap([]);
    expect(map.blocks).toHaveLength(0);
  });

  it("single block: startLineCompressed equals startLine (no prior shrinkage)", () => {
    // Block A: lines 1-4 (0-indexed), innerLineCount = 2 → shrinkage = 1
    const [b] = buildCompressionMap([block("A", 1, 4, 2)]).blocks;
    expect(b.startLineCompressed).toBe(1);
    expect(b.shrinkage).toBe(1);
    // End: endLine=4, accumulated shrinkage=1, endLineCompressed = 4-0-1 = 3
    expect(b.endLineCompressed).toBe(3);
  });

  it("second block startLineCompressed accounts for first block's shrinkage", () => {
    // Block A: startLine=1, endLine=4, inner=2 → shrinkage=1
    // Block B: startLine=6, endLine=8, inner=1 → shrinkage=0
    const [a, b] = buildCompressionMap([block("A", 1, 4, 2), block("B", 6, 8, 1)]).blocks;
    expect(a.startLineCompressed).toBe(1);
    expect(b.startLineCompressed).toBe(6 - 1); // minus accumulated shrinkage of block A
    expect(b.shrinkage).toBe(0);
  });

  it("block with innerLineCount = 0 gets shrinkage = 0", () => {
    const [b] = buildCompressionMap([block("EMPTY", 0, 1, 0)]).blocks;
    expect(b.shrinkage).toBe(0);
  });
});

describe("transformDiffCoordinates", () => {
  it("returns chunks unchanged when compressionMap has no blocks", () => {
    const chunks = [chunk("@@ -5,3 +5,3 @@")];
    const result = transformDiffCoordinates(chunks, { blocks: [] });
    expect(result[0].location).toBe("@@ -5,3 +5,3 @@");
  });

  it("hunk before the only block: offset = 0", () => {
    // Block A: startLine=5 (0-indexed), innerLineCount=3 → shrinkage=2
    // startLineCompressed = 5 (no prior blocks)
    // Hunk at line 2 (1-indexed): 5+1=6 > 2, so block not counted
    const map = buildCompressionMap([block("A", 5, 9, 3)]);
    const result = transformDiffCoordinates([chunk("@@ -2,1 +2,1 @@")], map);
    expect(result[0].location).toBe("@@ -2,1 +2,1 @@");
  });

  it("hunk after the only block: offset = shrinkage of block", () => {
    // Block A: startLine=1 (0-indexed), innerLineCount=3 → shrinkage=2
    // startLineCompressed = 1 (0-indexed); 1+1=2; hunk at line 6 (1-indexed)
    // 2 < 6 → include shrinkage=2 → offset=2
    const map = buildCompressionMap([block("A", 1, 5, 3)]);
    const result = transformDiffCoordinates([chunk("@@ -6,1 +6,1 @@")], map);
    expect(result[0].location).toBe("@@ -8,1 +8,1 @@");
  });

  it("hunk between two blocks: offset = shrinkage of first block only", () => {
    // Block A: startLine=1, endLine=4, inner=2 → shrinkage=1
    //   startLineCompressed=1; 1+1=2
    // Block B: startLine=6, endLine=9, inner=2 → shrinkage=1
    //   startLineCompressed=6-1=5; 5+1=6
    // Hunk at line 5 (1-indexed, after A's compressed end=3, before B's compressed start=6):
    //   Block A: 2 < 5 → include shrinkage=1
    //   Block B: 6 < 5 → false → skip
    //   offset=1 → line 5+1=6
    const map = buildCompressionMap([block("A", 1, 4, 2), block("B", 6, 9, 2)]);
    const result = transformDiffCoordinates([chunk("@@ -5,1 +5,1 @@")], map);
    expect(result[0].location).toBe("@@ -6,1 +6,1 @@");
  });

  it("hunk after two blocks: offset = sum of both shrinkages", () => {
    // Block A: startLine=1, inner=2 → shrinkage=1; startLineCompressed=1
    // Block B: startLine=6, inner=3 → shrinkage=2; startLineCompressed=6-1=5
    // Hunk at line 10 (1-indexed):
    //   Block A: 2 < 10 → include +1
    //   Block B: 6 < 10 → include +2
    //   offset=3 → line 10+3=13
    const map = buildCompressionMap([block("A", 1, 4, 2), block("B", 6, 10, 3)]);
    const result = transformDiffCoordinates([chunk("@@ -10,1 +10,1 @@")], map);
    expect(result[0].location).toBe("@@ -13,1 +13,1 @@");
  });

  it("block with innerLineCount = 0: shrinkage = 0, no offset contribution", () => {
    // Block A: startLine=1, endLine=2, inner=0 → shrinkage=0; startLineCompressed=1
    // Hunk at line 5: 2 < 5 → include shrinkage=0 → offset=0
    const map = buildCompressionMap([block("A", 1, 2, 0)]);
    const result = transformDiffCoordinates([chunk("@@ -5,1 +5,1 @@")], map);
    expect(result[0].location).toBe("@@ -5,1 +5,1 @@");
  });

  it("multiple hunks in same diff are each transformed independently", () => {
    // Block A: startLine=2, inner=2 → shrinkage=1; startLineCompressed=2
    // Hunk at line 1 (before block): 3 > 1 → no offset
    // Hunk at line 6 (after block): 3 < 6 → offset=1 → line 7
    const map = buildCompressionMap([block("A", 2, 5, 2)]);
    const chunks = [chunk("@@ -1,1 +1,1 @@"), chunk("@@ -6,1 +6,1 @@")];
    const result = transformDiffCoordinates(chunks, map);
    expect(result[0].location).toBe("@@ -1,1 +1,1 @@");
    expect(result[1].location).toBe("@@ -7,1 +7,1 @@");
  });

  it("preserves hunk content unchanged", () => {
    const map = buildCompressionMap([block("A", 1, 4, 2)]);
    const original = chunk("@@ -6,2 +6,3 @@");
    original.content = "+new\n context";
    const result = transformDiffCoordinates([original], map);
    expect(result[0].content).toBe("+new\n context");
    expect(result[0].index).toBe(1);
  });

  it("chunk with non-matching location is returned unchanged", () => {
    const map = buildCompressionMap([block("A", 1, 4, 2)]);
    const malformed = chunk("not a hunk header");
    const result = transformDiffCoordinates([malformed], map);
    expect(result[0].location).toBe("not a hunk header");
  });
});
