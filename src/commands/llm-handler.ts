import { createContainer } from "../cli/container.js";
import type { ILlmService } from "../services/interfaces/llm-service-interface.js";

export class LlmHandler {
  private readonly llmService: ILlmService;

  constructor() {
    this.llmService = createContainer().llmService;
  }

  public execute(): void {
    const resp = this.llmService.providers();
    console.log(resp);
  }
  public async executeTest(prompt: string): Promise<void> {
    const resp = await this.llmService.test(prompt);
    console.log(resp);
  }
}
