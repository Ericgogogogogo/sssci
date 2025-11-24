type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export function allowRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const e = store.get(key);
  if (!e || now > e.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs } as const;
  }
  if (e.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: e.resetAt } as const;
  }
  e.count += 1;
  store.set(key, e);
  return { allowed: true, remaining: Math.max(0, limit - e.count), resetAt: e.resetAt } as const;
}