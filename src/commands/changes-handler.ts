import { createContainer } from "../cli/container.js";
import type { IChangesService } from "../services/interfaces/changes-service-interface.js";

export class ChangesHandler {
  private readonly changesService: IChangesService;

  constructor() {
    this.changesService = createContainer().changesService;
  }

  public executeApply(all: boolean): void {
    const resp = this.changesService.apply(all);
    console.log(resp);
  }

  public executeDiscard(all: boolean): void {
    const resp = this.changesService.discard(all);
    console.log(resp);
  }

  public executePending(all: boolean): void {
    const resp = this.changesService.pending(all);
    console.log(resp);
  }
}
