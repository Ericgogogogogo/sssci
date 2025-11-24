import { getProvider } from "@/lib/admin/config-store"
import { allowRateLimit } from "@/lib/utils/rate-limit"
import { logApiCall } from "@/lib/monitoring/logger"
import { retryableAPICall } from "@/lib/ai/retry"

export async function sendEmail(to: string, subject: string, text: string) {
  const cfg = await getProvider("resend")
  if (cfg && cfg.enabled === false) return
  
  if (cfg?.rateLimitPerMin) {
    const rl = allowRateLimit("provider:resend", cfg.rateLimitPerMin, 60_000)
    if (!rl.allowed) return
  }
  
  const key = process.env.RESEND_API_KEY
  if (!key || !to) return
  
  const start = Date.now()
  const base = cfg?.baseUrl ?? "https://api.resend.com/emails"
  
  try {
    const res = await retryableAPICall(() => 
      fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ from: "alerts@sssci.app", to, subject, text }),
      }), { maxRetries: cfg?.maxRetries ?? 2, timeoutMs: cfg?.timeoutMs ?? 10000 }
    )
    
    await logApiCall({ 
      route: "/api/notifications/email", 
      status: res.status, 
      durationMs: Date.now() - start, 
      provider: "internal", 
      endpoint: "resend/emails", 
      success: res.ok 
    })
  } catch (error) {
    await logApiCall({ 
      route: "/api/notifications/email", 
      status: 500, 
      durationMs: Date.now() - start, 
      provider: "internal", 
      endpoint: "resend/emails", 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}