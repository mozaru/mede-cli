import type { ProjectConfigEntity }  from "../../entities/project-config-entity.js"

export interface IProjectConfigRepository
{
    insert(projectConfigObj: ProjectConfigEntity): ProjectConfigEntity;
    updateContent(id: number, content: string, hashContent: string): boolean;
    list(projectId: number): ProjectConfigEntity[];
    getById(id: number): ProjectConfigEntity | null;
    getCurrent(projectId: number): ProjectConfigEntity | null;
    delete(id: number): boolean;
    deleteFromProject(projectId: number): boolean;
}

