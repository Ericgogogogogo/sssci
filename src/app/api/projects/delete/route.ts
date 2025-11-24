import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "projects.errors.not_logged_in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "projects.errors.missing_id" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "projects.errors.user_not_found" }, { status: 404 });
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== user.id) return NextResponse.json({ error: "projects.errors.project_not_found" }, { status: 404 });
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true, message: "projects.messages.deleted" });
}