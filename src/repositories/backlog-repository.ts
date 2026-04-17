import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { BacklogEntity }  from "../entities/backlog-entity.js"
import { IBacklogRepository }  from "./interfaces/backlog-repository-interface.js"

export class BacklogRepository implements IBacklogRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(backlogObj: BacklogEntity): BacklogEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into backlog (projectId,documentType,referenceDate,nature,interventionType,sequence,immutableId,description,tags,ata,source,deliver,status,createdAt,updatedAt) values (@projectId,@documentType,@referenceDate,@nature,@interventionType,@sequence,@immutableId,@description,@tags,@ata,@source,@deliver,@status,@createdAt,@updatedAt)";
        const result = this._uow.connection.prepare(sql).run({
                projectId: backlogObj.projectId,
                documentType: backlogObj.documentType,
                referenceDate: backlogObj.referenceDate,
                nature: backlogObj.nature,
                interventionType: backlogObj.interventionType,
                sequence: backlogObj.sequence,
                immutableId: backlogObj.immutableId,
                description: backlogObj.description,
                tags: (backlogObj.tags).join(", "),
                ata: backlogObj.ata,
                source: backlogObj.source,
                deliver: backlogObj.deliver,
                status: backlogObj.status,
                createdAt: backlogObj.createdAt,
                updatedAt: backlogObj.updatedAt
            });
        return { ...backlogObj, id: Number(result.lastInsertRowid) };
    }
    public list(projectId: number): BacklogEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.documentType,tp.referenceDate,tp.nature,tp.interventionType,tp.sequence,tp.immutableId,tp.description,tp.tags,tp.ata,tp.source,tp.deliver,tp.status,tp.createdAt,tp.updatedAt,Project3.id as projectId from backlog tp left join Project Project3 on (tp.projectId = Project3.id)  where tp.projectId = @projectId";
        return this._uow.connection.prepare(sql).all({
        projectId: projectId  }) as BacklogEntity[];
    }
    public getById(id : number): BacklogEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.documentType,tp.referenceDate,tp.nature,tp.interventionType,tp.sequence,tp.immutableId,tp.description,tp.tags,tp.ata,tp.source,tp.deliver,tp.status,tp.createdAt,tp.updatedAt,Project3.id as projectId from backlog tp left join Project Project3 on (tp.projectId = Project3.id)  where tp.id=@id";
        const row = this._uow.connection.prepare(sql).get({ id: id }) as BacklogEntity | undefined;
        return row ?? null;

    }
    public delete(id : number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from backlog where id=@id";
        const result = this._uow.connection.prepare(sql).run({ id: id });
        return result.changes > 0;
    }
    public deleteFromProject(projectId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from backlog where projectId = @projectId";
        const result = this._uow.connection.prepare(sql).run({
        projectId: projectId  });
        return result.changes > 0;
    }
}
