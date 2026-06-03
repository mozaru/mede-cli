import { getContainer } from "../container.js";
import { emitResult } from "../output.js";
import type { IFilesService } from "../../domain/interfaces/services/files-service-interface.js";

export class FilesHandler {
  private readonly filesService: IFilesService;

  constructor() {
    this.filesService = getContainer().filesService;
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
