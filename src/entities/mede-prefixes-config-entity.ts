
export class MedePrefixesConfigEntity
{    
    public meetingMinutes: string;
    public architecturalDecisions: string;
    public systemMaintenanceSpecifications: string;
    public deliveryLog: string;
    constructor()
    {
        this.meetingMinutes = 'ata';
        this.architecturalDecisions = 'adr';
        this.systemMaintenanceSpecifications = 'esm';
        this.deliveryLog = 'leg';
    }
}

