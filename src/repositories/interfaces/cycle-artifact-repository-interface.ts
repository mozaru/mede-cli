import type { CycleArtifactEntity }  from "../../entities/cycle-artifact-entity.js"

export interface ICycleArtifactRepository
{
    insert(cycleArtifactObj: CycleArtifactEntity): CycleArtifactEntity;
    list(cycleId: number): CycleArtifactEntity[];
    getById(id: number): CycleArtifactEntity | null;
    getFromPath(cycleId: number, artifactPath: string): CycleArtifactEntity | null;
    deleteFromCycle(cycleId: number): boolean;
    updateContent(id: number, currentContent: string): boolean;
    existAnyByCycle(cycleId: number): boolean;
}

