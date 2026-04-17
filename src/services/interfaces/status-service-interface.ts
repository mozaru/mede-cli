import type { ProjectEntity } from "../../entities/project-entity.js";
import type { CycleEntity } from "../../entities/cycle-entity.js";
import type { PhaseEntity } from "../../entities/phase-entity.js";
import type { ChangeSetEntity } from "../../entities/change-set-entity.js";

export interface IStatusService
{
    /*public phaseStateText(phase: PhaseEntity): string
    public proposalStateText(phase: PhaseEntity): string
    public autoModeText(cycle: CycleEntity): string
    public countRefinements(phase: PhaseEntity): number
    public countChangedFiles(cycle: CycleEntity): number
    public countCreatedFiles(cycle: CycleEntity): number
    public availableActions(cycle: CycleEntity, phase: PhaseEntity): string
*/
    generate( project: ProjectEntity, cycle: CycleEntity, phase: PhaseEntity, changeSet: ChangeSetEntity | null): string
    successCommit(project: ProjectEntity, cycle: CycleEntity): string
    successRollback(project: ProjectEntity, cycle: CycleEntity): string
    showStatus():string
}