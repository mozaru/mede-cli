
export class ChangeSetEntity
{    
    public id: number;
    public phaseId: number;
    public cycleArtifactId: number;
    public fileName: string;
    public completed: boolean;
    public currentChangeChunkIndex: number;
    public currentOffset: number; 
    public changeChunkCount: number;
    public startedAt: string;
    public updatedAt: string;
    constructor()
    {
        this.id = 0;
        this.phaseId = 0;
        this.cycleArtifactId = 0;
        this.fileName = '';
        this.completed = false;
        this.currentChangeChunkIndex = 0;
        this.changeChunkCount = 0;
        this.currentOffset = 0;
        this.startedAt = '';
        this.updatedAt = '';
    }
}

