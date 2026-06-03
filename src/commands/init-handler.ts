import { createContainer } from "../cli/container.js";
import type { IInitService } from "../services/interfaces/init-service-interface.js";

export class InitHandler {
  private readonly initService: IInitService;

  constructor() {
    this.initService = createContainer().initService;
  }

  public async execute(prompt: string, file: Array<string>): Promise<void> {
    const status = await this.initService.init(prompt, file);
    console.log(status);
  }
}
