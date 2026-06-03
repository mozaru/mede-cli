import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { CycleRepository } from "./cycle-repository.js";
import { ProjectRepository } from "./project-repository.js";
import { CycleEntity } from "../entities/cycle-entity.js";
import { ProjectEntity } from "../entities/project-entity.js";

// ---------------------------------------------------------------------------
// Integration tests against a real SQLite database created in a temp directory.
// The schema is provisioned by the production migration in
// BetterSqliteConnectionFactory, so these tests stay aligned with the real DDL.
// ---------------------------------------------------------------------------

let uow: UnitOfWork;
let root: string;
let cycles: CycleRepository;
let projects: ProjectRepository;

// Builds a fresh, isolated database for each test. The factory migrates every
// new database on connect, so each temp DB comes fully provisioned.
function freshDatabase(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-cycle-repo-"));
  const factory = new BetterSqliteConnectionFactory({ projectRootPath: root });
  uow = new UnitOfWork(factory);
  uow.ensureConnection();
  cycles = new CycleRepository(uow);
  projects = new ProjectRepository(uow);
}

function insertProject(): number {
  const project = new ProjectEntity();
  project.name = "demo";
  project.rootProjectPath = root;
  project.docsRootPath = "docs";
  project.documentationLanguage = "pt-BR";
  project.createdAt = new Date().toISOString();
  project.updatedAt = project.createdAt;
  return projects.insert(project).id;
}

function newCycle(projectId: number, status: string): CycleEntity {
  const cycle = new CycleEntity();
  cycle.projectId = projectId;
  cycle.status = status;
  cycle.currentPhaseIndex = 0;
  cycle.phaseCount = 11;
  cycle.autoMode = "NONE";
  cycle.startedAt = new Date().toISOString();
  cycle.finishedAt = "";
  return cycle;
}

beforeEach(() => {
  freshDatabase();
});

afterEach(() => {
  uow[Symbol.dispose]();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("CycleRepository CRUD", () => {
  it("insert returns the entity with a generated id", () => {
    const projectId = insertProject();
    const inserted = cycles.insert(newCycle(projectId, "OPEN"));

    expect(inserted.id).toBeGreaterThan(0);
    expect(inserted.projectId).toBe(projectId);
    expect(inserted.status).toBe("OPEN");
  });

  it("getById returns the persisted cycle and null when missing", () => {
    const projectId = insertProject();
    const inserted = cycles.insert(newCycle(projectId, "OPEN"));

    const found = cycles.getById(inserted.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(inserted.id);
    expect(found!.phaseCount).toBe(11);

    expect(cycles.getById(999999)).toBeNull();
  });

  it("list returns every cycle for the project", () => {
    const projectId = insertProject();
    cycles.insert(newCycle(projectId, "OPEN"));
    cycles.insert(newCycle(projectId, "COMMITTED"));

    expect(cycles.list(projectId)).toHaveLength(2);
  });

  it("getCurrent returns only OPEN or AWAITING_COMMIT cycles", () => {
    const projectId = insertProject();
    cycles.insert(newCycle(projectId, "COMMITTED"));
    expect(cycles.getCurrent(projectId)).toBeNull();

    const open = cycles.insert(newCycle(projectId, "OPEN"));
    const current = cycles.getCurrent(projectId);
    expect(current).not.toBeNull();
    expect(current!.id).toBe(open.id);
  });
});

// These tests pin the fix that replaced hardcoded `return true` with
// `return result.changes > 0`, so update methods now report whether a row
// actually changed instead of always claiming success.
describe("CycleRepository state transitions report real row changes", () => {
  it("updatePhaseIndex persists and returns true; false for a missing id", () => {
    const projectId = insertProject();
    const cycle = cycles.insert(newCycle(projectId, "OPEN"));

    expect(cycles.updatePhaseIndex(cycle.id, 5)).toBe(true);
    expect(cycles.getById(cycle.id)!.currentPhaseIndex).toBe(5);

    expect(cycles.updatePhaseIndex(999999, 5)).toBe(false);
  });

  it("awaiting transitions status to AWAITING_COMMIT; false for a missing id", () => {
    const projectId = insertProject();
    const cycle = cycles.insert(newCycle(projectId, "OPEN"));

    expect(cycles.awaiting(cycle.id)).toBe(true);
    expect(cycles.getById(cycle.id)!.status).toBe("AWAITING_COMMIT");

    expect(cycles.awaiting(999999)).toBe(false);
  });

  it("approveAll and rejectAll set autoMode; false for a missing id", () => {
    const projectId = insertProject();
    const cycle = cycles.insert(newCycle(projectId, "OPEN"));

    expect(cycles.approveAll(cycle.id)).toBe(true);
    expect(cycles.getById(cycle.id)!.autoMode).toBe("APPROVE_ALL");

    expect(cycles.rejectAll(cycle.id)).toBe(true);
    expect(cycles.getById(cycle.id)!.autoMode).toBe("REJECT_ALL");

    expect(cycles.approveAll(999999)).toBe(false);
    expect(cycles.rejectAll(999999)).toBe(false);
  });

  it("delete removes the cycle and returns true; false for a missing id", () => {
    const projectId = insertProject();
    const cycle = cycles.insert(newCycle(projectId, "OPEN"));

    expect(cycles.delete(cycle.id)).toBe(true);
    expect(cycles.getById(cycle.id)).toBeNull();
    expect(cycles.delete(cycle.id)).toBe(false);
  });

  it("deleteFromProject removes all cycles of the project", () => {
    const projectId = insertProject();
    cycles.insert(newCycle(projectId, "OPEN"));
    cycles.insert(newCycle(projectId, "COMMITTED"));

    expect(cycles.deleteFromProject(projectId)).toBe(true);
    expect(cycles.list(projectId)).toHaveLength(0);
    expect(cycles.deleteFromProject(projectId)).toBe(false);
  });
});
