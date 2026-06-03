import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";

// Persistent store for OAuth credentials (Q2). Deliberately NOT the OS keychain:
// keytar is archived + native (breaks on headless Linux/CI/containers), and
// shelling out to `security`/`cmdkey`/`secret-tool` is fragile in exactly those
// environments. Instead we follow what AWS CLI / gcloud / gh / npm / docker do by
// default — a file under the user's data dir with restricted permissions. A
// keychain-backed credential helper can be plugged behind this interface later
// without touching callers. Honest about protection: the primary safeguard is the
// 0600 file mode, not strong crypto. The secret lives OUTSIDE the project and is
// never written to mede.config.json.
export interface ISecretVault {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

// Resolves the per-user data directory following platform conventions:
// Windows -> %APPDATA%\mede-cli ; macOS -> ~/Library/Application Support/mede-cli ;
// Linux/other -> $XDG_DATA_HOME/mede-cli or ~/.local/share/mede-cli.
export function resolveUserDataDir(): string {
  if (process.platform === "win32") {
    const appData = process.env.APPDATA?.trim();
    const base =
      appData && appData.length > 0 ? appData : path.join(os.homedir(), "AppData", "Roaming");
    return path.join(base, "mede-cli");
  }

  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "mede-cli");
  }

  const xdg = process.env.XDG_DATA_HOME?.trim();
  const base = xdg && xdg.length > 0 ? xdg : path.join(os.homedir(), ".local", "share");
  return path.join(base, "mede-cli");
}

export interface FileSecretVaultOptions {
  // Overridable for tests; defaults to <userDataDir>/credentials.json.
  filePath?: string;
}

export class FileSecretVault implements ISecretVault {
  private readonly filePath: string;

  public constructor(options?: FileSecretVaultOptions) {
    const envPath = process.env.MEDE_VAULT_PATH?.trim() || process.env.MEDE_CREDENTIALS_PATH?.trim();
    this.filePath = options?.filePath ?? (envPath && envPath.length > 0 ? envPath : path.join(resolveUserDataDir(), "credentials.json"));
  }

  public get(key: string): string | undefined {
    const store = this.read();
    const value = store[key];
    return typeof value === "string" ? value : undefined;
  }

  public set(key: string, value: string): void {
    const store = this.read();
    store[key] = value;
    this.write(store);
  }

  public delete(key: string): void {
    const store = this.read();
    if (key in store) {
      delete store[key];
      this.write(store);
    }
  }

  private read(): Record<string, string> {
    let raw: string;
    try {
      raw = fs.readFileSync(this.filePath, "utf8");
    } catch {
      // Missing file == empty vault. Any other read error also degrades to empty
      // rather than crashing a command over a corrupt/locked file.
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, string>;
      }
    } catch {
      // Corrupt file: treat as empty; the next write overwrites it cleanly.
    }

    return {};
  }

  private write(store: Record<string, string>): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    // mode 0o600: owner read/write only. Effective on POSIX; on Windows the bit is
    // largely ignored, but %APPDATA% is already a per-user, ACL-scoped location.
    fs.writeFileSync(this.filePath, JSON.stringify(store, null, 2), { mode: 0o600 });
    try {
      fs.chmodSync(this.filePath, 0o600);
    } catch {
      // chmod is a no-op / may fail on some filesystems (e.g. Windows) — ignore.
    }
  }
}

export class SystemKeychainSecretVault implements ISecretVault {
  public get(key: string): string | undefined {
    try {
      if (process.platform === "darwin") {
        const stdout = execSync(`security find-generic-password -s mede-cli -a "${key}" -w`, {
          stdio: ["ignore", "pipe", "ignore"],
        });
        return stdout.toString().trim() || undefined;
      }
      
      if (process.platform === "win32") {
        const script = `$vault = New-Object Windows.Security.Credentials.PasswordVault; try { $cred = $vault.Retrieve('mede-cli', '${key}'); $cred.RetrievePassword(); Write-Output $cred.Password } catch {}`;
        const stdout = execSync(`powershell -NoProfile -NonInteractive -Command "${script}"`, {
          stdio: ["ignore", "pipe", "ignore"],
        });
        return stdout.toString().trim() || undefined;
      }
      
      const stdout = execSync(`secret-tool lookup service mede-cli account "${key}"`, {
        stdio: ["ignore", "pipe", "ignore"],
      });
      return stdout.toString().trim() || undefined;
    } catch {
      return undefined;
    }
  }

  public set(key: string, value: string): void {
    try {
      if (process.platform === "darwin") {
        execSync(`security add-generic-password -s mede-cli -a "${key}" -w "${value}" -U`, {
          stdio: "ignore",
        });
      } else if (process.platform === "win32") {
        const script = `$vault = New-Object Windows.Security.Credentials.PasswordVault; $cred = New-Object Windows.Security.Credentials.PasswordCredential('mede-cli', '${key}', '${value}'); $vault.Add($cred)`;
        execSync(`powershell -NoProfile -NonInteractive -Command "${script}"`, {
          stdio: "ignore",
        });
      } else {
        execSync(`secret-tool store --label="Mede CLI" service mede-cli account "${key}"`, {
          input: value,
          stdio: ["pipe", "ignore", "ignore"],
        });
      }
    } catch (err) {
      throw new Error(`Falha ao gravar no chaveiro do sistema: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  public delete(key: string): void {
    try {
      if (process.platform === "darwin") {
        execSync(`security delete-generic-password -s mede-cli -a "${key}"`, {
          stdio: "ignore",
        });
      } else if (process.platform === "win32") {
        const script = `$vault = New-Object Windows.Security.Credentials.PasswordVault; try { $cred = $vault.Retrieve('mede-cli', '${key}'); $vault.Remove($cred) } catch {}`;
        execSync(`powershell -NoProfile -NonInteractive -Command "${script}"`, {
          stdio: "ignore",
        });
      } else {
        execSync(`secret-tool clear service mede-cli account "${key}"`, {
          stdio: "ignore",
        });
      }
    } catch {
      // ignore
    }
  }
}

export class DockerCredentialHelperSecretVault implements ISecretVault {
  private readonly helperBin: string;

  constructor(helperName: string) {
    this.helperBin = helperName.startsWith("docker-credential-")
      ? helperName
      : `docker-credential-${helperName}`;
  }

  public get(key: string): string | undefined {
    try {
      const stdout = execSync(`${this.helperBin} get`, {
        input: key,
        stdio: ["pipe", "pipe", "ignore"],
      });
      const parsed = JSON.parse(stdout.toString()) as { Secret?: string };
      return parsed.Secret;
    } catch {
      return undefined;
    }
  }

  public set(key: string, value: string): void {
    try {
      const payload = JSON.stringify({
        ServerURL: key,
        Username: "mede-cli",
        Secret: value,
      });
      execSync(`${this.helperBin} store`, {
        input: payload,
        stdio: ["pipe", "ignore", "ignore"],
      });
    } catch (err) {
      throw new Error(`Falha ao gravar via helper ${this.helperBin}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  public delete(key: string): void {
    try {
      execSync(`${this.helperBin} erase`, {
        input: key,
        stdio: ["pipe", "ignore", "ignore"],
      });
    } catch {
      // ignore
    }
  }
}

export function createSecretVault(credentialsHelper?: string): ISecretVault {
  const helper = credentialsHelper?.trim() || process.env.MEDE_CREDENTIALS_HELPER?.trim();
  if (!helper) {
    return new FileSecretVault();
  }
  if (helper === "system" || helper === "keychain") {
    return new SystemKeychainSecretVault();
  }
  return new DockerCredentialHelperSecretVault(helper);
}
