
export class BacklogInterventionCountersEntity
{    
    public id: number;
    public projectId: number;
    public name: string;
    public lastNumber: number;
    public createdAt: string;
    public updatedAt: string;
    constructor()
    {
        this.id = 0;
        this.projectId =0;
        this.name = '';
        this.lastNumber = 0;
        this.createdAt = '';
        this.updatedAt = '';
    }
}

