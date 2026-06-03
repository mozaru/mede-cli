import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import BetterSqlite3 from "better-sqlite3";

import { BetterSqliteConnectionFactory } from "./better-sqlite-connection-factory.js";

// ---------------------------------------------------------------------------
// Schema versioning via PRAGMA user_version. New databases are migrated to the
// latest version, re-opening is idempotent, and legacy databases (tables already
// present, user_version still 0) are upgraded without error.
// ---------------------------------------------------------------------------

let root: string;

function dbPath(): string {
  return path.join(root, ".mede", "mede.db");
}

function tableNames(connection: BetterSqlite3.Database): string[] {
  const rows = connection
    .prepare("select name from sqlite_master where type = 'table'")
    .all() as Array<{ name: string }>;
  return rows.map((r) => r.name);
}

function userVersion(connection: BetterSqlite3.Database): number {
  return Number(connection.pragma("user_version", { simple: true }));
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "mede-migrations-"));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("schema migrations", () => {
  it("migrates a fresh database to the latest version and creates the tables", () => {
    const connection = new BetterSqliteConnectionFactory({
      projectRootPath: root,
    }).createConnection();

    try {
      expect(userVersion(connection)).toBe(1);
      const tables = tableNames(connection);
      expect(tables).toContain("Project");
      expect(tables).toContain("Cycle");
      expect(tables).toContain("ChangeChunk");
    } finally {
      connection.close();
    }
  });

  it("provisions an in-memory database without touching the filesystem", () => {
    const connection = new BetterSqliteConnectionFactory({
      projectRootPath: root,
      inMemory: true,
    }).createConnection();

    try {
      expect(userVersion(connection)).toBe(1);
      expect(tableNames(connection)).toContain("Project");
      // No `.mede` directory is created for an in-memory database.
      expect(fs.existsSync(path.join(root, ".mede"))).toBe(false);
    } finally {
      connection.close();
    }
  });

  it("is idempotent when re-opening an already-migrated database", () => {
    new BetterSqliteConnectionFactory({ projectRootPath: root }).createConnection().close();

    const connection = new BetterSqliteConnectionFactory({
      projectRootPath: root,
    }).createConnection();
    try {
      expect(userVersion(connection)).toBe(1);
      expect(tableNames(connection)).toContain("Project");
    } finally {
      connection.close();
    }
  });

  it("upgrades a legacy database (tables present, user_version 0) without error", () => {
    // Simulate a database created before versioning existed.
    fs.mkdirSync(path.join(root, ".mede"), { recursive: true });
    const legacy = new BetterSqlite3(dbPath());
    legacy.exec(`create table Project (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'name' VARCHAR(50) NOT NULL,
        'rootProjectPath' VARCHAR(300) NULL,
        'docsRootPath' VARCHAR(300) NULL,
        'documentationLanguage' VARCHAR(60) NULL,
        'createdAt' DATETIME NOT NULL,
        'updatedAt' DATETIME NOT NULL
    );`);
    expect(userVersion(legacy)).toBe(0);
    legacy.close();

    const connection = new BetterSqliteConnectionFactory({
      projectRootPath: root,
    }).createConnection();
    try {
      expect(userVersion(connection)).toBe(1);
      // The pre-existing table is preserved and the missing ones are created.
      const tables = tableNames(connection);
      expect(tables).toContain("Project");
      expect(tables).toContain("Cycle");
    } finally {
      connection.close();
    }
  });
});
