import { createContainer } from "../cli/container.js";
import { emitResult } from "../cli/output.js";
import type { IChangesService } from "../services/interfaces/changes-service-interface.js";

export class ChangesHandler {
  private readonly changesService: IChangesService;

  constructor() {
    this.changesService = createContainer().changesService;
  }

  public executeApply(all: boolean): void {
    const resp = this.changesService.apply(all);
    emitResult(resp);
  }

  public executeDiscard(all: boolean): void {
    const resp = this.changesService.discard(all);
    emitResult(resp);
  }

  public executePending(all: boolean): void {
    const resp = this.changesService.pending(all);
    emitResult(resp);
  }
}
