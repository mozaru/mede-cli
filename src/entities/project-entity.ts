
export class ProjectEntity
{    
    public id: number;
    public name: string;
    public rootProjectPath: string;
    public docsRootPath: string;
    public documentationLanguage: string;
    public createdAt: string;
    public updatedAt: string;
    constructor()
    {
        this.id = 0;
        this.name = '';
        this.rootProjectPath = '';
        this.docsRootPath = '';
        this.documentationLanguage = '';
        this.createdAt = '';
        this.updatedAt = '';
    }
}

