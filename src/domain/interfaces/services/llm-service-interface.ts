export interface ILlmService {
  providers(): string;
  test(prompt: string): Promise<string>;
  login(display: (message: string) => void): Promise<string>;
  logout(): string;
}
