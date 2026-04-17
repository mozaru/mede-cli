
export class ChangeChunkEntity
{    
    public id: number;
    public phaseId: number;
    public changeSetId: number;
    public index: number;
    public status: string;
    public blockLocation: string;
    public changeContent: string;
    public startedAt: string;
    public updatedAt: string;
    constructor()
    {
        this.id = 0;
        this.phaseId = 0;
        this.changeSetId = 0;
        this.index = 0;
        this.status = '';
        this.blockLocation = '';
        this.changeContent = '';
        this.startedAt = '';
        this.updatedAt = '';
    }
}

