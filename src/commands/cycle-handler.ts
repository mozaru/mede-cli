import { createContainer } from "../cli/container.js";
import { ICycleService } from "../services/interfaces/cycle-service-interface.js";

export class CycleHandler {
  private readonly cycleService: ICycleService;

  constructor() {
    this.cycleService = createContainer().cycleService;
  }

  public async executeCycle(prompt: string, files: Array<string>): Promise<void> {
    const resp = await this.cycleService.cycle(prompt, files);
    console.log(resp);
  }

  public async executeApprove(all: boolean): Promise<void> {
    const resp = await this.cycleService.approve(all);
    console.log(resp);
  }

  public async executeReject(all: boolean): Promise<void> {
    const resp = await this.cycleService.reject(all);
    console.log(resp);
  }

  public async executeReset(): Promise<void> {
    const resp = await this.cycleService.reset();
    console.log(resp);
  }

  public async executeRetry(): Promise<void> {
    const resp = await this.cycleService.retry();
    console.log(resp);
  }

  public async executeRefine(prompt: string, files: Array<string>): Promise<void> {
    const resp = await this.cycleService.refine(prompt, files);
    console.log(resp);
  }

  public executeCommit(): void {
    const resp = this.cycleService.commit();
    console.log(resp);
  }
  public executeRollback(): void {
    const resp = this.cycleService.rollback();
    console.log(resp);
  }
}
