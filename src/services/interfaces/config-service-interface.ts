
export interface IConfigService
{
    getConfig(): string;
    init(): void;
    apply(): void;
}
