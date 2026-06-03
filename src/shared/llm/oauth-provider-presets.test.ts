import { describe, it, expect } from "vitest";
import { resolveDeviceCodeConfig } from "./oauth-provider-presets.js";

describe("resolveDeviceCodeConfig — Azure preset", () => {
  it("fills the AAD device-code endpoints from clientId + tenant", () => {
    const config = resolveDeviceCodeConfig("azure", { clientId: "app-1", tenant: "contoso" });

    expect(config).toEqual({
      deviceAuthUrl: "https://login.microsoftonline.com/contoso/oauth2/v2.0/devicecode",
      tokenUrl: "https://login.microsoftonline.com/contoso/oauth2/v2.0/token",
      clientId: "app-1",
      scope: "https://cognitiveservices.azure.com/.default offline_access",
    });
  });

  it('defaults the tenant to "common"', () => {
    const config = resolveDeviceCodeConfig("azure-openai", { clientId: "app-1" });
    expect(config?.deviceAuthUrl).toContain("/common/");
  });

  it("lets explicit URLs/scope override the preset", () => {
    const config = resolveDeviceCodeConfig("azure", {
      clientId: "app-1",
      deviceAuthUrl: "https://custom/devicecode",
      scope: "custom.scope",
    });

    expect(config?.deviceAuthUrl).toBe("https://custom/devicecode");
    expect(config?.scope).toBe("custom.scope");
  });

  it("returns undefined when clientId is missing", () => {
    expect(resolveDeviceCodeConfig("azure", { clientId: "  " })).toBeUndefined();
  });
});

describe("resolveDeviceCodeConfig — generic provider (no preset)", () => {
  it("requires the three core fields explicitly", () => {
    expect(
      resolveDeviceCodeConfig("openai-compatible", {
        clientId: "c",
        deviceAuthUrl: "https://idp/devicecode",
        tokenUrl: "https://idp/token",
        scope: "s",
      }),
    ).toEqual({
      deviceAuthUrl: "https://idp/devicecode",
      tokenUrl: "https://idp/token",
      clientId: "c",
      scope: "s",
    });
  });

  it("returns undefined when URLs are missing and there is no preset", () => {
    expect(resolveDeviceCodeConfig("openai-compatible", { clientId: "c" })).toBeUndefined();
  });
});
