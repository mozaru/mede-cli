import { getContainer } from "../container.js";
import { emitResult } from "../output.js";
import type { IStatusService } from "../../domain/interfaces/services/status-service-interface.js";

export class StatusCommand {
  private readonly statusService: IStatusService;

  constructor() {
    this.statusService = getContainer().statusService;
  }

  public execute(): void {
    const status = this.statusService.showStatus();
    emitResult(status);
  }
}
