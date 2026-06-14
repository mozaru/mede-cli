import { PassThrough } from "node:stream";
import React from "react";
import { render } from "ink";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearSharedContainer, getContainer } from "./container.js";
import { handleTuiKey, isTty, startTui, Tui } from "./tui.js";

function makeStream(): PassThrough & {
  columns: number;
  rows: number;
  isTTY: boolean;
  setRawMode: ReturnType<typeof vi.fn>;
  ref: ReturnType<typeof vi.fn>;
  unref: ReturnType<typeof vi.fn>;
} {
  const stream = new PassThrough() as PassThrough & {
    columns: number;
    rows: number;
    isTTY: boolean;
    setRawMode: ReturnType<typeof vi.fn>;
    ref: ReturnType<typeof vi.fn>;
    unref: ReturnType<typeof vi.fn>;
  };
  stream.columns = 100;
  stream.rows = 30;
  stream.isTTY = true;
  stream.setRawMode = vi.fn();
  stream.ref = vi.fn();
  stream.unref = vi.fn();
  return stream;
}

function makeContainer(overrides: Record<string, unknown> = {}) {
  return {
    tuiViewModelService: {
      getViewModel: vi.fn(() => ({
        project: null,
        cycle: null,
        phase: null,
        changeSet: null,
        chunks: [],
      })),
      selectChunk: vi.fn(),
    },
    cycleService: {
      cycle: vi.fn(async () => "cycle started"),
      approve: vi.fn(async () => "approved"),
      reject: vi.fn(async () => "rejected"),
      refine: vi.fn(async () => "refined"),
      commit: vi.fn(() => "committed"),
      rollback: vi.fn(() => "rolled back"),
    },
    changesService: {
      apply: vi.fn(() => "applied"),
      discard: vi.fn(() => "discarded"),
    },
    dispose: vi.fn(),
    ...overrides,
  };
}

async function renderTui(
  container = makeContainer(),
  options: { initialScreen?: "status" | "diffs" | "refine"; initialRefinePrompt?: string } = {},
) {
  const stdin = makeStream();
  const stdout = makeStream();
  const stderr = makeStream();
  const output: string[] = [];
  stdout.on("data", (chunk) => output.push(String(chunk)));
  const onExit = vi.fn();
  const instance = render(
    React.createElement(Tui, { container: container as any, onExit, ...options }),
    {
      stdin: stdin as any,
      stdout: stdout as any,
      stderr: stderr as any,
      exitOnCtrlC: false,
      patchConsole: false,
      interactive: true,
    },
  );
  await instance.waitUntilRenderFlush();

  return {
    instance: instance as any,
    stdin,
    onExit,
    output: () => output.join(""),
  };
}

describe("Tui render", () => {
  afterEach(() => {
    clearSharedContainer();
  });

  it("renders an empty project status screen", async () => {
    const { instance, output } = await renderTui();

    expect(output()).toContain("MEDE-CLI");
    expect(output()).toContain("Projeto: Nenhum");
    expect(output()).toContain("[i] Iniciar Novo Ciclo");

    instance.unmount();
    await instance.waitUntilExit();
  });

  it("renders active cycle actions from repository state", async () => {
    const container = makeContainer({
      tuiViewModelService: {
        selectChunk: vi.fn(),
        getViewModel: vi.fn(() => ({
          project: {
            id: 1,
            name: "Projeto Teste",
            documentationLanguage: "pt-BR",
            docsRootPath: "docs",
          },
          cycle: {
            id: 2,
            status: "OPEN",
            currentPhaseIndex: 0,
            phaseCount: 2,
          },
          phase: {
            id: 3,
            cycleId: 2,
            name: "EXTRACT_BACKLOG",
            status: "AWAITING_APPROVAL",
            proposalState: "NON_EMPTY",
          },
          changeSet: { id: 4, fileName: "docs/a.md", currentOffset: 0 },
          chunks: [
            {
              id: 5,
              index: 1,
              status: "AWAITING_APPROVAL",
              changeContent: "+ nova linha",
              blockLocation: "linha 1",
            },
          ],
        })),
      },
    });

    const { instance, output } = await renderTui(container);

    expect(output()).toContain("Projeto Teste");
    expect(output()).toContain("[a] Aprovar");
    expect(output()).toContain("[r] Rejeitar");
    expect(output()).toContain("[f] Refinar");

    instance.unmount();
    await instance.waitUntilExit();
  });

  it("renders the refine screen with the initial prompt", async () => {
    const { instance, output } = await renderTui(makeContainer(), {
      initialScreen: "refine",
      initialRefinePrompt: "ajustar escopo",
    });

    expect(output()).toContain("Refinamento da Fase");
    expect(output()).toContain("ajustar escopo");
    expect(output()).toContain("Pressione [Enter]");

    instance.unmount();
    await instance.waitUntilExit();
  });

  it("renders the diff screen with pending, applied, and discarded chunks", async () => {
    const container = makeContainer({
      tuiViewModelService: {
        selectChunk: vi.fn(),
        getViewModel: vi.fn(() => ({
          project: { id: 1, name: "P" },
          cycle: {
            id: 2,
            status: "OPEN",
            currentPhaseIndex: 0,
            phaseCount: 1,
          },
          phase: {
            id: 3,
            cycleId: 2,
            name: "PHASE",
            status: "REFINING",
            proposalState: "NON_EMPTY",
          },
          changeSet: { id: 4, fileName: "docs/a.md", currentOffset: 0 },
          chunks: [
            {
              id: 5,
              index: 1,
              status: "AWAITING_APPROVAL",
              changeContent: ["@@ -1 +1", "- antiga", "+ nova", " contexto"].join("\n"),
              blockLocation: "linha 1",
            },
            {
              id: 6,
              index: 2,
              status: "APPLIED",
              changeContent: "+ aplicada",
              blockLocation: "linha 2",
            },
            {
              id: 7,
              index: 3,
              status: "DISCARDED",
              changeContent: "- descartada",
              blockLocation: "linha 3",
            },
          ],
        })),
      },
    });
    const { instance, output } = await renderTui(container, { initialScreen: "diffs" });

    expect(output()).toContain("Navegação de Diff");
    expect(output()).toContain("[Pendente]");
    expect(output()).toContain("[Aplicado]");
    expect(output()).toContain("[Descartado]");
    expect(output()).toContain("@@ -1 +1");

    instance.unmount();
    await instance.waitUntilExit();
  });

  it("renders an empty diff screen and awaiting-commit action", async () => {
    const container = makeContainer({
      tuiViewModelService: {
        selectChunk: vi.fn(),
        getViewModel: vi.fn(() => ({
          project: { id: 1, name: "P" },
          cycle: {
            id: 2,
            status: "AWAITING_COMMIT",
            currentPhaseIndex: 0,
            phaseCount: 1,
          },
          phase: {
            id: 3,
            cycleId: 2,
            name: "",
            status: "REFINING",
            proposalState: "EMPTY",
          },
          changeSet: null,
          chunks: [],
        })),
      },
    });

    const statusRender = await renderTui(container);
    expect(statusRender.output()).toContain("[c] Confirmar");
    expect(statusRender.output()).toContain("Vazio");
    statusRender.instance.unmount();
    await statusRender.instance.waitUntilExit();

    const diffRender = await renderTui(container, { initialScreen: "diffs" });
    expect(diffRender.output()).toContain("Sem trechos diffs");
    diffRender.instance.unmount();
    await diffRender.instance.waitUntilExit();
  });

  it("reports the process TTY state", () => {
    const previous = process.stdout.isTTY;
    process.stdout.isTTY = true;
    expect(isTty()).toBe(true);
    process.stdout.isTTY = false;
    expect(isTty()).toBe(false);
    process.stdout.isTTY = previous;
  });
});

describe("Tui keyboard interaction", () => {
  function makeActions() {
    return {
      exit: vi.fn(),
      startCycle: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      openRefine: vi.fn(),
      refine: vi.fn(),
      setRefinePrompt: vi.fn(),
      openDiffs: vi.fn(),
      closeToStatus: vi.fn(),
      moveChunk: vi.fn(),
      applyChunk: vi.fn(),
      discardChunk: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      refresh: vi.fn(),
    };
  }

  it("dispatches status-screen shortcuts", () => {
    const actions = makeActions();
    const baseState = {
      loading: false,
      screen: "status" as const,
      cycleStatus: null,
      phaseStatus: null,
      chunksLength: 0,
      selectedChunk: null,
      refinePrompt: "",
    };

    handleTuiKey("i", {}, baseState, actions);
    handleTuiKey("q", {}, baseState, actions);
    handleTuiKey("s", {}, baseState, actions);

    expect(actions.startCycle).toHaveBeenCalled();
    expect(actions.exit).toHaveBeenCalled();
    expect(actions.refresh).toHaveBeenCalled();
  });

  it("dispatches approval, refine, diff, commit and rollback shortcuts", () => {
    const actions = makeActions();
    const approvalState = {
      loading: false,
      screen: "status" as const,
      cycleStatus: "OPEN",
      phaseStatus: "AWAITING_APPROVAL",
      chunksLength: 1,
      selectedChunk: { status: "AWAITING_APPROVAL" },
      refinePrompt: "",
    };

    handleTuiKey("a", {}, approvalState, actions);
    handleTuiKey("r", {}, approvalState, actions);
    handleTuiKey("f", {}, approvalState, actions);
    handleTuiKey("d", {}, approvalState, actions);
    handleTuiKey("b", {}, approvalState, actions);
    handleTuiKey("c", {}, { ...approvalState, cycleStatus: "AWAITING_COMMIT" }, actions);

    expect(actions.approve).toHaveBeenCalled();
    expect(actions.reject).toHaveBeenCalled();
    expect(actions.openRefine).toHaveBeenCalled();
    expect(actions.openDiffs).toHaveBeenCalled();
    expect(actions.rollback).toHaveBeenCalled();
    expect(actions.commit).toHaveBeenCalled();
  });

  it("edits refine prompt and dispatches diff-screen actions", () => {
    const actions = makeActions();

    handleTuiKey(
      "x",
      {},
      {
        loading: false,
        screen: "refine",
        cycleStatus: "OPEN",
        phaseStatus: "AWAITING_APPROVAL",
        chunksLength: 0,
        selectedChunk: null,
        refinePrompt: "",
      },
      actions,
    );
    handleTuiKey(
      "",
      { backspace: true },
      {
        loading: false,
        screen: "refine",
        cycleStatus: "OPEN",
        phaseStatus: "AWAITING_APPROVAL",
        chunksLength: 0,
        selectedChunk: null,
        refinePrompt: "x",
      },
      actions,
    );
    handleTuiKey(
      "",
      { return: true },
      {
        loading: false,
        screen: "refine",
        cycleStatus: "OPEN",
        phaseStatus: "AWAITING_APPROVAL",
        chunksLength: 0,
        selectedChunk: null,
        refinePrompt: "x",
      },
      actions,
    );

    const diffState = {
      loading: false,
      screen: "diffs" as const,
      cycleStatus: "OPEN",
      phaseStatus: "REFINING",
      chunksLength: 2,
      selectedChunk: { status: "AWAITING_APPROVAL" },
      refinePrompt: "",
    };
    handleTuiKey("", { downArrow: true }, diffState, actions);
    handleTuiKey("a", {}, diffState, actions);
    handleTuiKey("d", {}, diffState, actions);
    handleTuiKey("s", {}, diffState, actions);

    expect(actions.setRefinePrompt).toHaveBeenCalledTimes(2);
    expect(actions.setRefinePrompt.mock.calls[0][0]("a")).toBe("ax");
    expect(actions.setRefinePrompt.mock.calls[1][0]("abc")).toBe("ab");
    expect(actions.refine).toHaveBeenCalled();
    expect(actions.moveChunk).toHaveBeenCalled();
    expect(actions.moveChunk.mock.calls[0][0](0)).toBe(1);
    expect(actions.applyChunk).toHaveBeenCalled();
    expect(actions.discardChunk).toHaveBeenCalled();
    expect(actions.closeToStatus).toHaveBeenCalled();
  });

  it("ignores keys while loading and ignores unavailable actions", () => {
    const actions = makeActions();

    handleTuiKey(
      "i",
      {},
      {
        loading: true,
        screen: "status",
        cycleStatus: null,
        phaseStatus: null,
        chunksLength: 0,
        selectedChunk: null,
        refinePrompt: "",
      },
      actions,
    );
    handleTuiKey(
      "x",
      { meta: true },
      {
        loading: false,
        screen: "refine",
        cycleStatus: "OPEN",
        phaseStatus: "AWAITING_APPROVAL",
        chunksLength: 0,
        selectedChunk: null,
        refinePrompt: "",
      },
      actions,
    );
    handleTuiKey(
      "a",
      {},
      {
        loading: false,
        screen: "diffs",
        cycleStatus: "OPEN",
        phaseStatus: "REFINING",
        chunksLength: 1,
        selectedChunk: { status: "APPLIED" },
        refinePrompt: "",
      },
      actions,
    );

    expect(actions.startCycle).not.toHaveBeenCalled();
    expect(actions.setRefinePrompt).not.toHaveBeenCalled();
    expect(actions.applyChunk).not.toHaveBeenCalled();
  });
});

describe("startTui", () => {
  it("uses an injected container and clears the shared container after exit", async () => {
    const container = makeContainer();
    const renderApp = vi.fn(() => ({
      waitUntilExit: async () => undefined,
    }));

    await startTui(container as any, renderApp as any);

    expect(renderApp).toHaveBeenCalled();
    expect(container.dispose as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
    expect(getContainer()).not.toBe(container);
  });
});
