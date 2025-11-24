import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

interface SessionUser {
  role?: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!session || user?.role !== "ADMIN") return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  await prisma.usageLimit.upsert({
    where: { userId },
    update: { topicGenerationsUsed: 0, frameworkGenerationsUsed: 0, reviewSectionsUsed: 0, resetDate: monthStart },
    create: { userId, resetDate: monthStart },
  });
  return NextResponse.json({ ok: true });
}