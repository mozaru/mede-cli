import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { FilesHandler } from "./files-handler.js";
import { setSharedContainer, clearSharedContainer } from "../container.js";
import { setOutputFormat } from "../output.js";

describe("FilesHandler", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    clearSharedContainer();
    setOutputFormat("text");
  });

  it("executeList runs filesService.files and prints result in text mode", () => {
    const mockFilesService = {
      files: vi.fn().mockReturnValue("MOCK_FILES_LIST"),
      cat: vi.fn(),
      diff: vi.fn(),
    };

    setSharedContainer({
      filesService: mockFilesService,
    } as any);

    setOutputFormat("text");

    const handler = new FilesHandler();
    handler.executeList(true);

    expect(mockFilesService.files).toHaveBeenCalledWith(true);
    expect(logSpy).toHaveBeenCalledWith("MOCK_FILES_LIST");
  });

  it("executeList runs filesService.files and prints JSON result in json mode", () => {
    const mockFilesService = {
      files: vi.fn().mockReturnValue("MOCK_FILES_LIST"),
      cat: vi.fn(),
      diff: vi.fn(),
    };

    setSharedContainer({
      filesService: mockFilesService,
    } as any);

    setOutputFormat("json");

    const handler = new FilesHandler();
    handler.executeList(true);

    expect(mockFilesService.files).toHaveBeenCalledWith(true);
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ ok: true, output: "MOCK_FILES_LIST" }));
  });

  it("executeCat runs filesService.cat and prints result in text mode", () => {
    const mockFilesService = {
      files: vi.fn(),
      cat: vi.fn().mockReturnValue("MOCK_CAT_RESULT"),
      diff: vi.fn(),
    };

    setSharedContainer({
      filesService: mockFilesService,
    } as any);

    setOutputFormat("text");

    const handler = new FilesHandler();
    handler.executeCat("readme.md", false);

    expect(mockFilesService.cat).toHaveBeenCalledWith("readme.md", false);
    expect(logSpy).toHaveBeenCalledWith("MOCK_CAT_RESULT");
  });

  it("executeCat runs filesService.cat and prints JSON result in json mode", () => {
    const mockFilesService = {
      files: vi.fn(),
      cat: vi.fn().mockReturnValue("MOCK_CAT_RESULT"),
      diff: vi.fn(),
    };

    setSharedContainer({
      filesService: mockFilesService,
    } as any);

    setOutputFormat("json");

    const handler = new FilesHandler();
    handler.executeCat("readme.md", false);

    expect(mockFilesService.cat).toHaveBeenCalledWith("readme.md", false);
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ ok: true, output: "MOCK_CAT_RESULT" }));
  });

  it("executeDiff runs filesService.diff and prints result in text mode", () => {
    const mockFilesService = {
      files: vi.fn(),
      cat: vi.fn(),
      diff: vi.fn().mockReturnValue("MOCK_DIFF_RESULT"),
    };

    setSharedContainer({
      filesService: mockFilesService,
    } as any);

    setOutputFormat("text");

    const handler = new FilesHandler();
    handler.executeDiff("readme.md");

    expect(mockFilesService.diff).toHaveBeenCalledWith("readme.md");
    expect(logSpy).toHaveBeenCalledWith("MOCK_DIFF_RESULT");
  });

  it("executeDiff runs filesService.diff and prints JSON result in json mode", () => {
    const mockFilesService = {
      files: vi.fn(),
      cat: vi.fn(),
      diff: vi.fn().mockReturnValue("MOCK_DIFF_RESULT"),
    };

    setSharedContainer({
      filesService: mockFilesService,
    } as any);

    setOutputFormat("json");

    const handler = new FilesHandler();
    handler.executeDiff("readme.md");

    expect(mockFilesService.diff).toHaveBeenCalledWith("readme.md");
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify({ ok: true, output: "MOCK_DIFF_RESULT" }));
  });
});

