export type LlmRole = "system" | "user" | "assistant";

export interface LlmMessage {
  role: LlmRole;
  content: string;
}

export interface LlmGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface LlmTextGenerationResult {
  rawText: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  finishReason?: string | null;
  model?: string | null;
}

export interface ILlmProvider {
  setSystemPrompt(prompt:string) : void;
  setExtraInfo(info:string) : void;
  setUserPrompt(prompt:string) : void;
  setOptions(options:LlmGenerationOptions): void;
  addMessage(actor:LlmRole, content:string): void;
  addAttachment(fileName:string, contentText:string):void;
  addInputDoc(id:number, artifactPath: string, currentContent:string):void;
  addOutputDoc(id:number, artifactPath: string, currentContent:string):void;
  generateText(): Promise<LlmTextGenerationResult>;
}
