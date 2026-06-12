import { describe, it, expect, beforeEach } from "vitest";
import { BetterSqliteConnectionFactory } from "../../infrastructure/db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../../infrastructure/db/unit-of-work.js";
import { BacklogRepository } from "../../infrastructure/repositories/backlog-repository.js";
import { BacklogInterventionCountersRepository } from "../../infrastructure/repositories/backlog-intervention-counters-repository.js";
import { ProjectRepository } from "../../infrastructure/repositories/project-repository.js";
import { BacklogEntity } from "../../domain/entities/backlog-entity.js";
import { ProjectEntity } from "../../domain/entities/project-entity.js";
import { BacklogSyncService, ExtractBacklogResponseSchema } from "./backlog-sync-service.js";
import { ZodError } from "zod";

let uow: UnitOfWork;
let backlogRepo: BacklogRepository;
let countersRepo: BacklogInterventionCountersRepository;
let service: BacklogSyncService;
let PROJECT_ID: number;

beforeEach(() => {
  uow = new UnitOfWork(new BetterSqliteConnectionFactory({ inMemory: true }));
  uow.ensureConnection();

  const projectRepo = new ProjectRepository(uow);
  const now = new Date().toISOString();
  const p = new ProjectEntity();
  p.name = "test";
  p.rootProjectPath = "/tmp/test";
  p.docsRootPath = "/tmp/test/docs";
  p.documentationLanguage = "pt-BR";
  p.createdAt = now;
  p.updatedAt = now;
  PROJECT_ID = projectRepo.insert(p).id;

  backlogRepo = new BacklogRepository(uow);
  countersRepo = new BacklogInterventionCountersRepository(uow);
  service = new BacklogSyncService(backlogRepo, countersRepo);
});

function makeItem(overrides: Partial<BacklogEntity> = {}): BacklogEntity {
  const e = new BacklogEntity();
  e.projectId = PROJECT_ID;
  e.documentType = "SAT";
  e.referenceDate = "2026-06-11";
  e.nature = "RF";
  e.interventionType = "BLI";
  e.sequence = 1;
  e.immutableId = "SAT-20260611-001-RF-BLI-0001";
  e.description = "Funcionalidade A";
  e.tags = [];
  e.ata = "";
  e.source = "";
  e.deliver = "";
  e.status = "Pendente";
  e.createdAt = new Date().toISOString();
  e.updatedAt = new Date().toISOString();
  return Object.assign(e, overrides);
}

describe("ExtractBacklogResponseSchema (zod validation)", () => {
  it("parses valid JSON with statusChanges and newItems", () => {
    const raw = {
      statusChanges: [
        { id: "SAT-20260611-001-RF-BLI-0001", newStatus: "Concluído", observation: "feito" },
      ],
      newItems: [
        {
          documentType: "SAT",
          nature: "RF",
          interventionType: "EVO",
          description: "Nova funcionalidade B",
          status: "Pendente",
        },
      ],
    };
    const result = ExtractBacklogResponseSchema.parse(raw);
    expect(result.statusChanges).toHaveLength(1);
    expect(result.statusChanges[0].newStatus).toBe("Concluído");
    expect(result.newItems[0].interventionType).toBe("EVO");
  });

  it("parses empty statusChanges and newItems", () => {
    const result = ExtractBacklogResponseSchema.parse({ statusChanges: [], newItems: [] });
    expect(result.statusChanges).toHaveLength(0);
    expect(result.newItems).toHaveLength(0);
  });

  it("rejects statusChange IDs in wrong format", () => {
    const raw = {
      statusChanges: [{ id: "SAT-001-RF", newStatus: "Concluído" }],
      newItems: [],
    };
    expect(() => ExtractBacklogResponseSchema.parse(raw)).toThrow(ZodError);
  });

  it("rejects an invalid newStatus enum value", () => {
    const raw = {
      statusChanges: [{ id: "SAT-20260611-001-RF-BLI-0001", newStatus: "Feito" }],
      newItems: [],
    };
    expect(() => ExtractBacklogResponseSchema.parse(raw)).toThrow(ZodError);
  });

  it("rejects a newItem with an invalid nature", () => {
    const raw = {
      statusChanges: [],
      newItems: [
        { documentType: "SAT", nature: "XX", interventionType: "BLI", description: "Algo" },
      ],
    };
    expect(() => ExtractBacklogResponseSchema.parse(raw)).toThrow(ZodError);
  });
});

describe("BacklogSyncService.applyExtraction", () => {
  it("updates the status of an existing item", () => {
    backlogRepo.insert(makeItem());

    service.applyExtraction(PROJECT_ID, 1, "2026-06-11", {
      statusChanges: [{ id: "SAT-20260611-001-RF-BLI-0001", newStatus: "Concluído" }],
      newItems: [],
    });

    const items = backlogRepo.list(PROJECT_ID);
    expect(items[0].status).toBe("Concluído");
  });

  it("inserts new items with auto-generated immutableId", () => {
    service.applyExtraction(PROJECT_ID, 2, "2026-06-11", {
      statusChanges: [],
      newItems: [
        {
          documentType: "SAT",
          nature: "NF",
          interventionType: "AJU",
          description: "Ajuste de performance",
        },
      ],
    });

    const items = backlogRepo.list(PROJECT_ID);
    expect(items).toHaveLength(1);
    expect(items[0].immutableId).toBe("SAT-20260611-002-NF-AJU-0001");
    expect(items[0].description).toBe("Ajuste de performance");
  });

  it("creates and increments counters per nature-intervention key", () => {
    service.applyExtraction(PROJECT_ID, 1, "2026-06-11", {
      statusChanges: [],
      newItems: [
        { documentType: "SAT", nature: "RF", interventionType: "BLI", description: "Item 1" },
        { documentType: "SAT", nature: "RF", interventionType: "BLI", description: "Item 2" },
        { documentType: "SAT", nature: "NF", interventionType: "BLI", description: "Item 3" },
      ],
    });

    const items = backlogRepo.list(PROJECT_ID);
    expect(items[0].immutableId).toBe("SAT-20260611-001-RF-BLI-0001");
    expect(items[1].immutableId).toBe("SAT-20260611-001-RF-BLI-0002");
    expect(items[2].immutableId).toBe("SAT-20260611-001-NF-BLI-0001");

    const counters = countersRepo.list(PROJECT_ID);
    const rfBli = counters.find((c) => c.name === "SAT-RF-BLI");
    const nfBli = counters.find((c) => c.name === "SAT-NF-BLI");
    expect(rfBli?.lastNumber).toBe(2);
    expect(nfBli?.lastNumber).toBe(1);
  });

  it("does not crash when statusChange references an unknown ID — emits a warning only", () => {
    expect(() =>
      service.applyExtraction(PROJECT_ID, 1, "2026-06-11", {
        statusChanges: [{ id: "SAT-20260101-001-RF-BLI-9999", newStatus: "Concluído" }],
        newItems: [],
      }),
    ).not.toThrow();

    // No items should have been modified
    expect(backlogRepo.list(PROJECT_ID)).toHaveLength(0);
  });
});

describe("BacklogSyncService.applyEsmInterventions", () => {
  it("inserts missing formal ESM intervention rows into backlog", () => {
    const esm = [
      "## 4. Backlog de Intervenções",
      "",
      "| ID | Natureza | Tipo | Nome | Origem | Entrega | Status |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      "| ESM-20260612-AR-EVO-0001 | AR | EVO | Loader JSON | Ata 003 | leg-003 | Concluído |",
      "| ESM-20260612-OP-AJU-0001 | OP | AJU | Ajuste compliance | Ata 003 |  | Pendente |",
    ].join("\n");

    service.applyEsmInterventions(PROJECT_ID, esm);

    const items = backlogRepo.list(PROJECT_ID);
    expect(items.map((item) => item.immutableId)).toEqual([
      "ESM-20260612-AR-EVO-0001",
      "ESM-20260612-OP-AJU-0001",
    ]);
    expect(items[0].description).toBe("Loader JSON");
    expect(items[0].deliver).toBe("leg-003");
    expect(items[0].status).toBe("Concluído");
    expect(items[1].status).toBe("Pendente");

    const counters = countersRepo.list(PROJECT_ID);
    expect(counters.find((counter) => counter.name === "ESM-AR-EVO")?.lastNumber).toBe(1);
    expect(counters.find((counter) => counter.name === "ESM-OP-AJU")?.lastNumber).toBe(1);
  });

  it("does not duplicate an ESM intervention that already exists", () => {
    backlogRepo.insert(
      makeItem({
        documentType: "ESM",
        referenceDate: "2026-06-12",
        nature: "AR",
        interventionType: "EVO",
        sequence: 1,
        immutableId: "ESM-20260612-AR-EVO-0001",
        status: "Pendente",
      }),
    );

    const esm = [
      "| ID | Natureza | Tipo | Nome | Origem | Entrega | Status |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      "| ESM-20260612-AR-EVO-0001 | AR | EVO | Loader JSON | Ata 003 | leg-003 | Concluído |",
    ].join("\n");

    service.applyEsmInterventions(PROJECT_ID, esm);

    const items = backlogRepo.list(PROJECT_ID);
    expect(items).toHaveLength(1);
    expect(items[0].status).toBe("Concluído");
  });
});
