import { NextResponse } from "next/server";
import { getCacheStats } from "@/lib/cache/ai-cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "admin.errors.forbidden" }, { status: 403 });
  const stats = await getCacheStats();
  return NextResponse.json({ stats });
}