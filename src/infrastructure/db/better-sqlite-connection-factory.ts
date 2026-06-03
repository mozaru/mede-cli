import fs from "node:fs";
import path from "node:path";
import BetterSqlite3 from "better-sqlite3";
import type Database from "better-sqlite3";

import type { IDbConnectionFactory } from "./db-connection-factory-interface.js";

export interface BetterSqliteConnectionFactoryOptions {
  projectRootPath?: string;
  medeDirectoryName?: string;
  databaseFileName?: string;
  // When true, the database lives in RAM (no `.mede` directory, no file). Used by
  // single-connection unit tests — faster and free of temp dirs / Windows file
  // locks. Not for production, where state must survive between command runs.
  inMemory?: boolean;
}

interface Migration {
  version: number;
  description: string;
  up(connection: Database.Database): void;
}

export class BetterSqliteConnectionFactory implements IDbConnectionFactory {
  private readonly projectRootPath: string;
  private readonly medeDirectoryName: string;
  private readonly databaseFileName: string;
  private readonly inMemory: boolean;

  // Ordered list of schema migrations. Each one runs exactly once per database,
  // gated by PRAGMA user_version, so new and existing databases converge to the
  // latest schema. Migration 1 uses IF NOT EXISTS so it is also safe on legacy
  // databases created before versioning existed (which report user_version 0).
  private static readonly MIGRATIONS: Migration[] = [
    {
      version: 1,
      description: "initial schema",
      up: (connection) => connection.exec(BetterSqliteConnectionFactory.INITIAL_SCHEMA),
    },
  ];

  public constructor(options?: BetterSqliteConnectionFactoryOptions) {
    this.projectRootPath = options?.projectRootPath ?? process.cwd();
    this.medeDirectoryName = options?.medeDirectoryName ?? ".mede";
    this.databaseFileName = options?.databaseFileName ?? "mede.db";
    this.inMemory = options?.inMemory ?? false;
  }

  public createConnection(): Database.Database {
    const connection = this.inMemory
      ? new BetterSqlite3(":memory:")
      : new BetterSqlite3(this.resolveDatabasePath());

    // foreign_keys is a per-connection pragma, so it must be set on every
    // connection, not once per process.
    connection.pragma("foreign_keys = ON");

    // WAL is a file-based journal mode; it is meaningless for an in-memory db.
    if (!this.inMemory) {
      connection.pragma("journal_mode = WAL");
    }

    this.runMigrations(connection);

    return connection;
  }

  private resolveDatabasePath(): string {
    const medeDirectoryPath = path.join(this.projectRootPath, this.medeDirectoryName);
    fs.mkdirSync(medeDirectoryPath, { recursive: true });
    return path.join(medeDirectoryPath, this.databaseFileName);
  }

  // Applies every migration whose version is greater than the database's current
  // user_version, each inside its own transaction, then records the new version.
  private runMigrations(connection: Database.Database): void {
    const currentVersion = Number(connection.pragma("user_version", { simple: true })) || 0;

    const pending = BetterSqliteConnectionFactory.MIGRATIONS.filter(
      (migration) => migration.version > currentVersion,
    ).sort((a, b) => a.version - b.version);

    for (const migration of pending) {
      const applyMigration = connection.transaction(() => {
        migration.up(connection);
        // PRAGMA does not accept bound parameters; the version is an integer we
        // control, so interpolation here is safe.
        connection.pragma(`user_version = ${migration.version}`);
      });

      applyMigration();
    }
  }

  private static readonly INITIAL_SCHEMA = `
create table if not exists Project (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'name' VARCHAR(50) NOT NULL,
        'rootProjectPath' VARCHAR(300) NULL,
        'docsRootPath' VARCHAR(300) NULL,
        'documentationLanguage' VARCHAR(60) NULL,
        'createdAt' DATETIME NOT NULL,
        'updatedAt' DATETIME NOT NULL
);

create table if not exists ProjectConfig (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'projectId' INTEGER NOT NULL,
        'medeConfigPath' VARCHAR(300) NULL,
        'hashContent' VARCHAR(300) NULL,
        'content' TEXT NULL,
        'createdAt' DATETIME NOT NULL,
        'updatedAt' DATETIME NOT NULL,
        FOREIGN KEY (projectId) REFERENCES Project(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table if not exists LlmProfile (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'projectId' INTEGER NOT NULL,
        'profileName' VARCHAR(50) NOT NULL,
        'provider' VARCHAR(50) NOT NULL,
        'model' VARCHAR(50) NOT NULL,
        'endpoint' VARCHAR(200) NOT NULL,
        'apiKeyEnv' VARCHAR(50) NOT NULL,
        'temperature' DOUBLE NULL,
        'maxTokens' INTEGER NULL,
        'timeoutMs' INTEGER NULL,
        'retryJson' TEXT NULL,
        'active' BOOL NOT NULL DEFAULT true,
        FOREIGN KEY (projectId) REFERENCES Project(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table if not exists Backlog (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'projectId' INTEGER NOT NULL,
        'documentType' VARCHAR(3) NOT NULL,
        'referenceDate' VARCHAR(8) NOT NULL,
        'nature' VARCHAR(3) NOT NULL,
        'interventionType' VARCHAR(3) NOT NULL,
        'sequence' INTEGER NOT NULL,
        'immutableId' VARCHAR(30) NOT NULL,
        'description' VARCHAR(100) NOT NULL,
        'tags' TEXT NULL,
        'ata' VARCHAR(50) NOT NULL,
        'source' VARCHAR(50) NOT NULL,
        'deliver' VARCHAR(50) NOT NULL,
        'status' VARCHAR(20) NOT NULL,
        'createdAt' DATETIME NOT NULL,
        'updatedAt' DATETIME NOT NULL,
        FOREIGN KEY (projectId) REFERENCES Project(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table if not exists BacklogInterventionCounters (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'projectId' INTEGER NOT NULL,
        'name' VARCHAR(3) NOT NULL,
        'lastNumber' INTEGER NOT NULL,
        'createdAt' DATETIME NOT NULL,
        'updatedAt' DATETIME NOT NULL,
        FOREIGN KEY (projectId) REFERENCES Project(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table if not exists Cycle (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'projectId' INTEGER NOT NULL,
        'status' VARCHAR(20) NOT NULL,
        'currentPhaseIndex' INTEGER NOT NULL,
        'phaseCount' INTEGER NOT NULL,
        'autoMode' VARCHAR(20) NOT NULL,
        'startedAt' DATETIME NOT NULL,
        'finishedAt' DATETIME NULL,
        FOREIGN KEY (projectId) REFERENCES Project(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table if not exists Phase (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'cycleId' INTEGER NOT NULL,
        'name' VARCHAR(50) NOT NULL,
        'index' INTEGER NOT NULL,
        'inputFiles' TEXT NULL,
        'outputFile' VARCHAR(300) NULL,
        'docTypeOutput' VARCHAR(20) NOT NULL,
        'promptName' VARCHAR(50) NOT NULL,
        'status' VARCHAR(20) NOT NULL,
        'proposalState' VARCHAR(20) NOT NULL,
        'startedAt' DATETIME NOT NULL,
        'finishedAt' DATETIME NULL,
        FOREIGN KEY (cycleId) REFERENCES Cycle(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table if not exists CycleArtifact (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'cycleId' INTEGER NOT NULL,
        'backupContent' TEXT NULL,
        'currentContent' TEXT NULL,
        'canonicalName' VARCHAR(60) NOT NULL,
        'canonicalType' VARCHAR(20) NOT NULL,
        'artifactPath' VARCHAR(300) NULL,
        'startedAt' DATETIME NOT NULL,
        'updatedAt' DATETIME NOT NULL,
        FOREIGN KEY (cycleId) REFERENCES Cycle(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table if not exists PhaseConversation (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'phaseId' INTEGER NOT NULL,
        'createdAt' DATETIME NOT NULL,
        'actor' VARCHAR(50) NOT NULL,
        'content' TEXT NULL,
        FOREIGN KEY (phaseId) REFERENCES Phase(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table if not exists PhaseAttachment (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'phaseId' INTEGER NOT NULL,
        'createdAt' DATETIME NOT NULL,
        'actor' VARCHAR(50) NOT NULL,
        'filePath' VARCHAR(300) NULL,
        'fileName' VARCHAR(50) NOT NULL,
        'content' BLOB NULL,
        'contentText' TEXT NULL,
        FOREIGN KEY (phaseId) REFERENCES Phase(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table if not exists ChangeSet (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'phaseId' INTEGER NOT NULL,
        'cycleArtifactId' INTEGER NOT NULL,
        'fileName' VARCHAR(300) NULL,
        'completed' BOOL NOT NULL DEFAULT false,
        'currentChangeChunkIndex' INTEGER NOT NULL,
        'changeChunkCount' INTEGER NOT NULL,
        'currentOffset' INTEGER NOT NULL,
        'startedAt' DATETIME NOT NULL,
        'updatedAt' DATETIME NULL,
        FOREIGN KEY (phaseId) REFERENCES Phase(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (cycleArtifactId) REFERENCES CycleArtifact(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table if not exists ChangeChunk (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'phaseId' INTEGER NOT NULL,
        'changeSetId' INTEGER NOT NULL,
        'index' INTEGER NOT NULL,
        'status' VARCHAR(20) NOT NULL,
        'blockLocation' VARCHAR(40) NOT NULL,
        'changeContent' TEXT NULL,
        'startedAt' DATETIME NOT NULL,
        'updatedAt' DATETIME NOT NULL,
        FOREIGN KEY (phaseId) REFERENCES Phase(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (changeSetId) REFERENCES ChangeSet(id) ON UPDATE CASCADE ON DELETE CASCADE
);
`;
}
