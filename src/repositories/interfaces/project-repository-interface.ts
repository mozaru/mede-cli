import type { ProjectEntity }  from "../../entities/project-entity.js"

export interface IProjectRepository
{
    insert(projectObj: ProjectEntity): ProjectEntity;
    update(projectObj: ProjectEntity): ProjectEntity;
    list(): ProjectEntity[];
    getById(id: number): ProjectEntity | null;
    getCurrent(): ProjectEntity | null;
    delete(id: number): boolean;
}

