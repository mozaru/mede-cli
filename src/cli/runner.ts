import { Command } from "commander";
import { ChangesHandler } from "../commands/changes-handler.js";
import { ConfigHandler } from "../commands/config-handler.js";
import { CycleHandler } from "../commands/cycle-handler.js";
import { FilesHandler } from "../commands/files-handler.js";
import { InitHandler } from "../commands/init-handler.js";
import { LlmHandler } from "../commands/llm-handler.js";
import { StatusHandler } from "../commands/status-handler.js";

function collectRepeatedOption(
  value: string,
  previous: string[] = [],
): string[] {
  return [...previous, value];
}

function parseOptionalNumber(value?: string): number | null {
  if (!value?.trim()) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid numeric value: ${value}`);
  }

  return parsed;
}

export function runCli(): void {
  const program = new Command();

  program
    .name("mede-cli")
    .description("MEDE CLI")
    .version("0.1.1");

  program  //mede-cli status 
    .command("status")
    .description("Show current project status")
    .action(() => {
      const handler = new StatusHandler();
      handler.execute();
    });

  program  //mede-cli init -p 
    .command("init")
    .description("Initialize the MEDE project or reconstruct local state")
    .option("-p, --prompt <text>", "Initial user prompt")
    .option(
      "-f, --file <path>",
      "Attach a file or directory to the init context",
      collectRepeatedOption,
      [],
    )
    .action((options: { prompt?: string; file?: string[] }) => {
      const handler = new InitHandler();

      handler.execute(options.prompt ?? "", options.file ?? []);
    });


  program  //mede-cli files -b 
    .command("files")
    .description("Lista os arquivos modificados no ciclo atua")
    .option("-b, --backup", "Indica se eh o arquivo atual ou o backup")
    .action((options: { backup?: boolean }) => {
      const handler = new FilesHandler();

      handler.executeList(options.backup ?? false);
    });

  program  //mede-cli cat <file> -b 
    .command("cat <file>") 
    .description("Mostra o conteúdo completo do arquivo 'file', no ciclo atua")
    .option("-b, --backup", "Indica se eh o arquivo atual ou o backup")
    .action((file: string, options: { backup?: boolean }) => {
      const handler = new FilesHandler();

      handler.executeCat(file, options.backup ?? false);
    });

    program  //mede-cli diff <file> 
    .command("diff <file>")
    .description("Mostra o diff do arquivo 'file', no ciclo atua")
    .action((file: string) => {
      const handler = new FilesHandler();

      handler.executeDiff(file);
    });

  const config = program  //mede-cli config 
    .command("config")
    .description("Inspect MEDE configuration")
    .action(async () => {
      const handler = new ConfigHandler();
      await handler.execute();
    });  
  
  config //mede-cli config init
    .command("init")
    .description("create MEDE configuration")
    .action( async () => {
      const handler = new ConfigHandler();
      await handler.executeInit();
    });

    config //mede-cli config apply
    .command("apply")
    .description("apply MEDE configuration changes")
    .action( async () => {
      const handler = new ConfigHandler();
      await handler.executeApply();
    });


  program  //mede-cli cycle -p ".." -f "file1;dir;file2;"
    .command("cycle")
    .description("Execute the next methodological cycle")
    .option("-p, --prompt <text>", "Cycle prompt")
    .option(
      "-f, --file <path>",
      "Attach a file or directory to the cycle context",
      collectRepeatedOption,
      [],
    )
    .action(async (options: { prompt?: string; file?: string[] }) => {
      const handler = new CycleHandler();
      await handler.executeCycle(options.prompt ?? "", options.file ?? [])
    });

  program  //mede-cli approve -a
    .command("approve")
    .description("Approve and apply a change-set")
    .option("-a, --all", "approve all phases of current cycle")
    .action(async (options: { all?: boolean })  => {
      const handler = new CycleHandler();
      await handler.executeApprove(options.all??false);
    });

  program  //mede-cli reject -a
    .command("reject")
    .description("Reject a change-set")
    .option("-a, --all", "reject all phases of current cycle")
    .action(async (options: { all?: boolean })  => {
      const handler = new CycleHandler();
      await handler.executeReject(options.all??false);
    });

  program  //mede-cli reset 
    .command("reset")
    .description("Reset current cycle, rollback all changes")
    .action(async ()  => {
      const handler = new CycleHandler();
      await handler.executeReset();
    });

  program  //mede-cli retry 
    .command("retry")
    .description("retry current cycle, after llm error")
    .action(async ()  => {
      const handler = new CycleHandler();
      await handler.executeRetry();
    });


  program  //mede-cli refine -p "..." -f "file1;dir;file2
    .command("refine")
    .description("Refine current change-set in current phase of currente cycle")
    .option("-p, --prompt <text>", "Cycle prompt")
    .option(
      "-f, --file <path>",
      "Attach a file or directory to the cycle context",
      collectRepeatedOption,
      [],
    )
    .action(async (options: { prompt?: string; file?: string[] }) => {
      const handler = new CycleHandler();
      await handler.executeRefine(options.prompt ?? "", options.file ?? []);
    });

  program  //mede-cli commit 
    .command("commit")
    .description("commit all changes")
    .action(()  => {
      const handler = new CycleHandler();
      handler.executeCommit();
    });

  program  //mede-cli rollback 
    .command("rollback")
    .description("rollback all changes")
    .action(()  => {
      const handler = new CycleHandler();
      handler.executeRollback();
    });    

  program  //mede-cli pending -a
    .command("pending")
    .description("List chunks pending of current change-set")
    .option("-a, --all", "list all chunks of current change-set")
    .action((options: { all?: boolean })  => {
      const handler = new ChangesHandler();
      handler.executePending(options.all??false);
    });

  program  //mede-cli apply -a
    .command("apply")
    .description("Apply current diff")
    .option("-a, --all", "apply all diff of current change-set")
    .action((options: { all?: boolean })  => {
      const handler = new ChangesHandler();
      handler.executeApply(options.all??false);
    });

  program  //mede-cli discard -a
    .command("discard")
    .description("Discard a current diff")
    .option("-a, --all", "discard all diff of current change-set")
    .action((options: { all?: boolean })  => {
      const handler = new ChangesHandler();
      handler.executeDiscard(options.all??false);
    });    

  const llm = program  //mede-cli llm 
    .command("llm")
    .description("Inspect or test current LLM configuration")
    .option("-p, --prompt <text>", "Prompt for llm test action")
    .action(() => {
      const handler = new LlmHandler();
      handler.execute()
    });

  llm ////mede-cli llm test -p "..."
    .command("test")
    .description("create MEDE configuration")
    .option("-p, --prompt <text>", "Prompt for llm test action")
    .action(async (options: {
      prompt?: string;
    }) => {
      const handler = new LlmHandler();
      await handler.executeTest(options.prompt??"");
    });

  program.parse(process.argv);
}