/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { StatusCommand } from "./status-command.js";
import { setSharedContainer, clearSharedContainer } from "../container.js";
import { setOutputFormat } from "../output.js";

describe("StatusCommand", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    clearSharedContainer();
    setOutputFormat("text");
  });

  it("executes status service and prints the formatted status text in text mode", () => {
    const mockStatusService = {
      showStatus: vi.fn().mockReturnValue("MOCK_STATUS_REPORT"),
    };

    setSharedContainer({
      statusService: mockStatusService,
    } as any);

    setOutputFormat("text");

    const handler = new StatusCommand();
    handler.execute();

    expect(mockStatusService.showStatus).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("MOCK_STATUS_REPORT");
  });

  it("executes status service and prints the JSON response envelope in json mode", () => {
    const mockStatusService = {
      showStatus: vi.fn().mockReturnValue("MOCK_STATUS_REPORT"),
    };

    setSharedContainer({
      statusService: mockStatusService,
    } as any);

    setOutputFormat("json");

    const handler = new StatusCommand();
    handler.execute();

    expect(mockStatusService.showStatus).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ ok: true, output: "MOCK_STATUS_REPORT" }));
  });
});
