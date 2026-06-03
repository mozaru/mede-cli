import { readFileSync } from "node:fs";
import { Command } from "commander";
import { reportCliError } from "./error-handler.js";
import { setOutputFormat } from "./output.js";
import { startRepl } from "./repl.js";
import { ChangesHandler } from "./commands/changes-handler.js";
import { ConfigHandler } from "./commands/config-handler.js";
import { CycleHandler } from "./commands/cycle-handler.js";
import { FilesHandler } from "./commands/files-handler.js";
import { InitHandler } from "./commands/init-handler.js";
import { LlmHandler } from "./commands/llm-handler.js";
import { StatusHandler } from "./commands/status-handler.js";

// Single source of truth for the version: read package.json at runtime. Using a
// URL relative to this module keeps it working both in dev (tsx) and in the
// bundled dist artifact, and avoids importing JSON across the tsconfig rootDir.
function resolveVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    ) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function collectRepeatedOption(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

// Builds the fully-configured commander program. Extracted so both the one-shot
// CLI (runCli) and the interactive console (REPL) drive the exact same commands.
export function buildProgram(): Command {
  const program = new Command();

  program.name("mede-cli").description("MEDE CLI").version(resolveVersion());

  // Global flag: emit machine-readable JSON instead of human text. Place it
  // before the subcommand (e.g. `mede-cli --json status`). The preAction hook
  // applies it before any command runs.
  program.option("--json", "Emite a saída em JSON (para uso em scripts)");
  program.hook("preAction", () => {
    if (program.opts().json) {
      setOutputFormat("json");
    }
  });

  program //mede-cli status
    .command("status")
    .description("Mostra o estado atual do projeto")
    .action(() => {
      const handler = new StatusHandler();
      handler.execute();
    });

  program //mede-cli init -p
    .command("init")
    .description("Inicializa o projeto MEDE ou reconstrói o estado local")
    .option("-p, --prompt <text>", "Prompt inicial do usuário")
    .option(
      "-f, --file <path>",
      "Anexa um arquivo ou diretório ao contexto do init",
      collectRepeatedOption,
      [],
    )
    .action((options: { prompt?: string; file?: string[] }) => {
      const handler = new InitHandler();

      handler.execute(options.prompt ?? "", options.file ?? []);
    });

  program //mede-cli files -b
    .command("files")
    .description("Lista os arquivos modificados no ciclo atual")
    .option("-b, --backup", "Mostra os arquivos do snapshot inicial em vez dos atuais")
    .action((options: { backup?: boolean }) => {
      const handler = new FilesHandler();

      handler.executeList(options.backup ?? false);
    });

  program //mede-cli cat <file> -b
    .command("cat <file>")
    .description("Mostra o conteúdo completo do arquivo 'file' no ciclo atual")
    .option("-b, --backup", "Mostra a versão do snapshot inicial em vez da atual")
    .action((file: string, options: { backup?: boolean }) => {
      const handler = new FilesHandler();

      handler.executeCat(file, options.backup ?? false);
    });

  program //mede-cli diff <file>
    .command("diff <file>")
    .description("Mostra o diff do arquivo 'file' no ciclo atual")
    .action((file: string) => {
      const handler = new FilesHandler();

      handler.executeDiff(file);
    });

  const config = program //mede-cli config
    .command("config")
    .description("Mostra a configuração atual do MEDE")
    .action(async () => {
      const handler = new ConfigHandler();
      await handler.execute();
    });

  config //mede-cli config init
    .command("init")
    .description("Cria o arquivo mede.config.json")
    .action(async () => {
      const handler = new ConfigHandler();
      await handler.executeInit();
    });

  config //mede-cli config apply
    .command("apply")
    .description("Aplica alterações manuais feitas na configuração")
    .action(async () => {
      const handler = new ConfigHandler();
      await handler.executeApply();
    });

  program //mede-cli cycle -p ".." -f "file1;dir;file2;"
    .command("cycle")
    .description("Inicia o próximo ciclo metodológico")
    .option("-p, --prompt <text>", "Prompt do ciclo")
    .option(
      "-f, --file <path>",
      "Anexa um arquivo ou diretório ao contexto do ciclo",
      collectRepeatedOption,
      [],
    )
    .action(async (options: { prompt?: string; file?: string[] }) => {
      const handler = new CycleHandler();
      await handler.executeCycle(options.prompt ?? "", options.file ?? []);
    });

  program //mede-cli approve -a
    .command("approve")
    .description("Aprova e aplica o change-set da fase atual")
    .option("-a, --all", "Aprova automaticamente todas as fases seguintes")
    .action(async (options: { all?: boolean }) => {
      const handler = new CycleHandler();
      await handler.executeApprove(options.all ?? false);
    });

  program //mede-cli reject -a
    .command("reject")
    .description("Rejeita o change-set da fase atual")
    .option("-a, --all", "Rejeita automaticamente todas as fases seguintes")
    .action(async (options: { all?: boolean }) => {
      const handler = new CycleHandler();
      await handler.executeReject(options.all ?? false);
    });

  program //mede-cli reset
    .command("reset")
    .description("Reinicia a fase atual, descartando a proposta corrente")
    .action(async () => {
      const handler = new CycleHandler();
      await handler.executeReset();
    });

  program //mede-cli retry
    .command("retry")
    .description("Repete a geração da fase atual após erro da LLM")
    .action(async () => {
      const handler = new CycleHandler();
      await handler.executeRetry();
    });

  program //mede-cli refine -p "..." -f "file1;dir;file2
    .command("refine")
    .description("Refina o change-set da fase atual do ciclo")
    .option("-p, --prompt <text>", "Prompt de refinamento")
    .option(
      "-f, --file <path>",
      "Anexa um arquivo ou diretório ao contexto do refinamento",
      collectRepeatedOption,
      [],
    )
    .action(async (options: { prompt?: string; file?: string[] }) => {
      const handler = new CycleHandler();
      await handler.executeRefine(options.prompt ?? "", options.file ?? []);
    });

  program //mede-cli commit
    .command("commit")
    .description("Finaliza o ciclo, mantendo todas as alterações aprovadas")
    .action(() => {
      const handler = new CycleHandler();
      handler.executeCommit();
    });

  program //mede-cli rollback
    .command("rollback")
    .description("Cancela o ciclo, restaurando o snapshot inicial")
    .action(() => {
      const handler = new CycleHandler();
      handler.executeRollback();
    });

  program //mede-cli pending -a
    .command("pending")
    .description("Lista os trecho-diffs pendentes do change-set atual")
    .option("-a, --all", "Lista todos os trecho-diffs do change-set atual")
    .action((options: { all?: boolean }) => {
      const handler = new ChangesHandler();
      handler.executePending(options.all ?? false);
    });

  program //mede-cli apply -a
    .command("apply")
    .description("Aplica o trecho-diff atual")
    .option("-a, --all", "Aplica todos os trecho-diffs do change-set atual")
    .action((options: { all?: boolean }) => {
      const handler = new ChangesHandler();
      handler.executeApply(options.all ?? false);
    });

  program //mede-cli discard -a
    .command("discard")
    .description("Descarta o trecho-diff atual")
    .option("-a, --all", "Descarta todos os trecho-diffs do change-set atual")
    .action((options: { all?: boolean }) => {
      const handler = new ChangesHandler();
      handler.executeDiscard(options.all ?? false);
    });

  const llm = program //mede-cli llm
    .command("llm")
    .description("Inspeciona a configuração de LLM atual")
    .option("-p, --prompt <text>", "Prompt para o teste da LLM")
    .action(() => {
      const handler = new LlmHandler();
      handler.execute();
    });

  llm ////mede-cli llm test -p "..."
    .command("test")
    .description("Executa um prompt de teste isolado na LLM")
    .option("-p, --prompt <text>", "Prompt para o teste da LLM")
    .action(async (options: { prompt?: string }) => {
      const handler = new LlmHandler();
      await handler.executeTest(options.prompt ?? "");
    });

  llm //mede-cli llm login
    .command("login")
    .description("Autentica na LLM via OAuth (device-code) e guarda o token no cofre local")
    .action(async () => {
      const handler = new LlmHandler();
      await handler.executeLogin();
    });

  llm //mede-cli llm logout
    .command("logout")
    .description("Remove as credenciais OAuth guardadas para o provider atual")
    .action(() => {
      const handler = new LlmHandler();
      handler.executeLogout();
    });

  return program;
}

export async function runCli(): Promise<void> {
  const args = process.argv.slice(2);

  // No subcommand or --repl flag: drop into interactive mode.
  // We default to TUI if stdout is a TTY and the user did not explicitly request the REPL via --repl.
  if (args.length === 0 || (args.length === 1 && args[0] === "--repl")) {
    const isInteractive = !!process.stdout.isTTY;
    const forceRepl = args.includes("--repl");

    if (isInteractive && !forceRepl) {
      const { startTui } = await import("./tui.js");
      await startTui();
    } else {
      await startRepl();
    }
    return;
  }

  const program = buildProgram();

  // A single guard around parseAsync catches both synchronous throws from
  // sync actions and rejected promises from async actions, turning any failure
  // into a friendly message plus a non-zero exit code.
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    reportCliError(error);
  }
}
