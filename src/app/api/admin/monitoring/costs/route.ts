import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const logs = await prisma.apiCallLog.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
  })
  const byDay: Record<string, { date: string; calls: number; cost: number }> = {}
  for (const l of logs) {
    const d = new Date(l.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    byDay[key] ??= { date: key, calls: 0, cost: 0 }
    byDay[key].calls += 1
    byDay[key].cost += l.costUsd ?? 0
  }
  const daily = Object.values(byDay)
  const apiDist: Record<string, number> = {}
  for (const l of logs) {
    const provider = l.apiProvider ?? (l.route.includes("literature/search") ? "serpapi" : "openai")
    apiDist[provider] = (apiDist[provider] ?? 0) + 1
  }
  const modelUsage: Record<string, number> = {}
  for (const l of logs) {
    if (l.model) modelUsage[l.model] = (modelUsage[l.model] ?? 0) + 1
  }
  return NextResponse.json({ daily, apiDist, modelUsage })
}