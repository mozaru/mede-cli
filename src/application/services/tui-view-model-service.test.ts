import { describe, expect, it, vi } from "vitest";

import { TuiViewModelService } from "./tui-view-model-service.js";

describe("TuiViewModelService", () => {
  it("returns an empty view model when there is no current project", () => {
    const service = new TuiViewModelService(
      mockUow() as any,
      { getCurrent: vi.fn(() => null) } as any,
      { getCurrent: vi.fn() } as any,
      { getByIndex: vi.fn() } as any,
      { getCurrent: vi.fn() } as any,
      { list: vi.fn() } as any,
    );

    expect(service.getViewModel()).toEqual({
      project: null,
      cycle: null,
      phase: null,
      changeSet: null,
      chunks: [],
    });
  });

  it("assembles the active TUI state from repositories", () => {
    const project = { id: 1, name: "Project" };
    const cycle = { id: 2, projectId: 1, currentPhaseIndex: 3 };
    const phase = { id: 4, cycleId: 2 };
    const changeSet = { id: 5, phaseId: 4 };
    const chunks = [{ id: 6, changeSetId: 5 }];

    const service = new TuiViewModelService(
      mockUow() as any,
      { getCurrent: vi.fn(() => project) } as any,
      { getCurrent: vi.fn(() => cycle) } as any,
      { getByIndex: vi.fn(() => phase) } as any,
      { getCurrent: vi.fn(() => changeSet) } as any,
      { list: vi.fn(() => chunks) } as any,
    );

    expect(service.getViewModel()).toEqual({
      project,
      cycle,
      phase,
      changeSet,
      chunks,
    });
  });

  it("updates the selected chunk inside a transaction", () => {
    const uow = mockUow();
    const changeSetRepository = { updateChunkIndex: vi.fn() };
    const service = new TuiViewModelService(
      uow as any,
      {} as any,
      {} as any,
      {} as any,
      changeSetRepository as any,
      {} as any,
    );

    service.selectChunk(10, 3, 7);

    expect(uow.requireTransaction).toHaveBeenCalled();
    expect(changeSetRepository.updateChunkIndex).toHaveBeenCalledWith(10, 3, 7);
    expect(uow.commit).toHaveBeenCalled();
    expect(uow.rollback).not.toHaveBeenCalled();
  });

  it("rolls back when selecting a chunk fails", () => {
    const uow = mockUow();
    const error = new Error("db failure");
    const service = new TuiViewModelService(
      uow as any,
      {} as any,
      {} as any,
      {} as any,
      { updateChunkIndex: vi.fn(() => { throw error; }) } as any,
      {} as any,
    );

    expect(() => service.selectChunk(10, 3, 7)).toThrow(error);
    expect(uow.rollback).toHaveBeenCalled();
    expect(uow.commit).not.toHaveBeenCalled();
  });
});

function mockUow() {
  return {
    requireTransaction: vi.fn(),
    commit: vi.fn(),
    rollback: vi.fn(),
  };
}
