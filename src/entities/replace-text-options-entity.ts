
export class ReplaceTextOptionsEntity
{    
    public searchValue: string;
    public replaceValue: string;
    public all: boolean;
    constructor()
    {
        this.searchValue = '';
        this.replaceValue = '';
        this.all = false;
    }
}

