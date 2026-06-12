import type { IFileSystemRepository } from "../../domain/interfaces/repositories/file-system-repository-interface.js";
import { FileSystemRepository } from "../../infrastructure/repositories/file-system-repository.js";

export interface LegStatIssue {
  stat: string;
  expected: number;
  found: number;
}

export interface LegReplayResult {
  legFile: string;
  statIssues: LegStatIssue[];
  causalIssues: string[];
}

export interface ReplayResult {
  state: Map<string, string>;
  legResults: LegReplayResult[];
  initialIssues: string[];
}

export class BacklogReplayService {
  constructor(
    private readonly fileSystemRepository: IFileSystemRepository = new FileSystemRepository(),
  ) {}

  public replay(initialUnderstandingPath: string, legPaths: string[]): ReplayResult {
    const initialContent = this.fileSystemRepository.readFile(initialUnderstandingPath);
    const sorted = [...legPaths].sort((a, b) =>
      this.fileSystemRepository.basename(a).localeCompare(this.fileSystemRepository.basename(b)),
    );
    const legContents = sorted.map((p) => ({
      name: this.fileSystemRepository.basename(p),
      content: this.fileSystemRepository.readFile(p),
    }));
    return this.replayFromContent(initialContent, legContents);
  }

  public replayFromContent(
    initialContent: string,
    legContents: Array<{ name: string; content: string }>,
  ): ReplayResult {
    const initialItems = this.parseTableIdAndStatus(initialContent, "TABELA_BACKLOG_INICIAL");
    const initialIssues = [
      ...this.findDuplicateIssues(initialItems.map((item) => item.id), "entendimento-inicial.md"),
      ...this.findInvalidStatusIssues(initialItems, "entendimento-inicial.md"),
    ];
    const state = this.buildState(initialItems);
    const legResults: LegReplayResult[] = [];

    for (const { name, content } of legContents) {
      const causalIssues: string[] = [];
      const knownBeforeLeg = new Set(state.keys());

      const deliveredIds = this.parseTableFirstColumn(content, "TABELA_ENTREGUES");
      causalIssues.push(...this.findDuplicateIssues(deliveredIds, name));
      for (const id of deliveredIds) {
        if (!knownBeforeLeg.has(id)) {
          causalIssues.push(`${name}: item entregue ${id} nao existia antes da LEG.`);
          continue;
        }
        if (this.normalizeStatus(state.get(id) ?? "") === "CONCLUIDO") {
          causalIssues.push(`${name}: item ${id} foi entregue novamente.`);
        }
        state.set(id, "Concluído");
      }

      const newItems = this.parseTableIdAndStatus(content, "TABELA_NOVOS_CICLO");
      causalIssues.push(...this.findDuplicateIssues(newItems.map((item) => item.id), name));
      causalIssues.push(...this.findInvalidStatusIssues(newItems, name));
      for (const { id, status } of newItems) {
        if (knownBeforeLeg.has(id)) {
          causalIssues.push(`${name}: item novo ${id} ja existia antes da LEG.`);
          continue;
        }
        state.set(id, status);
      }

      const statIssues = this.validateLegStats(content, state, deliveredIds.length, newItems.length);
      legResults.push({ legFile: name, statIssues, causalIssues });
    }

    return { state, legResults, initialIssues };
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
      ["PENDENTE", "AGUARDANDO", "AGUARDANDO FORMALIZACAO"].includes(this.normalizeStatus(s)),
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

  private buildState(items: Array<{ id: string; status: string }>): Map<string, string> {
    const state = new Map<string, string>();
    for (const { id, status } of items) {
      state.set(id, status);
    }
    return state;
  }

  private parseTableFirstColumn(content: string, blockName: string): string[] {
    const block = this.extractBlock(content, blockName);
    if (!block) return [];
    const rows = this.parseMarkdownTable(block);
    return rows
      .map((r) => r[0]?.trim() ?? "")
      .filter((id) => id !== "" && id !== "-" && id !== "—" && id !== "â€”");
  }

  private parseTableIdAndStatus(
    content: string,
    blockName: string,
  ): Array<{ id: string; status: string }> {
    const block = this.extractBlock(content, blockName);
    if (!block) return [];
    const rows = this.parseMarkdownTable(block);
    return rows
      .map((r) => ({ id: r[0]?.trim() ?? "", status: r[r.length - 1]?.trim() || "Pendente" }))
      .filter((i) => i.id && i.id !== "-" && i.id !== "—" && i.id !== "â€”");
  }

  private findDuplicateIssues(ids: string[], sourceName: string): string[] {
    const seen = new Set<string>();
    const duplicated = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) {
        duplicated.add(id);
      }
      seen.add(id);
    }
    return [...duplicated].map((id) => `${sourceName}: item duplicado ${id}.`);
  }

  private findInvalidStatusIssues(
    items: Array<{ id: string; status: string }>,
    sourceName: string,
  ): string[] {
    return items
      .filter((item) => !this.isKnownStatus(item.status))
      .map((item) => `${sourceName}: item ${item.id} tem status desconhecido "${item.status}".`);
  }

  private isKnownStatus(status: string): boolean {
    return [
      "CONCLUIDO",
      "PENDENTE",
      "EM ANDAMENTO",
      "AGUARDANDO",
      "AGUARDANDO FORMALIZACAO",
    ].includes(this.normalizeStatus(status));
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
