#!/usr/bin/env node
import { runCli } from "./runner.js";
import { reportCliError } from "./error-handler.js";

// Final safety net: anything that escapes runCli (unexpected rejection) still
// produces a clean message and a non-zero exit code instead of a raw crash.
runCli().catch((error) => {
  reportCliError(error);
});
