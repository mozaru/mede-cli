import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { buildProgram } from "./runner.js";
import { formatCliError } from "./error-handler.js";
import { clearSharedContainer, createContainer, setSharedContainer } from "./container.js";

// Minimal interactive console (Q3). A long-lived process reads one command per
// line and dispatches it to the very same commander program the one-shot CLI
// uses, so behavior stays identical. Built-ins (help/exit) are handled here; the
// rest is parsed by a fresh program instance per line (with exitOverride so a
// parse error or `--help` never kills the session).

// Splits a line into argv-style tokens, honoring single/double quotes so that
// arguments with spaces (e.g. -p "duas palavras") survive.
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3] ?? "");
  }

  return tokens;
}

// Renders the outcome of a failed parse. Commander throws a CommanderError for
// help/version (already printed → stay silent) and for unknown command/option
// (give a friendly hint). Anything else is a genuine handler failure.
function reportReplError(error: unknown): void {
  if (error instanceof Error && error.name === "CommanderError") {
    const code = (error as { code?: string }).code ?? "";
    if (code === "commander.unknownCommand" || code === "commander.unknownOption") {
      output.write("Comando inválido. Digite 'help' para ver os comandos disponíveis.\n");
    }
    return;
  }

  // Local, non-fatal print: unlike reportCliError this does not set a non-zero
  // process exit code, since the session keeps going.
  output.write(`Erro: ${formatCliError(error)}\n`);
}

function printWelcome(): void {
  const commands = buildProgram()
    .commands.map((command) => command.name())
    .join(", ");

  output.write("MEDE-CLI — console interativo\n");
  output.write(`Comandos: ${commands}\n`);
  output.write(
    "Digite '<comando> --help' para detalhes, 'help' para esta ajuda, 'exit' para sair.\n\n",
  );
}

function printHelp(): void {
  buildProgram().outputHelp();
  output.write("\nConsole: 'help' mostra esta ajuda, 'exit'/'quit' encerra.\n");
}

export async function startRepl(): Promise<void> {
  const rl = readline.createInterface({ input, output });
  printWelcome();

  // Q1 — single connection per session: the interactive console builds one
  // container (one long-lived SQLite connection) and shares it with every
  // handler, instead of each command re-assembling the graph and opening a fresh
  // connection. The one-shot CLI leaves no shared container, so it keeps its
  // per-process behavior untouched.
  const container = createContainer();
  setSharedContainer(container);

  try {
    for (;;) {
      let line: string;
      try {
        line = (await rl.question("mede> ")).trim();
      } catch {
        // stream closed (Ctrl+D) or interrupted
        break;
      }

      if (line === "") {
        continue;
      }

      const tokens = tokenize(line);
      const command = tokens[0].toLowerCase();

      if (command === "exit" || command === "quit") {
        break;
      }

      if (command === "help" || command === "?") {
        printHelp();
        continue;
      }

      const program = buildProgram();
      program.exitOverride();

      try {
        await program.parseAsync(tokens, { from: "user" });
      } catch (error) {
        reportReplError(error);
      }
    }
  } finally {
    rl.close();
    clearSharedContainer();
    container.dispose();
  }

  output.write("Até logo.\n");
}
