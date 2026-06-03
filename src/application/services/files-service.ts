import type { IProjectRepository } from "../../domain/interfaces/repositories/project-repository-interface.js";
import type { IProjectConfigRepository } from "../../domain/interfaces/repositories/project-config-repository-interface.js";
import type { ICycleRepository } from "../../domain/interfaces/repositories/cycle-repository-interface.js";
import type { ICycleArtifactRepository } from "../../domain/interfaces/repositories/cycle-artifact-repository-interface.js";
import type { ProjectEntity } from "../../domain/entities/project-entity.js";
import type { ProjectConfigEntity } from "../../domain/entities/project-config-entity.js";
import { type DiffFunction, generateDiff } from "../../shared/diff.js";

export class FilesService {
  private readonly projectRepository: IProjectRepository;
  private readonly projectConfigRepository: IProjectConfigRepository;
  private readonly cycleRepository: ICycleRepository;
  private readonly cycleArtifactRepository: ICycleArtifactRepository;
  private readonly diffFunction: DiffFunction;

  constructor(
    projectRepository: IProjectRepository,
    projectConfigRepository: IProjectConfigRepository,
    cycleRepository: ICycleRepository,
    cycleArtifactRepository: ICycleArtifactRepository,
    diffFunction: DiffFunction | null = null,
  ) {
    this.projectRepository = projectRepository;
    this.projectConfigRepository = projectConfigRepository;
    this.cycleRepository = cycleRepository;
    this.cycleArtifactRepository = cycleArtifactRepository;
    this.diffFunction = diffFunction ?? generateDiff;
  }

  public files(backup: boolean): string {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const config = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(config, "Configuração não encontrada");
    void config;

    const cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");

    let response = "";

    for (const artifact of this.cycleArtifactRepository.list(cycle.id)) {
      if (backup) {
        if (this.notEmpty(artifact.backupContent)) {
          response += `${artifact.artifactPath}\n`;
        }
      } else if (artifact.backupContent !== artifact.currentContent) {
        response += `${artifact.artifactPath}\n`;
      }
    }

    return response;
  }

  public diff(file: string): string {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const config = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(config, "Configuração não encontrada");
    void config;

    const cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");

    let response = "";
    let found = false;

    for (const artifact of this.cycleArtifactRepository.list(cycle.id)) {
      if (artifact.artifactPath === file) {
        found = true;

        if (artifact.backupContent === artifact.currentContent) {
          response = "No diffs found";
        } else {
          const chunks = this.diffFunction(artifact.backupContent, artifact.currentContent);

          if (!chunks || chunks.length === 0) {
            return "No diffs found";
          }

          return chunks.map((chunk) => `${chunk.location}\n${chunk.content}`).join("\n\n");
        }
      }
    }

    this.assert(found, "arquivo não encontrado");
    return response;
  }

  public cat(file: string, backup: boolean): string {
    const project = this.getCurrentProject();
    this.assertNotNull(project, "Projeto não encontrado");

    const config = this.getCurrentProjectConfig(project.id);
    this.assertNotNull(config, "Configuração não encontrada");
    void config;

    const cycle = this.cycleRepository.getCurrent(project.id);
    this.assertNotNull(cycle, "Nenhum ciclo ativo no projeto atual");

    let response = "";
    let found = false;

    for (const artifact of this.cycleArtifactRepository.list(cycle.id)) {
      if (artifact.artifactPath === file) {
        found = true;

        if (backup && this.isEmpty(artifact.backupContent)) {
          response = "O arquivo não existia no snapshot inicial";
        } else {
          response = backup ? artifact.backupContent : artifact.currentContent;
        }
      }
    }

    this.assert(found, "arquivo não encontrado");
    return response;
  }

  private getCurrentProject(): ProjectEntity | null {
    const repository = this.projectRepository as IProjectRepository & {
      getCurrent?: () => ProjectEntity | null;
    };

    if (typeof repository.getCurrent === "function") {
      return repository.getCurrent();
    }

    const projects = this.projectRepository.list();

    if (projects.length === 0) {
      return null;
    }

    let currentProject = projects[0];

    for (const project of projects) {
      if (project.id > currentProject.id) {
        currentProject = project;
      }
    }

    return currentProject;
  }

  private getCurrentProjectConfig(projectId: number): ProjectConfigEntity | null {
    const repository = this.projectConfigRepository as IProjectConfigRepository & {
      get?: (projectId: number) => ProjectConfigEntity | null;
    };

    if (typeof repository.get === "function") {
      return repository.get(projectId);
    }

    return this.projectConfigRepository.getCurrent(projectId);
  }

  private isEmpty(value: string | null | undefined): boolean {
    return value === null || value === undefined || value.trim() === "";
  }

  private notEmpty(value: string | null | undefined): boolean {
    return !this.isEmpty(value);
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  private assertNotNull<T>(value: T | null, message: string): asserts value is T {
    if (value === null) {
      throw new Error(message);
    }
  }
}
