import { getContainer } from "../container.js";
import { emitResult } from "../output.js";
import type { IInitService } from "../../domain/interfaces/services/init-service-interface.js";

export class InitHandler {
  private readonly initService: IInitService;

  constructor() {
    this.initService = getContainer().initService;
  }

  public async execute(prompt: string, file: Array<string>): Promise<void> {
    const status = await this.initService.init(prompt, file);
    emitResult(status);
  }
}
