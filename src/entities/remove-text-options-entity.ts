
export class RemoveTextOptionsEntity
{    
    public startMarker: string;
    public endMarker: string;
    public includeMarkers: boolean;
    constructor()
    {
        this.startMarker = '';
        this.endMarker = '';
        this.includeMarkers = false;
    }
}

