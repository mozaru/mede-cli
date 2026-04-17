
export class PhaseAttachmentEntity
{    
    public id: number;
    public phaseId: number;
    public createdAt: string;
    public actor: string;
    public filePath: string;
    public fileName: string;
    public content: string;
    public contentText: string;
    constructor()
    {
        this.id = 0;
        this.phaseId = 0;
        this.createdAt = '';
        this.actor = '';
        this.filePath = '';
        this.fileName = '';
        this.content = '';
        this.contentText = '';
    }
}

