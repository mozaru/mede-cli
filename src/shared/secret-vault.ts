import fs from "node:fs";
import os from "node:os";
import path from "node:path";

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
    this.filePath = options?.filePath ?? path.join(resolveUserDataDir(), "credentials.json");
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
