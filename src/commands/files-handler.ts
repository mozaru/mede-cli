import { createContainer } from "../cli/container.js";
import type { IFilesService } from "../services/interfaces/files-service-interface.js";

export class FilesHandler {
  private readonly filesService: IFilesService;

  constructor() {
    this.filesService = createContainer().filesService;
  }

  public executeCat(file: string, backup: boolean): void {
    const resp = this.filesService.cat(file, backup);
    console.log(resp);
  }
  public executeList(backup: boolean): void {
    const resp = this.filesService.files(backup);
    console.log(resp);
  }
  public executeDiff(file: string): void {
    const resp = this.filesService.diff(file);
    console.log(resp);
  }
}
