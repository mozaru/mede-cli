import type { LlmProfileEntity }  from "../../entities/llm-profile-entity.js"

export interface ILlmProfileRepository
{
    insert(llmProfileObj: LlmProfileEntity): LlmProfileEntity;
    list(projectId: number): LlmProfileEntity[];
    getById(id: number): LlmProfileEntity | null;
    delete(id: number): boolean;
    deleteFromProject(projectId: number): boolean;
}

