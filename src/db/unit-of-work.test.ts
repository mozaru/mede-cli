import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { BetterSqliteConnectionFactory } from "./better-sqlite-connection-factory.js";
import { UnitOfWork } from "./unit-of-work.js";
import { ProjectRepository } from "../repositories/project-repository.js";
import { ProjectEntity } from "../entities/project-entity.js";

// ---------------------------------------------------------------------------
// Transaction semantics of UnitOfWork against a real SQLite database. These are
// the guarantees CycleService now relies on to make multi-step cycle operations
// atomic (begin / clearCycle / createBackupDocs).
// ---------------------------------------------------------------------------

let uow: UnitOfWork;
let root: string;
let projects: ProjectRepository;

function freshDatabase(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-uow-"));
  const factory = new BetterSqliteConnectionFactory({ projectRootPath: root });
  uow = new UnitOfWork(factory);
  uow.ensureConnection();
  projects = new ProjectRepository(uow);
}

function newProject(name: string): ProjectEntity {
  const project = new ProjectEntity();
  project.name = name;
  project.rootProjectPath = root;
  project.docsRootPath = "docs";
  project.documentationLanguage = "pt-BR";
  project.createdAt = new Date().toISOString();
  project.updatedAt = project.createdAt;
  return project;
}

beforeEach(() => {
  freshDatabase();
});

afterEach(() => {
  uow[Symbol.dispose]();
  fs.rmSync(root, { recursive: true, force: true });
});

describe("UnitOfWork transactions", () => {
  it("commit persists every write made inside the transaction", () => {
    uow.requireTransaction();
    projects.insert(newProject("a"));
    projects.insert(newProject("b"));
    uow.commit();

    expect(projects.list()).toHaveLength(2);
  });

  it("rollback discards every write made inside the transaction", () => {
    uow.requireTransaction();
    projects.insert(newProject("a"));
    projects.insert(newProject("b"));
    uow.rollback();

    expect(projects.list()).toHaveLength(0);
  });

  it("rolls back a partial multi-step operation atomically", () => {
    // Simulates a multi-step write that fails halfway: nothing should remain.
    expect(() => {
      uow.requireTransaction();
      projects.insert(newProject("a"));
      throw new Error("boom in the middle of the operation");
    }).toThrow("boom");
    uow.rollback();

    expect(projects.list()).toHaveLength(0);
  });

  it("flags transactional state correctly across the lifecycle", () => {
    expect(uow.isTransactional).toBe(false);

    uow.requireTransaction();
    expect(uow.isTransactional).toBe(true);

    projects.insert(newProject("a"));
    expect(uow.hasActiveTransaction).toBe(true);

    uow.commit();
    expect(uow.isTransactional).toBe(false);
    expect(uow.hasActiveTransaction).toBe(false);
  });

  it("autocommits writes when no transaction was requested", () => {
    projects.insert(newProject("a"));

    expect(uow.isTransactional).toBe(false);
    expect(projects.list()).toHaveLength(1);
  });
});
