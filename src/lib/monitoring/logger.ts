import { prisma } from "@/lib/db/client"
import { calculateCost } from "./cost-calculator"

export type LogParams = {
  route: string
  status: number
  durationMs: number
  provider?: "openai" | "anthropic" | "serpapi" | "internal"
  endpoint?: string
  model?: string
  inputTokens?: number
  outputTokens?: number
  costUsd?: number
  success?: boolean
  userId?: string
  projectId?: string
  error?: string
}

export async function logApiCall(params: LogParams) {
  const cost = params.costUsd ?? calculateCost(params.provider ?? "internal", params.model, {
    input: params.inputTokens,
    output: params.outputTokens,
  })
  try {
    await prisma.apiCallLog.create({
      data: {
        route: params.route,
        status: params.status,
        durationMs: params.durationMs,
        error: params.error,
        apiProvider: params.provider,
        endpoint: params.endpoint,
        model: params.model,
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        costUsd: cost,
        latencyMs: params.durationMs,
        success: params.success ?? (params.status >= 200 && params.status < 300),
        userId: params.userId,
        projectId: params.projectId,
      },
    })
  } catch {}
}