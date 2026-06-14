/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UpdateCommand } from "./update-command.js";
import { setOutputFormat } from "../output.js";
import { spawn } from "node:child_process";
import { resolveVersion } from "../runner.js";
import { I18n } from "../../shared/i18n.js";

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

vi.mock("../runner.js", () => ({
  resolveVersion: vi.fn().mockReturnValue("1.1.1"),
}));

describe("UpdateCommand", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let fetchSpy: any;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    vi.mocked(resolveVersion).mockReturnValue("1.1.1");
    I18n.setLanguage("pt-BR");
    vi.clearAllMocks();
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    setOutputFormat("text");
  });

  it("should output message when version is already up to date", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: "1.1.1" }),
    });

    const command = new UpdateCommand();
    await command.execute();

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://registry.npmjs.org/mede-cli/latest",
      expect.any(Object),
    );
    expect(spawn).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Você já está na versão mais recente"),
    );
  });

  it("should run npm install -g when a newer version is available and succeed", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: "1.2.0" }),
    });

    const mockChild = {
      on: vi.fn((event, callback) => {
        if (event === "close") {
          setTimeout(() => callback(0), 10);
        }
        return mockChild;
      }),
    };
    vi.mocked(spawn).mockReturnValue(mockChild as any);

    const command = new UpdateCommand();
    await command.execute();

    expect(spawn).toHaveBeenCalledWith("npm", ["install", "-g", "mede-cli@latest"], {
      stdio: "inherit",
      shell: true,
    });
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Atualização concluída com sucesso! Versão anterior: 1.1.1, Versão atual: 1.2.0",
      ),
    );
  });

  it("should output error message if fetch fails", async () => {
    fetchSpy.mockRejectedValue(new Error("Network Error"));

    const command = new UpdateCommand();
    await command.execute();

    expect(spawn).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Erro ao verificar ou aplicar a atualização: Network Error"),
    );
  });

  it("should output error and suggestion if npm install fails", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: "1.2.0" }),
    });

    const mockChild = {
      on: vi.fn((event, callback) => {
        if (event === "close") {
          setTimeout(() => callback(1), 10);
        }
        return mockChild;
      }),
    };
    vi.mocked(spawn).mockReturnValue(mockChild as any);

    const command = new UpdateCommand();
    await command.execute();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Erro ao verificar ou aplicar a atualização: npm install falhou"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Por favor, tente executar manualmente: npm install -g mede-cli"),
    );
  });
});
