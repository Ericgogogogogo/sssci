import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "projects.errors.not_logged_in" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { subscription: true } });
  if (!user) return NextResponse.json({ error: "projects.errors.user_not_found" }, { status: 404 });
  const plan = user.subscription?.planType ?? "FREE";
  const allowed = plan === "TEAM" ? null : plan === "PRO" ? 5 : 1;
  const projects = await prisma.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ projects, plan, allowed });
}