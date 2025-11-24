import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { projectId, selectedTopicId } = body ?? {};
  if (!projectId || !selectedTopicId) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const latest = await prisma.topicGeneration.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
  if (!latest) return NextResponse.json({ error: "projects.errors.project_not_found" }, { status: 404 });
  await prisma.topicGeneration.update({ where: { id: latest.id }, data: { selectedTopicId } });
  return NextResponse.json({ ok: true });
}