import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  questions: [] as Array<string | Error>,
  writes: [] as string[],
  close: vi.fn(),
  parseAsync: vi.fn(),
  outputHelp: vi.fn(),
  exitOverride: vi.fn(),
  dispose: vi.fn(),
  clearSharedContainer: vi.fn(),
  createContainer: vi.fn(),
  setSharedContainer: vi.fn(),
}));

vi.mock("node:readline/promises", () => ({
  default: {
    createInterface: vi.fn(() => ({
      question: vi.fn(async () => {
        const next = state.questions.shift();
        if (next instanceof Error) {
          throw next;
        }
        return next ?? "exit";
      }),
      close: state.close,
    })),
  },
}));

vi.mock("node:process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:process")>();
  return {
    ...actual,
    stdout: {
      ...actual.stdout,
      write: (chunk: string) => {
        state.writes.push(String(chunk));
        return true;
      },
    },
  };
});

vi.mock("./runner.js", () => ({
  buildProgram: vi.fn(() => ({
    commands: [{ name: () => "status" }, { name: () => "cycle" }],
    outputHelp: state.outputHelp,
    exitOverride: state.exitOverride,
    parseAsync: state.parseAsync,
  })),
}));

vi.mock("./container.js", () => ({
  clearSharedContainer: state.clearSharedContainer,
  createContainer: state.createContainer,
  setSharedContainer: state.setSharedContainer,
}));

import { startRepl } from "./repl.js";

describe("startRepl", () => {
  beforeEach(() => {
    state.questions = [];
    state.writes = [];
    state.close.mockReset();
    state.parseAsync.mockReset();
    state.outputHelp.mockReset();
    state.exitOverride.mockReset();
    state.dispose.mockReset();
    state.clearSharedContainer.mockReset();
    state.createContainer.mockReset();
    state.setSharedContainer.mockReset();
    state.createContainer.mockReturnValue({ dispose: state.dispose });
  });

  it("prints welcome/help, dispatches commands, and disposes the shared container", async () => {
    state.questions = ["", "help", "status --json", "exit"];

    await startRepl();

    expect(state.writes.join("")).toContain("console interativo");
    expect(state.writes.join("")).toContain("Comandos: status, cycle");
    expect(state.outputHelp).toHaveBeenCalled();
    expect(state.exitOverride).toHaveBeenCalled();
    expect(state.parseAsync).toHaveBeenCalledWith(["status", "--json"], { from: "user" });
    expect(state.setSharedContainer).toHaveBeenCalledWith({ dispose: state.dispose });
    expect(state.close).toHaveBeenCalled();
    expect(state.clearSharedContainer).toHaveBeenCalled();
    expect(state.dispose).toHaveBeenCalled();
    expect(state.writes[state.writes.length - 1]).toBe("Até logo.\n");
  });

  it("handles commander errors and stream closure without throwing", async () => {
    const commanderError = Object.assign(new Error("bad option"), {
      name: "CommanderError",
      code: "commander.unknownOption",
    });
    state.parseAsync.mockRejectedValueOnce(commanderError);
    state.questions = ["bad --flag", new Error("closed")];

    await startRepl();

    expect(state.writes.join("")).toContain("Comando inválido");
    expect(state.close).toHaveBeenCalled();
    expect(state.dispose).toHaveBeenCalled();
  });

  it("prints non-commander handler failures and accepts quit alias", async () => {
    state.parseAsync.mockRejectedValueOnce(new Error("handler failed"));
    state.questions = ["status", "quit"];

    await startRepl();

    expect(state.writes.join("")).toContain("Erro: handler failed");
    expect(state.dispose).toHaveBeenCalled();
  });
});
