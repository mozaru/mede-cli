import { describe, it, expect, vi } from "vitest";
import { withRetry, defaultShouldRetry } from "./retry.js";

describe("withRetry", () => {
  it("returns immediately when the operation succeeds on the first try", async () => {
    const fn = vi.fn().mockResolvedValue("ok");

    await expect(withRetry(fn, { retries: 3, baseDelayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries transient failures and eventually succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("503 service unavailable"))
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValue("done");

    const onRetry = vi.fn();
    await expect(withRetry(fn, { retries: 3, baseDelayMs: 1, onRetry })).resolves.toBe("done");

    expect(fn).toHaveBeenCalledTimes(3);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it("gives up after exhausting the retries and rethrows the last error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("503 still down"));

    await expect(withRetry(fn, { retries: 2, baseDelayMs: 1 })).rejects.toThrow("503 still down");
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it("does not retry permanent failures (e.g. bad API key)", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("401 invalid api key"));

    await expect(withRetry(fn, { retries: 5, baseDelayMs: 1 })).rejects.toThrow("401");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("defaultShouldRetry", () => {
  it("retries transient-looking errors", () => {
    expect(defaultShouldRetry(new Error("500 internal error"))).toBe(true);
    expect(defaultShouldRetry(new Error("network timeout"))).toBe(true);
  });

  it("does not retry permanent-looking errors", () => {
    expect(defaultShouldRetry(new Error("401 unauthorized"))).toBe(false);
    expect(defaultShouldRetry(new Error("invalid api key"))).toBe(false);
    expect(defaultShouldRetry(new Error("404 not found"))).toBe(false);
  });
});
