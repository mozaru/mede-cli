import { execFile } from "node:child_process";
import type { ILlmAuthStrategy } from "./llm-auth.js";

// Application Default Credentials (auth: "adc"). For Vertex AI / Gemini Enterprise
// the natural corporate path is a short-lived OAuth access token minted from the
// machine's ADC — so we DON'T store anything in the vault; we delegate to the
// already-configured gcloud/ADC. The token is cached briefly to avoid spawning
// gcloud on every request (matters in the long-lived interactive console).
const ADC_CACHE_TTL_MS = 45 * 60 * 1000;

export type AdcTokenFetcher = () => Promise<string>;

export interface AdcAuthStrategyDeps {
  fetchToken: AdcTokenFetcher;
  now: () => number;
}

export class AdcAuthStrategy implements ILlmAuthStrategy {
  private readonly providerLabel: string;
  private readonly deps: AdcAuthStrategyDeps;
  private cachedToken?: string;
  private cachedAt = 0;

  public constructor(providerLabel: string, deps: AdcAuthStrategyDeps) {
    this.providerLabel = providerLabel;
    this.deps = deps;
  }

  public async resolveAuthHeaders(): Promise<Record<string, string>> {
    return { Authorization: `Bearer ${await this.getToken()}` };
  }

  private async getToken(): Promise<string> {
    if (this.cachedToken && this.deps.now() - this.cachedAt < ADC_CACHE_TTL_MS) {
      return this.cachedToken;
    }

    const token = (await this.deps.fetchToken()).trim();
    if (!token) {
      throw new Error(
        `Não foi possível obter um token ADC para o provider ${this.providerLabel}. ` +
          'Rode "gcloud auth application-default login".',
      );
    }

    this.cachedToken = token;
    this.cachedAt = this.deps.now();
    return token;
  }
}

// Default token source: `gcloud auth application-default print-access-token`.
export function createGcloudTokenFetcher(): AdcTokenFetcher {
  return () =>
    new Promise<string>((resolve, reject) => {
      execFile(
        "gcloud",
        ["auth", "application-default", "print-access-token"],
        { timeout: 30_000 },
        (error, stdout, stderr) => {
          if (error) {
            reject(
              new Error(
                `Falha ao obter token ADC via gcloud: ${stderr?.toString().trim() || error.message}. ` +
                  'Instale o gcloud e rode "gcloud auth application-default login".',
              ),
            );
            return;
          }
          resolve(stdout.toString());
        },
      );
    });
}
