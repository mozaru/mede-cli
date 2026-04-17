import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { PhaseAttachmentEntity }  from "../entities/phase-attachment-entity.js"
import { IPhaseAttachmentRepository }  from "./interfaces/phase-attachment-repository-interface.js"

export class PhaseAttachmentRepository implements IPhaseAttachmentRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(phaseAttachmentObj: PhaseAttachmentEntity): PhaseAttachmentEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into phaseAttachment (phaseId,createdAt,actor,filePath,fileName,content,contentText) values (@phaseId,@createdAt,@actor,@filePath,@fileName,@content,@contentText)";
        const result = this._uow.connection.prepare(sql).run({
                phaseId: phaseAttachmentObj.phaseId,
                createdAt: phaseAttachmentObj.createdAt,
                actor: phaseAttachmentObj.actor,
                filePath: phaseAttachmentObj.filePath,
                fileName: phaseAttachmentObj.fileName,
                content: phaseAttachmentObj.content,
                contentText: phaseAttachmentObj.contentText
            });
        return { ...phaseAttachmentObj, id: Number(result.lastInsertRowid) };
    }
    public list(phaseId: number): PhaseAttachmentEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.createdAt,tp.actor,tp.filePath,tp.fileName,tp.content,tp.contentText,Phase9.id as phaseId from phaseAttachment tp left join Phase Phase9 on (tp.phaseId = Phase9.id)  where tp.phaseId = @phaseId";
        return this._uow.connection.prepare(sql).all({
        phaseId: phaseId  }) as PhaseAttachmentEntity[];
    }
    public getById(id : number): PhaseAttachmentEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.createdAt,tp.actor,tp.filePath,tp.fileName,tp.content,tp.contentText,Phase9.id as phaseId from phaseAttachment tp left join Phase Phase9 on (tp.phaseId = Phase9.id)  where tp.id=@id";
        const row = this._uow.connection.prepare(sql).get({ id: id }) as PhaseAttachmentEntity | undefined;
        return row ?? null;

    }
    public deleteFromPhase(phaseId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from phaseAttachment where phaseId = @phaseId";
        const result = this._uow.connection.prepare(sql).run({
        phaseId: phaseId  });
        return result.changes > 0;
    }
}
