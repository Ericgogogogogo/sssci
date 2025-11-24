type SemanticPaper = {
  title: string
  authors: string[]
  year?: number
  abstract?: string
  citationCount?: number
  doi?: string
  url?: string
}

type GooglePaper = {
  title: string
  authors: string[]
  year?: number
  snippet?: string
  citations?: number
  link?: string
}

import { retryableAPICall } from "@/lib/ai/retry"
import { logApiCall } from "@/lib/monitoring/logger"
import { getProvider } from "@/lib/admin/config-store"
import { allowRateLimit } from "@/lib/utils/rate-limit"

export async function searchSemanticScholar(query: string, limit = 20, offset = 0): Promise<{ papers: SemanticPaper[]; total?: number }> {
  const cfg = await getProvider("semantic_scholar")
  if (cfg && cfg.enabled === false) {
    await logApiCall({ route: "/api/literature/search", status: 503, durationMs: 0, provider: "internal", endpoint: "semantic_scholar", success: false, error: "disabled" })
    return { papers: [], total: 0 }
  }
  if (cfg?.rateLimitPerMin) {
    const rl = allowRateLimit("provider:semantic_scholar", cfg.rateLimitPerMin, 60_000)
    if (!rl.allowed) {
      await logApiCall({ route: "/api/literature/search", status: 429, durationMs: 0, provider: "internal", endpoint: "semantic_scholar", success: false, error: "rate_limited" })
      return { papers: [], total: 0 }
    }
  }
  const base = cfg?.baseUrl ?? "https://api.semanticscholar.org/graph/v1/paper/search"
  const url = new URL(base)
  url.searchParams.set("query", query)
  url.searchParams.set("limit", String(limit))
  url.searchParams.set("offset", String(offset))
  url.searchParams.set("fields", "title,authors,year,abstract,citationCount,doi,url")
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (process.env.SEMANTIC_SCHOLAR_API_KEY) headers["x-api-key"] = process.env.SEMANTIC_SCHOLAR_API_KEY
  const start = Date.now()
  const res = await retryableAPICall(() => fetch(url.toString(), { headers }), { maxRetries: cfg?.maxRetries ?? 3, timeoutMs: cfg?.timeoutMs ?? 30000 })
  if (!res.ok) {
    const text = await res.text()
    await logApiCall({ route: "/api/literature/search", status: res.status, durationMs: Date.now() - start, provider: "internal", endpoint: "semantic_scholar", success: false, error: text })
    return { papers: [], total: 0 }
  }
  const data = await res.json()
  const papers: SemanticPaper[] = (data?.data ?? []).map((p: any) => ({
    title: p.title,
    authors: Array.isArray(p.authors) ? p.authors.map((a: any) => a.name).filter(Boolean) : [],
    year: p.year,
    abstract: p.abstract,
    citationCount: p.citationCount,
    doi: p.doi,
    url: p.url,
  }))
  await logApiCall({ route: "/api/literature/search", status: 200, durationMs: Date.now() - start, provider: "internal", endpoint: "semantic_scholar", success: true })
  return { papers, total: data?.total }
}

export async function searchGoogleScholar(query: string, limit = 20, yearRange?: { from?: number; to?: number }): Promise<{ papers: GooglePaper[] }> {
  const cfg = await getProvider("serpapi")
  if (cfg && cfg.enabled === false) {
    await logApiCall({ route: "/api/literature/search", status: 503, durationMs: 0, provider: "serpapi", endpoint: "google_scholar", success: false, error: "disabled" })
    return { papers: [] }
  }
  if (cfg?.rateLimitPerMin) {
    const rl = allowRateLimit("provider:serpapi", cfg.rateLimitPerMin, 60_000)
    if (!rl.allowed) {
      await logApiCall({ route: "/api/literature/search", status: 429, durationMs: 0, provider: "serpapi", endpoint: "google_scholar", success: false, error: "rate_limited" })
      return { papers: [] }
    }
  }
  const base = cfg?.baseUrl ?? "https://serpapi.com/search.json"
  const url = new URL(base)
  url.searchParams.set("engine", "google_scholar")
  url.searchParams.set("q", query)
  if (process.env.SERPAPI_API_KEY) url.searchParams.set("api_key", process.env.SERPAPI_API_KEY)
  if (yearRange?.from) url.searchParams.set("as_ylo", String(yearRange.from))
  if (yearRange?.to) url.searchParams.set("as_yhi", String(yearRange.to))
  const start = Date.now()
  const res = await retryableAPICall(() => fetch(url.toString()), { maxRetries: cfg?.maxRetries ?? 3, timeoutMs: cfg?.timeoutMs ?? 30000 })
  if (!res.ok) {
    const text = await res.text()
    await logApiCall({ route: "/api/literature/search", status: res.status, durationMs: Date.now() - start, provider: "serpapi", endpoint: "google_scholar", success: false, error: text, costUsd: 0.001 })
    return { papers: [] }
  }
  const data = await res.json()
  const results = (data?.organic_results ?? []) as any[]
  const papers: GooglePaper[] = results.slice(0, limit).map((r: any) => ({
    title: r.title,
    authors: Array.isArray(r.publication_info?.authors) ? r.publication_info.authors.map((a: any) => a.name).filter(Boolean) : [],
    year: r.publication_info?.year,
    snippet: r.snippet,
    citations: r.inline_links?.cited_by?.total,
    link: r.link,
  }))
  await logApiCall({ route: "/api/literature/search", status: 200, durationMs: Date.now() - start, provider: "serpapi", endpoint: "google_scholar", success: true, costUsd: 0.001 })
  return { papers }
}

export type UnifiedPaper = {
  title: string
  authors: string[]
  year?: number
  abstract?: string
  citationCount?: number
  doi?: string
  url?: string
  source: "semantic" | "google" | "merged"
}

import { withTimeout } from "@/lib/ai/retry"
import { APIError } from "@/lib/errors/handler"
export async function summarizePaper(paper: UnifiedPaper): Promise<{ summary: string; contributions: string[]; methods: string[] }> {
  const input = `${paper.title} ${paper.abstract ?? paper.authors.join(", ")}`.slice(0, 1000)
  const cfg = await getProvider("openai")
  if (cfg && cfg.enabled === false) {
    return { summary: (paper.abstract ?? "摘要不可用").slice(0, 150), contributions: [], methods: [] }
  }
  if (process.env.OPENAI_API_KEY) {
    const start = Date.now()
    const base = cfg?.baseUrl ?? "https://api.openai.com/v1/chat/completions"
    const model = cfg?.defaultModel ?? "gpt-3.5-turbo"
    const res = await withTimeout(() =>
      retryableAPICall(() =>
        fetch(base, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "你是学术助手，请用中文生成150字摘要并提取关键贡献和方法。" },
              { role: "user", content: input },
            ],
            temperature: 0.3,
          }),
        })
      , { maxRetries: cfg?.maxRetries ?? 3, timeoutMs: cfg?.timeoutMs ?? 30000 })
    , cfg?.timeoutMs ?? 30000)
    if (res.ok) {
      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content ?? ""
      const usage = data?.usage ?? { prompt_tokens: 0, completion_tokens: 0 }
      await logApiCall({ route: "/api/literature/search", status: 200, durationMs: Date.now() - start, provider: "openai", endpoint: "chat.completions", model: data?.model ?? "gpt-3.5-turbo", inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens, success: true })
      return { summary: content.slice(0, 300), contributions: [], methods: [] }
    }
    const text = await res.text().catch(() => "")
    await logApiCall({ route: "/api/literature/search", status: res.status, durationMs: Date.now() - start, provider: "openai", endpoint: "chat.completions", success: false, error: text })
    throw new APIError(text || "OpenAI调用失败", res.status)
  }
  return { summary: (paper.abstract ?? "摘要不可用").slice(0, 150), contributions: [], methods: [] }
}
