
export interface ILlmService
{
    providers(): string;
    test(prompt: string): Promise<string>;
}
