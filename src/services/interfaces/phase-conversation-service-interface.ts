import { ChangeSetEntity } from "../../entities/change-set-entity.js";
import { MedeConfigModelEntity } from "../../entities/mede-config-model-entity.js";
import { PhaseEntity } from "../../entities/phase-entity.js";
import { ProjectEntity } from "../../entities/project-entity.js";

export interface IPhaseConversationService {
    getSystemPrompt(config: MedeConfigModelEntity, promptName: string ): string;
    getPrompt(config: MedeConfigModelEntity, promptName: string): string;
    sendMessage(project: ProjectEntity, config: MedeConfigModelEntity, phase:PhaseEntity, prompt: string, files:Array<string>): Promise<ChangeSetEntity | null>;
    sendMessageWithoutPrompt( project: ProjectEntity, config: MedeConfigModelEntity, phase: PhaseEntity): Promise<ChangeSetEntity | null>;
    applyAll(phase: PhaseEntity,changeSet: ChangeSetEntity): ChangeSetEntity;
    apply(phase: PhaseEntity,changeSet: ChangeSetEntity): ChangeSetEntity | null;
    discardAll(phase: PhaseEntity, changeSet: ChangeSetEntity): ChangeSetEntity;
    discard( phase: PhaseEntity, changeSet: ChangeSetEntity ): ChangeSetEntity | null;    
}
