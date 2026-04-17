
export class CycleEntity
{    
    public id: number;
    public projectId: number;
    public status: string;
    public currentPhaseIndex: number;
    public phaseCount: number;
    public autoMode: string;
    public startedAt: string;
    public finishedAt: string;
    constructor()
    {
        this.id = 0;
        this.projectId = 0;
        this.status = '';
        this.currentPhaseIndex = 0;
        this.phaseCount = 0;
        this.autoMode = '';
        this.startedAt = '';
        this.finishedAt = '';
    }
}

