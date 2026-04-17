
export interface IInitService
{
    init(prompt: string, files: string[]): Promise<string>;
}
