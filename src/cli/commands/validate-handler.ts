import fs from "node:fs";
import path from "node:path";
import { parseMedeConfig } from "../../shared/mede-config-schema.js";
import { BacklogReplayService } from "../../application/services/backlog-replay-service.js";
import { ConsistencyCheckerService } from "../../application/services/consistency-checker-service.js";

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
      console.log("❌ mede.config.json não encontrado.");
      return false;
    }

    const config = parseMedeConfig(fs.readFileSync(configPath, "utf-8"));
    const docsRoot = path.resolve(config.docsRoot);

    const initialUnderstandingPath = path.join(docsRoot, config.fileNames.initialUnderstanding);
    const currentStatePath = path.join(docsRoot, config.fileNames.currentState);
    const legDir = path.join(docsRoot, config.directories.deliveryLog);
    const legPrefix = config.prefixes.deliveryLog;

    if (!fs.existsSync(initialUnderstandingPath)) {
      console.log(
        `⚠ ${config.fileNames.initialUnderstanding} não encontrado — validate ignorado.`,
      );
      return true;
    }

    const legPaths: string[] = [];
    if (fs.existsSync(legDir)) {
      const files = fs
        .readdirSync(legDir)
        .filter((f) => f.startsWith(legPrefix + "-") && f.endsWith(".md"))
        .sort();
      legPaths.push(...files.map((f) => path.join(legDir, f)));
    }

    const { state, legResults } = this.replayService.replay(initialUnderstandingPath, legPaths);

    let hasLegIssues = false;
    for (const { legFile, statIssues } of legResults) {
      if (statIssues.length > 0) {
        hasLegIssues = true;
        console.log(`✗ ${legFile}:`);
        for (const issue of statIssues) {
          console.log(`  ${issue.stat}: esperado ${issue.expected}, encontrado ${issue.found}`);
        }
      }
    }
    if (!hasLegIssues && legPaths.length > 0) {
      console.log(`✓ ${legPaths.length} LEG(s) com estatísticas consistentes.`);
    }

    if (!fs.existsSync(currentStatePath)) {
      console.log(`⚠ ${config.fileNames.currentState} não encontrado.`);
      return !hasLegIssues;
    }

    const currentStateContent = fs.readFileSync(currentStatePath, "utf-8");
    const { ok, issues } = this.checkerService.check(state, currentStateContent);

    if (ok) {
      console.log("✓ Estado final reconstruído = situacao-atual.md");
    } else {
      console.log("✗ Divergência entre replay e situacao-atual.md:");
      for (const issue of issues) {
        console.log(`  ${issue}`);
      }
    }

    const valid = !hasLegIssues && ok;
    if (!valid && strict) {
      throw new Error("Validação de consistência causal falhou (--strict).");
    }

    return valid;
  }
}
