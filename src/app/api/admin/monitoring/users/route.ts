import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  const logs = await prisma.apiCallLog.findMany({ where: { createdAt: { gte: since } } })
  const byUser: Record<string, { userId: string; calls: number; cost: number }> = {}
  for (const l of logs) {
    const uid = l.userId ?? "unknown"
    byUser[uid] ??= { userId: uid, calls: 0, cost: 0 }
    byUser[uid].calls += 1
    byUser[uid].cost += l.costUsd ?? 0
  }
  const topByCost = Object.values(byUser).sort((a, b) => b.cost - a.cost).slice(0, 10)
  const topByCalls = Object.values(byUser).sort((a, b) => b.calls - a.calls).slice(0, 10)
  return NextResponse.json({ topByCost, topByCalls })
}