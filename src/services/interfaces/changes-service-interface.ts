
export interface IChangesService
{
    pending(all: boolean): string;
    apply(all: boolean): string;
    discard(all: boolean): string;
}
