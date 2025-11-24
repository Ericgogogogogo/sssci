import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updateProvider, removeProvider } from "@/lib/admin/config-store"

export async function PATCH(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "admin.errors.forbidden" }, { status: 403 })
  const { id } = await context.params
  const body = await _.json().catch(() => ({}))
  const patch: any = {}
  if (typeof body?.name === "string") patch.name = body.name.trim()
  if (typeof body?.enabled !== "undefined") patch.enabled = Boolean(body.enabled)
  if (typeof body?.baseUrl === "string") patch.baseUrl = body.baseUrl.trim()
  if (typeof body?.defaultModel === "string") patch.defaultModel = body.defaultModel.trim()
  if (typeof body?.rateLimitPerMin !== "undefined") patch.rateLimitPerMin = Number(body.rateLimitPerMin)
  if (typeof body?.timeoutMs !== "undefined") patch.timeoutMs = Number(body.timeoutMs)
  if (typeof body?.maxRetries !== "undefined") patch.maxRetries = Number(body.maxRetries)
  const updated = await updateProvider(id, patch)
  if (!updated) return NextResponse.json({ error: "admin.errors.not_found" }, { status: 404 })
  return NextResponse.json({ provider: updated })
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "admin.errors.forbidden" }, { status: 403 })
  const { id } = await context.params
  const ok = await removeProvider(id)
  return NextResponse.json({ ok })
}
