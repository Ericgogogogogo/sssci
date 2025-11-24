import { NextResponse } from "next/server";
import { clearCache } from "@/lib/cache/ai-cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "admin.errors.forbidden" }, { status: 403 });
  await clearCache();
  return NextResponse.json({ ok: true });
}