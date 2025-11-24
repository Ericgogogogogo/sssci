import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "projects.errors.not_logged_in" }, { status: 401 });
  const { id } = await context.params;
  const p = await prisma.project.findUnique({ where: { id } });
  if (!p) return NextResponse.json({ error: "projects.errors.project_not_found" }, { status: 404 });
  return NextResponse.json({ project: p });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "projects.errors.not_logged_in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = typeof body?.title === "string" ? body.title.trim() : undefined;
  const field = typeof body?.field === "string" ? body.field.trim() : undefined;
  const currentModule = typeof body?.currentModule === "number" ? body.currentModule : undefined;
  const status = typeof body?.status === "string" ? body.status : undefined;
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const { id } = await context.params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || !user || project.userId !== user.id) return NextResponse.json({ error: "projects.errors.project_not_found" }, { status: 404 });
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (field !== undefined) data.field = field;
  if (currentModule !== undefined) {
    if (currentModule < 1 || currentModule > 5) return NextResponse.json({ error: "projects.errors.module_invalid" }, { status: 400 });
    data.currentModule = currentModule;
  }
  if (status !== undefined) {
    if (!["IN_PROGRESS", "COMPLETED", "ARCHIVED"].includes(status)) return NextResponse.json({ error: "projects.errors.status_invalid" }, { status: 400 });
    data.status = status;
  }
  const updated = await prisma.project.update({ where: { id }, data });
  return NextResponse.json({ ok: true, project: updated, message: "projects.messages.updated" });
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "projects.errors.not_logged_in" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const { id } = await context.params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || !user || project.userId !== user.id) return NextResponse.json({ error: "projects.errors.project_not_found" }, { status: 404 });
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true, message: "projects.messages.deleted" });
}