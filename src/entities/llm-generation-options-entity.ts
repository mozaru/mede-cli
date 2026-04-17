
export class LlmGenerationOptionsEntity
{    
    public temperature: number;
    public maxTokens: number;
    public timeoutMs: number;
    constructor()
    {
        this.temperature = 0;
        this.maxTokens = 0;
        this.timeoutMs = 0;
    }
}

