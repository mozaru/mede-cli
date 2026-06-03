import { getContainer } from "../cli/container.js";
import { emitResult } from "../cli/output.js";
import type { ILlmService } from "../services/interfaces/llm-service-interface.js";

export class LlmHandler {
  private readonly llmService: ILlmService;

  constructor() {
    this.llmService = getContainer().llmService;
  }

  public execute(): void {
    const resp = this.llmService.providers();
    emitResult(resp);
  }
  public async executeTest(prompt: string): Promise<void> {
    const resp = await this.llmService.test(prompt);
    emitResult(resp);
  }

  public async executeLogin(): Promise<void> {
    // The device-code flow prints the verification URL/code mid-flow so the user
    // can authorize before login resolves; the final confirmation goes through
    // the normal result channel (so --json still wraps it).
    const resp = await this.llmService.login((message) => console.log(message));
    emitResult(resp);
  }

  public executeLogout(): void {
    const resp = this.llmService.logout();
    emitResult(resp);
  }
}
