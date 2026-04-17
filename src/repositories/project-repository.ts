import { IUnitOfWork } from '../db/unit-of-work-interface.js';
import { ProjectEntity }  from "../entities/project-entity.js"
import { IProjectRepository }  from "./interfaces/project-repository-interface.js"

export class ProjectRepository implements IProjectRepository
{
    private readonly _uow: IUnitOfWork;

    public constructor(uow: IUnitOfWork) { this._uow = uow; }

    public insert(projectObj: ProjectEntity): ProjectEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "insert into project (name,rootProjectPath,docsRootPath,documentationLanguage,createdAt,updatedAt) values (@name,@rootProjectPath,@docsRootPath,@documentationLanguage,@createdAt,@updatedAt)";
        const result = this._uow.connection.prepare(sql).run({
                name: projectObj.name,
                rootProjectPath: projectObj.rootProjectPath,
                docsRootPath: projectObj.docsRootPath,
                documentationLanguage: projectObj.documentationLanguage,
                createdAt: projectObj.createdAt,
                updatedAt: projectObj.updatedAt
            });
        return { ...projectObj, id: Number(result.lastInsertRowid) };
    }
    public update(projectObj: ProjectEntity): ProjectEntity
    {
        this._uow.ensureTransactionForWrite();
        const sql = "update project set name=@name,rootProjectPath=@rootProjectPath,docsRootPath=@docsRootPath,documentationLanguage=@documentationLanguage,createdAt=@createdAt,updatedAt=@updatedAt where id=@id";
        const result = this._uow.connection.prepare(sql).run({
                name: projectObj.name,
                rootProjectPath: projectObj.rootProjectPath,
                docsRootPath: projectObj.docsRootPath,
                documentationLanguage: projectObj.documentationLanguage,
                createdAt: projectObj.createdAt,
                updatedAt: projectObj.updatedAt,
                id: projectObj.id
            });
        return projectObj;
    }
    public list(): ProjectEntity[]
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.name,tp.rootProjectPath,tp.docsRootPath,tp.documentationLanguage,tp.createdAt,tp.updatedAt from project tp";
        return this._uow.connection.prepare(sql).all() as ProjectEntity[];
    }
    public getById(id : number): ProjectEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.name,tp.rootProjectPath,tp.docsRootPath,tp.documentationLanguage,tp.createdAt,tp.updatedAt from project tp where tp.id=@id";
        const row = this._uow.connection.prepare(sql).get({ id: id }) as ProjectEntity | undefined;
        return row ?? null;
    }
    public getCurrent(): ProjectEntity | null
    {
        this._uow.ensureConnection();
        const sql = "select tp.id,tp.name,tp.rootProjectPath,tp.docsRootPath,tp.documentationLanguage,tp.createdAt,tp.updatedAt from project tp order by tp.id desc limit 1";
        const row = this._uow.connection.prepare(sql).get() as ProjectEntity | undefined;
        return row ?? null;
    }
    public delete(id : number): boolean
    {
        this._uow.ensureTransactionForWrite();
        const sql = "delete from project where id=@id";
        const result = this._uow.connection.prepare(sql).run({ id: id });
        return result.changes > 0;
    }
}
