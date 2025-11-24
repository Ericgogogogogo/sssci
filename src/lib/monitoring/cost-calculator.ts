export const PRICING: Record<string, any> = {
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  "claude-3-opus": { input: 0.015, output: 0.075 },
  serpapi: 0.001,
}

export function calculateCost(provider: string, model: string | undefined, tokens?: { input?: number; output?: number }): number {
  if (provider === "serpapi") return PRICING.serpapi
  const p = PRICING[model ?? ""]
  if (!p) return 0
  const inK = (tokens?.input ?? 0) / 1000
  const outK = (tokens?.output ?? 0) / 1000
  return +(inK * p.input + outK * p.output).toFixed(6)
}