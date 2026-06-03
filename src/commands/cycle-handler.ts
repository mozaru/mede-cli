import { createContainer } from "../cli/container.js";
import { emitResult } from "../cli/output.js";
import { ICycleService } from "../services/interfaces/cycle-service-interface.js";

export class CycleHandler {
  private readonly cycleService: ICycleService;

  constructor() {
    this.cycleService = createContainer().cycleService;
  }

  public async executeCycle(prompt: string, files: Array<string>): Promise<void> {
    const resp = await this.cycleService.cycle(prompt, files);
    emitResult(resp);
  }

  public async executeApprove(all: boolean): Promise<void> {
    const resp = await this.cycleService.approve(all);
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
    const resp = await this.cycleService.retry();
    emitResult(resp);
  }

  public async executeRefine(prompt: string, files: Array<string>): Promise<void> {
    const resp = await this.cycleService.refine(prompt, files);
    emitResult(resp);
  }

  public executeCommit(): void {
    const resp = this.cycleService.commit();
    emitResult(resp);
  }
  public executeRollback(): void {
    const resp = this.cycleService.rollback();
    emitResult(resp);
  }
}
