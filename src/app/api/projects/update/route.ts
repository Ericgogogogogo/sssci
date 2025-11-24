import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "projects.errors.not_logged_in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : "";
  const title = typeof body?.title === "string" ? body.title.trim() : undefined;
  const currentModule = typeof body?.currentModule === "number" ? body.currentModule : undefined;
  const status = typeof body?.status === "string" ? body.status : undefined;
  if (!id) return NextResponse.json({ error: "projects.errors.missing_id" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "projects.errors.user_not_found" }, { status: 404 });
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== user.id) return NextResponse.json({ error: "projects.errors.project_not_found" }, { status: 404 });
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (currentModule !== undefined) {
    if (currentModule < 1 || currentModule > 5) return NextResponse.json({ error: "projects.errors.module_invalid" }, { status: 400 });
    data.currentModule = currentModule;
  }
  if (status !== undefined) {
    if (!["IN_PROGRESS", "COMPLETED", "ARCHIVED"].includes(status)) return NextResponse.json({ error: "projects.errors.status_invalid" }, { status: 400 });
    data.status = status;
  }
  const updated = await prisma.project.update({ where: { id }, data });
  return NextResponse.json({ ok: true, project: updated, message: title !== undefined ? "projects.messages.title_updated" : "projects.messages.updated" });
}