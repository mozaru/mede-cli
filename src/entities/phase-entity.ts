
export class PhaseEntity
{    
    public id: number;
    public cycleId: number;
    public name: string;
    public index: number;
    public inputFiles: Array<string>;
    public outputFile: string;
    public docTypeOutput: string;
    public promptName: string;
    public status: string;
    public proposalState: string;
    public startedAt: string;
    public finishedAt: string;
    constructor()
    {
        this.id = 0;
        this.cycleId = 0;
        this.name = '';
        this.index = 0;
        this.inputFiles = [];
        this.outputFile = '';
        this.docTypeOutput = '';
        this.promptName = '';
        this.status = '';
        this.proposalState = '';
        this.startedAt = '';
        this.finishedAt = '';
    }
}

