import { describe, it, expect } from "vitest";
import path from "node:path";
import { isPathWithin, assertPathWithin, assertNoNullByte } from "./path-safety.js";

const root = path.resolve("/srv/project/docs");

describe("isPathWithin", () => {
  it("accepts the root itself", () => {
    expect(isPathWithin(root, root)).toBe(true);
  });

  it("accepts a nested file", () => {
    expect(isPathWithin(root, path.join(root, "atas", "min-001.md"))).toBe(true);
  });

  it("accepts a relative path that stays inside", () => {
    expect(isPathWithin(root, "atas/min-001.md")).toBe(true);
  });

  it("rejects a traversal escape", () => {
    expect(isPathWithin(root, path.join(root, "..", "..", "etc", "passwd"))).toBe(false);
  });

  it("rejects a sibling directory with a shared prefix", () => {
    expect(isPathWithin(root, path.resolve("/srv/project/docs-evil/x.md"))).toBe(false);
  });

  it("rejects paths containing a NUL byte", () => {
    expect(isPathWithin(root, `${root}/a\0b`)).toBe(false);
  });
});

describe("assertPathWithin", () => {
  it("does not throw for a contained path", () => {
    expect(() => assertPathWithin(root, path.join(root, "readme.md"))).not.toThrow();
  });

  it("throws with a descriptive message for an escape", () => {
    expect(() => assertPathWithin(root, path.join(root, "..", "secret"), "doc")).toThrow(
      /Unsafe doc/,
    );
  });

  it("throws for a NUL byte", () => {
    expect(() => assertPathWithin(root, "a\0b")).toThrow(/NUL byte/);
  });
});

describe("assertNoNullByte", () => {
  it("passes for a clean path", () => {
    expect(() => assertNoNullByte("/srv/docs/a.md")).not.toThrow();
  });

  it("throws for an embedded NUL", () => {
    expect(() => assertNoNullByte("/srv/docs/a\0.md")).toThrow(/NUL byte/);
  });
});
