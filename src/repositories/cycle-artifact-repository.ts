import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { CycleArtifactEntity }  from "../entities/cycle-artifact-entity.js"
import { ICycleArtifactRepository }  from "./interfaces/cycle-artifact-repository-interface.js"

export class CycleArtifactRepository implements ICycleArtifactRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(cycleArtifactObj: CycleArtifactEntity): CycleArtifactEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into cycleArtifact (cycleId,backupContent,currentContent,canonicalName,canonicalType,artifactPath,startedAt,updatedAt) values (@cycleId,@backupContent,@currentContent,@canonicalName,@canonicalType,@artifactPath,@startedAt,@updatedAt)";
        const result = this._uow.connection.prepare(sql).run({
                cycleId: cycleArtifactObj.cycleId,
                backupContent: cycleArtifactObj.backupContent,
                currentContent: cycleArtifactObj.currentContent,
                canonicalName: cycleArtifactObj.canonicalName,
                canonicalType: cycleArtifactObj.canonicalType,
                artifactPath: cycleArtifactObj.artifactPath,
                startedAt: cycleArtifactObj.startedAt,
                updatedAt: cycleArtifactObj.updatedAt
            });
        return { ...cycleArtifactObj, id: Number(result.lastInsertRowid) };
    }
    public list(cycleId: number): CycleArtifactEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.backupContent,tp.currentContent,tp.canonicalName,tp.canonicalType,tp.artifactPath,tp.startedAt,tp.updatedAt,Cycle7.id as cycleId from cycleArtifact tp left join Cycle Cycle7 on (tp.cycleId = Cycle7.id)  where tp.cycleId = @cycleId";
        return this._uow.connection.prepare(sql).all({
        cycleId: cycleId  }) as CycleArtifactEntity[];
    }
    public getById(id : number): CycleArtifactEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.backupContent,tp.currentContent,tp.canonicalName,tp.canonicalType,tp.artifactPath,tp.startedAt,tp.updatedAt,Cycle7.id as cycleId from cycleArtifact tp left join Cycle Cycle7 on (tp.cycleId = Cycle7.id)  where tp.id=@id";
        const row = this._uow.connection.prepare(sql).get({ id: id }) as CycleArtifactEntity | undefined;
        return row ?? null;

    }
    public getFromPath(cycleId: number, artifactPath: string): CycleArtifactEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.backupContent,tp.currentContent,tp.canonicalName,tp.canonicalType,tp.artifactPath,tp.startedAt,tp.updatedAt,Cycle7.id as cycleId from cycleArtifact tp left join Cycle Cycle7 on (tp.cycleId = Cycle7.id)  where tp.cycleId = @cycleId and tp.artifactPath = @artifactPath";
        const row = this._uow.connection.prepare(sql).get({
        cycleId: cycleId,
        artifactPath: artifactPath  }) as CycleArtifactEntity | undefined;
        return row ?? null;
    }
    public deleteFromCycle(cycleId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from cycleArtifact where cycleId = @cycleId";
        const result = this._uow.connection.prepare(sql).run({
        cycleId: cycleId  });
        return result.changes > 0;
    }
    public updateContent(id: number, currentContent: string): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update cycleArtifact set currentContent = @currentContent,updatedAt = @updatedAt  where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                currentContent: currentContent,
                updatedAt: new Date().toISOString()
            });
        return true;
    }
    public existAnyByCycle(cycleId: number): boolean
    {
        this._uow.ensureConnection();
        const sql = "select count(*) as count from cycleArtifact where cycleId = @cycleId";
        return this._uow.connection.prepare(sql).get({
        cycleId: cycleId  }) as number > 0;
    }
}
