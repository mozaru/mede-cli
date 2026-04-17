import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { PhaseEntity }  from "../entities/phase-entity.js"
import { IPhaseRepository }  from "./interfaces/phase-repository-interface.js"

export class PhaseRepository implements IPhaseRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(phaseObj: PhaseEntity): PhaseEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into phase (cycleId,name,`index`,inputFiles,outputFile,docTypeOutput,promptName,status,proposalState,startedAt,finishedAt) values (@cycleId,@name,@index,@inputFiles,@outputFile,@docTypeOutput,@promptName,@status,@proposalState,@startedAt,@finishedAt)";
        const result = this._uow.connection.prepare(sql).run({
                cycleId: phaseObj.cycleId,
                name: phaseObj.name,
                index: phaseObj.index,
                inputFiles: (phaseObj.inputFiles).join(", "),
                outputFile: phaseObj.outputFile,
                docTypeOutput: phaseObj.docTypeOutput,
                promptName: phaseObj.promptName,
                status: phaseObj.status,
                proposalState: phaseObj.proposalState,
                startedAt: new Date().toISOString(),
                finishedAt: null
            });
        return { ...phaseObj, id: Number(result.lastInsertRowid) };
    }
    public list(cycleId: number): PhaseEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.name,tp.`index`,tp.inputFiles,tp.outputFile,tp.docTypeOutput,tp.promptName,tp.status,tp.proposalState,tp.startedAt,tp.finishedAt,Cycle6.id as cycleId from phase tp left join Cycle Cycle6 on (tp.cycleId = Cycle6.id)  where tp.cycleId = @cycleId";
        return this._uow.connection.prepare(sql).all({
        cycleId: cycleId  }) as PhaseEntity[];
    }
    public getById(id: number): PhaseEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.name,tp.`index`,tp.inputFiles,tp.outputFile,tp.docTypeOutput,tp.promptName,tp.status,tp.proposalState,tp.startedAt,tp.finishedAt,Cycle6.id as cycleId from phase tp left join Cycle Cycle6 on (tp.cycleId = Cycle6.id)  where tp.id = @id";
        const row = this._uow.connection.prepare(sql).get({
        id: id  }) as PhaseEntity | undefined;
        return row ?? null;
    }
    public getByIndex(cycleId: number, index: number): PhaseEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.name,tp.`index`,tp.inputFiles,tp.outputFile,tp.docTypeOutput,tp.promptName,tp.status,tp.proposalState,tp.startedAt,tp.finishedAt,Cycle6.id as cycleId from phase tp left join Cycle Cycle6 on (tp.cycleId = Cycle6.id)  where tp.cycleId = @cycleId and tp.`index` = @index";
        const row = this._uow.connection.prepare(sql).get({
        cycleId: cycleId,
        index: index  }) as PhaseEntity | undefined;
        return row ?? null;
    }
    public deleteFromCycle(cycleId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from phase where cycleId = @cycleId";
        const result = this._uow.connection.prepare(sql).run({
        cycleId: cycleId  });
        return result.changes > 0;
    }
    public empty(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update phase set proposalState = @proposalState, status = @status, finishedAt = @finishedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                proposalState: "EMPTY",
                status: "AWAITING_APPROVAL",
                finishedAt: null
            });
        return true;
    }
    public nonEmpty(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update phase set proposalState = @proposalState, finishedAt = @finishedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                proposalState: "NON_EMPTY",
                status: "REFINING",
                finishedAt: null
            });
        return true;
    }
    public approve(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update phase set status = @status, finishedAt = @finishedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                status: "APPROVED",
                finishedAt: new Date().toISOString()
            });
        return true;
    }
    public reject(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update phase set status = @status, finishedAt = @finishedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                status: "REJECTED",
                finishedAt: new Date().toISOString()
            });
        return true;
    }
    public skip(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update phase set status = @status, finishedAt = @finishedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                status: "SKIPPED",
                finishedAt: new Date().toISOString()
            });
        return true;
    }
    public awaitingApproval(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update phase set status = @status, finishedAt = @finishedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                status: "AWAITING_APPROVAL",
                finishedAt: null
            });
        return true;
    }
    public reset(id: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update phase set status = @status, proposalState = @proposalState, startedAt = @startedAt, finishedAt = @finishedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                status: "REFINING",
                proposalState: "NOT_GENERATED",
                startedAt: new Date().toISOString(),
                finishedAt: null
            });
        return true;
    }
}
