import type { ChangeSetEntity }  from "../../entities/change-set-entity.js"

export interface IChangeSetRepository
{
    insert(changeSetObj: ChangeSetEntity): ChangeSetEntity;
    delete(id: number): boolean;
    list(phaseId: number): ChangeSetEntity[];
    getById(id: number): ChangeSetEntity | null;
    getCurrent(phaseId: number): ChangeSetEntity | null;
    updateComplete(id: number): boolean;
    updateChunkIndex(id: number, currentChangeChunkIndex: number, currentOffset: number): boolean;
    deleteFromPhase(phaseId: number): boolean;
}

