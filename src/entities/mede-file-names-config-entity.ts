
export class MedeFileNamesConfigEntity
{    
    public initialUnderstanding: string;
    public readme: string;
    public currentState: string;
    public scopeAndVision: string;
    public functionalRequirements: string;
    public nonFunctionalRequirements: string;
    public dataModel: string;
    public timeline: string;
    constructor()
    {
        this.initialUnderstanding = 'entendimento-inicial.md';
        this.readme = 'readme.md';
        this.currentState = 'situacao-atual.md';
        this.scopeAndVision = 'visao-escopo.md';
        this.functionalRequirements = 'requisitos-funcionais.md';
        this.nonFunctionalRequirements = 'requisitos-nao-funcionais.md';
        this.dataModel = 'modelo-dados.md';
        this.timeline = 'cronograma.md';
    }
}

