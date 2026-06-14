// Retries an async operation with exponential backoff and jitter. Built for the
// LLM calls, where transient network/5xx/timeout failures are common and worth
// retrying, but permanent failures (bad API key, malformed request) are not.

export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

function defaultRetries(): number {
  const fromEnv = Number(process.env.MEDE_LLM_RETRIES);
  return Number.isInteger(fromEnv) && fromEnv >= 0 ? fromEnv : 5;
}

// Does not retry failures that look permanent (auth/validation/not-found).
export function defaultShouldRetry(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return !/(\b400\b|\b401\b|\b403\b|\b404\b|unauthorized|forbidden|invalid api key|api key)/.test(
    message,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const retries = options?.retries ?? defaultRetries();
  const baseDelayMs = options?.baseDelayMs ?? 500;
  const maxDelayMs = options?.maxDelayMs ?? 8000;
  const shouldRetry = options?.shouldRetry ?? defaultShouldRetry;

  let attempt = 0;

  for (;;) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;

      if (attempt > retries || !shouldRetry(error)) {
        throw error;
      }

      const backoff = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const jitter = Math.floor(Math.random() * Math.min(250, backoff));
      const delayMs = backoff + jitter;

      options?.onRetry?.(error, attempt, delayMs);
      await sleep(delayMs);
    }
  }
}
