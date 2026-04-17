import path from "node:path";
import { ProjectEntity } from "../entities/project-entity.js";
import { BacklogEntity } from "../entities/backlog-entity.js";
import type { IFileSystemRepository } from "../repositories/interfaces/file-system-repository-interface.js";
import { FileSystemRepository } from "../repositories/file-system-repository.js";


export interface InitialUnderstandingParserResult {
  backlogItems: BacklogEntity[];
  metadata: {
    systemName: string | null;
    objective: string | null;
    summary: string | null;
    totalParsedItems: number;
  };
}

interface MarkdownTable {
  headers: string[];
  rows: string[][];
}

export class InitialUnderstandingParser {
  private readonly fileSystemRepository: IFileSystemRepository;

  constructor(fileSystemRepository?: IFileSystemRepository) {
    this.fileSystemRepository =
      fileSystemRepository ?? new FileSystemRepository();
  }

  public parse(
    filePath: string
  ): InitialUnderstandingParserResult {
    const content = this.fileSystemRepository.readFile(filePath);

    const backlogItems = this.extractIndexedBacklogItemsFromContent(content, filePath);

    return {
      backlogItems,
      metadata: {
        systemName: this.extractSystemName(content),
        objective: this.extractObjective(content),
        summary: this.extractSummary(content),
        totalParsedItems: backlogItems.length,
      }
    };
  }

  public extractIndexedBacklogItems(
    filePath: string
  ): BacklogEntity[] {
    const content = this.fileSystemRepository.readFile(filePath);
    return this.extractIndexedBacklogItemsFromContent(content, filePath);
  }

  private extractIndexedBacklogItemsFromContent(
    content: string,
    filePath: string,
  ): BacklogEntity[] {
    const table = this.findBacklogTable(content);

    if (!table) {
      return [];
    }

    const headerMap = this.buildHeaderIndexMap(table.headers);

    const idIndex = this.findHeaderIndex(headerMap, ["id"]);
    const typeIndex = this.findHeaderIndex(headerMap, ["tipo"]);
    const nameIndex = this.findHeaderIndex(headerMap, ["nome"]);
    const originIndex = this.findHeaderIndex(headerMap, ["origem"]);
    const statusIndex = this.findHeaderIndex(headerMap, [
      "statusinicial",
      "situacaoatual",
      "status",
    ]);

    if (
      idIndex === null ||
      typeIndex === null ||
      nameIndex === null ||
      originIndex === null ||
      statusIndex === null
    ) {
      return [];
    }

    const reconstructionSource = path.basename(filePath);

    return table.rows
      .map((row) => {
        const itemCode = this.getCell(row, idIndex);
        const itemType = this.getCell(row, typeIndex);
        const itemName = this.getCell(row, nameIndex);
        const itemOrigin = this.getCell(row, originIndex);
        const currentStatus = this.getCell(row, statusIndex);

        if (
          !itemCode ||
          !itemType ||
          !itemName ||
          !itemOrigin ||
          !currentStatus
        ) {
          return null;
        }

        return {
          id:0,
          projectId:0,
          documentType: reconstructionSource,
          referenceDate:"",
          nature:"INITIAL_UNDERSTANDING",
          interventionType:itemType,
          sequence:this.parseSequenceFromItemCode(itemCode),
          immutableId:itemCode,
          description:itemName,
          tags:[],
          ata:"",
          source:itemOrigin,
          deliver:"",          
          status:currentStatus,
          createdAt:"",
          updatedAt:""
        } as BacklogEntity;
      })
      .filter((item): item is BacklogEntity => item !== null);
  }

  private extractSystemName(content: string): string | null {
    return (
      this.extractLabeledValue(content, "Sistema") ??
      this.extractLabeledValue(content, "Projeto") ??
      this.extractFirstH1Title(content)
    );
  }

  private extractObjective(content: string): string | null {
    return this.extractLabeledValue(content, "Objetivo");
  }

  private extractSummary(content: string): string | null {
    const section = this.extractSectionBody(content, "Resumo Analítico");
    if (section) {
      return section;
    }

    const contextSection = this.extractSectionBody(content, "Contexto");
    return contextSection;
  }

  private extractLabeledValue(content: string, label: string): string | null {
    const escapedLabel = this.escapeRegExp(label);
    const regex = new RegExp(`^\\*\\*${escapedLabel}:\\*\\*\\s*(.+)$`, "im");

    const match = content.match(regex);
    if (!match) {
      return null;
    }

    const value = match[1]?.trim();
    return value ? value : null;
  }

  private extractFirstH1Title(content: string): string | null {
    const match = content.match(/^#\s+(.+)$/m);
    if (!match) {
      return null;
    }

    const value = match[1]?.trim();
    return value ? value : null;
  }

  private extractSectionBody(content: string, sectionTitle: string): string | null {
    const escapedTitle = this.escapeRegExp(sectionTitle);
    const regex = new RegExp(`^##\\s+${escapedTitle}\\s*$([\\s\\S]*?)(?=^##\\s+|\\Z)`, "im");

    const match = content.match(regex);
    if (!match) {
      return null;
    }

    const body = match[1]?.trim();
    return body ? body : null;
  }

  private findBacklogTable(content: string): MarkdownTable | null {
    const tables = this.extractMarkdownTables(content);

    for (const table of tables) {
      const normalizedHeaders = table.headers.map((header) =>
        this.normalizeHeader(header)
      );

      const hasId = normalizedHeaders.includes("id");
      const hasType = normalizedHeaders.includes("tipo");
      const hasName = normalizedHeaders.includes("nome");
      const hasOrigin = normalizedHeaders.includes("origem");
      const hasStatus =
        normalizedHeaders.includes("statusinicial") ||
        normalizedHeaders.includes("situacaoatual") ||
        normalizedHeaders.includes("status");

      if (hasId && hasType && hasName && hasOrigin && hasStatus) {
        return table;
      }
    }

    return null;
  }

  private extractMarkdownTables(content: string): MarkdownTable[] {
    const lines = content.split(/\r?\n/);
    const tables: MarkdownTable[] = [];

    let index = 0;

    while (index < lines.length - 1) {
      const headerLine = lines[index]?.trim();
      const separatorLine = lines[index + 1]?.trim();

      if (this.isTableLine(headerLine) &&
        this.isSeparatorLine(separatorLine)
      ) {
        const headers = this.parseTableLine(headerLine);
        const rows: string[][] = [];
        index += 2;

        while (index < lines.length && this.isTableLine(lines[index]?.trim())) {
          rows.push(this.parseTableLine(lines[index]!.trim()));
          index += 1;
        }

        tables.push({ headers, rows });
        continue;
      }

      index += 1;
    }

    return tables;
  }

  private isTableLine(line: string | undefined): boolean {
    if (!line) {
      return false;
    }

    return line.includes("|");
  }

  private isSeparatorLine(line: string | undefined): boolean {
    if (!line) {
      return false;
    }

    const normalized = line.replace(/\|/g, "").trim();
    return /^:?-{3,}:?(?:\s+:?-{3,}:?)*$/.test(normalized);
  }

  private parseTableLine(line: string): string[] {
    return line
      .split("|")
      .map((part) => part.trim())
      .filter((part, index, array) => {
        const isFirst = index === 0 && part === "";
        const isLast = index === array.length - 1 && part === "";
        return !isFirst && !isLast;
      });
  }

  private buildHeaderIndexMap(headers: string[]): Map<string, number> {
    const map = new Map<string, number>();

    headers.forEach((header, index) => {
      map.set(this.normalizeHeader(header), index);
    });

    return map;
  }

  private findHeaderIndex(
    map: Map<string, number>,
    candidates: string[],
  ): number | null {
    for (const candidate of candidates) {
      const found = map.get(candidate);
      if (found !== undefined) {
        return found;
      }
    }

    return null;
  }

  private getCell(row: string[], index: number): string {
    return (row[index] ?? "").trim();
  }

  private normalizeHeader(value: string): string {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();
  }

  private parseSequenceFromItemCode(itemCode: string): number {
    const trimmed = itemCode.trim();

    if (trimmed === "") {
      return 0;
    }

    const directNumber = Number(trimmed);
    if (Number.isInteger(directNumber) && directNumber >= 0) {
      return directNumber;
    }

    const match = trimmed.match(/(\d+)$/);
    return match ? Number(match[1]) : 0;
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}