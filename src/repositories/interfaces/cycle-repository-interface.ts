import type { CycleEntity } from "../../entities/cycle-entity.js";

export interface ICycleRepository {
  insert(cycleObj: CycleEntity): CycleEntity;
  list(projectId: number): CycleEntity[];
  getById(id: number): CycleEntity | null;
  delete(id: number): boolean;
  deleteFromProject(projectId: number): boolean;
  getCurrent(projectId: number): CycleEntity | null;
  updatePhaseIndex(id: number, currentPhaseIndex: number): boolean;
  awaiting(id: number): boolean;
  // CÓDIGO MORTO: ver CycleRepository.commit()/rollback(). O ciclo é apagado
  // (delete) no commit/rollback em vez de ter o status transicionado, então
  // estes métodos nunca são chamados. Mantidos comentados intencionalmente.
  // commit(id: number): boolean;
  // rollback(id: number): boolean;
  approveAll(id: number): boolean;
  rejectAll(id: number): boolean;
}
