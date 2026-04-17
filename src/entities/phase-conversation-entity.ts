
export class PhaseConversationEntity
{    
    public id: number;
    public phaseId: number;
    public createdAt: string;
    public actor: string;
    public content: string;
    constructor()
    {
        this.id = 0;
        this.phaseId = 0;
        this.createdAt = '';
        this.actor = '';
        this.content = '';
    }
}

