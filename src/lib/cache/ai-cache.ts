import { createHash } from "crypto";
import { getRedis } from "@/lib/redis/client";

type CacheOptions = { ttlSeconds?: number; forceRefresh?: boolean; model?: string };

const memoryStore = new Map<string, { value: string; expireAt: number }>();
let hits = 0;
let misses = 0;

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

function shouldCachePrompt(prompt: string) {
  const p = prompt.toLowerCase();
  return !/(当前|最新|今天|today|current|latest)/.test(p);
}

export async function cachedAICall(prompt: string, model: string, options?: CacheOptions, generator?: () => Promise<string>) {
  const ttl = options?.ttlSeconds ?? 86400;
  const force = options?.forceRefresh ?? false;
  const useCache = shouldCachePrompt(prompt) && !force;
  const key = `ai:${model}:${sha256(prompt)}`;
  if (!useCache) return generator ? await generator() : "";
  const redis = getRedis();
  if (redis) {
    const cached = await redis.get(key);
    if (cached) {
      hits++;
      return cached;
    }
    misses++;
    const val = generator ? await generator() : "";
    await redis.set(key, val, "EX", ttl);
    return val;
  }
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (entry && entry.expireAt > now) {
    hits++;
    return entry.value;
  }
  misses++;
  const val = generator ? await generator() : "";
  memoryStore.set(key, { value: val, expireAt: now + ttl * 1000 });
  return val;
}

export async function clearCache(prefix: string = "ai:") {
  const redis = getRedis();
  if (redis) {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length) await redis.del(keys);
  }
  memoryStore.clear();
  hits = 0;
  misses = 0;
}

export async function getCacheStats() {
  const redis = getRedis();
  let keyCount = 0;
  if (redis) {
    const keys = await redis.keys("ai:*");
    keyCount = keys.length;
  } else {
    keyCount = memoryStore.size;
  }
  return { hits, misses, keys: keyCount };
}