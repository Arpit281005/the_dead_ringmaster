/**
 * In-memory sliding-window rate limiter + min-interval helper (per process).
 * Adequate for single-instance SQLite/local and small event deploys.
 */

type Bucket = number[];

const buckets = new Map<string, Bucket>();
const lastHit = new Map<string, number>();

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const prior = buckets.get(key) ?? [];
  const recent = prior.filter((t) => t > cutoff);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    const oldest = recent[0] ?? now;
    return { allowed: false, retryAfterMs: Math.max(0, oldest + windowMs - now) };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true, retryAfterMs: 0 };
}

/** Enforce a minimum gap between hits on the same key (e.g. per-node scan). */
export function checkMinInterval(
  key: string,
  minIntervalMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const prev = lastHit.get(key);
  if (prev !== undefined && now - prev < minIntervalMs) {
    return { allowed: false, retryAfterMs: minIntervalMs - (now - prev) };
  }
  lastHit.set(key, now);
  return { allowed: true, retryAfterMs: 0 };
}
