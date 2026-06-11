import fs from "node:fs";
import path from "node:path";

export interface LegStatIssue {
  stat: string;
  expected: number;
  found: number;
}

export interface LegReplayResult {
  legFile: string;
  statIssues: LegStatIssue[];
}

export interface ReplayResult {
  state: Map<string, string>;
  legResults: LegReplayResult[];
}

export class BacklogReplayService {
  public replay(initialUnderstandingPath: string, legPaths: string[]): ReplayResult {
    const initialContent = fs.readFileSync(initialUnderstandingPath, "utf-8");
    const sorted = [...legPaths].sort((a, b) =>
      path.basename(a).localeCompare(path.basename(b)),
    );
    const legContents = sorted.map((p) => ({
      name: path.basename(p),
      content: fs.readFileSync(p, "utf-8"),
    }));
    return this.replayFromContent(initialContent, legContents);
  }

  public replayFromContent(
    initialContent: string,
    legContents: Array<{ name: string; content: string }>,
  ): ReplayResult {
    const state = this.parseInitialState(initialContent);
    const legResults: LegReplayResult[] = [];

    for (const { name, content } of legContents) {
      const deliveredIds = this.parseTableFirstColumn(content, "TABELA_ENTREGUES");
      for (const id of deliveredIds) {
        if (state.has(id)) {
          state.set(id, "Concluído");
        }
      }

      const newItems = this.parseTableIdAndStatus(content, "TABELA_NOVOS_CICLO");
      for (const { id, status } of newItems) {
        state.set(id, status);
      }

      const statIssues = this.validateLegStats(content, state, deliveredIds.length, newItems.length);
      legResults.push({ legFile: name, statIssues });
    }

    return { state, legResults };
  }

  public validateLegStats(
    legDoc: string,
    stateAtLeg: Map<string, string>,
    deliveredThisCycle?: number,
    newThisCycle?: number,
  ): LegStatIssue[] {
    const issues: LegStatIssue[] = [];
    const statuses = [...stateAtLeg.values()];

    const totalDelivered = statuses.filter((s) => this.normalizeStatus(s) === "CONCLUIDO").length;
    const totalPending = statuses.filter((s) =>
      ["PENDENTE", "AGUARDANDO"].includes(this.normalizeStatus(s)),
    ).length;

    const resolvedDeliveredCycle =
      deliveredThisCycle ?? this.parseTableFirstColumn(legDoc, "TABELA_ENTREGUES").length;
    const resolvedNewCycle =
      newThisCycle ?? this.parseTableIdAndStatus(legDoc, "TABELA_NOVOS_CICLO").length;

    const checks: Array<{ name: string; expected: number }> = [
      { name: "TOTAL_ENTREGUES", expected: totalDelivered },
      { name: "TOTAL_PENDENTES", expected: totalPending },
      { name: "TOTAL_ENTREGUES_CICLO", expected: resolvedDeliveredCycle },
      { name: "NOVOS_CICLO", expected: resolvedNewCycle },
    ];

    for (const { name, expected } of checks) {
      const raw = this.parseInlineBlock(legDoc, name);
      if (raw === null || raw === "") continue;
      const found = Number(raw);
      if (Number.isNaN(found) || found !== expected) {
        issues.push({ stat: name, expected, found: Number.isNaN(found) ? -1 : found });
      }
    }

    return issues;
  }

  private parseInitialState(content: string): Map<string, string> {
    const state = new Map<string, string>();
    const block = this.extractBlock(content, "TABELA_BACKLOG_INICIAL");
    if (!block) return state;

    const rows = this.parseMarkdownTable(block);
    for (const row of rows) {
      const id = row[0]?.trim() ?? "";
      const status = row[4]?.trim() ?? "Pendente";
      if (id && id !== "—") {
        state.set(id, status);
      }
    }
    return state;
  }

  private parseTableFirstColumn(content: string, blockName: string): string[] {
    const block = this.extractBlock(content, blockName);
    if (!block) return [];
    const rows = this.parseMarkdownTable(block);
    return rows.map((r) => r[0]?.trim() ?? "").filter(Boolean);
  }

  private parseTableIdAndStatus(
    content: string,
    blockName: string,
  ): Array<{ id: string; status: string }> {
    const block = this.extractBlock(content, blockName);
    if (!block) return [];
    const rows = this.parseMarkdownTable(block);
    return rows
      .map((r) => ({ id: r[0]?.trim() ?? "", status: r[4]?.trim() ?? "Pendente" }))
      .filter((i) => i.id && i.id !== "—");
  }

  private extractBlock(content: string, blockName: string): string | null {
    const regex = new RegExp(
      `<!--\\s*BEGIN-${blockName}\\s*-->([\\s\\S]*?)<!--\\s*END-${blockName}\\s*-->`,
      "i",
    );
    const match = content.match(regex);
    return match ? match[1] : null;
  }

  private parseInlineBlock(content: string, blockName: string): string | null {
    const regex = new RegExp(
      `<!--\\s*BEGIN-${blockName}\\s*-->(.*?)<!--\\s*END-${blockName}\\s*-->`,
      "i",
    );
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  }

  private parseMarkdownTable(block: string): string[][] {
    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const rows: string[][] = [];
    let headerFound = false;

    for (const line of lines) {
      if (!line.includes("|")) continue;
      if (/^\|?\s*:?-{3,}/.test(line)) {
        headerFound = true;
        continue;
      }
      if (!headerFound) continue;
      const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter((c, i, a) => {
          const isFirst = i === 0 && c === "";
          const isLast = i === a.length - 1 && c === "";
          return !isFirst && !isLast;
        });
      if (cells.length > 0) rows.push(cells);
    }
    return rows;
  }

  private normalizeStatus(status: string): string {
    return status
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toUpperCase();
  }
}
