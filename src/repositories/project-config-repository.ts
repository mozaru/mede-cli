import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { ProjectConfigEntity }  from "../entities/project-config-entity.js"
import { IProjectConfigRepository }  from "./interfaces/project-config-repository-interface.js"

export class ProjectConfigRepository implements IProjectConfigRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(projectConfigObj: ProjectConfigEntity): ProjectConfigEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into projectConfig (projectId,medeConfigPath,hashContent,content,createdAt,updatedAt) values (@projectId,@medeConfigPath,@hashContent,@content,@createdAt,@updatedAt)";
        const result = this._uow.connection.prepare(sql).run({
                projectId: projectConfigObj.projectId,
                medeConfigPath: projectConfigObj.medeConfigPath,
                hashContent: projectConfigObj.hashContent,
                content: projectConfigObj.content,
                createdAt: projectConfigObj.createdAt,
                updatedAt: projectConfigObj.updatedAt
            });
        return { ...projectConfigObj, id: Number(result.lastInsertRowid) };
    }
    public updateContent(id: number, content: string, hashContent: string): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update projectConfig set content = @content,hashContent = @hashContent where id = @id";
        const result = this._uow.connection.prepare(sql).run({
                id: id,
                content: content,
                hashContent: hashContent
            });
        return true;
    }
    public list(projectId: number): ProjectConfigEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.medeConfigPath,tp.hashContent,tp.content,tp.createdAt,tp.updatedAt,Project1.id as projectId from projectConfig tp left join Project Project1 on (tp.projectId = Project1.id)  where tp.projectId = @projectId";
        return this._uow.connection.prepare(sql).all({
        projectId: projectId  }) as ProjectConfigEntity[];
    }
    public getById(id : number): ProjectConfigEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.medeConfigPath,tp.hashContent,tp.content,tp.createdAt,tp.updatedAt,Project1.id as projectId from projectConfig tp left join Project Project1 on (tp.projectId = Project1.id)  where tp.id=@id";
        const row = this._uow.connection.prepare(sql).get({ id: id }) as ProjectConfigEntity | undefined;
        return row ?? null;

    }
    public getCurrent(projectId: number): ProjectConfigEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.medeConfigPath,tp.hashContent,tp.content,tp.createdAt,tp.updatedAt,Project1.id as projectId from projectConfig tp left join Project Project1 on (tp.projectId = Project1.id)  where tp.projectId = @projectId";
        const row = this._uow.connection.prepare(sql).get({
        projectId: projectId  }) as ProjectConfigEntity | undefined;
        return row ?? null;
    }
    public delete(id : number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from projectConfig where id=@id";
        const result = this._uow.connection.prepare(sql).run({ id: id });
        return result.changes > 0;
    }
    public deleteFromProject(projectId: number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from projectConfig where projectId = @projectId";
        const result = this._uow.connection.prepare(sql).run({
        projectId: projectId  });
        return result.changes > 0;
    }
}
