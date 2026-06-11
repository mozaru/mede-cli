import { getContainer } from "../container.js";
import { emitResult, emitProgress } from "../output.js";
import { ICycleService } from "../../domain/interfaces/services/cycle-service-interface.js";
import { ValidateHandler } from "./validate-handler.js";

export class CycleHandler {
  private readonly cycleService: ICycleService;

  constructor() {
    this.cycleService = getContainer().cycleService;
  }

  public async executeCycle(prompt: string, files: Array<string>): Promise<void> {
    const resp = await this.cycleService.cycle(prompt, files, (msg) => emitProgress(msg));
    emitResult(resp);
  }

  public async executeApprove(all: boolean): Promise<void> {
    const resp = await this.cycleService.approve(all, (msg) => emitProgress(msg));
    emitResult(resp);
  }

  public async executeReject(all: boolean): Promise<void> {
    const resp = await this.cycleService.reject(all);
    emitResult(resp);
  }

  public async executeReset(): Promise<void> {
    const resp = await this.cycleService.reset();
    emitResult(resp);
  }

  public async executeRetry(): Promise<void> {
    const resp = await this.cycleService.retry((msg) => emitProgress(msg));
    emitResult(resp);
  }

  public async executeRefine(prompt: string, files: Array<string>): Promise<void> {
    const resp = await this.cycleService.refine(prompt, files, (msg) => emitProgress(msg));
    emitResult(resp);
  }

  public executeCommit(): void {
    const resp = this.cycleService.commit();
    emitResult(resp);
    try {
      new ValidateHandler().execute(false);
    } catch {
      // Non-blocking post-commit validation
    }
  }
  public executeRollback(): void {
    const resp = this.cycleService.rollback();
    emitResult(resp);
  }
}
