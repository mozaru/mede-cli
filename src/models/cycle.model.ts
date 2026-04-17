import { CycleEntity } from "../entities/cycle-entity.js";
import { PhaseEntity } from "../entities/phase-entity.js";


export class CycleUpdatePhaseIndexModel
{
    currentPhaseIndex:number;
    
    constructor()
    {
        this.currentPhaseIndex = 0;
        
    }
}

export class CycleCreateBackupDocsResponseModel 
{
    content: string;
    constructor() 
    {
        this.content = '';
    }
};

export class CycleResponseModel
{
    cycle: CycleEntity;
    phase: PhaseEntity;
    constructor() 
    {
        this.cycle = new CycleEntity();
        this.phase = new PhaseEntity() ;
    }
};

export class CycleBeginInitializationResponseModel extends CycleResponseModel {};

export class CycleBeginResponseModel extends CycleResponseModel {};

export class CycleNextResponseModel  extends CycleResponseModel {};

export class CycleCycleResponseModel extends CycleCreateBackupDocsResponseModel {};

export class CycleApproveResponseModel extends CycleCreateBackupDocsResponseModel {};

export class CycleRejectResponseModel extends CycleCreateBackupDocsResponseModel {};

export class CycleResetResponseModel extends CycleCreateBackupDocsResponseModel {};
