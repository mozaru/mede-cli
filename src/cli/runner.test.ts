import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const calls = vi.hoisted(() => ({
  setOutputFormat: vi.fn(),
  statusExecute: vi.fn(),
  initExecute: vi.fn(),
  filesList: vi.fn(),
  filesCat: vi.fn(),
  filesDiff: vi.fn(),
  configExecute: vi.fn(),
  configInit: vi.fn(),
  configApply: vi.fn(),
  cycleStart: vi.fn(),
  cycleApprove: vi.fn(),
  cycleReject: vi.fn(),
  cycleReset: vi.fn(),
  cycleRetry: vi.fn(),
  cycleRefine: vi.fn(),
  cycleCommit: vi.fn(),
  cycleRollback: vi.fn(),
  pending: vi.fn(),
  apply: vi.fn(),
  discard: vi.fn(),
  validate: vi.fn(),
  llmExecute: vi.fn(),
  llmTest: vi.fn(),
  llmLogin: vi.fn(),
  llmLogout: vi.fn(),
  startRepl: vi.fn(),
  startTui: vi.fn(),
  reportCliError: vi.fn(),
}));

vi.mock("./output.js", () => ({
  setOutputFormat: calls.setOutputFormat,
}));

vi.mock("./repl.js", () => ({
  startRepl: calls.startRepl,
}));

vi.mock("./tui.js", () => ({
  startTui: calls.startTui,
}));

vi.mock("./error-handler.js", () => ({
  reportCliError: calls.reportCliError,
}));

vi.mock("./commands/status-command.js", () => ({
  StatusCommand: class {
    execute = calls.statusExecute;
  },
}));

vi.mock("./commands/init-command.js", () => ({
  InitCommand: class {
    execute = calls.initExecute;
  },
}));

vi.mock("./commands/files-command.js", () => ({
  FilesCommand: class {
    executeList = calls.filesList;
    executeCat = calls.filesCat;
    executeDiff = calls.filesDiff;
  },
}));

vi.mock("./commands/config-command.js", () => ({
  ConfigCommand: class {
    execute = calls.configExecute;
    executeInit = calls.configInit;
    executeApply = calls.configApply;
  },
}));

vi.mock("./commands/cycle-command.js", () => ({
  CycleCommand: class {
    executeCycle = calls.cycleStart;
    executeApprove = calls.cycleApprove;
    executeReject = calls.cycleReject;
    executeReset = calls.cycleReset;
    executeRetry = calls.cycleRetry;
    executeRefine = calls.cycleRefine;
    executeCommit = calls.cycleCommit;
    executeRollback = calls.cycleRollback;
  },
}));

vi.mock("./commands/changes-command.js", () => ({
  ChangesCommand: class {
    executePending = calls.pending;
    executeApply = calls.apply;
    executeDiscard = calls.discard;
  },
}));

vi.mock("./commands/validate-command.js", () => ({
  ValidateCommand: class {
    execute = calls.validate;
  },
}));

vi.mock("./commands/llm-command.js", () => ({
  LlmCommand: class {
    execute = calls.llmExecute;
    executeTest = calls.llmTest;
    executeLogin = calls.llmLogin;
    executeLogout = calls.llmLogout;
  },
}));

import { buildProgram, runCli } from "./runner.js";

async function parse(args: string[]): Promise<void> {
  const program = buildProgram();
  program.exitOverride();
  await program.parseAsync(["node", "mede-cli", ...args]);
}

describe("buildProgram", () => {
  beforeEach(() => {
    for (const value of Object.values(calls)) {
      value.mockReset();
    }
  });

  it("wires basic project and file commands", async () => {
    await parse(["--json", "status"]);
    expect(calls.setOutputFormat).toHaveBeenCalledWith("json");
    expect(calls.statusExecute).toHaveBeenCalled();

    await parse(["init", "-p", "hello", "-f", "a.md", "-f", "b.md"]);
    expect(calls.initExecute).toHaveBeenCalledWith("hello", ["a.md", "b.md"]);

    await parse(["files", "--backup"]);
    expect(calls.filesList).toHaveBeenCalledWith(true);

    await parse(["cat", "docs/a.md", "-b"]);
    expect(calls.filesCat).toHaveBeenCalledWith("docs/a.md", true);

    await parse(["diff", "docs/a.md"]);
    expect(calls.filesDiff).toHaveBeenCalledWith("docs/a.md");
  });

  it("wires config, cycle, and review commands", async () => {
    await parse(["config"]);
    await parse(["config", "init"]);
    await parse(["config", "apply"]);
    expect(calls.configExecute).toHaveBeenCalled();
    expect(calls.configInit).toHaveBeenCalled();
    expect(calls.configApply).toHaveBeenCalled();

    await parse(["cycle", "-p", "prompt", "-f", "one.md", "-f", "two.md"]);
    expect(calls.cycleStart).toHaveBeenCalledWith("prompt", ["one.md", "two.md"]);

    await parse(["approve", "-a"]);
    await parse(["reject", "-a"]);
    await parse(["reset"]);
    await parse(["retry"]);
    await parse(["refine", "-p", "more", "-f", "ctx.md"]);
    await parse(["commit"]);
    await parse(["rollback"]);

    expect(calls.cycleApprove).toHaveBeenCalledWith(true);
    expect(calls.cycleReject).toHaveBeenCalledWith(true);
    expect(calls.cycleReset).toHaveBeenCalled();
    expect(calls.cycleRetry).toHaveBeenCalled();
    expect(calls.cycleRefine).toHaveBeenCalledWith("more", ["ctx.md"]);
    expect(calls.cycleCommit).toHaveBeenCalled();
    expect(calls.cycleRollback).toHaveBeenCalled();

    await parse(["pending", "-a"]);
    await parse(["apply", "-a"]);
    await parse(["discard", "-a"]);
    expect(calls.pending).toHaveBeenCalledWith(true);
    expect(calls.apply).toHaveBeenCalledWith(true);
    expect(calls.discard).toHaveBeenCalledWith(true);
  });

  it("wires validation and LLM commands with defaults", async () => {
    await parse(["validate", "--strict"]);
    expect(calls.validate).toHaveBeenCalledWith(true);

    await parse(["llm"]);
    await parse(["llm", "test", "-p", "ping"]);
    await parse(["llm", "login"]);
    await parse(["llm", "logout"]);

    expect(calls.llmExecute).toHaveBeenCalled();
    expect(calls.llmTest).toHaveBeenCalledWith("ping");
    expect(calls.llmLogin).toHaveBeenCalled();
    expect(calls.llmLogout).toHaveBeenCalled();

    await parse(["approve"]);
    await parse(["pending"]);
    await parse(["llm", "test"]);
    expect(calls.cycleApprove).toHaveBeenLastCalledWith(false);
    expect(calls.pending).toHaveBeenLastCalledWith(false);
    expect(calls.llmTest).toHaveBeenLastCalledWith("");
  });

  it("passes default option values when optional flags are omitted", async () => {
    await parse(["init"]);
    await parse(["files"]);
    await parse(["cat", "docs/a.md"]);
    await parse(["cycle"]);
    await parse(["reject"]);
    await parse(["refine"]);
    await parse(["apply"]);
    await parse(["discard"]);
    await parse(["validate"]);

    expect(calls.initExecute).toHaveBeenLastCalledWith("", []);
    expect(calls.filesList).toHaveBeenLastCalledWith(false);
    expect(calls.filesCat).toHaveBeenLastCalledWith("docs/a.md", false);
    expect(calls.cycleStart).toHaveBeenLastCalledWith("", []);
    expect(calls.cycleReject).toHaveBeenLastCalledWith(false);
    expect(calls.cycleRefine).toHaveBeenLastCalledWith("", []);
    expect(calls.apply).toHaveBeenLastCalledWith(false);
    expect(calls.discard).toHaveBeenLastCalledWith(false);
    expect(calls.validate).toHaveBeenLastCalledWith(false);
  });

  it("uses BUILD_TIME in the generated command metadata", () => {
    const previousBuildTime = process.env.BUILD_TIME;
    process.env.BUILD_TIME = "2026.0612.1200";

    try {
      const program = buildProgram();

      expect(program.description()).toContain("Build: 2026.0612.1200");
      expect(program.version()).toContain("2026.0612.1200");
    } finally {
      if (previousBuildTime === undefined) {
        delete process.env.BUILD_TIME;
      } else {
        process.env.BUILD_TIME = previousBuildTime;
      }
    }
  });
});

describe("runCli", () => {
  const originalArgv = process.argv;
  const originalIsTty = process.stdout.isTTY;

  beforeEach(() => {
    for (const value of Object.values(calls)) {
      value.mockReset();
    }
    process.stdout.isTTY = false;
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.stdout.isTTY = originalIsTty;
  });

  it("starts the REPL when no args are provided in a non-TTY process", async () => {
    process.argv = ["node", "mede-cli"];

    await runCli();

    expect(calls.startRepl).toHaveBeenCalled();
  });

  it("starts the TUI when no args are provided in a TTY process", async () => {
    process.stdout.isTTY = true;
    process.argv = ["node", "mede-cli"];

    await runCli();

    expect(calls.startRepl).not.toHaveBeenCalled();
    expect(calls.startTui).toHaveBeenCalled();
  });

  it("reports parse or handler errors without throwing", async () => {
    calls.statusExecute.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    process.argv = ["node", "mede-cli", "status"];

    await runCli();

    expect(calls.reportCliError).toHaveBeenCalledWith(expect.any(Error));
  });
});
