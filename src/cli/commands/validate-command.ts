import fs from "node:fs";
import path from "node:path";
import { parseMedeConfig } from "../../shared/mede-config-schema.js";
import { BacklogReplayService } from "../../application/services/backlog-replay-service.js";
import { ConsistencyCheckerService } from "../../application/services/consistency-checker-service.js";
import { extractPlaceholderBlocks } from "../../shared/placeholder-block-extractor.js";
import { I18n } from "../../shared/i18n.js";

export class ValidateCommand {
  private replayService: BacklogReplayService;
  private checkerService: ConsistencyCheckerService;

  constructor() {
    this.replayService = new BacklogReplayService();
    this.checkerService = new ConsistencyCheckerService();
  }

  public execute(strict: boolean = false): boolean {
    const configPath = "mede.config.json";
    if (!fs.existsSync(configPath)) {
      console.log(I18n.t("ERRO: mede.config.json nao encontrado."));
      return false;
    }

    const config = parseMedeConfig(fs.readFileSync(configPath, "utf-8"));
    I18n.setLanguage(config.language);

    const docsRoot = path.resolve(config.docsRoot);

    const initialUnderstandingPath = path.join(docsRoot, config.fileNames.initialUnderstanding);
    const currentStatePath = path.join(docsRoot, config.fileNames.currentState);
    const legDir = path.join(docsRoot, config.directories.deliveryLog);
    const legPrefix = config.prefixes.deliveryLog;

    if (!fs.existsSync(initialUnderstandingPath)) {
      console.log(
        I18n.t("{0} nao encontrado; validate ignorado.", config.fileNames.initialUnderstanding),
      );
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
      console.log(I18n.t("ERRO: {0}", issue));
    }

    const { state, legResults, initialIssues } = this.replayService.replay(
      initialUnderstandingPath,
      legPaths,
    );

    for (const issue of initialIssues) {
      console.log(I18n.t("ERRO: {0}", issue));
    }

    let hasLegIssues = false;
    for (const { legFile, statIssues, causalIssues } of legResults) {
      if (statIssues.length > 0 || causalIssues.length > 0) {
        hasLegIssues = true;
        console.log(I18n.t("ERRO: {0}:", legFile));
        for (const issue of causalIssues) {
          console.log(`  ${issue}`);
        }
        for (const issue of statIssues) {
          console.log(
            I18n.t("  {0}: esperado {1}, encontrado {2}", issue.stat, issue.expected, issue.found),
          );
        }
      }
    }
    if (!hasLegIssues && legPaths.length > 0) {
      console.log(I18n.t("OK: {0} LEG(s) com estatisticas consistentes.", legPaths.length));
    }

    if (!fs.existsSync(currentStatePath)) {
      console.log(I18n.t("{0} nao encontrado.", config.fileNames.currentState));
      return structuralIssues.length === 0 && initialIssues.length === 0 && !hasLegIssues;
    }

    const currentStateContent = fs.readFileSync(currentStatePath, "utf-8");
    const { ok, issues } = this.checkerService.check(state, currentStateContent);

    if (ok) {
      console.log(I18n.t("OK: Estado final reconstruido = situacao-atual.md"));
    } else {
      console.log(I18n.t("ERRO: Divergencia entre replay e situacao-atual.md:"));
      for (const issue of issues) {
        console.log(`  ${issue}`);
      }
    }

    const valid =
      structuralIssues.length === 0 && initialIssues.length === 0 && !hasLegIssues && ok;
    if (!valid && strict) {
      throw new Error(I18n.t("Validacao de consistencia causal falhou (--strict)."));
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
