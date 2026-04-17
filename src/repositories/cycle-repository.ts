import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { CycleEntity }  from "../entities/cycle-entity.js"
import { ICycleRepository }  from "./interfaces/cycle-repository-interface.js"

export class CycleRepository implements ICycleRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(cycleObj: CycleEntity): CycleEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into cycle (projectId,status,currentPhaseIndex,phaseCount,autoMode,startedAt,finishedAt) values (@projectId,@status,@currentPhaseIndex,@phaseCount,@autoMode,@startedAt,@finishedAt)";
        const result = this._uow.connection.prepare(sql).run({
                projectId: cycleObj.projectId,
                status: cycleObj.status,
                currentPhaseIndex: cycleObj.currentPhaseIndex,
                phaseCount: cycleObj.phaseCount,
                autoMode: cycleObj.autoMode,
                startedAt: cycleObj.startedAt,
                finishedAt: cycleObj.finishedAt
            });
        return { ...cycleObj, id: Number(result.lastInsertRowid) };
    }
    public list(projectId: number): CycleEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.status,tp.currentPhaseIndex,tp.phaseCount,tp.autoMode,tp.startedAt,tp.finishedAt,Project5.id as projectId from cycle tp left join Project Project5 on (tp.projectId = Project5.id)  where tp.projectId = @projectId";
        return this._uow.connection.prepare(sql).all({
        projectId: projectId  }) as CycleEntity[];
    }
    public getById(id : number): CycleEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.status,tp.currentPhaseIndex,tp.phaseCount,tp.autoMode,tp.startedAt,tp.finishedAt,Project5.id as projectId from cycle tp left join Project Project5 on (tp.projectId = Project5.id)  where tp.id=@id";
        const row = this._uow.connection.prepare(sql).get({ id: id }) as CycleEntity | undefined;
        return row ?? null;

    }
    public delete(id : number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from cycle where id=@id";
        const result = this._uow.connection.prepare(sql).run({ id: id });
        return result.changes > 0;
    }
    public deleteFromProject(projectId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from cycle where projectId = @projectId";
        const result = this._uow.connection.prepare(sql).run({
        projectId: projectId  });
        return result.changes > 0;
    }
    public getCurrent(projectId: number): CycleEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.status,tp.currentPhaseIndex,tp.phaseCount,tp.autoMode,tp.startedAt,tp.finishedAt,Project5.id as projectId from cycle tp left join Project Project5 on (tp.projectId = Project5.id)  where tp.projectId = @projectId and tp.status IN ('OPEN', 'AWAITING_COMMIT')";
        const row = this._uow.connection.prepare(sql).get({
        projectId: projectId}) as CycleEntity | undefined;
        return row ?? null;
    }
    public updatePhaseIndex(id: number, currentPhaseIndex: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update cycle set currentPhaseIndex = @currentPhaseIndex where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                currentPhaseIndex: currentPhaseIndex
            });
        return true;
    }
    public awaiting(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update cycle set status = @status  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                status: "AWAITING_COMMIT"
            });
        return true;
    }
    public commit(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update cycle set status = @status, finishedAt = @finishedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                status: "COMMITTED",
                finishedAt: new Date().toISOString()
            });
        return true;
    }
    public rollback(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update cycle set status = @status, finishedAt = @finishedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                status: "ROLLEDBACK",
                finishedAt: new Date().toISOString()
            });
        return true;
    }
    public approveAll(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update cycle set autoMode = @autoMode  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                autoMode: "APPROVE_ALL"
            });
        return true;
    }
    public rejectAll(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update cycle set autoMode = @autoMode  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                autoMode: "REJECT_ALL"
            });
        return true;
    }
}
