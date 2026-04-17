import { MedeDirectoriesConfigEntity } from './mede-directories-config-entity.js';
import { MedeFileNamesConfigEntity } from './mede-file-names-config-entity.js';
import { MedePrefixesConfigEntity } from './mede-prefixes-config-entity.js';
import { MedeLlmConfigEntity } from './mede-llm-config-entity.js';
import { MedePromptsConfigEntity } from './mede-prompts-config-entity.js';

export class MedeConfigModelEntity
{    
    public configVersion: number;
    public language: string;
    public docsRoot: string; 
    public directories: MedeDirectoriesConfigEntity;
    public fileNames: MedeFileNamesConfigEntity;
    public prefixes: MedePrefixesConfigEntity;
    public llm: MedeLlmConfigEntity;
    public systemPrompts: MedePromptsConfigEntity;
    public prompts: MedePromptsConfigEntity;
    constructor()
    {
        this.configVersion = 1.0;
        this.language = 'pt-br';
        this.docsRoot = 'docs';
        this.directories = new MedeDirectoriesConfigEntity();
        this.fileNames = new MedeFileNamesConfigEntity();
        this.prefixes = new MedePrefixesConfigEntity();
        this.llm = new MedeLlmConfigEntity();
        this.systemPrompts = new MedePromptsConfigEntity();
        this.prompts = new MedePromptsConfigEntity();
    }
}

