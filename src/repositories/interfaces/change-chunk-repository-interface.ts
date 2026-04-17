import type { ChangeChunkEntity }  from "../../entities/change-chunk-entity.js"

export interface IChangeChunkRepository
{
    insert(changeChunkObj: ChangeChunkEntity): ChangeChunkEntity;
    deleteFromPhase(phaseId: number): boolean;
    deleteFromChangeSet(changeSetId: number): boolean;
    list(changeSetId: number): ChangeChunkEntity[];
    listFromPhase(phaseId: number): ChangeChunkEntity[];
    getById(id: number): ChangeChunkEntity | null;
    getByIndex(changeSetId: number, index: number): ChangeChunkEntity | null;
    getCurrent(changeSetId: number): ChangeChunkEntity | null;
    approve(id: number): boolean;
    reject(id: number): boolean;
}

