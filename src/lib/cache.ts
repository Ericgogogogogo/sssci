type Entry<T> = { value: T; expiresAt: number }
const memory = new Map<string, Entry<any>>()

export async function cacheGet<T>(key: string): Promise<T | null> {
  const e = memory.get(key)
  if (!e) return null
  if (Date.now() > e.expiresAt) { memory.delete(key); return null }
  return e.value as T
}

export async function cacheSet<T>(key: string, value: T, ttlMs: number): Promise<void> {
  memory.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function hashKey(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return `h${Math.abs(h)}`
}