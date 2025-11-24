import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

interface SessionUser {
  role?: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!session || user?.role !== "ADMIN") return NextResponse.json({ error: "未授权" }, { status: 401 });
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  const header = ["id", "userId", "title", "status", "currentModule", "createdAt"].join(",");
  const rows = projects.map((p: any) => [
    p.id,
    p.userId,
    p.title,
    p.status,
    p.currentModule,
    p.createdAt.toISOString(),
  ].map((v) => String(v).replace(/"/g, '""')).join(","));
  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=projects.csv" } });
}