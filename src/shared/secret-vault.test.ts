import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { FileSecretVault, SystemKeychainSecretVault, DockerCredentialHelperSecretVault, createSecretVault } from "./secret-vault.js";

describe("FileSecretVault", () => {
  let dir: string;
  let filePath: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "mede-vault-"));
    filePath = path.join(dir, "credentials.json");
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("returns undefined for a missing key (and missing file)", () => {
    const vault = new FileSecretVault({ filePath });
    expect(vault.get("absent")).toBeUndefined();
  });

  it("persists a value across instances", () => {
    new FileSecretVault({ filePath }).set("oauth:azure", "token-1");
    expect(new FileSecretVault({ filePath }).get("oauth:azure")).toBe("token-1");
  });

  it("overwrites an existing key and keeps others", () => {
    const vault = new FileSecretVault({ filePath });
    vault.set("a", "1");
    vault.set("b", "2");
    vault.set("a", "1-updated");

    expect(vault.get("a")).toBe("1-updated");
    expect(vault.get("b")).toBe("2");
  });

  it("deletes a key without disturbing the rest", () => {
    const vault = new FileSecretVault({ filePath });
    vault.set("a", "1");
    vault.set("b", "2");
    vault.delete("a");

    expect(vault.get("a")).toBeUndefined();
    expect(vault.get("b")).toBe("2");
  });

  it("treats a corrupt file as an empty vault", () => {
    fs.writeFileSync(filePath, "{ not valid json");
    const vault = new FileSecretVault({ filePath });

    expect(vault.get("a")).toBeUndefined();
    vault.set("a", "1");
    expect(vault.get("a")).toBe("1");
  });

  it("creates the parent directory on first write", () => {
    const nested = path.join(dir, "deep", "nested", "credentials.json");
    new FileSecretVault({ filePath: nested }).set("k", "v");

    expect(fs.existsSync(nested)).toBe(true);
  });

  it("honors MEDE_VAULT_PATH environment variable if filePath is not explicitly passed", () => {
    const envFilePath = path.join(dir, "env-credentials.json");
    process.env.MEDE_VAULT_PATH = envFilePath;
    try {
      const vault = new FileSecretVault();
      vault.set("oauth:test", "val-env");
      expect(vault.get("oauth:test")).toBe("val-env");
      expect(fs.existsSync(envFilePath)).toBe(true);
    } finally {
      delete process.env.MEDE_VAULT_PATH;
    }
  });

  it("createSecretVault creates correct instances based on credentialsHelper parameter or env", () => {
    expect(createSecretVault()).toBeInstanceOf(FileSecretVault);
    expect(createSecretVault("system")).toBeInstanceOf(SystemKeychainSecretVault);
    expect(createSecretVault("keychain")).toBeInstanceOf(SystemKeychainSecretVault);
    expect(createSecretVault("wincred")).toBeInstanceOf(DockerCredentialHelperSecretVault);

    process.env.MEDE_CREDENTIALS_HELPER = "keychain";
    try {
      expect(createSecretVault()).toBeInstanceOf(SystemKeychainSecretVault);
    } finally {
      delete process.env.MEDE_CREDENTIALS_HELPER;
    }
  });
});
