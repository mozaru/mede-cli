import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger.js";

describe("logger", () => {
  const previousLogLevel = process.env.MEDE_LOG_LEVEL;
  const previousDebug = process.env.MEDE_DEBUG;
  const previousLogFormat = process.env.MEDE_LOG_FORMAT;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    delete process.env.MEDE_LOG_LEVEL;
    delete process.env.MEDE_DEBUG;
    delete process.env.MEDE_LOG_FORMAT;
    consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
    if (previousLogLevel === undefined) {
      delete process.env.MEDE_LOG_LEVEL;
    } else {
      process.env.MEDE_LOG_LEVEL = previousLogLevel;
    }
    if (previousDebug === undefined) {
      delete process.env.MEDE_DEBUG;
    } else {
      process.env.MEDE_DEBUG = previousDebug;
    }
    if (previousLogFormat === undefined) {
      delete process.env.MEDE_LOG_FORMAT;
    } else {
      process.env.MEDE_LOG_FORMAT = previousLogFormat;
    }
  });

  it("uses warn threshold by default", () => {
    logger.info("hidden");
    logger.warn("shown");

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith("[warn]", "shown");
  });

  it("honors explicit log levels", () => {
    process.env.MEDE_LOG_LEVEL = "debug";

    logger.debug("debug");
    logger.info("info");
    logger.error("error");

    expect(consoleError).toHaveBeenCalledWith("[debug]", "debug");
    expect(consoleError).toHaveBeenCalledWith("[info]", "info");
    expect(consoleError).toHaveBeenCalledWith("[error]", "error");
  });

  it("uses MEDE_DEBUG when the configured level is invalid", () => {
    process.env.MEDE_LOG_LEVEL = "verbose";
    process.env.MEDE_DEBUG = "1";

    logger.debug("debug");

    expect(consoleError).toHaveBeenCalledWith("[debug]", "debug");
  });

  it("can emit structured JSON logs", () => {
    process.env.MEDE_LOG_FORMAT = "json";

    logger.warn("event", { id: 7 });

    expect(consoleError).toHaveBeenCalledTimes(1);
    const [payload] = consoleError.mock.calls[0] as [string];
    expect(JSON.parse(payload)).toMatchObject({
      level: "warn",
      message: 'event {"id":7}',
    });
  });
});
