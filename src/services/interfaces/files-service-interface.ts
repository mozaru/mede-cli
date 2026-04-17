
export interface IFilesService
{
    files(backup: boolean): string
    diff(file: string): string
    cat(file: string, backup: boolean): string
}
