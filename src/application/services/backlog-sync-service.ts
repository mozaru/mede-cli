import { z } from "zod";
import { BacklogEntity } from "../../domain/entities/backlog-entity.js";
import { BacklogInterventionCountersEntity } from "../../domain/entities/backlog-intervention-counters-entity.js";
import type { IBacklogRepository } from "../../domain/interfaces/repositories/backlog-repository-interface.js";
import type { IBacklogInterventionCountersRepository } from "../../domain/interfaces/repositories/backlog-intervention-counters-repository-interface.js";

export const ExtractBacklogResponseSchema = z.object({
  statusChanges: z.array(
    z.object({
      id: z.string().regex(/^[A-Z]+-\d{8}(?:-\d{3})?-[A-Z]+-[A-Z]+-\d{4}$/),
      newStatus: z.enum([
        "Concluído",
        "Pendente",
        "Em andamento",
        "Aguardando",
        "Cancelado",
        "Esclarecido",
      ]),
      observation: z.string().optional(),
    }),
  ),
  newItems: z.array(
    z.object({
      documentType: z.string(),
      nature: z.enum(["RF", "NF", "RN", "UX", "OP", "AR"]),
      interventionType: z.enum(["BLI", "COR", "AJU", "EVO"]),
      description: z.string().min(1),
      source: z.string().optional(),
      deliver: z.string().optional(),
      tags: z.array(z.string()).optional(),
      status: z.string().optional(),
    }),
  ),
});

export type ExtractBacklogResponse = z.infer<typeof ExtractBacklogResponseSchema>;

export class BacklogSyncService {
  constructor(
    private readonly backlogRepository: IBacklogRepository,
    private readonly countersRepository: IBacklogInterventionCountersRepository,
  ) {}

  public applyExtraction(
    projectId: number,
    cycleNumber: number,
    referenceDate: string,
    result: ExtractBacklogResponse,
  ): void {
    const items = this.backlogRepository.list(projectId);

    for (const change of result.statusChanges) {
      const item = items.find((i) => i.immutableId === change.id);
      if (!item) {
        console.warn(
          `[BacklogSyncService] Item ${change.id} não encontrado no SQLite — mudança de status ignorada.`,
        );
        continue;
      }
      this.backlogRepository.updateStatus(item.id, change.newStatus);
    }

    const cycleStr = String(cycleNumber).padStart(3, "0");
    const dateStr = referenceDate.replace(/-/g, "");
    const countersMap = new Map(
      this.countersRepository.list(projectId).map((c) => [c.name, c.lastNumber]),
    );

    for (const newItem of result.newItems) {
      const counterKey = `${newItem.documentType}-${newItem.nature}-${newItem.interventionType}`;
      const nextSeq = (countersMap.get(counterKey) ?? 0) + 1;
      countersMap.set(counterKey, nextSeq);

      const seqStr = String(nextSeq).padStart(4, "0");
      const immutableId = `${newItem.documentType}-${dateStr}-${cycleStr}-${newItem.nature}-${newItem.interventionType}-${seqStr}`;

      const entity = new BacklogEntity();
      entity.projectId = projectId;
      entity.documentType = newItem.documentType;
      entity.referenceDate = referenceDate;
      entity.nature = newItem.nature;
      entity.interventionType = newItem.interventionType;
      entity.sequence = nextSeq;
      entity.immutableId = immutableId;
      entity.description = newItem.description;
      entity.tags = newItem.tags ?? [];
      entity.ata = "";
      entity.source = newItem.source ?? "";
      entity.deliver = newItem.deliver ?? "";
      entity.status = newItem.status ?? "Pendente";
      entity.createdAt = new Date().toISOString();
      entity.updatedAt = new Date().toISOString();

      this.backlogRepository.insert(entity);

      const existingCounter = this.countersRepository
        .list(projectId)
        .find((c) => c.name === counterKey);
      if (existingCounter) {
        this.countersRepository.updateCounter(projectId, counterKey, nextSeq);
      } else {
        const nc = new BacklogInterventionCountersEntity();
        nc.projectId = projectId;
        nc.name = counterKey;
        nc.lastNumber = nextSeq;
        nc.createdAt = new Date().toISOString();
        nc.updatedAt = new Date().toISOString();
        this.countersRepository.insert(nc);
      }
    }
  }

  public applyEsmInterventions(projectId: number, esmContent: string): void {
    const existingItems = this.backlogRepository.list(projectId);
    const existingIds = new Set(existingItems.map((item) => item.immutableId));
    const countersMap = new Map(
      this.countersRepository.list(projectId).map((c) => [c.name, c.lastNumber]),
    );

    for (const intervention of this.parseEsmInterventionRows(esmContent)) {
      const parsedId = this.parseFormalBacklogId(intervention.id);
      if (!parsedId) {
        continue;
      }

      const counterKey = `${parsedId.documentType}-${parsedId.nature}-${parsedId.interventionType}`;
      const currentCounter = countersMap.get(counterKey) ?? 0;
      if (parsedId.sequence > currentCounter) {
        countersMap.set(counterKey, parsedId.sequence);
        this.upsertCounter(projectId, counterKey, parsedId.sequence);
      }

      if (existingIds.has(intervention.id)) {
        const item = existingItems.find((i) => i.immutableId === intervention.id);
        if (item && item.status !== intervention.status) {
          this.backlogRepository.updateStatus(item.id, intervention.status);
        }
        continue;
      }

      const entity = new BacklogEntity();
      entity.projectId = projectId;
      entity.documentType = parsedId.documentType;
      entity.referenceDate = parsedId.referenceDate;
      entity.nature = parsedId.nature;
      entity.interventionType = parsedId.interventionType;
      entity.sequence = parsedId.sequence;
      entity.immutableId = intervention.id;
      entity.description = intervention.name;
      entity.tags = [];
      entity.ata = "";
      entity.source = intervention.origin;
      entity.deliver = intervention.delivery;
      entity.status = intervention.status;
      entity.createdAt = new Date().toISOString();
      entity.updatedAt = new Date().toISOString();

      this.backlogRepository.insert(entity);
      existingIds.add(intervention.id);
    }
  }

  private parseEsmInterventionRows(
    content: string,
  ): Array<{
    id: string;
    nature: string;
    interventionType: string;
    name: string;
    origin: string;
    delivery: string;
    status: string;
  }> {
    const lines = content.split(/\r?\n/);
    const rows: ReturnType<BacklogSyncService["parseEsmInterventionRows"]> = [];

    for (let i = 0; i < lines.length; i++) {
      const cells = this.parseMarkdownTableRow(lines[i]);
      if (cells.length < 7 || this.normalizeHeader(cells[0]) !== "ID") {
        continue;
      }

      for (let j = i + 2; j < lines.length; j++) {
        const rowCells = this.parseMarkdownTableRow(lines[j]);
        if (rowCells.length < 7) {
          break;
        }

        rows.push({
          id: rowCells[0],
          nature: rowCells[1],
          interventionType: rowCells[2],
          name: rowCells[3],
          origin: rowCells[4],
          delivery: rowCells[5],
          status: rowCells[6],
        });
      }
    }

    return rows.filter((row) => this.parseFormalBacklogId(row.id) !== null);
  }

  private parseMarkdownTableRow(line: string): string[] {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
      return [];
    }

    return trimmed
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());
  }

  private normalizeHeader(value: string): string {
    return value.trim().toUpperCase();
  }

  private parseFormalBacklogId(value: string): {
    documentType: string;
    referenceDate: string;
    nature: string;
    interventionType: string;
    sequence: number;
  } | null {
    const normalized = value.trim().toUpperCase();
    const match = normalized.match(
      /^([A-Z]+)-(\d{8})(?:-\d{3})?-(RF|NF|RN|UX|OP|AR)-(BLI|COR|AJU|EVO)-(\d{4})$/,
    );

    if (!match) {
      return null;
    }

    const date = match[2];
    return {
      documentType: match[1],
      referenceDate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
      nature: match[3],
      interventionType: match[4],
      sequence: Number(match[5]),
    };
  }

  private upsertCounter(projectId: number, key: string, lastNumber: number): void {
    const existingCounter = this.countersRepository
      .list(projectId)
      .find((counter) => counter.name === key);

    if (existingCounter) {
      this.countersRepository.updateCounter(projectId, key, lastNumber);
      return;
    }

    const counter = new BacklogInterventionCountersEntity();
    counter.projectId = projectId;
    counter.name = key;
    counter.lastNumber = lastNumber;
    counter.createdAt = new Date().toISOString();
    counter.updatedAt = new Date().toISOString();
    this.countersRepository.insert(counter);
  }
}
