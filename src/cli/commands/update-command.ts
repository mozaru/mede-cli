import { spawn } from "node:child_process";
import { emitResult, emitProgress } from "../output.js";
import { I18n } from "../../shared/i18n.js";
import { resolveVersion } from "../runner.js";

export class UpdateCommand {
  public async execute(): Promise<void> {
    const currentVersion = resolveVersion();
    emitProgress(I18n.t("Verificando se existem atualizações para o mede-cli..."));

    let latestVersion: string;
    try {
      const response = await fetch("https://registry.npmjs.org/mede-cli/latest", {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as { version?: string };
      if (!data.version) {
        throw new Error("Resposta inválida do registro npm");
      }
      latestVersion = data.version;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      emitResult(I18n.t("Erro ao verificar ou aplicar a atualização: {0}", message));
      return;
    }

    if (!this.isNewer(latestVersion, currentVersion)) {
      emitResult(I18n.t("Você já está na versão mais recente ({0}).", currentVersion));
      return;
    }

    emitProgress(
      I18n.t("Nova versão disponível: {0} (versão atual: {1}).", latestVersion, currentVersion),
    );
    emitProgress(I18n.t("Atualizando o mede-cli para a versão {0}...", latestVersion));

    try {
      const success = await this.runNpmInstall();
      if (success) {
        emitResult(
          I18n.t(
            "Atualização concluída com sucesso! Versão anterior: {0}, Versão atual: {1}",
            currentVersion,
            latestVersion,
          ),
        );
      } else {
        emitResult(
          I18n.t("Erro ao verificar ou aplicar a atualização: {0}", "npm install falhou") +
            "\n" +
            I18n.t("Por favor, tente executar manualmente: npm install -g mede-cli"),
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      emitResult(
        I18n.t("Erro ao verificar ou aplicar a atualização: {0}", message) +
          "\n" +
          I18n.t("Por favor, tente executar manualmente: npm install -g mede-cli"),
      );
    }
  }

  private isNewer(latest: string, current: string): boolean {
    const clean = (v: string) => v.replace(/^v/, "").split("-")[0].split(".").map(Number);
    const [lMajor = 0, lMinor = 0, lPatch = 0] = clean(latest);
    const [cMajor = 0, cMinor = 0, cPatch = 0] = clean(current);
    if (lMajor > cMajor) return true;
    if (lMajor < cMajor) return false;
    if (lMinor > cMinor) return true;
    if (lMinor < cMinor) return false;
    return lPatch > cPatch;
  }

  private runNpmInstall(): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn("npm", ["install", "-g", "mede-cli@latest"], {
        stdio: "inherit",
        shell: true,
      });

      child.on("close", (code) => {
        resolve(code === 0);
      });

      child.on("error", () => {
        resolve(false);
      });
    });
  }
}
