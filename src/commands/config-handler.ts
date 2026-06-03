import { createContainer } from "../cli/container.js";
import type { IConfigService } from "../services/interfaces/config-service-interface.js";

export class ConfigHandler {
  private readonly configService: IConfigService;

  constructor() {
    this.configService = createContainer().configService;
  }

  public execute(): void {
    const resp = this.configService.getConfig();
    console.log(resp);
  }
  public executeInit(): void {
    this.configService.init();
    console.log("Successfully initialized config");
  }
  public executeApply(): void {
    this.configService.apply();
    console.log("Successfully updated config");
  }
}
