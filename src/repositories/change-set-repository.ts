import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { ChangeSetEntity }  from "../entities/change-set-entity.js"
import { IChangeSetRepository }  from "./interfaces/change-set-repository-interface.js"

export class ChangeSetRepository implements IChangeSetRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(changeSetObj: ChangeSetEntity): ChangeSetEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into changeSet (phaseId,cycleArtifactId,fileName,completed,currentChangeChunkIndex,changeChunkCount,currentOffset,startedAt,updatedAt) values (@phaseId,@cycleArtifactId,@fileName,@completed,@currentChangeChunkIndex,@changeChunkCount,@currentOffset,@startedAt,@updatedAt)";
        const result = this._uow.connection.prepare(sql).run({
                phaseId: changeSetObj.phaseId,
                cycleArtifactId: changeSetObj.cycleArtifactId,
                fileName: changeSetObj.fileName,
                completed: changeSetObj.completed ? 1 : 0,
                currentChangeChunkIndex: changeSetObj.currentChangeChunkIndex,
                changeChunkCount: changeSetObj.changeChunkCount,
                currentOffset: changeSetObj.currentOffset,
                startedAt: changeSetObj.startedAt,
                updatedAt: changeSetObj.updatedAt
            });
        return { ...changeSetObj, id: Number(result.lastInsertRowid) };
    }
    public delete(id : number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from changeSet where id=@id";
        const result = this._uow.connection.prepare(sql).run({ id: id });
        return result.changes > 0;
    }
    public list(phaseId: number): ChangeSetEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.fileName,tp.completed,tp.currentChangeChunkIndex,tp.changeChunkCount,tp.currentOffset,tp.startedAt,tp.updatedAt,Phase10.id as phaseId,CycleArtifact11.id as cycleArtifactId from changeSet tp left join Phase Phase10 on (tp.phaseId = Phase10.id)  left join CycleArtifact CycleArtifact11 on (tp.cycleArtifactId = CycleArtifact11.id)  where tp.phaseId = @phaseId";
        return this._uow.connection.prepare(sql).all({
        phaseId: phaseId  }) as ChangeSetEntity[];
    }
    public getById(id: number): ChangeSetEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.fileName,tp.completed,tp.currentChangeChunkIndex,tp.changeChunkCount,tp.currentOffset,tp.startedAt,tp.updatedAt,Phase10.id as phaseId,CycleArtifact11.id as cycleArtifactId from changeSet tp left join Phase Phase10 on (tp.phaseId = Phase10.id)  left join CycleArtifact CycleArtifact11 on (tp.cycleArtifactId = CycleArtifact11.id)  where tp.id = @id";
        const row = this._uow.connection.prepare(sql).get({
        id: id  }) as ChangeSetEntity | undefined;
        return row ?? null;
    }
    public getCurrent(phaseId: number): ChangeSetEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.fileName,tp.completed,tp.currentChangeChunkIndex,tp.changeChunkCount,tp.currentOffset,tp.startedAt,tp.updatedAt,Phase10.id as phaseId,CycleArtifact11.id as cycleArtifactId from changeSet tp left join Phase Phase10 on (tp.phaseId = Phase10.id)  left join CycleArtifact CycleArtifact11 on (tp.cycleArtifactId = CycleArtifact11.id)  where tp.phaseId = @phaseId and tp.completed = @completed";
        const row = this._uow.connection.prepare(sql).get({
        phaseId: phaseId,
        completed: 0  }) as ChangeSetEntity | undefined;
        return row ?? null;
    }
    public updateComplete(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update changeSet set completed = @completed, updatedAt = @updatedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                completed: 1,
                updatedAt: new Date().toISOString()
            });
        return true;
    }
    public updateChunkIndex(id: number, currentChangeChunkIndex: number, currentOffset: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update changeSet set currentChangeChunkIndex = @currentChangeChunkIndex, currentOffset = @currentOffset, updatedAt = @updatedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                currentChangeChunkIndex: currentChangeChunkIndex,
                currentOffset: currentOffset,
                updatedAt: new Date().toISOString()
            });
        return true;
    }
    public deleteFromPhase(phaseId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from changeSet where phaseId = @phaseId";
        const result = this._uow.connection.prepare(sql).run({
        phaseId: phaseId  });
        return result.changes > 0;
    }
}
