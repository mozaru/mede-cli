import { CycleEntity } from "../../entities/cycle-entity.js";
import { CycleResponseModel } from "../../models/cycle.model.js";

export interface ICycleService {
  createBackupDocs(projectId: number, cycleId: number): void;
  restoreBackup(cycle: CycleEntity): void;
  clearCycle(cycle: CycleEntity): void;
  beginInitialization(projectId: number): CycleResponseModel;
  begin(projectId: number): CycleResponseModel;
  next(cycle: CycleEntity): CycleResponseModel;
  cycle(prompt: string, files: Array<string>, onProgress?: (msg: string) => void): Promise<string>;
  approve(all: boolean, onProgress?: (msg: string) => void): Promise<string>;
  reject(all: boolean): Promise<string>;
  reset(): Promise<string>;
  retry(onProgress?: (msg: string) => void): Promise<string>;
  refine(prompt: string, files: Array<string>, onProgress?: (msg: string) => void): Promise<string>;
  commit(): string;
  rollback(): string;
}
