import { IUnitOfWork } from "../db/unit-of-work-interface.js";
import { PhaseEntity } from "../../domain/entities/phase-entity.js";
import { IPhaseRepository } from "../../domain/interfaces/repositories/phase-repository-interface.js";

export class PhaseRepository implements IPhaseRepository {
  private readonly _uow: IUnitOfWork;

  public constructor(uow: IUnitOfWork) {
    this._uow = uow;
  }

  public insert(phaseObj: PhaseEntity): PhaseEntity {
    this._uow.ensureTransactionForWrite();
    const sql =
      "insert into phase (cycleId,name,`index`,inputFiles,outputFile,docTypeOutput,promptName,status,proposalState,startedAt,finishedAt) values (@cycleId,@name,@index,@inputFiles,@outputFile,@docTypeOutput,@promptName,@status,@proposalState,@startedAt,@finishedAt)";
    const result = this._uow.connection.prepare(sql).run({
      cycleId: phaseObj.cycleId,
      name: phaseObj.name,
      index: phaseObj.index,
      inputFiles: phaseObj.inputFiles.join(", "),
      outputFile: phaseObj.outputFile,
      docTypeOutput: phaseObj.docTypeOutput,
      promptName: phaseObj.promptName,
      status: phaseObj.status,
      proposalState: phaseObj.proposalState,
      startedAt: new Date().toISOString(),
      finishedAt: null,
    });
    return { ...phaseObj, id: Number(result.lastInsertRowid) };
  }
  public list(cycleId: number): PhaseEntity[] {
    this._uow.ensureConnection();
    const sql =
      "select tp.id,tp.name,tp.`index`,tp.inputFiles,tp.outputFile,tp.docTypeOutput,tp.promptName,tp.status,tp.proposalState,tp.startedAt,tp.finishedAt,Cycle6.id as cycleId from phase tp left join Cycle Cycle6 on (tp.cycleId = Cycle6.id)  where tp.cycleId = @cycleId";
    return (this._uow.connection.prepare(sql).all({ cycleId: cycleId }) as PhaseEntity[]).map((r) =>
      this.deserializeInputFiles(r),
    );
  }
  public getById(id: number): PhaseEntity | null {
    this._uow.ensureConnection();
    const sql =
      "select tp.id,tp.name,tp.`index`,tp.inputFiles,tp.outputFile,tp.docTypeOutput,tp.promptName,tp.status,tp.proposalState,tp.startedAt,tp.finishedAt,Cycle6.id as cycleId from phase tp left join Cycle Cycle6 on (tp.cycleId = Cycle6.id)  where tp.id = @id";
    const row = this._uow.connection.prepare(sql).get({ id: id }) as PhaseEntity | undefined;
    return row ? this.deserializeInputFiles(row) : null;
  }
  public getByIndex(cycleId: number, index: number): PhaseEntity | null {
    this._uow.ensureConnection();
    const sql =
      "select tp.id,tp.name,tp.`index`,tp.inputFiles,tp.outputFile,tp.docTypeOutput,tp.promptName,tp.status,tp.proposalState,tp.startedAt,tp.finishedAt,Cycle6.id as cycleId from phase tp left join Cycle Cycle6 on (tp.cycleId = Cycle6.id)  where tp.cycleId = @cycleId and tp.`index` = @index";
    const row = this._uow.connection.prepare(sql).get({
      cycleId: cycleId,
      index: index,
    }) as PhaseEntity | undefined;
    return row ? this.deserializeInputFiles(row) : null;
  }

  private deserializeInputFiles(row: PhaseEntity): PhaseEntity {
    const raw = row.inputFiles as unknown;
    if (typeof raw === "string") {
      const s = (raw as string).trim();
      row.inputFiles = s ? s.split(", ") : [];
    } else if (!Array.isArray(raw)) {
      row.inputFiles = [];
    }
    return row;
  }
  public deleteFromCycle(cycleId: number): boolean {
    this._uow.ensureTransactionForWrite();
    const sql = "delete from phase where cycleId = @cycleId";
    const result = this._uow.connection.prepare(sql).run({
      cycleId: cycleId,
    });
    return result.changes > 0;
  }
  public empty(id: number): boolean {
    this._uow.ensureTransactionForWrite();
    const sql =
      "update phase set proposalState = @proposalState, status = @status, finishedAt = @finishedAt  where id = @id";
    const result = this._uow.connection.prepare(sql).run({
      id: id,
      proposalState: "EMPTY",
      status: "AWAITING_APPROVAL",
      finishedAt: null,
    });
    return result.changes > 0;
  }
  public nonEmpty(id: number): boolean {
    this._uow.ensureTransactionForWrite();
    const sql =
      "update phase set proposalState = @proposalState, status = @status, finishedAt = @finishedAt  where id = @id";
    const result = this._uow.connection.prepare(sql).run({
      id: id,
      proposalState: "NON_EMPTY",
      status: "REFINING",
      finishedAt: null,
    });
    return result.changes > 0;
  }
  public approve(id: number): boolean {
    this._uow.ensureTransactionForWrite();
    const sql = "update phase set status = @status, finishedAt = @finishedAt  where id = @id";
    const result = this._uow.connection.prepare(sql).run({
      id: id,
      status: "APPROVED",
      finishedAt: new Date().toISOString(),
    });
    return result.changes > 0;
  }
  public reject(id: number): boolean {
    this._uow.ensureTransactionForWrite();
    const sql = "update phase set status = @status, finishedAt = @finishedAt  where id = @id";
    const result = this._uow.connection.prepare(sql).run({
      id: id,
      status: "REJECTED",
      finishedAt: new Date().toISOString(),
    });
    return result.changes > 0;
  }
  public skip(id: number): boolean {
    this._uow.ensureTransactionForWrite();
    const sql = "update phase set status = @status, finishedAt = @finishedAt  where id = @id";
    const result = this._uow.connection.prepare(sql).run({
      id: id,
      status: "SKIPPED",
      finishedAt: new Date().toISOString(),
    });
    return result.changes > 0;
  }
  public awaitingApproval(id: number): boolean {
    this._uow.ensureTransactionForWrite();
    const sql = "update phase set status = @status, finishedAt = @finishedAt  where id = @id";
    const result = this._uow.connection.prepare(sql).run({
      id: id,
      status: "AWAITING_APPROVAL",
      finishedAt: null,
    });
    return result.changes > 0;
  }
  public reset(id: number): boolean {
    this._uow.ensureTransactionForWrite();
    const sql =
      "update phase set status = @status, proposalState = @proposalState, startedAt = @startedAt, finishedAt = @finishedAt  where id = @id";
    const result = this._uow.connection.prepare(sql).run({
      id: id,
      status: "REFINING",
      proposalState: "NOT_GENERATED",
      startedAt: new Date().toISOString(),
      finishedAt: null,
    });
    return result.changes > 0;
  }
  public updateOutputFile(id: number, newPath: string): boolean {
    this._uow.ensureTransactionForWrite();
    const result = this._uow.connection
      .prepare("update phase set outputFile = @newPath where id = @id")
      .run({ id, newPath });
    return result.changes > 0;
  }
  public updateInputFilePath(cycleId: number, oldPath: string, newPath: string): number {
    this._uow.ensureTransactionForWrite();
    const result = this._uow.connection
      .prepare(
        "update phase set inputFiles = replace(inputFiles, @oldPath, @newPath) where cycleId = @cycleId and instr(inputFiles, @oldPath) > 0",
      )
      .run({ cycleId, oldPath, newPath });
    return result.changes;
  }
}
