// Generic OAuth 2.0 Device Authorization Grant (RFC 8628). Provider-agnostic on
// purpose: the concrete endpoints/clientId/scope come from config (and, in a
// later slice, from per-provider presets for Azure AD / Vertex / OpenRouter).
// All side effects (network, clock, sleep, user-facing output) are injected so
// the polling state machine is unit-testable without real I/O.

export interface DeviceCodeConfig {
  deviceAuthUrl: string;
  tokenUrl: string;
  clientId: string;
  scope?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  // Absolute expiry as epoch milliseconds, when the provider returned expires_in.
  expiresAt?: number;
}

export interface DeviceCodeDeps {
  fetch: typeof fetch;
  now: () => number;
  sleep: (ms: number) => Promise<void>;
  // Shows the verification URL + user code so the user can authorize the device.
  display: (verificationUri: string, userCode: string) => void;
}

interface DeviceAuthorizationResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in?: number;
  interval?: number;
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

const DEVICE_CODE_GRANT = "urn:ietf:params:oauth:grant-type:device_code";

export class DeviceCodeFlow {
  private readonly config: DeviceCodeConfig;
  private readonly deps: DeviceCodeDeps;

  public constructor(config: DeviceCodeConfig, deps: DeviceCodeDeps) {
    this.config = config;
    this.deps = deps;
  }

  // Runs the full device-code dance and resolves with the granted tokens, or
  // rejects with an actionable error (denied, expired, or the provider's own
  // error_description).
  public async authenticate(): Promise<OAuthTokens> {
    const authorization = await this.requestDeviceCode();

    this.deps.display(
      authorization.verification_uri_complete ?? authorization.verification_uri,
      authorization.user_code,
    );

    return this.pollForToken(authorization);
  }

  // Exchanges a refresh token for a fresh access token. Used by OAuthAuthStrategy
  // when the cached access token has expired.
  public async refresh(refreshToken: string): Promise<OAuthTokens> {
    const response = await this.postForm(this.config.tokenUrl, {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: this.config.clientId,
    });

    const body = (await response.json()) as TokenResponse;

    if (!response.ok || !body.access_token) {
      throw new Error(this.describeTokenError(body, response.status, "renovar o token OAuth"));
    }

    return this.toTokens(body, refreshToken);
  }

  private async requestDeviceCode(): Promise<DeviceAuthorizationResponse> {
    const params: Record<string, string> = { client_id: this.config.clientId };
    if (this.config.scope) {
      params.scope = this.config.scope;
    }

    const response = await this.postForm(this.config.deviceAuthUrl, params);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Falha ao iniciar o login OAuth (device authorization) [${response.status}]: ${errorBody}`,
      );
    }

    return (await response.json()) as DeviceAuthorizationResponse;
  }

  private async pollForToken(authorization: DeviceAuthorizationResponse): Promise<OAuthTokens> {
    let intervalMs = Math.max(1, authorization.interval ?? 5) * 1000;
    const expiresInMs = (authorization.expires_in ?? 900) * 1000;
    const deadline = this.deps.now() + expiresInMs;

    for (;;) {
      await this.deps.sleep(intervalMs);

      if (this.deps.now() >= deadline) {
        throw new Error("Login OAuth expirou antes da autorização. Rode o login novamente.");
      }

      const response = await this.postForm(this.config.tokenUrl, {
        grant_type: DEVICE_CODE_GRANT,
        device_code: authorization.device_code,
        client_id: this.config.clientId,
      });

      const body = (await response.json()) as TokenResponse;

      if (response.ok && body.access_token) {
        return this.toTokens(body);
      }

      switch (body.error) {
        case "authorization_pending":
          continue;
        case "slow_down":
          // RFC 8628: back off by 5s and keep polling.
          intervalMs += 5000;
          continue;
        case "access_denied":
          throw new Error("Login OAuth negado pelo usuário.");
        case "expired_token":
          throw new Error("Login OAuth expirou antes da autorização. Rode o login novamente.");
        default:
          throw new Error(this.describeTokenError(body, response.status, "obter o token OAuth"));
      }
    }
  }

  private async postForm(url: string, params: Record<string, string>): Promise<Response> {
    return this.deps.fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body: new URLSearchParams(params).toString(),
    });
  }

  private toTokens(body: TokenResponse, fallbackRefresh?: string): OAuthTokens {
    return {
      accessToken: body.access_token as string,
      refreshToken: body.refresh_token ?? fallbackRefresh,
      expiresAt:
        typeof body.expires_in === "number" ? this.deps.now() + body.expires_in * 1000 : undefined,
    };
  }

  private describeTokenError(body: TokenResponse, status: number, action: string): string {
    const detail = body.error_description ?? body.error ?? `HTTP ${status}`;
    return `Falha ao ${action}: ${detail}`;
  }
}
