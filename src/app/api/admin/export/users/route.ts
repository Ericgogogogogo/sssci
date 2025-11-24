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
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { subscription: true } });
  const header = ["id", "email", "name", "role", "plan", "status", "createdAt"].join(",");
  const rows = users.map((u: any) => [
    u.id,
    u.email,
    u.name ?? "",
    u.role,
    u.subscription?.planType ?? "",
    u.subscription?.status ?? "",
    u.createdAt.toISOString(),
  ].map((v) => String(v).replace(/"/g, '""')).join(","));
  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=users.csv" } });
}