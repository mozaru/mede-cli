// Minimal leveled logger. Everything goes to stderr so it never pollutes stdout,
// which carries the actual command output a user may pipe or capture.
//
// Verbosity is controlled by env vars:
//   MEDE_LOG_LEVEL = error | warn | info | debug   (explicit level)
//   MEDE_DEBUG     = any value                      (shortcut for debug)
// Default level is "warn", so info/debug are silent unless enabled.

type LogLevel = "error" | "warn" | "info" | "debug";

const LEVEL_ORDER: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function currentThreshold(): number {
  const configured = (process.env.MEDE_LOG_LEVEL ?? "").toLowerCase();
  if (configured in LEVEL_ORDER) {
    return LEVEL_ORDER[configured as LogLevel];
  }
  if (process.env.MEDE_DEBUG) {
    return LEVEL_ORDER.debug;
  }
  return LEVEL_ORDER.warn;
}

function emit(level: LogLevel, args: unknown[]): void {
  if (LEVEL_ORDER[level] <= currentThreshold()) {
    console.error(`[${level}]`, ...args);
  }
}

export const logger = {
  error: (...args: unknown[]): void => emit("error", args),
  warn: (...args: unknown[]): void => emit("warn", args),
  info: (...args: unknown[]): void => emit("info", args),
  debug: (...args: unknown[]): void => emit("debug", args),
};
