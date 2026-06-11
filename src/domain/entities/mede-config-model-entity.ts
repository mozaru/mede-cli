import { MedeDirectoriesConfigEntity } from "./mede-directories-config-entity.js";
import { MedeFileNamesConfigEntity } from "./mede-file-names-config-entity.js";
import { MedePrefixesConfigEntity } from "./mede-prefixes-config-entity.js";
import { MedeLlmConfigEntity } from "./mede-llm-config-entity.js";
import { MedePromptsConfigEntity } from "./mede-prompts-config-entity.js";
import { MedeShortDescriptionSlugConfigEntity } from "./mede-short-description-slug-config-entity.js";

export class MedeConfigModelEntity {
  public configVersion: number;
  public language: string;
  public docsRoot: string;
  public projectName?: string;
  public clientName?: string;
  public supplierName?: string;
  public directories: MedeDirectoriesConfigEntity;
  public fileNames: MedeFileNamesConfigEntity;
  public prefixes: MedePrefixesConfigEntity;
  public llm: MedeLlmConfigEntity;
  public systemPrompts: MedePromptsConfigEntity;
  public prompts: MedePromptsConfigEntity;
  public shortDescriptionSlug: MedeShortDescriptionSlugConfigEntity;
  constructor() {
    this.configVersion = 1.0;
    this.language = "pt-BR";
    this.docsRoot = "docs";
    this.directories = new MedeDirectoriesConfigEntity();
    this.fileNames = new MedeFileNamesConfigEntity();
    this.prefixes = new MedePrefixesConfigEntity();
    this.llm = new MedeLlmConfigEntity();
    this.systemPrompts = new MedePromptsConfigEntity();
    this.prompts = new MedePromptsConfigEntity();
    this.shortDescriptionSlug = new MedeShortDescriptionSlugConfigEntity();
  }
}
