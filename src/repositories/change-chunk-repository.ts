import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { ChangeChunkEntity }  from "../entities/change-chunk-entity.js"
import { IChangeChunkRepository }  from "./interfaces/change-chunk-repository-interface.js"

export class ChangeChunkRepository implements IChangeChunkRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(changeChunkObj: ChangeChunkEntity): ChangeChunkEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into changeChunk (phaseId,changeSetId,`index`,status,blockLocation,changeContent,startedAt,updatedAt) values (@phaseId,@changeSetId,@index,@status,@blockLocation,@changeContent,@startedAt,@updatedAt)";
        const result = this._uow.connection.prepare(sql).run({
                phaseId: changeChunkObj.phaseId,
                changeSetId: changeChunkObj.changeSetId,
                index: changeChunkObj.index,
                status: changeChunkObj.status,
                blockLocation: changeChunkObj.blockLocation,
                changeContent: changeChunkObj.changeContent,
                startedAt: changeChunkObj.startedAt,
                updatedAt: changeChunkObj.updatedAt
            });
        return { ...changeChunkObj, id: Number(result.lastInsertRowid) };
    }
    public deleteFromPhase(phaseId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from changeChunk where phaseId = @phaseId";
        const result = this._uow.connection.prepare(sql).run({
        phaseId: phaseId  });
        return result.changes > 0;
    }
    public deleteFromChangeSet(changeSetId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from changeChunk where changeSetId = @changeSetId";
        const result = this._uow.connection.prepare(sql).run({
        changeSetId: changeSetId  });
        return result.changes > 0;
    }
    public list(changeSetId: number): ChangeChunkEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.`index`,tp.status,tp.blockLocation,tp.changeContent,tp.startedAt,tp.updatedAt,Phase12.id as phaseId,ChangeSet13.id as changeSetId from changeChunk tp left join Phase Phase12 on (tp.phaseId = Phase12.id)  left join ChangeSet ChangeSet13 on (tp.changeSetId = ChangeSet13.id)  where tp.changeSetId = @changeSetId";
        return this._uow.connection.prepare(sql).all({
        changeSetId: changeSetId  }) as ChangeChunkEntity[];
    }
    public listFromPhase(phaseId: number): ChangeChunkEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.`index`,tp.status,tp.blockLocation,tp.changeContent,tp.startedAt,tp.updatedAt,Phase12.id as phaseId,ChangeSet13.id as changeSetId from changeChunk tp left join Phase Phase12 on (tp.phaseId = Phase12.id)  left join ChangeSet ChangeSet13 on (tp.changeSetId = ChangeSet13.id)  where tp.phaseId = @phaseId";
        return this._uow.connection.prepare(sql).all({
        phaseId: phaseId  }) as ChangeChunkEntity[];
    }
    public getById(id : number): ChangeChunkEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.`index`,tp.status,tp.blockLocation,tp.changeContent,tp.startedAt,tp.updatedAt,Phase12.id as phaseId,ChangeSet13.id as changeSetId from changeChunk tp left join Phase Phase12 on (tp.phaseId = Phase12.id)  left join ChangeSet ChangeSet13 on (tp.changeSetId = ChangeSet13.id)  where tp.id=@id";
        const row = this._uow.connection.prepare(sql).get({ id: id }) as ChangeChunkEntity | undefined;
        return row ?? null;

    }
    public getByIndex(changeSetId: number, index: number): ChangeChunkEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.`index`,tp.status,tp.blockLocation,tp.changeContent,tp.startedAt,tp.updatedAt,Phase12.id as phaseId,ChangeSet13.id as changeSetId from changeChunk tp left join Phase Phase12 on (tp.phaseId = Phase12.id)  left join ChangeSet ChangeSet13 on (tp.changeSetId = ChangeSet13.id)  where tp.changeSetId = @changeSetId and tp.`index` = @index";
        const row = this._uow.connection.prepare(sql).get({
        changeSetId: changeSetId,
        index: index  }) as ChangeChunkEntity | undefined;
        return row ?? null;
    }
    public getCurrent(changeSetId: number): ChangeChunkEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.`index`,tp.status,tp.blockLocation,tp.changeContent,tp.startedAt,tp.updatedAt,Phase12.id as phaseId,ChangeSet13.id as changeSetId from changeChunk tp left join Phase Phase12 on (tp.phaseId = Phase12.id)  left join ChangeSet ChangeSet13 on (tp.changeSetId = ChangeSet13.id)  where tp.changeSetId = @changeSetId and tp.status = @status";
        const row = this._uow.connection.prepare(sql).get({
        changeSetId: changeSetId,
        status: "awaitingApproval"  }) as ChangeChunkEntity | undefined;
        return row ?? null;
    }
    public approve(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update changeChunk set status = @status, updatedAt = @updatedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                status: "APPROVED",
                updatedAt: new Date().toISOString()
            });
        return true;
    }
    public reject(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update changeChunk set status = @status, updatedAt = @updatedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                status: "REJECTED",
                updatedAt: new Date().toISOString()
            });
        return true;
    }
}
