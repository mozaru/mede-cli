import { createContainer } from "../cli/container.js";
import { emitResult } from "../cli/output.js";
import type { IConfigService } from "../services/interfaces/config-service-interface.js";

export class ConfigHandler {
  private readonly configService: IConfigService;

  constructor() {
    this.configService = createContainer().configService;
  }

  public execute(): void {
    const resp = this.configService.getConfig();
    emitResult(resp);
  }
  public executeInit(): void {
    this.configService.init();
    emitResult("Configuração criada com sucesso.");
  }
  public executeApply(): void {
    this.configService.apply();
    emitResult("Configuração atualizada com sucesso.");
  }
}
