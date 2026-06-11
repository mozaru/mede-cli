import { z } from "zod";
import { BacklogEntity } from "../../domain/entities/backlog-entity.js";
import { BacklogInterventionCountersEntity } from "../../domain/entities/backlog-intervention-counters-entity.js";
import type { IBacklogRepository } from "../../domain/interfaces/repositories/backlog-repository-interface.js";
import type { IBacklogInterventionCountersRepository } from "../../domain/interfaces/repositories/backlog-intervention-counters-repository-interface.js";

export const ExtractBacklogResponseSchema = z.object({
  statusChanges: z.array(
    z.object({
      id: z.string().regex(/^[A-Z]+-\d{8}-\d{3}-[A-Z]+-[A-Z]+-\d{4}$/),
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
      const counterKey = `${newItem.nature}-${newItem.interventionType}`;
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
}
