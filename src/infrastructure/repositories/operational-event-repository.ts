import type { IUnitOfWork } from "../db/unit-of-work-interface.js";
import type { IOperationalEventRepository } from "../../domain/interfaces/repositories/operational-event-repository-interface.js";
import { OperationalEventEntity } from "../../domain/entities/operational-event-entity.js";

export class OperationalEventRepository implements IOperationalEventRepository {
  private readonly uow: IUnitOfWork;

  public constructor(uow: IUnitOfWork) {
    this.uow = uow;
  }

  public insert(event: OperationalEventEntity): OperationalEventEntity {
    this.uow.ensureTransactionForWrite();
    const result = this.uow.connection
      .prepare(
        `insert into OperationalEvent
          (projectId, cycleId, phaseId, eventType, message, payloadJson, createdAt)
         values
          (@projectId, @cycleId, @phaseId, @eventType, @message, @payloadJson, @createdAt)`,
      )
      .run({
        projectId: event.projectId,
        cycleId: event.cycleId,
        phaseId: event.phaseId,
        eventType: event.eventType,
        message: event.message,
        payloadJson: event.payloadJson,
        createdAt: event.createdAt,
      });

    return { ...event, id: Number(result.lastInsertRowid) };
  }

  public list(projectId: number): OperationalEventEntity[] {
    this.uow.ensureConnection();
    return this.uow.connection
      .prepare(
        `select id, projectId, cycleId, phaseId, eventType, message, payloadJson, createdAt
           from OperationalEvent
          where projectId = @projectId
          order by id asc`,
      )
      .all({ projectId }) as OperationalEventEntity[];
  }
}
