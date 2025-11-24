import { prisma } from "@/lib/db/client"
import { sendEmail } from "@/lib/notifications/email"

export async function evaluateCostAlerts() {
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  const logs = await prisma.apiCallLog.findMany({ where: { createdAt: { gte: since } } })
  const totalCost = logs.reduce((acc, l) => acc + (l.costUsd ?? 0), 0)
  const alerts: string[] = []
  if (totalCost > 100) alerts.push("单日成本超过$100")
  const errorRate = logs.length ? logs.filter((l) => l.status >= 400).length / logs.length : 0
  if (errorRate > 0.1) alerts.push("API错误率>10%")
  if (alerts.length) {
    const admin = process.env.ADMIN_ALERT_EMAIL ?? ""
    if (admin) await sendEmail(admin, "成本告警", alerts.join("\n"))
  }
  return { totalCost, errorRate, alerts }
}