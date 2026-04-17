
export class ListFilesOptionsEntity
{    
    public recursive: boolean;
    public extensions: Array<string>;
    constructor()
    {
        this.recursive = false;
        this.extensions = [];
    }
}

