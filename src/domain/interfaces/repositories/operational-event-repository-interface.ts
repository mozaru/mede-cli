import type { OperationalEventEntity } from "../../entities/operational-event-entity.js";

export interface IOperationalEventRepository {
  insert(event: OperationalEventEntity): OperationalEventEntity;
  list(projectId: number): OperationalEventEntity[];
}
