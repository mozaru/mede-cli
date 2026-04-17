import path from "node:path";
import { ProjectEntity } from "../entities/project-entity.js";
import { BacklogEntity } from "../entities/backlog-entity.js";
import type { IFileSystemRepository } from "../repositories/interfaces/file-system-repository-interface.js";
import { FileSystemRepository } from "../repositories/file-system-repository.js";


export interface CurrentStateParserResult {
  backlogItems: BacklogEntity[];
  metadata: {
    systemName: string | null;
    referenceDate: string | null;
    sourceDescription: string | null;
    totalParsedItems: number;
    totalFormalBacklogItems: number;
    classificationCounters: Array<{
      key: string;
      lastSequenceNumber: number;
    }>;    
  };
}

interface MarkdownTable {
  headers: string[];
  rows: string[][];
}

export class CurrentStateParser {
  private readonly fileSystemRepository: IFileSystemRepository;

  constructor(fileSystemRepository?: IFileSystemRepository) {
    this.fileSystemRepository =
      fileSystemRepository ?? new FileSystemRepository();
  }

  public parse(
    filePath: string
  ): CurrentStateParserResult {
    const content = this.fileSystemRepository.readFile(filePath);

    const backlogItems = this.extractIndexedBacklogItemsFromContent(content, filePath);
    const classificationCounters = this.buildClassificationCounters(backlogItems);

    return {
      backlogItems,
      metadata: {
        systemName: this.extractSystemName(content),
        referenceDate: this.extractLabeledValue(content, "Data de referência"),
        sourceDescription: this.extractLabeledValue(
          content,
          "Origem da consolidação"
        ),
        totalParsedItems: backlogItems.length,
        totalFormalBacklogItems: backlogItems.filter((item) =>
          this.parseFormalBacklogId(item.immutableId)!== null,
        ).length,
        classificationCounters,        
      }
    };
  }

  public extractIndexedBacklogItems(
    filePath: string
  ): BacklogEntity[] {
    const content = this.fileSystemRepository.readFile(filePath);
    return this.extractIndexedBacklogItemsFromContent(content, filePath);
  }

  private extractIndexedBacklogItemsFromContent( content: string, filePath: string): BacklogEntity[] {
    const table = this.findBacklogTable(content);

    if (!table) {
      return [];
    }

    const headerMap = this.buildHeaderIndexMap(table.headers);

    const idIndex = this.findHeaderIndex(headerMap, ["id"]);
    const descriptionIndex = this.findHeaderIndex(headerMap, [
      "descricao",
      "descrição",
    ]);
    const tagsIndex = this.findHeaderIndex(headerMap, ["tags"]);
    const meetingIndex = this.findHeaderIndex(headerMap, ["ata"]);
    const originIndex = this.findHeaderIndex(headerMap, ["origem"]);
    const deliveryIndex = this.findHeaderIndex(headerMap, ["entrega"]);
    const statusIndex = this.findHeaderIndex(headerMap, ["status"]);

    if (
      idIndex === null ||
      descriptionIndex === null ||
      tagsIndex === null ||
      meetingIndex === null ||
      originIndex === null ||
      deliveryIndex === null ||
      statusIndex === null
    ) {
      return [];
    }

    const reconstructionSource = path.basename(filePath);
    const sourceDocumentType = "current_state";
    const referenceDate = this.extractLabeledValue(content, "Data de referência") ?? "";    

    return table.rows
      .map((row) => {
        const itemCode = this.getCell(row, idIndex);
        const description = this.getCell(row, descriptionIndex);
        const tagsCsv = this.normalizeTags(this.getCell(row, tagsIndex));
        const meetingReference = this.getCell(row, meetingIndex);
        const itemOrigin = this.getCell(row, originIndex);
        const deliveryReference = this.getCell(row, deliveryIndex);
        const currentStatus = this.getCell(row, statusIndex);
        const classification = this.parseFormalBacklogId(itemCode);

        if (
          !itemCode ||
          !description ||
          !itemOrigin ||
          !currentStatus
        ) {
          return null;
        }

        return {
          id:0,
          projectId:0,
          documentType:classification?.classificationDoc ?? sourceDocumentType,
          referenceDate:classification?.classificationDate ?? referenceDate,
          nature: classification?.classificationNature ?? "FORMAL_BACKLOG",
          interventionType: classification?.classificationInterventionType ?? "",
          sequence: classification?.classificationSequence ?? this.parseSequenceFromItemCode(itemCode),
          immutableId: itemCode,
          description: description,
          tags: this.parseTags(tagsCsv),
          ata: meetingReference,
          source: itemOrigin,
          deliver: deliveryReference,
          status: currentStatus,
          createdAt: "",
          updatedAt :""
        } as BacklogEntity;
      })
      .filter((item): item is BacklogEntity => item !== null);
  }

  private extractSystemName(content: string): string | null {
    return (
      this.extractLabeledValue(content, "Sistema") ??
      this.extractLabeledValue(content, "Projeto")
    );
  }

  private extractLabeledValue(content: string, label: string): string | null {
    const escapedLabel = this.escapeRegExp(label);
    const regex = new RegExp(
      `^\\*\\*${escapedLabel}:\\*\\*\\s*(.+)$`,
      "im",
    );

    const match = content.match(regex);
    if (!match) {
      return null;
    }

    const value = match[1]?.trim();
    return value ? value : null;
  }

  private findBacklogTable(content: string): MarkdownTable | null {
    const tables = this.extractMarkdownTables(content);

    for (const table of tables) {
      const normalizedHeaders = table.headers.map((header) =>
        this.normalizeHeader(header),
      );

      const hasId = normalizedHeaders.includes("id");
      const hasDescription = normalizedHeaders.includes("descricao");
      const hasTags = normalizedHeaders.includes("tags");
      const hasMeeting = normalizedHeaders.includes("ata");
      const hasOrigin = normalizedHeaders.includes("origem");
      const hasDelivery = normalizedHeaders.includes("entrega");
      const hasStatus = normalizedHeaders.includes("status");

     if ( hasId && hasDescription && hasTags && hasMeeting && hasOrigin && hasDelivery && hasStatus) {
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

      if (
        this.isTableLine(headerLine) &&
        this.isSeparatorLine(separatorLine)
      ) {
        const headers = this.parseTableLine(headerLine);
        const rows: string[][] = [];
        index += 2;

        while (index < lines.length && this.isTableLine(lines[index]?.trim())) {
          rows.push(this.parseTableLine(lines[index].trim()));
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

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private parseTags(value: string): string[] {
    if (value.trim() === "") {
      return [];
    }

    return value
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter((item) => item.length > 0);
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

  private buildClassificationKey(item: BacklogEntity): string | null {
    if (item.documentType.trim() === "" || item.nature.trim() === "" || item.interventionType.trim() === "") {
      return null;
    }

    return `${item.documentType}-${item.nature}-${item.interventionType}`;
  }

  private parseFormalBacklogId(value: string): {
    classificationDoc: string;
    classificationDate: string;
    classificationNature: string;
    classificationInterventionType: string;
    classificationSequence: number;
  } | null {
    const normalized = value.trim().toUpperCase();
    const match = normalized.match(
      /^(DEI|ESM|LEG)-(\d{8})-(RF|NF|RN|UX|OP|AR)-(BLI|COR|AJU|EVO)-(\d{4})$/,
    );

    if (!match) {
      return null;
    }

    return {
      classificationDoc: match[1],
      classificationDate: match[2],
      classificationNature: match[3],
      classificationInterventionType: match[4],
      classificationSequence: Number(match[5]),
    };
  }

  private normalizeTags(value: string): string {
    if (!value.trim()) {
      return "";
    }

    const allowed = new Set(["HOT", "PERF", "SEC", "MIG"]);

    const normalizedTags = value
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter((item) => item.length > 0)
      .filter((item) => allowed.has(item));

    return [...new Set(normalizedTags)].join(", ");
  }

  private buildClassificationCounters(
    items: BacklogEntity[],
  ): Array<{ key: string; lastSequenceNumber: number }> {
    const map = new Map<string, number>();

    for (const item of items) {
      const key = this.buildClassificationKey(item);

      if (!key) {
        continue;
      }

      const current = map.get(key) ?? 0;
      if (item.sequence > current) {
        map.set(key, item.sequence);
      }
    }

    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, lastSequenceNumber]) => ({
        key,
        lastSequenceNumber,
      }));
  }  

}