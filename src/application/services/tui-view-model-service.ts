import type { IUnitOfWork } from "../../infrastructure/db/unit-of-work-interface.js";
import type { IProjectRepository } from "../../domain/interfaces/repositories/project-repository-interface.js";
import type { ICycleRepository } from "../../domain/interfaces/repositories/cycle-repository-interface.js";
import type { IPhaseRepository } from "../../domain/interfaces/repositories/phase-repository-interface.js";
import type { IChangeSetRepository } from "../../domain/interfaces/repositories/change-set-repository-interface.js";
import type { IChangeChunkRepository } from "../../domain/interfaces/repositories/change-chunk-repository-interface.js";
import type { ProjectEntity } from "../../domain/entities/project-entity.js";
import type { CycleEntity } from "../../domain/entities/cycle-entity.js";
import type { PhaseEntity } from "../../domain/entities/phase-entity.js";
import type { ChangeSetEntity } from "../../domain/entities/change-set-entity.js";
import type { ChangeChunkEntity } from "../../domain/entities/change-chunk-entity.js";

export interface TuiViewModel {
  project: ProjectEntity | null;
  cycle: CycleEntity | null;
  phase: PhaseEntity | null;
  changeSet: ChangeSetEntity | null;
  chunks: ChangeChunkEntity[];
}

export class TuiViewModelService {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly projectRepository: IProjectRepository,
    private readonly cycleRepository: ICycleRepository,
    private readonly phaseRepository: IPhaseRepository,
    private readonly changeSetRepository: IChangeSetRepository,
    private readonly changeChunkRepository: IChangeChunkRepository,
  ) {}

  public getViewModel(): TuiViewModel {
    const project = this.projectRepository.getCurrent();
    if (!project) {
      return this.empty(project);
    }

    const cycle = this.cycleRepository.getCurrent(project.id);
    if (!cycle) {
      return this.empty(project);
    }

    const phase = this.phaseRepository.getByIndex(cycle.id, cycle.currentPhaseIndex);
    if (!phase) {
      return { project, cycle, phase: null, changeSet: null, chunks: [] };
    }

    const changeSet = this.changeSetRepository.getCurrent(phase.id);
    if (!changeSet) {
      return { project, cycle, phase, changeSet: null, chunks: [] };
    }

    return {
      project,
      cycle,
      phase,
      changeSet,
      chunks: this.changeChunkRepository.list(changeSet.id),
    };
  }

  public selectChunk(changeSetId: number, chunkIndex: number, currentOffset: number): void {
    this.uow.requireTransaction();
    try {
      this.changeSetRepository.updateChunkIndex(changeSetId, chunkIndex, currentOffset);
      this.uow.commit();
    } catch (err) {
      this.uow.rollback();
      throw err;
    }
  }

  private empty(project: ProjectEntity | null): TuiViewModel {
    return {
      project,
      cycle: null,
      phase: null,
      changeSet: null,
      chunks: [],
    };
  }
}
