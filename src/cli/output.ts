// Centralizes how the CLI emits results so every command honors the global
// `--json` flag uniformly. In text mode the human-readable string is printed as
// is; in JSON mode it is wrapped in a stable envelope so scripts can consume the
// output and the exit code together. Errors use the matching envelope in
// error-handler.ts.

export type OutputFormat = "text" | "json";

let currentFormat: OutputFormat = "text";

export function setOutputFormat(format: OutputFormat): void {
  currentFormat = format;
}

export function getOutputFormat(): OutputFormat {
  return currentFormat;
}

// Prints a successful command result respecting the active format.
export function emitResult(output: string): void {
  if (currentFormat === "json") {
    console.log(JSON.stringify({ ok: true, output }));
    return;
  }

  console.log(output);
}

// Prints a progress message during long-running tasks. Emits to stderr so it does not interfere with stdout.
export function emitProgress(message: string): void {
  if (currentFormat === "text") {
    console.error(message);
  }
}
