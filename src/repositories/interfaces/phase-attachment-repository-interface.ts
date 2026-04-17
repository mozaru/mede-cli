import type { PhaseAttachmentEntity }  from "../../entities/phase-attachment-entity.js"

export interface IPhaseAttachmentRepository
{
    insert(phaseAttachmentObj: PhaseAttachmentEntity): PhaseAttachmentEntity;
    list(phaseId: number): PhaseAttachmentEntity[];
    getById(id: number): PhaseAttachmentEntity | null;
    deleteFromPhase(phaseId: number): boolean;
}

