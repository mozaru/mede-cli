import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { BacklogInterventionCountersEntity }  from "../entities/backlog-intervention-counters-entity.js"
import { IBacklogInterventionCountersRepository }  from "./interfaces/backlog-intervention-counters-repository-interface.js"

export class BacklogInterventionCountersRepository implements IBacklogInterventionCountersRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(backlogInterventionCountersObj: BacklogInterventionCountersEntity): BacklogInterventionCountersEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into backlogInterventionCounters (projectId,name,lastNumber,createdAt,updatedAt) values (@projectId,@name,@lastNumber,@createdAt,@updatedAt)";
        const result = this._uow.connection.prepare(sql).run({
                projectId: backlogInterventionCountersObj.projectId,
                name: backlogInterventionCountersObj.name,
                lastNumber: backlogInterventionCountersObj.lastNumber,
                createdAt: backlogInterventionCountersObj.createdAt,
                updatedAt: backlogInterventionCountersObj.updatedAt
            });
        return { ...backlogInterventionCountersObj, id: Number(result.lastInsertRowid) };
    }
    public list(projectId: number): BacklogInterventionCountersEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.name,tp.lastNumber,tp.createdAt,tp.updatedAt,Project4.id as projectId from backlogInterventionCounters tp left join Project Project4 on (tp.projectId = Project4.id)  where tp.projectId = @projectId";
        return this._uow.connection.prepare(sql).all({
        projectId: projectId  }) as BacklogInterventionCountersEntity[];
    }
    public getById(id : number): BacklogInterventionCountersEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.name,tp.lastNumber,tp.createdAt,tp.updatedAt,Project4.id as projectId from backlogInterventionCounters tp left join Project Project4 on (tp.projectId = Project4.id)  where tp.id=@id";
        const row = this._uow.connection.prepare(sql).get({ id: id }) as BacklogInterventionCountersEntity | undefined;
        return row ?? null;

    }
    public delete(id : number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from backlogInterventionCounters where id=@id";
        const result = this._uow.connection.prepare(sql).run({ id: id });
        return result.changes > 0;
    }
    public deleteFromProject(projectId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from backlogInterventionCounters where projectId = @projectId";
        const result = this._uow.connection.prepare(sql).run({
        projectId: projectId  });
        return result.changes > 0;
    }
    public updateCounter(projectId: number, name: string, lastNumber: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update backlogInterventionCounters set lastNumber = @lastNumber,updatedAt = @updatedAt  where projectId = @projectId and name = @name";
        const result = this._uow.connection.prepare(sql).run({
                projectId: projectId,
                name: name,
                lastNumber: lastNumber,
                updatedAt: new Date().toISOString()
            });
        return true;
    }
}
