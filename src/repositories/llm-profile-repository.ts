import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { LlmProfileEntity }  from "../entities/llm-profile-entity.js"
import { ILlmProfileRepository }  from "./interfaces/llm-profile-repository-interface.js"

export class LlmProfileRepository implements ILlmProfileRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(llmProfileObj: LlmProfileEntity): LlmProfileEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into llmProfile (projectId,profileName,provider,model,endpoint,apiKeyEnv,temperature,maxTokens,timeoutMs,retryJson,active) values (@projectId,@profileName,@provider,@model,@endpoint,@apiKeyEnv,@temperature,@maxTokens,@timeoutMs,@retryJson,@active)";
        const result = this._uow.connection.prepare(sql).run({
                projectId: llmProfileObj.projectId,
                profileName: llmProfileObj.profileName,
                provider: llmProfileObj.provider,
                model: llmProfileObj.model,
                endpoint: llmProfileObj.endpoint,
                apiKeyEnv: llmProfileObj.apiKeyEnv,
                temperature: llmProfileObj.temperature,
                maxTokens: llmProfileObj.maxTokens,
                timeoutMs: llmProfileObj.timeoutMs,
                retryJson: llmProfileObj.retryJson,
                active: llmProfileObj.active
            });
        return { ...llmProfileObj, id: Number(result.lastInsertRowid) };
    }
    public list(projectId: number): LlmProfileEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.profileName,tp.provider,tp.model,tp.endpoint,tp.apiKeyEnv,tp.temperature,tp.maxTokens,tp.timeoutMs,tp.retryJson,tp.active,Project2.id as projectId from llmProfile tp left join Project Project2 on (tp.projectId = Project2.id)  where tp.projectId = @projectId";
        return this._uow.connection.prepare(sql).all({
        projectId: projectId  }) as LlmProfileEntity[];
    }
    public getById(id : number): LlmProfileEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.profileName,tp.provider,tp.model,tp.endpoint,tp.apiKeyEnv,tp.temperature,tp.maxTokens,tp.timeoutMs,tp.retryJson,tp.active,Project2.id as projectId from llmProfile tp left join Project Project2 on (tp.projectId = Project2.id)  where tp.id=@id";
        const row = this._uow.connection.prepare(sql).get({ id: id }) as LlmProfileEntity | undefined;
        return row ?? null;

    }
    public delete(id : number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from llmProfile where id=@id";
        const result = this._uow.connection.prepare(sql).run({ id: id });
        return result.changes > 0;
    }
    public deleteFromProject(projectId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from llmProfile where projectId = @projectId";
        const result = this._uow.connection.prepare(sql).run({
        projectId: projectId  });
        return result.changes > 0;
    }
}
