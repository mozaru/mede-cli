import fs from 'node:fs';
import path from 'node:path';
import BetterSqlite3 from 'better-sqlite3';
import type Database from 'better-sqlite3';

import type { IDbConnectionFactory } from './db-connection-factory-interface.js';

export interface BetterSqliteConnectionFactoryOptions {
  projectRootPath?: string;
  medeDirectoryName?: string;
  databaseFileName?: string;
}

export class BetterSqliteConnectionFactory implements IDbConnectionFactory {
  private readonly projectRootPath: string;
  private readonly medeDirectoryName: string;
  private readonly databaseFileName: string;
  private static initialized = false;

  public constructor(options?: BetterSqliteConnectionFactoryOptions) {
    this.projectRootPath = options?.projectRootPath ?? process.cwd();
    this.medeDirectoryName = options?.medeDirectoryName ?? '.mede';
    this.databaseFileName = options?.databaseFileName ?? 'mede.db';

  }

  public createConnection(): Database.Database {
    const medeDirectoryPath = path.join(
      this.projectRootPath,
      this.medeDirectoryName
    );

    fs.mkdirSync(medeDirectoryPath, { recursive: true });

    const databasePath = path.join(
      medeDirectoryPath,
      this.databaseFileName
    );
    const hasDatabase = fs.existsSync(databasePath); 
    const connection = new BetterSqlite3(databasePath);

    if (!BetterSqliteConnectionFactory.initialized) {
      connection.pragma('foreign_keys = ON');
      connection.pragma('journal_mode = WAL');
      if (!hasDatabase)
        this.migrate(connection);
      this.seedReferenceData(connection);
      BetterSqliteConnectionFactory.initialized = true;
    }

    return connection;
  }

  private migrate(connection: Database.Database): void {
    connection.exec(`
create table Project (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'name' VARCHAR(50) NOT NULL,
        'rootProjectPath' VARCHAR(300) NULL,
        'docsRootPath' VARCHAR(300) NULL,
        'documentationLanguage' VARCHAR(60) NULL,
        'createdAt' DATETIME NOT NULL,
        'updatedAt' DATETIME NOT NULL
);

create table ProjectConfig (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'projectId' INTEGER NOT NULL,
        'medeConfigPath' VARCHAR(300) NULL,
        'hashContent' VARCHAR(300) NULL,
        'content' TEXT NULL,
        'createdAt' DATETIME NOT NULL,
        'updatedAt' DATETIME NOT NULL,
        FOREIGN KEY (projectId) REFERENCES Project(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table LlmProfile (
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

create table Backlog (
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

create table BacklogInterventionCounters (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'projectId' INTEGER NOT NULL,
        'name' VARCHAR(3) NOT NULL,
        'lastNumber' INTEGER NOT NULL,
        'createdAt' DATETIME NOT NULL,
        'updatedAt' DATETIME NOT NULL,
        FOREIGN KEY (projectId) REFERENCES Project(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table Cycle (
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

create table Phase (
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

create table CycleArtifact (
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

create table PhaseConversation (
        'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        'phaseId' INTEGER NOT NULL,
        'createdAt' DATETIME NOT NULL,
        'actor' VARCHAR(50) NOT NULL,
        'content' TEXT NULL,
        FOREIGN KEY (phaseId) REFERENCES Phase(id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table PhaseAttachment (
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

create table ChangeSet (
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

create table ChangeChunk (
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
    `);
  }

  private seedReferenceData(connection: Database.Database): void {
    // reservado para seed futura
  }

  private ensureColumnExists(
    connection: Database.Database,
    tableName: string,
    columnName: string,
    columnDefinition: string
  ): void {
    const rows = connection
      .prepare(`PRAGMA table_info(${tableName})`)
      .all() as Array<{ name: string }>;

    const hasColumn = rows.some((row) => row.name === columnName);

    if (!hasColumn) {
      connection.exec(`
        ALTER TABLE ${tableName}
        ADD COLUMN ${columnName} ${columnDefinition}
      `);
    }
  }
}