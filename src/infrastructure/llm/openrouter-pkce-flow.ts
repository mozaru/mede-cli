import crypto from "node:crypto";
import http from "node:http";
import { spawn } from "node:child_process";

// OpenRouter OAuth PKCE. Unlike the device-code providers, OpenRouter's OAuth
// *provisions an API key*: the browser flow returns a one-time `code`, which we
// exchange for a key that is then used as `Authorization: Bearer <key>` against
// the OpenAI-compatible endpoint. So the stored "token" has no expiry/refresh —
// it is a long-lived key. The browser + local-callback I/O is injected via
// `authorize`, keeping the PKCE/exchange logic unit-testable.

export interface OpenRouterPkceConfig {
  authBaseUrl?: string;
  keysUrl?: string;
  callbackPort?: number;
}

export interface OpenRouterPkceDeps {
  fetch: typeof fetch;
  // Opens `authUrl` (browser) and resolves with the `code` delivered to
  // `callbackUrl`. Default implementation: createBrowserAuthorize().
  authorize: (authUrl: string, callbackUrl: string) => Promise<string>;
  // Overridable for deterministic tests; defaults to a 32-byte random verifier.
  createVerifier?: () => string;
}

const DEFAULT_AUTH_BASE = "https://openrouter.ai/auth";
const DEFAULT_KEYS_URL = "https://openrouter.ai/api/v1/auth/keys";
const DEFAULT_PORT = 8765;

function base64url(buffer: Buffer): string {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export class OpenRouterPkceFlow {
  private readonly config: OpenRouterPkceConfig;
  private readonly deps: OpenRouterPkceDeps;

  public constructor(deps: OpenRouterPkceDeps, config: OpenRouterPkceConfig = {}) {
    this.config = config;
    this.deps = deps;
  }

  // Runs the PKCE dance and resolves with the provisioned API key.
  public async login(): Promise<string> {
    const verifier = this.deps.createVerifier?.() ?? base64url(crypto.randomBytes(32));
    const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());

    const envPort = process.env.MEDE_OPENROUTER_PORT
      ? parseInt(process.env.MEDE_OPENROUTER_PORT, 10)
      : undefined;
    const port = envPort ?? this.config.callbackPort ?? DEFAULT_PORT;
    const callbackUrl = `http://localhost:${port}/callback`;
    const authBase = this.config.authBaseUrl ?? DEFAULT_AUTH_BASE;
    const authUrl =
      `${authBase}?callback_url=${encodeURIComponent(callbackUrl)}` +
      `&code_challenge=${challenge}&code_challenge_method=S256`;

    const code = await this.deps.authorize(authUrl, callbackUrl);

    const response = await this.deps.fetch(this.config.keysUrl ?? DEFAULT_KEYS_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, code_verifier: verifier, code_challenge_method: "S256" }),
    });

    const body = (await response.json()) as { key?: string; error?: string };

    if (!response.ok || !body.key) {
      throw new Error(
        `Falha ao trocar o código de autorização do OpenRouter por uma chave de API: ${body.error ?? `HTTP ${response.status}`}.`,
      );
    }

    return body.key;
  }
}

// Default `authorize`: starts a one-shot local HTTP server on the callback port,
// opens the system browser at `authUrl`, and resolves with the `code` query
// param of the first request. Times out so a never-completed login doesn't hang.
export function createBrowserAuthorize(options?: {
  port?: number;
  timeoutMs?: number;
  open?: (url: string) => void;
  notify?: (message: string) => void;
}): (authUrl: string, callbackUrl: string) => Promise<string> {
  const envPort = process.env.MEDE_OPENROUTER_PORT
    ? parseInt(process.env.MEDE_OPENROUTER_PORT, 10)
    : undefined;
  const envTimeout = process.env.MEDE_OPENROUTER_TIMEOUT
    ? parseInt(process.env.MEDE_OPENROUTER_TIMEOUT, 10)
    : undefined;

  const port = envPort ?? options?.port ?? DEFAULT_PORT;
  const timeoutMs = envTimeout ?? options?.timeoutMs ?? 5 * 60 * 1000;
  const openBrowser = options?.open ?? openInDefaultBrowser;
  const notify = options?.notify ?? (() => undefined);

  return (authUrl) =>
    new Promise<string>((resolve, reject) => {
      const server = http.createServer((req, res) => {
        const url = new URL(req.url ?? "/", `http://localhost:${port}`);
        const code = url.searchParams.get("code");

        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(
          code
            ? "<html><body>Login concluído com sucesso. Você já pode fechar esta aba do navegador.</body></html>"
            : "<html><body>Login sem código. Você já pode fechar esta aba do navegador.</body></html>",
        );

        cleanup();
        if (code) {
          resolve(code);
        } else {
          reject(new Error("OpenRouter não retornou um código de autorização."));
        }
      });

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("Login OpenRouter expirou. Rode novamente."));
      }, timeoutMs);

      function cleanup(): void {
        clearTimeout(timer);
        server.close();
      }

      server.on("error", (error: unknown) => {
        cleanup();
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          (error as { code?: string }).code === "EADDRINUSE"
        ) {
          reject(new Error(`Porta ${port} já está em uso.`));
        } else {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });

      server.listen(port, () => {
        notify(`Abrindo o navegador para autenticar. Se não abrir, acesse:\n${authUrl}`);
        openBrowser(authUrl);
      });
    });
}

function openInDefaultBrowser(url: string): void {
  const command =
    process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  try {
    spawn(command, args, { stdio: "ignore", detached: true }).unref();
  } catch {
    // If we can't launch a browser, the URL was already printed for manual use.
  }
}
