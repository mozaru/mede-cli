import { describe, it, expect } from "vitest";
import { parseDiff, applyDiff } from "./diff.js";

// Helper: creates a creation diff (new file from empty) from plain text content
function makeDiff(content: string): string {
  const lines = content.trim().split("\n");
  const diffLines = lines.map((l) => `+${l}`).join("\n");
  return `@@ -0,0 +1,${lines.length} @@\n${diffLines}`;
}

// Helper: applies all chunks from a diff string to a base content string
function applyAll(base: string, diffText: string): string {
  const chunks = parseDiff(diffText);
  let content = base;
  let offset = 0;
  for (const chunk of chunks) {
    const result = applyDiff(content, { ...chunk, offset });
    content = result.newContent;
    offset += result.addedCount - result.removedCount;
  }
  return content;
}

// ---------------------------------------------------------------------------
// parseDiff
// ---------------------------------------------------------------------------

describe("parseDiff", () => {
  it("parses a single hunk", () => {
    const diff = `@@ -1,3 +1,4 @@\n context\n+new line\n context2\n context3`;
    const chunks = parseDiff(diff);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].index).toBe(1);
    expect(chunks[0].offset).toBe(0);
    expect(chunks[0].location).toBe("@@ -1,3 +1,4 @@");
    expect(chunks[0].content).toBe(" context\n+new line\n context2\n context3");
  });

  it("parses multiple hunks with correct indexes", () => {
    const diff = [
      "@@ -1,2 +1,3 @@",
      " context",
      "+added",
      " context2",
      "@@ -10,2 +11,3 @@",
      " other",
      "+more",
      " end",
    ].join("\n");

    const chunks = parseDiff(diff);

    expect(chunks).toHaveLength(2);
    expect(chunks[0].index).toBe(1);
    expect(chunks[0].location).toBe("@@ -1,2 +1,3 @@");
    expect(chunks[1].index).toBe(2);
    expect(chunks[1].location).toBe("@@ -10,2 +11,3 @@");
  });

  it("ignores text before the first @@ marker", () => {
    const diff = `Some preamble text\nIgnored line\n@@ -1,1 +1,2 @@\n context\n+added`;
    const chunks = parseDiff(diff);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].location).toBe("@@ -1,1 +1,2 @@");
  });

  it("ignores trailing markdown code block markers and conversational text", () => {
    const diff = [
      "@@ -1,1 +1,2 @@",
      " context",
      "+added",
      "```",
      "Here is some commentary from the model.",
    ].join("\n");
    const chunks = parseDiff(diff);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe(" context\n+added");
  });

  it("returns empty array for NO_CHANGES response", () => {
    expect(parseDiff("NO_CHANGES")).toHaveLength(0);
  });

  it("returns empty array for empty string", () => {
    expect(parseDiff("")).toHaveLength(0);
  });

  it("returns empty array for whitespace-only response", () => {
    expect(parseDiff("   \n   ")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// applyDiff
// ---------------------------------------------------------------------------

describe("applyDiff", () => {
  it("creates a new document from an empty base", () => {
    const diffText = makeDiff("line 1\nline 2\nline 3");
    const [chunk] = parseDiff(diffText);

    const result = applyDiff("", { ...chunk, offset: 0 });

    expect(result.addedCount).toBe(3);
    expect(result.removedCount).toBe(0);
    expect(result.newContent).toContain("line 1");
    expect(result.newContent).toContain("line 2");
    expect(result.newContent).toContain("line 3");
  });

  it("adds a line to existing content", () => {
    const base = "line 1\nline 2\nline 3";
    const diffText = `@@ -3,1 +3,2 @@\n line 3\n+line 4`;
    const [chunk] = parseDiff(diffText);

    const result = applyDiff(base, { ...chunk, offset: 0 });

    expect(result.newContent).toContain("line 4");
    expect(result.newContent).toContain("line 3");
    expect(result.addedCount).toBeGreaterThan(result.removedCount);
  });

  it("replaces a line in existing content", () => {
    const base = "title\nold content\nend";
    const diffText = `@@ -2,1 +2,1 @@\n-old content\n+new content`;
    const [chunk] = parseDiff(diffText);

    const result = applyDiff(base, { ...chunk, offset: 0 });

    expect(result.newContent).toContain("new content");
    expect(result.newContent).not.toContain("old content");
  });

  it("returns original content for an invalid location", () => {
    const base = "original content";
    const chunk = { index: 1, offset: 0, location: "INVALID", content: "+replacement" };

    const result = applyDiff(base, chunk);

    expect(result.newContent).toBe("original content");
    expect(result.addedCount).toBe(0);
    expect(result.removedCount).toBe(0);
  });

  it("accumulates offset correctly across sequential chunks", () => {
    const base = "a\nb\nc\nd\ne";
    // First chunk: insert a line after line 2
    const diff1 = `@@ -2,1 +2,2 @@\n b\n+inserted`;
    // Second chunk: replace line 5 (which is now line 6 due to offset +1)
    const diff2 = `@@ -5,1 +5,1 @@\n-e\n+E`;

    const chunks1 = parseDiff(diff1);
    const result1 = applyDiff(base, { ...chunks1[0], offset: 0 });
    const offset = result1.addedCount - result1.removedCount;

    const chunks2 = parseDiff(diff2);
    const result2 = applyDiff(result1.newContent, { ...chunks2[0], offset });

    expect(result2.newContent).toContain("inserted");
    expect(result2.newContent).toContain("E");
    expect(result2.newContent).not.toContain("\ne\n");
  });

  it("handles creation diffs produced by applyAll helper", () => {
    const content = "first line\nsecond line\nthird line";
    const result = applyAll("", makeDiff(content));

    expect(result).toContain("first line");
    expect(result).toContain("second line");
    expect(result).toContain("third line");
  });
});
