export interface ConsistencyResult {
  ok: boolean;
  issues: string[];
}

export class ConsistencyCheckerService {
  public check(replayedState: Map<string, string>, currentStateContent: string): ConsistencyResult {
    const currentState = this.parseCurrentState(currentStateContent);
    const issues: string[] = [];

    for (const [id, status] of replayedState) {
      if (!currentState.has(id)) {
        issues.push(`Item ${id} presente no replay mas ausente em situacao-atual.md`);
      } else if (this.normalize(currentState.get(id)!) !== this.normalize(status)) {
        issues.push(
          `Item ${id}: status no replay é "${status}" mas em situacao-atual.md é "${currentState.get(id)}"`,
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
    const currentState = this.parseCurrentState(currentStateContent);
    const lines: string[] = [];

    for (const [id, status] of replayedState) {
      if (!currentState.has(id)) {
        lines.push(`+ ${id} → ${status}`);
      } else if (this.normalize(currentState.get(id)!) !== this.normalize(status)) {
        lines.push(`~ ${id}: replay="${status}" atual="${currentState.get(id)}"`);
      }
    }

    for (const [id, status] of currentState) {
      if (!replayedState.has(id)) {
        lines.push(`- ${id} → ${status}`);
      }
    }

    return lines.join("\n");
  }

  private parseCurrentState(content: string): Map<string, string> {
    const state = new Map<string, string>();
    const block = this.extractBlock(content, "TABELA_SITUACAO_ATUAL");
    if (!block) return state;

    const rows = this.parseMarkdownTable(block);
    for (const row of rows) {
      const id = row[0]?.trim() ?? "";
      const status = row[6]?.trim() ?? "";
      if (id && id !== "—") {
        state.set(id, status);
      }
    }
    return state;
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

  private normalize(status: string): string {
    return status
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toUpperCase();
  }
}
