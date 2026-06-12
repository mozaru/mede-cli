import fs from "node:fs";
import path from "node:path";
import { parseMedeConfig } from "../../shared/mede-config-schema.js";
import { BacklogReplayService } from "../../application/services/backlog-replay-service.js";
import { ConsistencyCheckerService } from "../../application/services/consistency-checker-service.js";
import { extractPlaceholderBlocks } from "../../shared/placeholder-block-extractor.js";

export class ValidateHandler {
  private readonly replayService: BacklogReplayService;
  private readonly checkerService: ConsistencyCheckerService;

  constructor() {
    this.replayService = new BacklogReplayService();
    this.checkerService = new ConsistencyCheckerService();
  }

  public execute(strict: boolean = false): boolean {
    const configPath = "mede.config.json";
    if (!fs.existsSync(configPath)) {
      console.log("ERRO: mede.config.json nao encontrado.");
      return false;
    }

    const config = parseMedeConfig(fs.readFileSync(configPath, "utf-8"));
    const docsRoot = path.resolve(config.docsRoot);

    const initialUnderstandingPath = path.join(docsRoot, config.fileNames.initialUnderstanding);
    const currentStatePath = path.join(docsRoot, config.fileNames.currentState);
    const legDir = path.join(docsRoot, config.directories.deliveryLog);
    const legPrefix = config.prefixes.deliveryLog;

    if (!fs.existsSync(initialUnderstandingPath)) {
      console.log(`${config.fileNames.initialUnderstanding} nao encontrado; validate ignorado.`);
      return true;
    }

    const legPaths: string[] = [];
    if (fs.existsSync(legDir)) {
      const files = fs
        .readdirSync(legDir)
        .filter((f) => f.startsWith(`${legPrefix}-`) && f.endsWith(".md"))
        .sort();
      legPaths.push(...files.map((f) => path.join(legDir, f)));
    }

    const structuralIssues = this.validatePlaceholderBlocks([
      initialUnderstandingPath,
      currentStatePath,
      ...legPaths,
    ]);
    for (const issue of structuralIssues) {
      console.log(`ERRO: ${issue}`);
    }

    const { state, legResults, initialIssues } = this.replayService.replay(
      initialUnderstandingPath,
      legPaths,
    );

    for (const issue of initialIssues) {
      console.log(`ERRO: ${issue}`);
    }

    let hasLegIssues = false;
    for (const { legFile, statIssues, causalIssues } of legResults) {
      if (statIssues.length > 0 || causalIssues.length > 0) {
        hasLegIssues = true;
        console.log(`ERRO: ${legFile}:`);
        for (const issue of causalIssues) {
          console.log(`  ${issue}`);
        }
        for (const issue of statIssues) {
          console.log(`  ${issue.stat}: esperado ${issue.expected}, encontrado ${issue.found}`);
        }
      }
    }
    if (!hasLegIssues && legPaths.length > 0) {
      console.log(`OK: ${legPaths.length} LEG(s) com estatisticas consistentes.`);
    }

    if (!fs.existsSync(currentStatePath)) {
      console.log(`${config.fileNames.currentState} nao encontrado.`);
      return structuralIssues.length === 0 && initialIssues.length === 0 && !hasLegIssues;
    }

    const currentStateContent = fs.readFileSync(currentStatePath, "utf-8");
    const { ok, issues } = this.checkerService.check(state, currentStateContent);

    if (ok) {
      console.log("OK: Estado final reconstruido = situacao-atual.md");
    } else {
      console.log("ERRO: Divergencia entre replay e situacao-atual.md:");
      for (const issue of issues) {
        console.log(`  ${issue}`);
      }
    }

    const valid = structuralIssues.length === 0 && initialIssues.length === 0 && !hasLegIssues && ok;
    if (!valid && strict) {
      throw new Error("Validacao de consistencia causal falhou (--strict).");
    }

    return valid;
  }

  private validatePlaceholderBlocks(pathsToValidate: string[]): string[] {
    const issues: string[] = [];
    for (const filePath of pathsToValidate) {
      if (!fs.existsSync(filePath)) {
        continue;
      }
      try {
        extractPlaceholderBlocks(fs.readFileSync(filePath, "utf-8"));
      } catch (err) {
        issues.push(
          `${path.relative(process.cwd(), filePath)}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    return issues;
  }
}
