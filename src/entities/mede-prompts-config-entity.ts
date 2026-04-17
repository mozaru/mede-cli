
export class MedePromptsConfigEntity
{    
    public meeting: string;
    public architecturalDecisions: string;
    public systemMaintenanceSpecifications: string;
    public deliveryLog:string;
    public functionalRequirements:string;
    public nonFunctionalRequirements:string; 
    public dataModel:string;
    public timeline:string;
    public scopeAndVision:string;
    public readme:string;
    public currentState:string;
    public initialUnderstanding:string;
    constructor()
    {
        this.meeting = "";
        this.architecturalDecisions = "";
        this.systemMaintenanceSpecifications="";
        this.deliveryLog="";
        this.functionalRequirements="";
        this.nonFunctionalRequirements="";
        this.dataModel="";
        this.timeline="";
        this.scopeAndVision="";
        this.readme="";
        this.currentState="";
        this.initialUnderstanding="";
    }
}

