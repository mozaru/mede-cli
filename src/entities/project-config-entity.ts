
export class ProjectConfigEntity
{    
    public id: number;
    public projectId: number;
    public medeConfigPath: string;
    public hashContent: string;
    public content: string;
    public createdAt: string;
    public updatedAt: string;
    constructor()
    {
        this.id = 0;
        this.projectId = 0;
        this.medeConfigPath = '';
        this.hashContent = '';
        this.content = '';
        this.createdAt = '';
        this.updatedAt = '';
    }
}

