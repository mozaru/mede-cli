import { describe, it, expect, afterEach, beforeEach } from "vitest";

import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { ProjectRepository } from "./project-repository.js";
import { OperationalEventRepository } from "./operational-event-repository.js";
import { ProjectEntity } from "../../domain/entities/project-entity.js";
import { OperationalEventEntity } from "../../domain/entities/operational-event-entity.js";

let uow: UnitOfWork;
let projectRepository: ProjectRepository;
let eventRepository: OperationalEventRepository;

beforeEach(() => {
  uow = new UnitOfWork(new BetterSqliteConnectionFactory({ inMemory: true }));
  projectRepository = new ProjectRepository(uow);
  eventRepository = new OperationalEventRepository(uow);
});

afterEach(() => {
  uow[Symbol.dispose]();
});

describe("OperationalEventRepository", () => {
  it("inserts and lists operational events by project", () => {
    const project = projectRepository.insert(buildProject("Audited Project"));
    const otherProject = projectRepository.insert(buildProject("Other Project"));

    eventRepository.insert(buildEvent(project.id, "change.apply", { chunkIndex: 1 }));
    eventRepository.insert(buildEvent(otherProject.id, "cycle.rollback", {}));
    eventRepository.insert(buildEvent(project.id, "phase.approve", { phaseName: "README" }));

    const events = eventRepository.list(project.id);

    expect(events).toHaveLength(2);
    expect(events.map((event) => event.eventType)).toEqual(["change.apply", "phase.approve"]);
    expect(JSON.parse(events[0].payloadJson)).toEqual({ chunkIndex: 1 });
  });
});

function buildProject(name: string): ProjectEntity {
  const project = new ProjectEntity();
  project.name = name;
  project.rootProjectPath = "";
  project.docsRootPath = "";
  project.documentationLanguage = "pt-BR";
  project.createdAt = "2026-06-12T00:00:00.000Z";
  project.updatedAt = "2026-06-12T00:00:00.000Z";
  return project;
}

function buildEvent(
  projectId: number,
  eventType: string,
  payload: Record<string, unknown>,
): OperationalEventEntity {
  const event = new OperationalEventEntity();
  event.projectId = projectId;
  event.eventType = eventType;
  event.message = eventType;
  event.payloadJson = JSON.stringify(payload);
  event.createdAt = "2026-06-12T00:00:00.000Z";
  return event;
}
