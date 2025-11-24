import { retryableAPICall, withTimeout } from "@/lib/ai/retry"
import { TimeoutError } from "@/lib/errors/handler"

test("retry succeeds on transient error", async () => {
  let calls = 0
  const fn = async () => {
    calls++
    if (calls < 2) throw new Error("ECONNRESET")
    return 42
  }
  const out = await retryableAPICall(fn, { maxRetries: 3, baseDelayMs: 1 })
  expect(out).toBe(42)
})

test("withTimeout throws TimeoutError", async () => {
  await expect(withTimeout(async () => new Promise((res) => setTimeout(() => res(1), 50)), 10)).rejects.toBeInstanceOf(TimeoutError)
})