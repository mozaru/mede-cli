
export class MedeLlmConfigEntity
{    
    public provider: string;
    public model: string;
    public endpoint: string;
    public apiKeyEnv: string;
    public temperature: number;
    public maxTokens: number;
    public timeoutMs: number;
    constructor()
    {
        this.provider = 'openai-compatible';
        this.model = 'gpt-4.1-mini';
        this.endpoint = 'https://api.openai.com/v1';
        this.apiKeyEnv = 'OPENAI_API_KEY';
        this.temperature = 0.1;
        this.maxTokens = 4000;
        this.timeoutMs = 60000;
    }
}
