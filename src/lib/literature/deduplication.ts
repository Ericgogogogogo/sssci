function normTitle(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "").trim()
}

function levenshtein(a: string, b: string) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

export function mergeDeduplicate(semantic: any[], google: any[]) {
  const merged: any[] = []
  const index: Record<string, number> = {}
  const add = (p: any, source: string) => {
    const key = normTitle(p.title ?? "")
    if (!key) return
    if (index[key] != null) {
      const i = index[key]
      const prev = merged[i]
      const prevCite = prev.citationCount ?? prev.citations ?? 0
      const curCite = p.citationCount ?? p.citations ?? 0
      if (p.doi && prev.doi && p.doi === prev.doi) {
        merged[i] = prevCite >= curCite ? prev : { ...prev, ...p, source: "merged" }
        return
      }
      const d = levenshtein(key, normTitle(prev.title))
      const sim = 1 - d / Math.max(key.length, prev.title.length)
      if (sim > 0.85) {
        merged[i] = prevCite >= curCite ? prev : { ...prev, ...p, source: "merged" }
        return
      }
    }
    index[key] = merged.length
    merged.push({
      title: p.title,
      authors: p.authors ?? [],
      year: p.year,
      abstract: p.abstract,
      citationCount: p.citationCount ?? p.citations,
      doi: p.doi,
      url: p.url ?? p.link,
      source,
    })
  }
  semantic.forEach((p) => add(p, "semantic"))
  google.forEach((p) => add(p, "google"))
  return merged
}