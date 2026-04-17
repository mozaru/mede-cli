import type { BacklogInterventionCountersEntity }  from "../../entities/backlog-intervention-counters-entity.js"

export interface IBacklogInterventionCountersRepository
{
    insert(backlogInterventionCountersObj: BacklogInterventionCountersEntity): BacklogInterventionCountersEntity;
    list(projectId: number): BacklogInterventionCountersEntity[];
    getById(id: number): BacklogInterventionCountersEntity | null;
    delete(id: number): boolean;
    deleteFromProject(projectId: number): boolean;
    updateCounter(projectId: number, name: string, lastNumber: number): boolean;
}

