import { createContainer } from "../cli/container.js";
import { emitResult } from "../cli/output.js";
import type { IFilesService } from "../services/interfaces/files-service-interface.js";

export class FilesHandler {
  private readonly filesService: IFilesService;

  constructor() {
    this.filesService = createContainer().filesService;
  }

  public executeCat(file: string, backup: boolean): void {
    const resp = this.filesService.cat(file, backup);
    emitResult(resp);
  }
  public executeList(backup: boolean): void {
    const resp = this.filesService.files(backup);
    emitResult(resp);
  }
  public executeDiff(file: string): void {
    const resp = this.filesService.diff(file);
    emitResult(resp);
  }
}
