// Centralized CLI error presentation. Keeps stack traces away from end users
// (unless MEDE_DEBUG is set) and guarantees a non-zero exit code on failure so
// scripts and CI can detect that a command did not succeed.

export function formatCliError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || error.name;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function reportCliError(error: unknown): void {
  console.error(`Erro: ${formatCliError(error)}`);

  if (process.env.MEDE_DEBUG && error instanceof Error && error.stack) {
    console.error(error.stack);
  }

  process.exitCode = 1;
}
