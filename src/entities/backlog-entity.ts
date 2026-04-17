
export class BacklogEntity
{    
    public id: number;
    public projectId: number;
    public documentType: string;
    public referenceDate: string;
    public nature: string;
    public interventionType: string;
    public sequence: number;
    public immutableId: string;
    public description: string;
    public tags: Array<string>;
    public ata: string;
    public source: string;
    public deliver: string;
    public status: string;
    public createdAt: string;
    public updatedAt: string;
    constructor()
    {
        this.id = 0;
        this.projectId = 0;
        this.documentType = '';
        this.referenceDate = '';
        this.nature = '';
        this.interventionType = '';
        this.sequence = 0;
        this.immutableId = '';
        this.description = '';
        this.tags = [];
        this.ata = '';
        this.source = '';
        this.deliver = '';
        this.status = '';
        this.createdAt = '';
        this.updatedAt = '';
    }
}

