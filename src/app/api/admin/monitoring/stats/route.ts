import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"
import { evaluateCostAlerts } from "@/lib/monitoring/alerts"

export async function GET() {
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  const logs = await prisma.apiCallLog.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
  })
  const totalCalls = logs.length
  const successCount = logs.filter((l: any) => l.status >= 200 && l.status < 300).length
  const avgLatency = Math.round(
    totalCalls ? logs.reduce((acc: number, l: any) => acc + (l.latencyMs ?? l.durationMs ?? 0), 0) / totalCalls : 0
  )
  const successRate = totalCalls ? +(successCount / totalCalls).toFixed(3) : 0
  const alerts = await evaluateCostAlerts()
  return NextResponse.json({ totalCalls, totalCost: +alerts.totalCost.toFixed(4), avgLatencyMs: avgLatency, successRate, alerts: alerts.alerts })
}