import { APIError, RateLimitError, TimeoutError } from "@/lib/errors/handler"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type RetryOptions = {
  maxRetries?: number
  baseDelayMs?: number
  timeoutMs?: number
  isRetriable?: (error: unknown) => boolean
}

export async function withTimeout<T>(fn: () => Promise<T>, timeoutMs = 30000): Promise<T> {
  return await Promise.race([
    fn(),
    new Promise<T>((_, reject) => setTimeout(() => reject(new TimeoutError()), timeoutMs)) as Promise<T>,
  ])
}

export function defaultIsRetriable(error: any): boolean {
  if (!error) return false
  if (error instanceof TimeoutError) return true
  if (error instanceof RateLimitError) return true
  const status = Number(error?.status ?? error?.statusCode)
  if (Number.isFinite(status)) {
    if (status >= 500) return true
    if (status === 429) return true
    if (status >= 400 && status < 500) return false
  }
  const msg = String(error?.message ?? "")
  if (/network|fetch failed|ECONNRESET|ENOTFOUND|ETIMEDOUT/i.test(msg)) return true
  return false
}

export async function retryableAPICall<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxRetries = options.maxRetries ?? 3
  const baseDelayMs = options.baseDelayMs ?? 1000
  const timeoutMs = options.timeoutMs ?? 30000
  const isRetriable = options.isRetriable ?? defaultIsRetriable
  let lastError: unknown
  for (let i = 0; i < maxRetries; i++) {
    try {
      const attempt = async () => fn()
      return await withTimeout(attempt, timeoutMs)
    } catch (err) {
      lastError = err
      const shouldRetry = isRetriable(err)
      if (!shouldRetry || i === maxRetries - 1) throw err
      const backoff = Math.pow(2, i) * baseDelayMs
      await delay(backoff)
    }
  }
  throw lastError instanceof Error ? lastError : new APIError("API调用失败")
}