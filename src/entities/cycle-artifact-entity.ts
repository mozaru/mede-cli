
export class CycleArtifactEntity
{    
    public id: number;
    public cycleId: number;
    public backupContent: string;
    public currentContent: string;
    public canonicalName: string;
    public canonicalType: string;
    public artifactPath: string;
    public startedAt: string;
    public updatedAt: string;
    constructor()
    {
        this.id = 0;
        this.cycleId = 0;
        this.backupContent = '';
        this.currentContent = '';
        this.canonicalName = '';
        this.canonicalType = '';
        this.artifactPath = '';
        this.startedAt = '';
        this.updatedAt = '';
    }
}

