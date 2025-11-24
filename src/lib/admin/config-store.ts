import { getRedis } from "@/lib/redis/client"

export type ProviderConfig = {
  id: string
  name: string
  enabled: boolean
  baseUrl?: string
  defaultModel?: string
  rateLimitPerMin?: number
  timeoutMs?: number
  maxRetries?: number
}

const KEY = "admin:providers"
let memory: ProviderConfig[] = []

async function loadFromRedis(): Promise<ProviderConfig[]> {
  const r = getRedis()
  if (!r) return memory
  const raw = await r.get(KEY)
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function saveToRedis(list: ProviderConfig[]) {
  const r = getRedis()
  memory = list
  if (!r) return
  await r.set(KEY, JSON.stringify(list))
}

export async function listProviders(): Promise<ProviderConfig[]> {
  const r = getRedis()
  if (r) {
    const list = await loadFromRedis()
    memory = list
    return list
  }
  return memory
}

export async function addProvider(p: Omit<ProviderConfig, "id">): Promise<ProviderConfig> {
  const list = await listProviders()
  const id = `${p.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
  const item: ProviderConfig = { id, ...p }
  const next = [item, ...list]
  await saveToRedis(next)
  return item
}

export async function updateProvider(id: string, patch: Partial<Omit<ProviderConfig, "id">>): Promise<ProviderConfig | null> {
  const list = await listProviders()
  const idx = list.findIndex((x) => x.id === id)
  if (idx < 0) return null
  const updated = { ...list[idx], ...patch }
  const next = [...list]
  next[idx] = updated
  await saveToRedis(next)
  return updated
}

export async function removeProvider(id: string): Promise<boolean> {
  const list = await listProviders()
  const next = list.filter((x) => x.id !== id)
  const changed = next.length !== list.length
  if (changed) await saveToRedis(next)
  return changed
}

export async function getProvider(name: string): Promise<ProviderConfig | null> {
  const list = await listProviders()
  const n = name.toLowerCase()
  const found = list.find((p) => p.name.toLowerCase() === n)
  return found ?? null
}

export async function isProviderEnabled(name: string): Promise<boolean> {
  const p = await getProvider(name)
  if (!p) return true
  return Boolean(p.enabled)
}
