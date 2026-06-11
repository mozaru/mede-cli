import { BacklogEntity } from "../domain/entities/backlog-entity.js";
import type { IBacklogRepository } from "../domain/interfaces/repositories/backlog-repository-interface.js";
import { CurrentStateParser, type CurrentStateParserResult } from "./current-state-parser.js";
import type { MedeConfigModelEntity } from "../domain/entities/mede-config-model-entity.js";

export interface PlaceholderContext {
  config?: MedeConfigModelEntity;
  cycleNumber?: number;
  referenceDate?: string;
}

type PlaceholderKey =
  | "##TABELA_INTERVENCAO##"
  | "##TABELA_BACKLOG_RECENTE##"
  | "##TABELA_ESTATISTICA_ENTREGA##"
  | "##TABELA_BACKLOG_INICIAL##"
  | "##TABELA_SITUACAO_ATUAL##"
  | "##NOME_PROJETO##"
  | "##CLIENTE##"
  | "##FORNECEDOR##"
  | "##CICLO_CORRENTE##"
  | "##DATA_REFERENCIA##"
  | "##TOTAL_ENTREGUES##"
  | "##TOTAL_PENDENTES##"
  | "##TOTAL_ENTREGUES_CICLO##"
  | "##NOVOS_CICLO##"
  | "##PERCENTUAL_ENTREGA##"
  | "##TABELA_ENTREGUES##"
  | "##TABELA_PENDENTES##"
  | "##TABELA_NOVOS_CICLO##";

export interface PromptPlaceholderContentMap {
  "##TABELA_INTERVENCAO##": string;
  "##TABELA_BACKLOG_RECENTE##": string;
  "##TABELA_ESTATISTICA_ENTREGA##": string;
  "##TABELA_BACKLOG_INICIAL##": string;
  "##TABELA_SITUACAO_ATUAL##": string;
  "##NOME_PROJETO##": string;
  "##CLIENTE##": string;
  "##FORNECEDOR##": string;
  "##CICLO_CORRENTE##": string;
  "##DATA_REFERENCIA##": string;
  "##TOTAL_ENTREGUES##": string;
  "##TOTAL_PENDENTES##": string;
  "##TOTAL_ENTREGUES_CICLO##": string;
  "##NOVOS_CICLO##": string;
  "##PERCENTUAL_ENTREGA##": string;
  "##TABELA_ENTREGUES##": string;
  "##TABELA_PENDENTES##": string;
  "##TABELA_NOVOS_CICLO##": string;
}

interface CurrentVsPreviousItem {
  current: BacklogEntity;
  previous: BacklogEntity | null;
  isNewInPeriod: boolean;
  wasDeliveredInPeriod: boolean;
  changedInPeriod: boolean;
}

export class PromptPlaceholderBuilder {
  private static readonly PLACEHOLDERS: PlaceholderKey[] = [
    "##TABELA_INTERVENCAO##",
    "##TABELA_BACKLOG_RECENTE##",
    "##TABELA_ESTATISTICA_ENTREGA##",
    "##TABELA_BACKLOG_INICIAL##",
    "##TABELA_SITUACAO_ATUAL##",
    "##NOME_PROJETO##",
    "##CLIENTE##",
    "##FORNECEDOR##",
    "##CICLO_CORRENTE##",
    "##DATA_REFERENCIA##",
    "##TOTAL_ENTREGUES##",
    "##TOTAL_PENDENTES##",
    "##TOTAL_ENTREGUES_CICLO##",
    "##NOVOS_CICLO##",
    "##PERCENTUAL_ENTREGA##",
    "##TABELA_ENTREGUES##",
    "##TABELA_PENDENTES##",
    "##TABELA_NOVOS_CICLO##",
  ];

  private readonly currentStateParser: CurrentStateParser;

  constructor(
    private readonly backlogRepository: IBacklogRepository,
    currentStateParser?: CurrentStateParser,
  ) {
    this.currentStateParser = currentStateParser ?? new CurrentStateParser();
  }

  public buildAll(
    projectId: number,
    previousCurrentStateFilePath: string,
    context?: PlaceholderContext,
  ): PromptPlaceholderContentMap {
    const currentItems = this.normalizeBacklogItems(this.backlogRepository.list(projectId));
    const previousState = this.currentStateParser.parse(previousCurrentStateFilePath);
    const comparisons = this.compareAllWithPrevious(currentItems, previousState);

    const totalDelivered = this.countDelivered(currentItems);
    const totalNonCancelled = currentItems.filter(
      (i) => this.normalizeStatus(i.status) !== "CANCELADO",
    ).length;
    const deliveryPercent =
      totalNonCancelled === 0 ? 0 : (totalDelivered / totalNonCancelled) * 100;

    return {
      "##TABELA_INTERVENCAO##": this.buildInterventionTable(currentItems),
      "##TABELA_BACKLOG_RECENTE##": this.buildRecentBacklogTableFromComparisons(comparisons),
      "##TABELA_ESTATISTICA_ENTREGA##": this.buildDeliveryStatistics(currentItems),
      "##TABELA_BACKLOG_INICIAL##": this.buildInitialBacklogTable(currentItems),
      "##TABELA_SITUACAO_ATUAL##": this.buildCurrentStateTable(currentItems),
      "##NOME_PROJETO##": context?.config?.projectName || "—",
      "##CLIENTE##": context?.config?.clientName || "—",
      "##FORNECEDOR##": context?.config?.supplierName || "—",
      "##CICLO_CORRENTE##":
        context?.cycleNumber != null ? String(context.cycleNumber).padStart(3, "0") : "—",
      "##DATA_REFERENCIA##": context?.referenceDate ?? "—",
      "##TOTAL_ENTREGUES##": String(totalDelivered),
      "##TOTAL_PENDENTES##": String(this.countPending(currentItems)),
      "##TOTAL_ENTREGUES_CICLO##": String(comparisons.filter((c) => c.wasDeliveredInPeriod).length),
      "##NOVOS_CICLO##": String(comparisons.filter((c) => c.isNewInPeriod).length),
      "##PERCENTUAL_ENTREGA##": `${this.formatPercent(deliveryPercent)}%`,
      "##TABELA_ENTREGUES##": this.buildEntreguesTable(currentItems),
      "##TABELA_PENDENTES##": this.buildPendentesTable(currentItems),
      "##TABELA_NOVOS_CICLO##": this.buildNovosCicloTable(comparisons),
    };
  }

  public replacePlaceholders(
    text: string,
    placeholders: Partial<PromptPlaceholderContentMap>,
  ): string {
    let result = text;

    for (const key of PromptPlaceholderBuilder.PLACEHOLDERS) {
      const replacement = placeholders[key] ?? "";
      result = result.replace(this.buildGlobalPlaceholderRegex(key), replacement);
    }

    return result;
  }

  public buildInterventionTableFromProject(projectId: number): string {
    const items = this.normalizeBacklogItems(this.backlogRepository.list(projectId));
    return this.buildInterventionTable(items);
  }

  public buildRecentBacklogTableFromProject(
    projectId: number,
    previousCurrentStateFilePath: string,
  ): string {
    const currentItems = this.normalizeBacklogItems(this.backlogRepository.list(projectId));
    const previousState = this.currentStateParser.parse(previousCurrentStateFilePath);
    const comparisons = this.compareAllWithPrevious(currentItems, previousState);
    return this.buildRecentBacklogTableFromComparisons(comparisons);
  }

  public buildDeliveryStatisticsFromProject(projectId: number): string {
    const items = this.normalizeBacklogItems(this.backlogRepository.list(projectId));
    return this.buildDeliveryStatistics(items);
  }

  public buildInitialBacklogTableFromProject(projectId: number): string {
    const items = this.normalizeBacklogItems(this.backlogRepository.list(projectId));
    return this.buildInitialBacklogTable(items);
  }

  public buildCurrentStateTableFromProject(projectId: number): string {
    const items = this.normalizeBacklogItems(this.backlogRepository.list(projectId));
    return this.buildCurrentStateTable(items);
  }

  public buildEntreguesTableFromProject(projectId: number): string {
    const items = this.normalizeBacklogItems(this.backlogRepository.list(projectId));
    return this.buildEntreguesTable(items);
  }

  public buildPendentesTableFromProject(projectId: number): string {
    const items = this.normalizeBacklogItems(this.backlogRepository.list(projectId));
    return this.buildPendentesTable(items);
  }

  public buildNovosCicloTableFromProject(
    projectId: number,
    previousCurrentStateFilePath: string,
  ): string {
    const currentItems = this.normalizeBacklogItems(this.backlogRepository.list(projectId));
    const previousState = this.currentStateParser.parse(previousCurrentStateFilePath);
    const comparisons = this.compareAllWithPrevious(currentItems, previousState);
    return this.buildNovosCicloTable(comparisons);
  }

  private buildInterventionTable(items: BacklogEntity[]): string {
    const rows = items
      .filter((item) => this.normalizeText(item.documentType) === "ESM")
      .sort((a, b) => this.compareBacklogItems(a, b));

    return this.toMarkdownTable(
      ["ID", "Natureza", "Tipo", "Nome", "Origem", "Entrega", "Status"],
      rows.map((item) => [
        item.immutableId,
        item.nature,
        item.interventionType,
        item.description,
        item.source,
        item.deliver,
        item.status,
      ]),
    );
  }

  private compareAllWithPrevious(
    currentItems: BacklogEntity[],
    previousState: CurrentStateParserResult,
  ): CurrentVsPreviousItem[] {
    const baselineDate = this.parseReferenceDate(previousState.metadata.referenceDate);
    const previousMap = this.indexByImmutableId(previousState.backlogItems);
    return currentItems.map((current) =>
      this.compareWithPrevious(current, previousMap, baselineDate),
    );
  }

  private buildRecentBacklogTableFromComparisons(
    comparisons: CurrentVsPreviousItem[],
  ): string {
    const filtered = comparisons
      .filter(
        (item) =>
          item.isNewInPeriod ||
          item.wasDeliveredInPeriod ||
          item.changedInPeriod ||
          this.normalizeStatus(item.current.status) === "CONCLUIDO",
      )
      .sort((a, b) => this.compareBacklogItems(a.current, b.current));

    return this.toMarkdownTable(
      [
        "ID",
        "Tipo",
        "Nome",
        "Origem",
        "Status",
        "MudouEm",
        "ObservacaoEntrega ou Evidencia",
        "FoiEntregueNoPeriodo",
        "EhNovoNoPeriodo",
      ],
      filtered.map((item) => [
        item.current.immutableId,
        `${item.current.nature}/${item.current.interventionType}`,
        item.current.description,
        item.current.source,
        item.current.status,
        this.formatDateTime(item.current.updatedAt),
        item.current.deliver,
        item.wasDeliveredInPeriod ? "Sim" : "Não",
        item.isNewInPeriod ? "Sim" : "Não",
      ]),
    );
  }

  private buildEntreguesTable(items: BacklogEntity[]): string {
    const rows = items
      .filter((i) => this.normalizeStatus(i.status) === "CONCLUIDO")
      .sort((a, b) => this.compareBacklogItems(a, b));

    return this.toMarkdownTable(
      ["ID", "Tipo", "Nome", "Origem", "Ciclo de Entrega", "Observação"],
      rows.map((i) => [
        i.immutableId,
        `${i.nature}/${i.interventionType}`,
        i.description,
        i.source,
        i.deliver,
        i.ata,
      ]),
    );
  }

  private buildPendentesTable(items: BacklogEntity[]): string {
    const PENDING_STATUSES = ["PENDENTE", "AGUARDANDO", "EM ANDAMENTO"];
    const rows = items
      .filter((i) => PENDING_STATUSES.includes(this.normalizeStatus(i.status)))
      .sort((a, b) => this.compareBacklogItems(a, b));

    return this.toMarkdownTable(
      ["ID", "Tipo", "Nome", "Origem", "Status", "Prioridade"],
      rows.map((i) => [
        i.immutableId,
        `${i.nature}/${i.interventionType}`,
        i.description,
        i.source,
        i.status,
        this.formatTags(i.tags),
      ]),
    );
  }

  private buildNovosCicloTable(comparisons: CurrentVsPreviousItem[]): string {
    const rows = comparisons
      .filter((c) => c.isNewInPeriod)
      .sort((a, b) => this.compareBacklogItems(a.current, b.current));

    return this.toMarkdownTable(
      ["ID", "Tipo", "Nome", "Origem", "Status"],
      rows.map((c) => [
        c.current.immutableId,
        `${c.current.nature}/${c.current.interventionType}`,
        c.current.description,
        c.current.source,
        c.current.status,
      ]),
    );
  }

  private countDelivered(items: BacklogEntity[]): number {
    return items.filter((i) => this.normalizeStatus(i.status) === "CONCLUIDO").length;
  }

  private countPending(items: BacklogEntity[]): number {
    return items.filter((i) =>
      ["PENDENTE", "AGUARDANDO"].includes(this.normalizeStatus(i.status)),
    ).length;
  }

  private buildDeliveryStatistics(items: BacklogEntity[]): string {
    const totalDelivered = items.filter(
      (item) => this.normalizeStatus(item.status) === "CONCLUIDO",
    ).length;

    const totalPending = items.filter((item) =>
      ["PENDENTE", "AGUARDANDO"].includes(this.normalizeStatus(item.status)),
    ).length;

    const totalRelevant = items.filter(
      (item) => this.normalizeStatus(item.status) !== "CANCELADO",
    ).length;

    const deliveryPercent = totalRelevant === 0 ? 0 : (totalDelivered / totalRelevant) * 100;

    return [
      `Total itens entregues: **${totalDelivered}**  `,
      `Total itens pendentes: **${totalPending}**  `,
      `Percentual de entrega: **${this.formatPercent(deliveryPercent)}%**`,
    ].join("\n");
  }

  private buildInitialBacklogTable(items: BacklogEntity[]): string {
    const rows = items
      .filter((item) => this.normalizeText(item.interventionType) === "BLI")
      .sort((a, b) => this.compareBacklogItems(a, b));

    return this.toMarkdownTable(
      ["ID", "Tipo", "Nome", "Origem", "Status"],
      rows.map((item) => [
        item.immutableId,
        item.nature,
        item.description,
        item.source,
        item.status,
      ]),
    );
  }

  private buildCurrentStateTable(items: BacklogEntity[]): string {
    const rows = [...items].sort((a, b) => this.compareBacklogItems(a, b));

    return this.toMarkdownTable(
      ["ID", "Descrição", "Tags", "Ata", "Origem", "Entrega", "Status"],
      rows.map((item) => [
        item.immutableId,
        item.description,
        this.formatTags(item.tags),
        item.ata,
        item.source,
        item.deliver,
        item.status,
      ]),
    );
  }

  private compareWithPrevious(
    current: BacklogEntity,
    previousMap: Map<string, BacklogEntity>,
    baselineDate: Date | null,
  ): CurrentVsPreviousItem {
    const previous = previousMap.get(current.immutableId) ?? null;
    const updatedAt = this.parseIsoDateTime(current.updatedAt);

    const isNewInPeriod = previous === null;

    const wasDeliveredInPeriod =
      this.normalizeStatus(current.status) === "CONCLUIDO" &&
      this.normalizeStatus(previous?.status ?? "") !== "CONCLUIDO";

    const changedInPeriod =
      updatedAt !== null && baselineDate !== null
        ? updatedAt.getTime() >= baselineDate.getTime()
        : previous === null || this.hasRelevantDifference(current, previous);

    return {
      current,
      previous,
      isNewInPeriod,
      wasDeliveredInPeriod,
      changedInPeriod,
    };
  }

  private hasRelevantDifference(current: BacklogEntity, previous: BacklogEntity | null): boolean {
    if (!previous) {
      return true;
    }

    return (
      this.normalizeText(current.description) !== this.normalizeText(previous.description) ||
      this.normalizeText(current.source) !== this.normalizeText(previous.source) ||
      this.normalizeText(current.deliver) !== this.normalizeText(previous.deliver) ||
      this.normalizeStatus(current.status) !== this.normalizeStatus(previous.status) ||
      this.formatTags(current.tags) !== this.formatTags(previous.tags)
    );
  }

  private normalizeBacklogItems(items: BacklogEntity[]): BacklogEntity[] {
    return items.map((item) => ({
      ...item,
      tags: this.normalizeTags(item.tags),
      immutableId: (item.immutableId ?? "").trim(),
      description: (item.description ?? "").trim(),
      ata: (item.ata ?? "").trim(),
      source: (item.source ?? "").trim(),
      deliver: (item.deliver ?? "").trim(),
      status: (item.status ?? "").trim(),
      documentType: (item.documentType ?? "").trim(),
      nature: (item.nature ?? "").trim(),
      interventionType: (item.interventionType ?? "").trim(),
      referenceDate: (item.referenceDate ?? "").trim(),
      updatedAt: (item.updatedAt ?? "").trim(),
    }));
  }

  private normalizeTags(tags: string[] | string | null | undefined): string[] {
    if (Array.isArray(tags)) {
      return tags.map((item) => (item ?? "").trim()).filter((item) => item.length > 0);
    }

    if (typeof tags === "string") {
      return tags
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    return [];
  }

  private indexByImmutableId(items: BacklogEntity[]): Map<string, BacklogEntity> {
    const map = new Map<string, BacklogEntity>();

    for (const item of items) {
      const key = (item.immutableId ?? "").trim();
      if (key) {
        map.set(key, {
          ...item,
          tags: this.normalizeTags(item.tags),
        });
      }
    }

    return map;
  }

  private compareBacklogItems(a: BacklogEntity, b: BacklogEntity): number {
    return (
      this.normalizeText(a.referenceDate).localeCompare(this.normalizeText(b.referenceDate)) ||
      this.normalizeText(a.documentType).localeCompare(this.normalizeText(b.documentType)) ||
      this.normalizeText(a.nature).localeCompare(this.normalizeText(b.nature)) ||
      this.normalizeText(a.interventionType).localeCompare(
        this.normalizeText(b.interventionType),
      ) ||
      a.sequence - b.sequence ||
      this.normalizeText(a.immutableId).localeCompare(this.normalizeText(b.immutableId))
    );
  }

  private toMarkdownTable(headers: string[], rows: string[][]): string {
    const safeRows = rows.length > 0 ? rows : [headers.map(() => "—")];

    const headerLine = `| ${headers.join(" | ")} |`;
    const separatorLine = `| ${headers.map(() => "---").join(" | ")} |`;
    const rowLines = safeRows.map(
      (row) => `| ${row.map((cell) => this.escapeCell(cell)).join(" | ")} |`,
    );

    return [headerLine, separatorLine, ...rowLines].join("\n");
  }

  private escapeCell(value: unknown): string {
    return String(value ?? "")
      .replace(/\r?\n/g, "<br>")
      .replace(/\|/g, "\\|")
      .trim();
  }

  private formatTags(tags: string[] | string | null | undefined): string {
    const normalized = this.normalizeTags(tags);
    return normalized.length > 0 ? normalized.join(", ") : "";
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? "").trim().toUpperCase();
  }

  private normalizeStatus(value: string | null | undefined): string {
    return this.normalizeText(value)
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  private parseReferenceDate(value: string | null): Date | null {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();

    if (/^\d{8}$/.test(trimmed)) {
      const year = Number(trimmed.slice(0, 4));
      const month = Number(trimmed.slice(4, 6)) - 1;
      const day = Number(trimmed.slice(6, 8));
      return new Date(year, month, day, 0, 0, 0, 0);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return new Date(`${trimmed}T00:00:00`);
    }

    return null;
  }

  private parseIsoDateTime(value: string | null | undefined): Date | null {
    const trimmed = (value ?? "").trim();
    if (!trimmed) {
      return null;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private formatDateTime(value: string | null | undefined): string {
    const parsed = this.parseIsoDateTime(value);
    if (!parsed) {
      return "";
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    const hour = String(parsed.getHours()).padStart(2, "0");
    const minute = String(parsed.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  private formatPercent(value: number): string {
    return value.toFixed(1).replace(".", ",");
  }

  private buildGlobalPlaceholderRegex(placeholder: string): RegExp {
    const escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped, "g");
  }
}
