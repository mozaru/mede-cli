import { getContainer } from "../container.js";
import { emitResult } from "../output.js";
import type { IConfigService } from "../../domain/interfaces/services/config-service-interface.js";

export class ConfigHandler {
  private readonly configService: IConfigService;

  constructor() {
    this.configService = getContainer().configService;
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
