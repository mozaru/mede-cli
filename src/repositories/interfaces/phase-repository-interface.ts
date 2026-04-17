import type { PhaseEntity }  from "../../entities/phase-entity.js"

export interface IPhaseRepository
{
    insert(phaseObj: PhaseEntity): PhaseEntity;
    list(cycleId: number): PhaseEntity[];
    getById(id: number): PhaseEntity | null;
    getByIndex(cycleId: number, index: number): PhaseEntity | null;
    deleteFromCycle(cycleId: number): boolean;
    empty(id: number): boolean;
    nonEmpty(id: number): boolean;
    approve(id: number): boolean;
    reject(id: number): boolean;
    skip(id: number): boolean;
    awaitingApproval(id: number): boolean;
    reset(id: number): boolean;
}

