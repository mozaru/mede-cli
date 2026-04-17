import path from "node:path";
import { createHash } from "node:crypto";
import { CurrentStateParser } from "../shared/current-state-parser.js";
import { InitialUnderstandingParser } from "../shared/initial-understanding-parser.js";
import { IProjectConfigRepository } from "../repositories/interfaces/project-config-repository-interface.js";
import { IProjectRepository } from "../repositories/interfaces/project-repository-interface.js";
import { IBacklogRepository } from "../repositories/interfaces/backlog-repository-interface.js";
import { IBacklogInterventionCountersRepository } from "../repositories/interfaces/backlog-intervention-counters-repository-interface.js";
import { ProjectEntity } from "../entities/project-entity.js";
import { ProjectConfigEntity } from "../entities/project-config-entity.js";
import { BacklogEntity } from "../entities/backlog-entity.js";
import { BacklogInterventionCountersEntity } from "../entities/backlog-intervention-counters-entity.js";
import { FileSystemRepository } from "../repositories/file-system-repository.js";
import type { IFileSystemRepository } from "../repositories/interfaces/file-system-repository-interface.js";
import { ProjectReconstructionServiceResult } from "../models/project-reconstruction-result-model.js";
import { IProjectReconstructionService } from "./interfaces/project-reconstruction-service-interface.js";
import { MedeConfigModelEntity } from "../entities/mede-config-model-entity.js";
import { jsonToStr } from "../shared/json.js";

export class ProjectReconstructionService implements IProjectReconstructionService{
  private readonly fileSystemRepository: IFileSystemRepository;
  private readonly configRepository: IProjectConfigRepository;
  private readonly projectRepository: IProjectRepository;
  private readonly backlogRepository: IBacklogRepository;
  private readonly backlogInterventionCountersRepository: IBacklogInterventionCountersRepository;
  private readonly currentStateParser: CurrentStateParser;
  private readonly initialUnderstandingParser: InitialUnderstandingParser;
  private readonly projectRootPath: string;

  constructor(
    configRepository: IProjectConfigRepository,
    projectRepository: IProjectRepository,
    backlogRepository: IBacklogRepository,
    backlogInterventionCountersRepository: IBacklogInterventionCountersRepository,
    currentStateParser?: CurrentStateParser,
    initialUnderstandingParser?: InitialUnderstandingParser,
    projectRootPath?: string,
    fileSystemRepository?: IFileSystemRepository,
  ) {
    this.fileSystemRepository = fileSystemRepository ?? new FileSystemRepository();
    this.projectRootPath = projectRootPath ?? process.cwd();
    this.configRepository = configRepository;
    this.projectRepository = projectRepository;
    this.backlogRepository = backlogRepository;
    this.backlogInterventionCountersRepository = backlogInterventionCountersRepository;
    this.currentStateParser = currentStateParser ?? new CurrentStateParser(this.fileSystemRepository);
    this.initialUnderstandingParser = initialUnderstandingParser ?? new InitialUnderstandingParser(this.fileSystemRepository);
  }

  public reconstruct(): ProjectReconstructionServiceResult {
    const { config, created: configCreated } = this.loadOrCreateDefault();

    const configPath = path.join(this.projectRootPath, "mede.config.json");

    const docsRootPath = path.join(this.projectRootPath, config.docsRoot);

    const readmePath = path.join(docsRootPath, config.fileNames.readme);

    const initialUnderstandingPath = path.join(docsRootPath, config.fileNames.initialUnderstanding);

    const readmeFound = this.fileSystemRepository.exists(readmePath);

    const currentStatePath = path.join( docsRootPath, config.fileNames.currentState );

    const initialUnderstandingFound = this.fileSystemRepository.exists(initialUnderstandingPath);

    const currentStateFound = this.fileSystemRepository.exists(currentStatePath);

    let project = this.projectRepository.list().find((item) => item.rootProjectPath === this.projectRootPath) ?? null;
 
    let projectCreated = false;
    let projectUpdated = false;

    if (!project) {
      project = {
        id: 0,
        name: "",
        rootProjectPath: this.projectRootPath,
        docsRootPath: docsRootPath,
        documentationLanguage: config.language,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as ProjectEntity;

      project = this.projectRepository.insert(project);
      projectCreated = true;
    }

    const persistedProjectConfig = this.persistProjectConfig( project.id, configPath);

    void persistedProjectConfig;

    let backlogItemsToPersist: BacklogEntity[] = [];
    let backlogSequenceCountersToPersist: BacklogInterventionCountersEntity[] = [];
    let projectNameFromReadme: string | null = null;
    let projectNameFromInitialUnderstanding: string | null = null;
    let projectNameFromCurrentState: string | null = null;
    let projectNameSource: "readme" | "initial-understanding" | "current-state" | "unknown" = "unknown";

    if (initialUnderstandingFound) {
      const initialUnderstandingResult = this.initialUnderstandingParser.parse(initialUnderstandingPath);   
      const parsedName = initialUnderstandingResult.metadata.systemName?.trim() ?? "";
      projectNameFromInitialUnderstanding = parsedName;
      backlogItemsToPersist = initialUnderstandingResult.backlogItems;
    }

    if (currentStateFound) {
      const currentStateResult = this.currentStateParser.parse(currentStatePath);           
      const parsedName = currentStateResult.metadata.systemName?.trim() ?? "";
      projectNameFromCurrentState = parsedName;
      backlogItemsToPersist = currentStateResult.backlogItems;
      backlogSequenceCountersToPersist =
        currentStateResult.metadata.classificationCounters.map((item) =>
          this.buildBacklogSequenceCounter(project!.id, item.key, item.lastSequenceNumber)
        );            
    }

    if (readmeFound) {
      projectNameFromReadme = this.extractProjectNameFromReadme(readmePath);
    }

    const resolvedProjectName =
      projectNameFromInitialUnderstanding ||
      projectNameFromReadme ||
      projectNameFromCurrentState ||
      project.name;

    if (projectNameFromInitialUnderstanding) {
      projectNameSource = "initial-understanding";
    } else if (projectNameFromReadme) {
      projectNameSource = "readme";
    } else if (projectNameFromCurrentState) {
      projectNameSource = "current-state";
    } else {
      projectNameSource = "unknown";
    }

    const mergedProject = {
      id: project.id,
      name: resolvedProjectName,
      rootProjectPath: project.rootProjectPath,
      docsRootPath: project.docsRootPath,
      documentationLanguage: project.documentationLanguage,
      createdAt: project.createdAt,
      updatedAt: new Date().toISOString(),
    } as ProjectEntity;

    if (this.hasProjectChanged(project, mergedProject)) {
      if (project.id) {
        project = this.projectRepository.update(mergedProject);
        projectUpdated = true;
      }
    } else {
      project = mergedProject;      
    }

    let backlogItemsRebuilt = 0;
    let backlogSequenceCountersRebuilt = 0;
    const snapshotCreated = false;

    if (initialUnderstandingFound || currentStateFound) {
      this.backlogRepository.deleteFromProject(project!.id);
      this.backlogInterventionCountersRepository.deleteFromProject(project!.id);

      for (const backlogItem of backlogItemsToPersist) {
        backlogItem.projectId = project.id;
        this.backlogRepository.insert(backlogItem);
        backlogItemsRebuilt += 1;
      }

      for (const counter of backlogSequenceCountersToPersist) {
        counter.projectId = project.id;
        this.backlogInterventionCountersRepository.insert(counter);
        backlogSequenceCountersRebuilt += 1;
      }
    }

    return {
      configCreated,
      configPath,

      project,
      projectCreated,
      projectUpdated,

      readmeFound,
      initialUnderstandingFound,
      currentStateFound,

      backlogItemsRebuilt,
      backlogSequenceCountersRebuilt,
      snapshotCreated,
      projectNameSource,

      sources: {
        readmePath,
        initialUnderstandingPath,
        currentStatePath,
      },
    };
  }

  private persistProjectConfig(
    projectId: number,
    configPath: string,
  ): ProjectConfigEntity {
    const rawConfig = this.fileSystemRepository.exists(configPath) ? this.fileSystemRepository.readFile(configPath) : jsonToStr(new MedeConfigModelEntity());

    const configHash = createHash("sha256")
      .update(rawConfig, "utf-8")
      .digest("hex");

    const existing = this.configRepository.getCurrent(projectId);

    if (existing) {
      this.configRepository.updateContent(existing.id, rawConfig, configHash);
      const updated = this.configRepository.getById(existing.id);
      if (updated === null) {
       throw new Error("Config not found after update");
      }
      return updated;
    }

    const projectConfig = new ProjectConfigEntity();
    projectConfig.id = 0;
    projectConfig.projectId = projectId;
    projectConfig.medeConfigPath = configPath;
    projectConfig.content = rawConfig;
    projectConfig.hashContent = configHash;
    projectConfig.createdAt = new Date().toISOString();
    projectConfig.updatedAt = new Date().toISOString();

    return this.configRepository.insert(projectConfig);
  }

  private hasProjectChanged(current: ProjectEntity, next: ProjectEntity): boolean {
    return (
      current.name !== next.name ||
      current.docsRootPath !== next.docsRootPath ||
      current.documentationLanguage !== next.documentationLanguage
    );
  }

  private buildBacklogSequenceCounter(
    projectId: number,
    key: string,
    lastSequenceNumber: number,
  ): BacklogInterventionCountersEntity {
    const counter = new BacklogInterventionCountersEntity();
    counter.id = 0;
    counter.projectId = projectId;
    counter.name = key;
    counter.lastNumber = lastSequenceNumber;
    counter.createdAt = "";
    counter.updatedAt = "";

    return counter;
  }

  private extractProjectNameFromReadme(
    readmePath: string,
  ): string | null {
    if (!this.fileSystemRepository.exists(readmePath)) {
      return null;
    }

    const content = this.fileSystemRepository.readFile(readmePath);
    const match = content.match(/^#\s+(.+)$/m);

    if (!match) {
      return null;
    }

    const projectName = match[1]?.trim();

    if (!projectName) {
      return null;
    }

    return projectName;
  }

  private loadOrCreateDefault() : { config: any; created: boolean }
  {
    const configPath = path.join(this.projectRootPath, "mede.config.json");
    let config : MedeConfigModelEntity = new MedeConfigModelEntity(); 
    let created : boolean = true;
    if (this.fileSystemRepository.exists(configPath))
    {
      config = this.fileSystemRepository.readJsonFile(configPath) as MedeConfigModelEntity;
      created = false;
    } 
    return { config, created }
  } 
}