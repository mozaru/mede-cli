export class CycleCreateBackupDocsResponseModel 
{
    content: string;
    constructor() 
    {
        this.content = '';
    }
};

export class CycleBeginInitializationResponseModel extends CycleCreateBackupDocsResponseModel {};

export class CycleBeginInitializationResponseModel 
{
    cycle: cycleEntity | null;
    phase: ;
    constructor() 
    {
        this.cycle = new cycleEntity() | null;
        this.phase = DEFAULT ;
    }
};

export class CycleBeginResponseModel extends CycleCreateBackupDocsResponseModel {};

export class CycleBeginResponseModel 
{
    cycle: cycleEntity | null;
    phase: ;
    constructor() 
    {
        this.cycle = new cycleEntity() | null;
        this.phase = DEFAULT ;
    }
};

export class CycleNextResponseModel 
{
    cycle: ;
    phase: phaseEntity | null;
    constructor() 
    {
        this.cycle = DEFAULT ;
        this.phase = new phaseEntity() | null;
    }
};

export class CycleCycleResponseModel extends CycleCreateBackupDocsResponseModel {};

export class CycleApproveResponseModel extends CycleCreateBackupDocsResponseModel {};

export class CycleRejectResponseModel extends CycleCreateBackupDocsResponseModel {};

export class CycleResetResponseModel extends CycleCreateBackupDocsResponseModel {};

