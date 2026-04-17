import type { BacklogEntity }  from "../../entities/backlog-entity.js"

export interface IBacklogRepository
{
    insert(backlogObj: BacklogEntity): BacklogEntity;
    list(projectId: number): BacklogEntity[];
    getById(id: number): BacklogEntity | null;
    delete(id: number): boolean;
    deleteFromProject(projectId: number): boolean;
}

