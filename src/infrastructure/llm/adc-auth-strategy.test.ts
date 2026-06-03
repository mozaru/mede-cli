import { describe, it, expect, vi } from "vitest";
import { AdcAuthStrategy } from "./adc-auth-strategy.js";

describe("AdcAuthStrategy", () => {
  it("returns a Bearer header from the ADC token source", async () => {
    const strategy = new AdcAuthStrategy("Gemini", {
      fetchToken: async () => "ya29.token\n",
      now: () => 0,
    });

    await expect(strategy.resolveAuthHeaders()).resolves.toEqual({
      Authorization: "Bearer ya29.token",
    });
  });

  it("caches the token and does not re-invoke the source within the TTL", async () => {
    const fetchToken = vi.fn(async () => "tok");
    const strategy = new AdcAuthStrategy("Gemini", { fetchToken, now: () => 1000 });

    await strategy.resolveAuthHeaders();
    await strategy.resolveAuthHeaders();

    expect(fetchToken).toHaveBeenCalledTimes(1);
  });

  it("refetches once the cache TTL has elapsed", async () => {
    const fetchToken = vi.fn(async () => "tok");
    let clock = 0;
    const strategy = new AdcAuthStrategy("Gemini", { fetchToken, now: () => clock });

    await strategy.resolveAuthHeaders();
    clock = 46 * 60 * 1000; // past the 45min TTL
    await strategy.resolveAuthHeaders();

    expect(fetchToken).toHaveBeenCalledTimes(2);
  });

  it("fails with an actionable message when the source returns an empty token", async () => {
    const strategy = new AdcAuthStrategy("Gemini", {
      fetchToken: async () => "   ",
      now: () => 0,
    });

    await expect(strategy.resolveAuthHeaders()).rejects.toThrow(
      /gcloud auth application-default login/,
    );
  });
});
