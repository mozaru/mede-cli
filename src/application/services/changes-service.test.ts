import { describe, expect, it, vi } from "vitest";
import { ChangesService } from "./changes-service.js";

const project = {
  id: 1,
  name: "Demo",
  rootProjectPath: "/root",
  docsRootPath: "/root/docs",
  documentationLanguage: "pt-BR",
};
const config = { id: 2, projectId: 1, content: '{"language":"pt-BR"}' };
const cycle = { id: 3, projectId: 1, status: "OPEN", currentPhaseIndex: 4, phaseCount: 12 };
const phase = { id: 4, cycleId: 3, status: "REFINING", name: "GENERATE_MEETING" };
const changeSet = {
  id: 5,
  phaseId: 4,
  fileName: "docs/a.md",
  currentChangeChunkIndex: 2,
  changeChunkCount: 3,
};

function makeService(overrides: Record<string, any> = {}) {
  const phaseConversationService = {
    apply: vi.fn(),
    applyAll: vi.fn(),
    discard: vi.fn(),
    discardAll: vi.fn(),
    ...overrides.phaseConversationService,
  };
  const statusService = {
    generate: vi.fn(() => "status text"),
    ...overrides.statusService,
  };
  const projectRepository = overrides.projectRepository ?? { getCurrent: vi.fn(() => project) };
  const projectConfigRepository = overrides.projectConfigRepository ?? {
    get: vi.fn(() => config),
    getCurrent: vi.fn(() => config),
  };
  const cycleRepository = overrides.cycleRepository ?? { getCurrent: vi.fn(() => cycle) };
  const phaseRepository = overrides.phaseRepository ?? {
    getByIndex: vi.fn(() => phase),
    getById: vi.fn(() => ({ ...phase, status: "AWAITING_APPROVAL" })),
  };
  const changeSetRepository = overrides.changeSetRepository ?? {
    getCurrent: vi.fn(() => changeSet),
    getById: vi.fn(() => ({ ...changeSet, completed: true })),
  };
  const changeChunkRepository = overrides.changeChunkRepository ?? {
    list: vi.fn(() => [
      { index: 1, status: "AWAITING_APPROVAL", blockLocation: "@@ -1 +1 @@", changeContent: "+a" },
      { index: 2, status: "REJECTED", blockLocation: "@@ -2 +2 @@", changeContent: "+b" },
    ]),
    getByIndex: vi.fn(() => ({
      index: 2,
      status: "AWAITING_APPROVAL",
      blockLocation: "@@ -2 +2 @@",
      changeContent: "+b",
    })),
  };

  return {
    service: new ChangesService(
      phaseConversationService as any,
      statusService as any,
      projectRepository as any,
      projectConfigRepository as any,
      cycleRepository as any,
      phaseRepository as any,
      changeSetRepository as any,
      changeChunkRepository as any,
    ),
    phaseConversationService,
    statusService,
  };
}

describe("ChangesService", () => {
  it("prints all pending chunks and skips non-pending ones", () => {
    const { service } = makeService();

    const output = service.pending(true);

    expect(output).toContain("[1] docs/a.md");
    expect(output).toContain("@@ -1 +1 @@");
    expect(output).toContain("+a");
    expect(output).not.toContain("[2] docs/a.md");
  });

  it("prints only the current pending chunk", () => {
    const { service } = makeService();

    const output = service.pending(false);

    expect(output).toContain("[2] docs/a.md");
    expect(output).toContain("@@ -2 +2 @@");
    expect(output).toContain("ChangeSet    : 2/3");
  });

  it("dispatches apply and applyAll, then formats status with refreshed entities", () => {
    const single = makeService();
    expect(single.service.apply(false)).toBe("status text");
    expect(single.phaseConversationService.apply).toHaveBeenCalledWith(phase, changeSet);
    expect(single.statusService.generate).toHaveBeenCalledWith(
      project,
      cycle,
      expect.objectContaining({ status: "AWAITING_APPROVAL" }),
      expect.objectContaining({ completed: true }),
    );

    const all = makeService();
    expect(all.service.apply(true)).toBe("status text");
    expect(all.phaseConversationService.applyAll).toHaveBeenCalledWith(phase, changeSet);
  });

  it("dispatches discard and discardAll, then formats status", () => {
    const single = makeService();
    expect(single.service.discard(false)).toBe("status text");
    expect(single.phaseConversationService.discard).toHaveBeenCalledWith(phase, changeSet);

    const all = makeService();
    expect(all.service.discard(true)).toBe("status text");
    expect(all.phaseConversationService.discardAll).toHaveBeenCalledWith(phase, changeSet);
  });

  it("validates phase and change-set preconditions", () => {
    expect(() =>
      makeService({
        phaseRepository: { getByIndex: () => ({ ...phase, status: "APPROVED" }) },
      }).service.pending(true),
    ).toThrow(/refinamento/);

    expect(() =>
      makeService({ changeSetRepository: { getCurrent: () => null } }).service.apply(true),
    ).toThrow(/Change-set/);

    expect(() =>
      makeService({
        changeChunkRepository: {
          getByIndex: () => ({ status: "APPROVED" }),
          list: () => [],
        },
      }).service.pending(false),
    ).toThrow(/não está pendente/);
  });

  it("falls back to list/getCurrent repositories and rejects missing project state", () => {
    const fallback = makeService({
      projectRepository: {
        list: () => [
          { ...project, id: 1 },
          { ...project, id: 9 },
        ],
      },
      projectConfigRepository: { getCurrent: vi.fn(() => config) },
      cycleRepository: { getCurrent: vi.fn(() => cycle) },
    });
    expect(fallback.service.pending(false)).toContain("Project : Demo");

    expect(() =>
      makeService({
        projectRepository: { getCurrent: () => null, list: () => [] },
      }).service.pending(false),
    ).toThrow(/Projeto/);
  });
});
