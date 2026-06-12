import { getContainer } from "../container.js";
import { emitResult } from "../output.js";
import type { IChangesService } from "../../domain/interfaces/services/changes-service-interface.js";

export class ChangesCommand {
  private readonly changesService: IChangesService;

  constructor() {
    this.changesService = getContainer().changesService;
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
