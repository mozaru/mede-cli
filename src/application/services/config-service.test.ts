import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { BetterSqliteConnectionFactory } from "../../infrastructure/db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../../infrastructure/db/unit-of-work.js";
import { ProjectRepository } from "../../infrastructure/repositories/project-repository.js";
import { ProjectConfigRepository } from "../../infrastructure/repositories/project-config-repository.js";
import { CycleRepository } from "../../infrastructure/repositories/cycle-repository.js";
import { FileSystemRepository } from "../../infrastructure/repositories/file-system-repository.js";
import { ConfigService } from "./config-service.js";
import { ProjectEntity } from "../../domain/entities/project-entity.js";
import { ProjectConfigEntity } from "../../domain/entities/project-config-entity.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import { CycleEntity } from "../../domain/entities/cycle-entity.js";
import { I18n } from "../../shared/i18n.js";

describe("ConfigService unit tests with real filesystem", () => {
  let uow: UnitOfWork;
  let projectRepository: ProjectRepository;
  let projectConfigRepository: ProjectConfigRepository;
  let cycleRepository: CycleRepository;
  let fileSystemRepository: FileSystemRepository;
  let configService: ConfigService;

  let originalCwd: string;
  let tempDir: string;

  beforeEach(() => {
    // Save original cwd and setup temp dir
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mede-config-test-"));
    process.chdir(tempDir);

    // Database setup
    uow = new UnitOfWork(new BetterSqliteConnectionFactory({ inMemory: true }));
    uow.ensureConnection();

    projectRepository = new ProjectRepository(uow);
    projectConfigRepository = new ProjectConfigRepository(uow);
    cycleRepository = new CycleRepository(uow);
    fileSystemRepository = new FileSystemRepository();

    configService = new ConfigService(
      projectRepository,
      projectConfigRepository,
      cycleRepository,
      fileSystemRepository
    );
  });

  afterEach(() => {
    // Restore original cwd and cleanup files
    process.chdir(originalCwd);
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup failures
    }
  });

  describe("init()", () => {
    it("generates a new mede.config.json file with default values and without localesDir", () => {
      expect(fs.existsSync("mede.config.json")).toBe(false);

      configService.init();

      expect(fs.existsSync("mede.config.json")).toBe(true);

      const content = fs.readFileSync("mede.config.json", "utf-8");
      const config = JSON.parse(content);

      expect(config.language).toBe("pt-BR");
      expect(config.docsRoot).toBe("docs");
      expect(config.localesDir).toBeUndefined(); // Should not have localesDir
    });

    it("throws if mede.config.json already exists", () => {
      fs.writeFileSync("mede.config.json", "{}");

      expect(() => configService.init()).toThrow("mede.config.json already exist");
    });
  });

  describe("getConfig()", () => {
    it("reads mede.config.json and fails clearly when it is missing", () => {
      expect(() => configService.getConfig()).toThrow("mede.config.json not found");

      fs.writeFileSync("mede.config.json", '{"ok":true}');

      expect(configService.getConfig()).toBe('{"ok":true}');
    });
  });

  describe("apply()", () => {
    it("throws if project or old config is not found", () => {
      expect(() => configService.apply()).toThrow("Project not found");
    });

    it("throws when a project config is missing or a cycle is active", () => {
      const now = new Date().toISOString();
      const projectEntity = new ProjectEntity();
      projectEntity.name = "TestProject";
      projectEntity.rootProjectPath = tempDir;
      projectEntity.docsRootPath = path.join(tempDir, "docs");
      projectEntity.documentationLanguage = "pt-BR";
      projectEntity.createdAt = now;
      projectEntity.updatedAt = now;

      uow.requireTransaction();
      const project = projectRepository.insert(projectEntity);
      uow.commit();

      expect(() => configService.apply()).toThrow("Configuration not found");

      configService.init();
      const configContent = fs.readFileSync("mede.config.json", "utf-8");
      const projectConfigEntity = new ProjectConfigEntity();
      projectConfigEntity.projectId = project.id;
      projectConfigEntity.medeConfigPath = "mede.config.json";
      projectConfigEntity.content = configContent;
      projectConfigEntity.hashContent = "hash";
      projectConfigEntity.createdAt = now;
      projectConfigEntity.updatedAt = now;

      const cycle = new CycleEntity();
      cycle.projectId = project.id;
      cycle.status = "OPEN";
      cycle.currentPhaseIndex = 1;
      cycle.phaseCount = 1;
      cycle.autoMode = "none";
      cycle.startedAt = now;

      uow.requireTransaction();
      projectConfigRepository.insert(projectConfigEntity);
      cycleRepository.insert(cycle);
      uow.commit();

      expect(() => configService.apply()).toThrow(/cycle is active|ciclo estiver ativo/);
    });

    it("applies changes from mede.config.json renaming base files, directories and moving docsRoot with real filesystem", () => {
      const now = new Date().toISOString();

      // Get a valid default config by initializing it and reading the file
      configService.init();
      const defaultConfigContent = fs.readFileSync("mede.config.json", "utf-8");
      const oldConfig = JSON.parse(defaultConfigContent) as MedeConfigModelEntity;
      fs.unlinkSync("mede.config.json"); // clean up for now

      // 1. Insert Project
      const projectEntity = new ProjectEntity();
      projectEntity.name = "TestProject";
      projectEntity.rootProjectPath = tempDir;
      projectEntity.docsRootPath = path.join(tempDir, "docs");
      projectEntity.documentationLanguage = "pt-BR";
      projectEntity.createdAt = now;
      projectEntity.updatedAt = now;
      const project = projectRepository.insert(projectEntity);


      const projectConfigEntity = new ProjectConfigEntity();
      projectConfigEntity.projectId = project.id;
      projectConfigEntity.medeConfigPath = "mede.config.json";
      projectConfigEntity.content = JSON.stringify(oldConfig, null, 2);
      projectConfigEntity.hashContent = "oldhash";
      projectConfigEntity.createdAt = now;
      projectConfigEntity.updatedAt = now;
      projectConfigRepository.insert(projectConfigEntity);

      // 3. Setup real old files on the filesystem
      const oldDocsRoot = path.join(tempDir, "docs");
      fs.mkdirSync(oldDocsRoot, { recursive: true });

      // Base files
      fs.writeFileSync(path.join(oldDocsRoot, "readme.md"), "# Old Readme");
      fs.writeFileSync(path.join(oldDocsRoot, "situacao-atual.md"), "# Old Current State");

      // Historical dir
      const oldMeetingDir = path.join(oldDocsRoot, "atas-de-reuniao");
      fs.mkdirSync(oldMeetingDir, { recursive: true });
      fs.writeFileSync(path.join(oldMeetingDir, "ata-001.md"), "# Meeting 1");
      fs.writeFileSync(path.join(oldMeetingDir, "ata-002.md"), "# Meeting 2");

      // 4. Create new config with changes:
      // - Change language to en-US
      // - Change docsRoot to "docs-new"
      // - Change fileNames.readme to "project-readme.md"
      // - Change directories.meetingMinutes to "minutes"
      // - Change prefixes.meetingMinutes to "min"
      const newConfig: MedeConfigModelEntity = {
        ...oldConfig,
        language: "en-US",
        docsRoot: "docs-new",
        fileNames: {
          ...oldConfig.fileNames,
          readme: "project-readme.md",
        },
        directories: {
          ...oldConfig.directories,
          meetingMinutes: "minutes",
        },
        prefixes: {
          ...oldConfig.prefixes,
          meetingMinutes: "min",
        },
      };

      fs.writeFileSync("mede.config.json", JSON.stringify(newConfig, null, 2));

      // 5. Apply configuration change
      uow.requireTransaction(); // Apply writes inside a transaction
      configService.apply();
      uow.commit();

      // 6. Verify filesystem changes in tempDir
      const newDocsRoot = path.join(tempDir, "docs-new");
      expect(fs.existsSync(oldDocsRoot)).toBe(false); // Old docsRoot directory should be gone
      expect(fs.existsSync(newDocsRoot)).toBe(true);

      // Base file should be renamed and moved
      expect(fs.existsSync(path.join(newDocsRoot, "project-readme.md"))).toBe(true);
      expect(fs.readFileSync(path.join(newDocsRoot, "project-readme.md"), "utf-8")).toBe("# Old Readme");

      // Unchanged base file name should still be moved to new docsRoot
      expect(fs.existsSync(path.join(newDocsRoot, "situacao-atual.md"))).toBe(true);

      // Meeting directory should be renamed to "minutes" under the new docsRoot
      const newMeetingDir = path.join(newDocsRoot, "minutes");
      expect(fs.existsSync(path.join(newDocsRoot, "atas-de-reuniao"))).toBe(false);
      expect(fs.existsSync(newMeetingDir)).toBe(true);

      // Meeting minutes should be renamed with the new prefix "min-"
      expect(fs.existsSync(path.join(newMeetingDir, "min-001.md"))).toBe(true);
      expect(fs.existsSync(path.join(newMeetingDir, "min-002.md"))).toBe(true);
      expect(fs.readFileSync(path.join(newMeetingDir, "min-001.md"), "utf-8")).toBe("# Meeting 1");

      // 7. Verify DB config entity updated
      const updatedConfigEntities = projectConfigRepository.list(project.id);
      expect(updatedConfigEntities).toHaveLength(1);
      const updatedConfig = JSON.parse(updatedConfigEntities[0].content);
      expect(updatedConfig.language).toBe("en-US");
      expect(updatedConfig.docsRoot).toBe("docs-new");

      // 8. Verify language was dynamically loaded in i18n
      expect(I18n.language).toBe("en-US");
    });
  });
});
