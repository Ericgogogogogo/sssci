import Redis from "ioredis";

let client: Redis | null = null;

export function getRedis() {
  if (client) return client;
  const url = process.env.REDIS_URL;
  try {
    client = url ? new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true }) : new Redis({ maxRetriesPerRequest: 2, lazyConnect: true });
  } catch {
    client = null;
  }
  return client;
}