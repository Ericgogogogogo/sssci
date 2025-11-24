import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkUsageLimit } from "@/lib/middleware/usage-limit";
import { prisma } from "@/lib/db/client";
import { allowRateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const ip = req.headers.get("x-forwarded-for") ?? session.user.email ?? "unknown";
  const rl = allowRateLimit(`usage:${ip}`, 60, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "usage.errors.rate_limited" }, { status: 429 });
  const { feature } = await req.json();
  if (!feature) return NextResponse.json({ error: "usage.errors.missing_param" }, { status: 400 });
  let userId = (session.user as any).id ?? null;
  if (!userId && session.user?.email) {
    const u = await prisma.user.findUnique({ where: { email: session.user.email } });
    userId = u?.id ?? null;
  }
  if (!userId) return NextResponse.json({ error: "usage.errors.missing_user" }, { status: 400 });
  const result = await checkUsageLimit(userId, feature);
  return NextResponse.json(result);
}