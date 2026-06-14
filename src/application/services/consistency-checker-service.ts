import { BacklogStatus, normalizeStatus } from "../../domain/enums/backlog-status.js";
import { isEmptyCell } from "../../shared/utils.js";

export interface ConsistencyResult {
  ok: boolean;
  issues: string[];
}

interface CurrentStateRow {
  id: string;
  status: string;
}

export class ConsistencyCheckerService {
  public check(replayedState: Map<string, string>, currentStateContent: string): ConsistencyResult {
    const currentRows = this.parseCurrentStateRows(currentStateContent);
    const currentState = this.toState(currentRows);
    const issues: string[] = [
      ...this.findDuplicateIssues(currentRows.map((row) => row.id)),
      ...this.checkIndicators(currentState, currentStateContent),
    ];

    for (const [id, status] of replayedState) {
      if (!currentState.has(id)) {
        issues.push(`Item ${id} presente no replay mas ausente em situacao-atual.md`);
      } else if (normalizeStatus(currentState.get(id)!) !== normalizeStatus(status)) {
        issues.push(
          `Item ${id}: status no replay e "${status}" mas em situacao-atual.md e "${currentState.get(id)}"`,
        );
      }
    }

    for (const [id] of currentState) {
      if (!replayedState.has(id)) {
        issues.push(`Item ${id} presente em situacao-atual.md mas ausente no replay`);
      }
    }

    return { ok: issues.length === 0, issues };
  }

  public diff(replayedState: Map<string, string>, currentStateContent: string): string {
    const currentState = this.toState(this.parseCurrentStateRows(currentStateContent));
    const lines: string[] = [];

    for (const [id, status] of replayedState) {
      if (!currentState.has(id)) {
        lines.push(`+ ${id} -> ${status}`);
      } else if (normalizeStatus(currentState.get(id)!) !== normalizeStatus(status)) {
        lines.push(`~ ${id}: replay="${status}" atual="${currentState.get(id)}"`);
      }
    }

    for (const [id, status] of currentState) {
      if (!replayedState.has(id)) {
        lines.push(`- ${id} -> ${status}`);
      }
    }

    return lines.join("\n");
  }

  private parseCurrentStateRows(content: string): CurrentStateRow[] {
    const block = this.extractBlock(content, "TABELA_SITUACAO_ATUAL");
    if (!block) return [];

    const rows = this.parseMarkdownTable(block);
    return rows
      .map((row) => ({
        id: row[0]?.trim() ?? "",
        status: row[6]?.trim() ?? row[row.length - 1]?.trim() ?? "",
      }))
      .filter((row) => !isEmptyCell(row.id));
  }

  private toState(rows: CurrentStateRow[]): Map<string, string> {
    const state = new Map<string, string>();
    for (const row of rows) {
      state.set(row.id, row.status);
    }
    return state;
  }

  private checkIndicators(currentState: Map<string, string>, content: string): string[] {
    const statuses = [...currentState.values()].map((status) => normalizeStatus(status));
    const expected = {
      concluded: statuses.filter((status) => status === normalizeStatus(BacklogStatus.CONCLUIDO))
        .length,
      inProgress: statuses.filter(
        (status) => status === normalizeStatus(BacklogStatus.EM_ANDAMENTO),
      ).length,
      pending: statuses.filter((status) =>
        [
          normalizeStatus(BacklogStatus.PENDENTE),
          normalizeStatus(BacklogStatus.AGUARDANDO),
          normalizeStatus(BacklogStatus.AGUARDANDO_FORMALIZACAO),
        ].includes(status),
      ).length,
    };

    const checks = [
      {
        label: "Itens concluidos",
        value: this.parseIndicator(content, "Itens conclu"),
        expected: expected.concluded,
      },
      {
        label: "Itens em andamento",
        value: this.parseIndicator(content, "Itens em andamento"),
        expected: expected.inProgress,
      },
      {
        label: "Itens pendentes",
        value: this.parseIndicator(content, "Itens pendentes"),
        expected: expected.pending,
      },
    ];

    return checks
      .filter((check) => check.value !== null && check.value !== check.expected)
      .map((check) => `${check.label}: esperado ${check.expected}, encontrado ${check.value}.`);
  }

  private parseIndicator(content: string, labelPrefix: string): number | null {
    const escaped = labelPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\*\\*${escaped}[^:]*:\\*\\*\\s*(\\d+)`, "i");
    const match = content.match(regex);
    return match ? Number(match[1]) : null;
  }

  private findDuplicateIssues(ids: string[]): string[] {
    const seen = new Set<string>();
    const duplicated = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) {
        duplicated.add(id);
      }
      seen.add(id);
    }
    return [...duplicated].map((id) => `Item ${id} duplicado em situacao-atual.md`);
  }

  private extractBlock(content: string, blockName: string): string | null {
    const regex = new RegExp(
      `<!--\\s*BEGIN-${blockName}\\s*-->([\\s\\S]*?)<!--\\s*END-${blockName}\\s*-->`,
      "i",
    );
    const match = content.match(regex);
    return match ? match[1] : null;
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
}
