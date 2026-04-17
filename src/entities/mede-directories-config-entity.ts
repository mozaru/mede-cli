
export class MedeDirectoriesConfigEntity
{    
    public meetingMinutes: string;
    public architecturalDecisions: string;
    public systemMaintenanceSpecifications: string;
    public deliveryLog: string;
    constructor()
    {
        this.meetingMinutes = 'atas-reuniao';
        this.architecturalDecisions = 'decisoes-arquiteturais';
        this.systemMaintenanceSpecifications = 'especificacoes-manutencao-sistema';
        this.deliveryLog = 'log-entregas';
    }
}

