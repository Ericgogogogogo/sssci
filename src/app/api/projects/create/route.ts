import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "projects.errors.not_logged_in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "projects.errors.title_required" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { subscription: true } });
  if (!user) return NextResponse.json({ error: "projects.errors.user_not_found" }, { status: 404 });
  const plan = user.subscription?.planType ?? "FREE";
  const allowed = plan === "TEAM" ? Number.POSITIVE_INFINITY : plan === "PRO" ? 5 : 1;
  const count = await prisma.project.count({ where: { userId: user.id } });
  if (count >= allowed) return NextResponse.json({ error: "projects.errors.limit_reached" }, { status: 403 });
  const project = await prisma.project.create({ data: { userId: user.id, title, status: "IN_PROGRESS", currentModule: 1 } });
  return NextResponse.json({ ok: true, project, message: "projects.messages.created" }, { status: 201 });
}