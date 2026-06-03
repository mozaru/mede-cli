import { describe, it, expect, vi } from "vitest";
import { DeviceCodeFlow, DeviceCodeConfig, DeviceCodeDeps } from "./oauth-device-code-flow.js";

const config: DeviceCodeConfig = {
  deviceAuthUrl: "https://idp.test/devicecode",
  tokenUrl: "https://idp.test/token",
  clientId: "client-123",
  scope: "llm.invoke",
};

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

// Builds a fetch stub that returns queued responses in order, recording the
// requests so assertions can inspect what was sent.
function queuedFetch(responses: Response[]) {
  const calls: Array<{ url: string; body: string }> = [];
  const fetchStub = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), body: String(init?.body ?? "") });
    const next = responses.shift();
    if (!next) {
      throw new Error("unexpected extra fetch call");
    }
    return next;
  });
  return { fetchStub: fetchStub as unknown as typeof fetch, calls };
}

function makeDeps(fetchStub: typeof fetch, display = vi.fn()): DeviceCodeDeps {
  return {
    fetch: fetchStub,
    now: () => 1_000_000,
    sleep: async () => {
      /* no delay in tests */
    },
    display,
  };
}

describe("DeviceCodeFlow.authenticate", () => {
  it("displays the verification info and returns tokens once authorized", async () => {
    const { fetchStub, calls } = queuedFetch([
      jsonResponse(200, {
        device_code: "dev-1",
        user_code: "WXYZ-1234",
        verification_uri: "https://idp.test/activate",
        expires_in: 900,
        interval: 5,
      }),
      jsonResponse(400, { error: "authorization_pending" }),
      jsonResponse(200, { access_token: "at-1", refresh_token: "rt-1", expires_in: 3600 }),
    ]);
    const display = vi.fn();
    const flow = new DeviceCodeFlow(config, makeDeps(fetchStub, display));

    const tokens = await flow.authenticate();

    expect(display).toHaveBeenCalledWith("https://idp.test/activate", "WXYZ-1234");
    expect(tokens.accessToken).toBe("at-1");
    expect(tokens.refreshToken).toBe("rt-1");
    expect(tokens.expiresAt).toBe(1_000_000 + 3600 * 1000);
    // device auth request carried client_id + scope
    expect(calls[0].body).toContain("client_id=client-123");
    expect(calls[0].body).toContain("scope=llm.invoke");
  });

  it("prefers verification_uri_complete when present", async () => {
    const { fetchStub } = queuedFetch([
      jsonResponse(200, {
        device_code: "dev-1",
        user_code: "WXYZ-1234",
        verification_uri: "https://idp.test/activate",
        verification_uri_complete: "https://idp.test/activate?code=WXYZ-1234",
        interval: 1,
      }),
      jsonResponse(200, { access_token: "at-1" }),
    ]);
    const display = vi.fn();
    const flow = new DeviceCodeFlow(config, makeDeps(fetchStub, display));

    await flow.authenticate();

    expect(display).toHaveBeenCalledWith("https://idp.test/activate?code=WXYZ-1234", "WXYZ-1234");
  });

  it("keeps polling on slow_down then succeeds", async () => {
    const { fetchStub } = queuedFetch([
      jsonResponse(200, { device_code: "d", user_code: "c", verification_uri: "u", interval: 1 }),
      jsonResponse(400, { error: "slow_down" }),
      jsonResponse(200, { access_token: "at-2" }),
    ]);
    const flow = new DeviceCodeFlow(config, makeDeps(fetchStub));

    const tokens = await flow.authenticate();
    expect(tokens.accessToken).toBe("at-2");
  });

  it("rejects when the user denies access", async () => {
    const { fetchStub } = queuedFetch([
      jsonResponse(200, { device_code: "d", user_code: "c", verification_uri: "u", interval: 1 }),
      jsonResponse(400, { error: "access_denied" }),
    ]);
    const flow = new DeviceCodeFlow(config, makeDeps(fetchStub));

    await expect(flow.authenticate()).rejects.toThrow(/negado/);
  });

  it("rejects when the device authorization request fails", async () => {
    const { fetchStub } = queuedFetch([jsonResponse(500, { error: "boom" })]);
    const flow = new DeviceCodeFlow(config, makeDeps(fetchStub));

    await expect(flow.authenticate()).rejects.toThrow(/autorização de dispositivo/);
  });

  it("times out once the device code expires", async () => {
    let clock = 1_000_000;
    const { fetchStub } = queuedFetch([
      jsonResponse(200, {
        device_code: "d",
        user_code: "c",
        verification_uri: "u",
        expires_in: 1,
        interval: 1,
      }),
    ]);
    const deps: DeviceCodeDeps = {
      fetch: fetchStub,
      now: () => clock,
      // advance the clock past the deadline before the first poll
      sleep: async () => {
        clock += 2000;
      },
      display: vi.fn(),
    };
    const flow = new DeviceCodeFlow(config, deps);

    await expect(flow.authenticate()).rejects.toThrow(/expirou/);
  });
});

describe("DeviceCodeFlow.refresh", () => {
  it("exchanges a refresh token for a new access token", async () => {
    const { fetchStub, calls } = queuedFetch([
      jsonResponse(200, { access_token: "at-new", expires_in: 3600 }),
    ]);
    const flow = new DeviceCodeFlow(config, makeDeps(fetchStub));

    const tokens = await flow.refresh("rt-1");

    expect(tokens.accessToken).toBe("at-new");
    // refresh reuses the old refresh token when the provider omits a new one
    expect(tokens.refreshToken).toBe("rt-1");
    expect(calls[0].body).toContain("grant_type=refresh_token");
    expect(calls[0].body).toContain("refresh_token=rt-1");
  });

  it("rejects with the provider's error description on failure", async () => {
    const { fetchStub } = queuedFetch([
      jsonResponse(400, { error: "invalid_grant", error_description: "token revoked" }),
    ]);
    const flow = new DeviceCodeFlow(config, makeDeps(fetchStub));

    await expect(flow.refresh("rt-1")).rejects.toThrow(/token revoked/);
  });
});
