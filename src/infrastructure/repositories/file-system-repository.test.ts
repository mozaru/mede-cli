import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { FileSystemRepository } from "./file-system-repository.js";
import { ListFilesOptionsEntity } from "../../domain/entities/list-files-options-entity.js";

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

  it("lists files recursively and filters by extension", () => {
    const repo = new FileSystemRepository();
    repo.writeFile(path.join(root, "a.md"), "a");
    repo.writeFile(path.join(root, "b.txt"), "b");
    repo.writeFile(path.join(root, "nested", "c.md"), "c");

    const options = new ListFilesOptionsEntity();
    options.recursive = true;
    options.extensions = ["md"];

    const files = repo.listFiles(root, options).map((file) => path.basename(file)).sort();

    expect(files).toEqual(["a.md", "c.md"]);
    expect(repo.listFiles(path.join(root, "missing"), options)).toEqual([]);
    expect(repo.listFiles(path.join(root, "b.txt"), options)).toEqual([]);
  });

  it("reads and writes JSON, and rejects invalid JSON", () => {
    const repo = new FileSystemRepository();
    const jsonPath = path.join(root, "config.json");
    const invalidPath = path.join(root, "invalid.json");

    repo.writeJsonFile(jsonPath, { ok: true, count: 2 });
    repo.writeFile(invalidPath, "{ nope");

    expect(repo.readJsonFile(jsonPath)).toEqual({ ok: true, count: 2 });
    expect(() => repo.readJsonFile(invalidPath)).toThrow(/Invalid JSON/);
  });

  it("creates, moves, renames, and deletes files and directories", () => {
    const repo = new FileSystemRepository();
    const source = path.join(root, "docs", "a.md");

    repo.createFile(source, "a", false);
    expect(() => repo.createFile(source, "b", false)).toThrow(/already exists/);

    const renamed = repo.renameFile(source, "b.md");
    expect(path.basename(renamed)).toBe("b.md");
    expect(repo.readFile(renamed)).toBe("a");

    const moved = path.join(root, "out", "b.md");
    repo.moveFile(renamed, moved);
    expect(repo.readFile(moved)).toBe("a");

    const dir = path.join(root, "folder");
    repo.ensureDirectory(dir);
    const renamedDir = repo.renameDirectory(dir, "folder-renamed");
    expect(repo.isDirectory(renamedDir)).toBe(true);

    repo.deleteFile(moved);
    expect(repo.exists(moved)).toBe(false);
    repo.deleteFile(moved);
  });

  it("edits text with replace, insert, and remove operations", () => {
    const repo = new FileSystemRepository();
    const target = path.join(root, "doc.md");
    repo.writeFile(target, "alpha beta beta omega");

    repo.replaceText(target, { searchValue: "beta", replaceValue: "B", all: false });
    expect(repo.readFile(target)).toBe("alpha B beta omega");

    repo.replaceText(target, { searchValue: "beta", replaceValue: "B", all: true });
    expect(repo.readFile(target)).toBe("alpha B B omega");

    repo.insertText(target, { createAnchorText: "", textToInsert: "START ", position: "start" });
    repo.insertText(target, { createAnchorText: "", textToInsert: " END", position: "end" });
    repo.insertText(target, { createAnchorText: "omega", textToInsert: "PRE ", position: "before" });
    repo.insertText(target, { createAnchorText: "omega", textToInsert: " POST", position: "after" });
    expect(repo.readFile(target)).toBe("START alpha B B PRE omega POST END");

    repo.removeText(target, { startMarker: "PRE ", endMarker: " POST", includeMarkers: false });
    expect(repo.readFile(target)).toBe("START alpha B B PRE  POST END");

    repo.removeText(target, { startMarker: "PRE ", endMarker: " POST", includeMarkers: true });
    expect(repo.readFile(target)).toBe("START alpha B B  END");
  });

  it("raises clear errors for invalid filesystem operations", () => {
    const repo = new FileSystemRepository();
    const dir = path.join(root, "dir");
    repo.ensureDirectory(dir);
    const target = path.join(root, "doc.md");
    repo.writeFile(target, "body");

    expect(() => repo.readFile(path.join(root, "missing.md"))).toThrow(/File not found/);
    expect(() => repo.deleteFile(dir)).toThrow(/not a file/);
    expect(() => repo.moveFile(path.join(root, "missing.md"), target)).toThrow(/not found/);
    expect(() => repo.renameFile(path.join(root, "missing.md"), "x.md")).toThrow(/File not found/);
    expect(() => repo.renameDirectory(target, "x")).toThrow(/not a directory/);
    expect(() =>
      repo.insertText(target, { createAnchorText: "missing", textToInsert: "x", position: "after" }),
    ).toThrow(/Anchor text/);
    expect(() =>
      repo.removeText(target, { startMarker: "missing", endMarker: "body", includeMarkers: true }),
    ).toThrow(/Start marker/);
    expect(() =>
      repo.removeText(target, { startMarker: "body", endMarker: "missing", includeMarkers: true }),
    ).toThrow(/End marker/);
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
