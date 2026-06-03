import { describe, it, expect } from "vitest";
import { tokenize } from "./repl.js";
import { buildProgram } from "./runner.js";

describe("tokenize", () => {
  it("splits a plain command line on whitespace", () => {
    expect(tokenize("approve -a")).toEqual(["approve", "-a"]);
  });

  it("keeps double-quoted arguments with spaces intact", () => {
    expect(tokenize('cycle -p "duas palavras"')).toEqual(["cycle", "-p", "duas palavras"]);
  });

  it("keeps single-quoted arguments intact", () => {
    expect(tokenize("cat 'um arquivo.md'")).toEqual(["cat", "um arquivo.md"]);
  });

  it("returns an empty list for blank input", () => {
    expect(tokenize("   ")).toEqual([]);
  });
});

describe("buildProgram", () => {
  it("registers the core commands the REPL dispatches to", () => {
    const names = buildProgram()
      .commands.map((command) => command.name())
      .sort();

    for (const expected of ["cycle", "approve", "reject", "commit", "rollback", "status"]) {
      expect(names).toContain(expected);
    }
  });
});
