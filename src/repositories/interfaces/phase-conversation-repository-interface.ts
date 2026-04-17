import type { PhaseConversationEntity }  from "../../entities/phase-conversation-entity.js"

export interface IPhaseConversationRepository
{
    insert(phaseConversationObj: PhaseConversationEntity): PhaseConversationEntity;
    list(phaseId: number): PhaseConversationEntity[];
    getById(id: number): PhaseConversationEntity | null;
    deleteFromPhase(phaseId: number): boolean;
}

