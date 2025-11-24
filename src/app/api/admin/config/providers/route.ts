import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { listProviders, addProvider } from "@/lib/admin/config-store"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "admin.errors.forbidden" }, { status: 403 })
  const list = await listProviders()
  return NextResponse.json({ providers: list })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "admin.errors.forbidden" }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  if (!name) return NextResponse.json({ error: "admin.errors.invalid_params" }, { status: 400 })
  const enabled = Boolean(body?.enabled ?? true)
  const baseUrl = typeof body?.baseUrl === "string" ? body.baseUrl.trim() : undefined
  const defaultModel = typeof body?.defaultModel === "string" ? body.defaultModel.trim() : undefined
  const rateLimitPerMin = Number.isFinite(Number(body?.rateLimitPerMin)) ? Number(body.rateLimitPerMin) : undefined
  const timeoutMs = Number.isFinite(Number(body?.timeoutMs)) ? Number(body.timeoutMs) : undefined
  const maxRetries = Number.isFinite(Number(body?.maxRetries)) ? Number(body.maxRetries) : undefined
  const created = await addProvider({ name, enabled, baseUrl, defaultModel, rateLimitPerMin, timeoutMs, maxRetries })
  return NextResponse.json({ provider: created })
}
