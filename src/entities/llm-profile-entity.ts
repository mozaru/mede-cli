
export class LlmProfileEntity
{    
    public id: number;
    public projectId: number;
    public profileName: string;
    public provider: string;
    public model: string;
    public endpoint: string;
    public apiKeyEnv: string;
    public temperature: number;
    public maxTokens: number;
    public timeoutMs: number;
    public retryJson: string;
    public active: boolean;
    constructor()
    {
        this.id = 0;
        this.projectId = 0;
        this.profileName = '';
        this.provider = '';
        this.model = '';
        this.endpoint = '';
        this.apiKeyEnv = '';
        this.temperature = 0;
        this.maxTokens = 0;
        this.timeoutMs = 0;
        this.retryJson = '';
        this.active = true;
    }
}

