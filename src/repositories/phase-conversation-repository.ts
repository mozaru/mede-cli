import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { PhaseConversationEntity }  from "../entities/phase-conversation-entity.js"
import { IPhaseConversationRepository }  from "./interfaces/phase-conversation-repository-interface.js"

export class PhaseConversationRepository implements IPhaseConversationRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(phaseConversationObj: PhaseConversationEntity): PhaseConversationEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into phaseConversation (phaseId,createdAt,actor,content) values (@phaseId,@createdAt,@actor,@content)";
        const result = this._uow.connection.prepare(sql).run({
                phaseId: phaseConversationObj.phaseId,
                createdAt: phaseConversationObj.createdAt,
                actor: phaseConversationObj.actor,
                content: phaseConversationObj.content
            });
        return { ...phaseConversationObj, id: Number(result.lastInsertRowid) };
    }
    public list(phaseId: number): PhaseConversationEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.createdAt,tp.actor,tp.content,Phase8.id as phaseId from phaseConversation tp left join Phase Phase8 on (tp.phaseId = Phase8.id)  where tp.phaseId = @phaseId";
        return this._uow.connection.prepare(sql).all({
        phaseId: phaseId  }) as PhaseConversationEntity[];
    }
    public getById(id : number): PhaseConversationEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.createdAt,tp.actor,tp.content,Phase8.id as phaseId from phaseConversation tp left join Phase Phase8 on (tp.phaseId = Phase8.id)  where tp.id=@id";
        const row = this._uow.connection.prepare(sql).get({ id: id }) as PhaseConversationEntity | undefined;
        return row ?? null;

    }
    public deleteFromPhase(phaseId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from phaseConversation where phaseId = @phaseId";
        const result = this._uow.connection.prepare(sql).run({
        phaseId: phaseId  });
        return result.changes > 0;
    }
}
