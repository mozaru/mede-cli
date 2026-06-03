import { createContainer } from "../cli/container.js";
import { emitResult } from "../cli/output.js";
import type { IStatusService } from "../services/interfaces/status-service-interface.js";

export class StatusHandler {
  private readonly statusService: IStatusService;

  constructor() {
    this.statusService = createContainer().statusService;
  }

  public execute(): void {
    const status = this.statusService.showStatus();
    emitResult(status);
  }
}
