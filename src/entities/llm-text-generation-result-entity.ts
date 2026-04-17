
export class LlmTextGenerationResultEntity
{    
    public rawText: string;
    public inputTokens: number;
    public outputTokens: number;
    public finishReason: string;
    public model: string;
    constructor()
    {
        this.rawText = '';
        this.inputTokens = 0;
        this.outputTokens = 0;
        this.finishReason = '';
        this.model = '';
    }
}

