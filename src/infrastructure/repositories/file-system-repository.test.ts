import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { FileSystemRepository } from "./file-system-repository.js";

let root: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-fsr-"));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("FileSystemRepository without allowedRoots (default)", () => {
  it("writes and reads a file anywhere", () => {
    const repo = new FileSystemRepository();
    const target = path.join(root, "sub", "a.md");

    repo.writeFile(target, "hello");

    expect(repo.readFile(target)).toBe("hello");
  });

  it("rejects a path with a NUL byte even with no roots configured", () => {
    const repo = new FileSystemRepository();
    expect(() => repo.writeFile(path.join(root, "a\0b.md"), "x")).toThrow(/NUL byte/);
  });
});

describe("FileSystemRepository with allowedRoots", () => {
  it("allows writes inside the allowed root", () => {
    const repo = new FileSystemRepository([root]);
    const target = path.join(root, "docs", "readme.md");

    repo.writeFile(target, "ok");

    expect(repo.readFile(target)).toBe("ok");
  });

  it("blocks a traversal write that escapes the allowed root", () => {
    const repo = new FileSystemRepository([path.join(root, "docs")]);
    const escape = path.join(root, "docs", "..", "..", "evil.md");

    expect(() => repo.writeFile(escape, "pwned")).toThrow(/Unsafe write path/);
    expect(fs.existsSync(path.join(root, "evil.md"))).toBe(false);
  });

  it("blocks createFile and deleteFile outside the allowed root", () => {
    const repo = new FileSystemRepository([path.join(root, "docs")]);
    const outside = path.join(root, "outside.md");

    expect(() => repo.createFile(outside, "x", true)).toThrow(/Unsafe write path/);
    expect(() => repo.deleteFile(outside)).toThrow(/Unsafe write path/);
  });
});
