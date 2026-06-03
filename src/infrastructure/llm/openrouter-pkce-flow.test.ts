import { describe, it, expect, vi } from "vitest";
import { OpenRouterPkceFlow } from "./openrouter-pkce-flow.js";
import http from "node:http";

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe("OpenRouterPkceFlow.login", () => {
  it("builds an S256 PKCE auth URL, exchanges the code, and returns the key", async () => {
    let seenAuthUrl = "";
    const fetchStub = vi.fn(async () => jsonResponse(200, { key: "sk-or-123" }));

    const flow = new OpenRouterPkceFlow(
      {
        fetch: fetchStub as unknown as typeof fetch,
        createVerifier: () => "fixed-verifier",
        authorize: async (authUrl) => {
          seenAuthUrl = authUrl;
          return "auth-code-1";
        },
      },
      { callbackPort: 9999 },
    );

    const key = await flow.login();

    expect(key).toBe("sk-or-123");
    expect(seenAuthUrl).toContain("code_challenge_method=S256");
    expect(seenAuthUrl).toContain(encodeURIComponent("http://localhost:9999/callback"));

    // The exchange POSTs the code + verifier to the keys endpoint.
    const [, init] = fetchStub.mock.calls[0] as unknown as [string, RequestInit];
    const sentBody = JSON.parse(String(init.body)) as Record<string, string>;
    expect(sentBody.code).toBe("auth-code-1");
    expect(sentBody.code_verifier).toBe("fixed-verifier");
  });

  it("derives a stable challenge from the verifier (SHA-256/base64url)", async () => {
    let seenAuthUrl = "";
    const flow = new OpenRouterPkceFlow({
      fetch: (async () => jsonResponse(200, { key: "k" })) as unknown as typeof fetch,
      createVerifier: () => "fixed-verifier",
      authorize: async (authUrl) => {
        seenAuthUrl = authUrl;
        return "c";
      },
    });

    await flow.login();

    // Precomputed base64url(SHA256("fixed-verifier")).
    expect(seenAuthUrl).toContain("code_challenge=7MosA1dS6hiqNcSny0SqUWJbJo82pR0lNczg5YZ-GLI");
  });

  it("fails with the provider error when the key exchange is rejected", async () => {
    const flow = new OpenRouterPkceFlow({
      fetch: (async () => jsonResponse(400, { error: "invalid_code" })) as unknown as typeof fetch,
      authorize: async () => "c",
    });

    await expect(flow.login()).rejects.toThrow(/invalid_code/);
  });

  it("honors MEDE_OPENROUTER_PORT env var for port configuration", async () => {
    process.env.MEDE_OPENROUTER_PORT = "12345";
    let seenAuthUrl = "";
    const fetchStub = vi.fn(async () => jsonResponse(200, { key: "sk-or-123" }));
    const flow = new OpenRouterPkceFlow(
      {
        fetch: fetchStub as unknown as typeof fetch,
        createVerifier: () => "fixed-verifier",
        authorize: async (authUrl) => {
          seenAuthUrl = authUrl;
          return "auth-code-1";
        },
      }
    );

    try {
      await flow.login();
      expect(seenAuthUrl).toContain(encodeURIComponent("http://localhost:12345/callback"));
    } finally {
      delete process.env.MEDE_OPENROUTER_PORT;
    }
  });
});

describe("createBrowserAuthorize", () => {
  it("rejects with a friendly error when the server gets EADDRINUSE", async () => {
    const mockServer = {
      listen: vi.fn(),
      on: vi.fn((event, handler) => {
        if (event === "error") {
          setTimeout(() => handler({ code: "EADDRINUSE" }), 0);
        }
      }),
      close: vi.fn(),
    };
    const spy = vi
      .spyOn(http, "createServer")
      .mockReturnValue(mockServer as unknown as http.Server);

    const { createBrowserAuthorize: authFn } = await import("./openrouter-pkce-flow.js");
    const authorize = authFn({ port: 1234, open: vi.fn() });
    await expect(authorize("http://auth", "http://callback")).rejects.toThrow(
      /Porta 1234 já está em uso/,
    );

    spy.mockRestore();
  });

  it("honors MEDE_OPENROUTER_PORT and MEDE_OPENROUTER_TIMEOUT env vars", async () => {
    process.env.MEDE_OPENROUTER_PORT = "23456";
    process.env.MEDE_OPENROUTER_TIMEOUT = "100";

    const mockServer = {
      listen: vi.fn(),
      on: vi.fn(),
      close: vi.fn(),
    };
    const spy = vi
      .spyOn(http, "createServer")
      .mockReturnValue(mockServer as unknown as http.Server);

    const { createBrowserAuthorize: authFn } = await import("./openrouter-pkce-flow.js");
    const authorize = authFn({ open: vi.fn() });

    try {
      await expect(authorize("http://auth", "http://callback")).rejects.toThrow(
        /Login OpenRouter expirou/,
      );
    } finally {
      spy.mockRestore();
      delete process.env.MEDE_OPENROUTER_PORT;
      delete process.env.MEDE_OPENROUTER_TIMEOUT;
    }
  });
});
