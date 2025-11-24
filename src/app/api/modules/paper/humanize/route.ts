import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { humanizePaper } from "@/lib/ai/humanizer";
import { cachedAICall } from "@/lib/cache/ai-cache";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "paper.errors.not_logged_in" }, { status: 401 });
  const { draftPaper } = await req.json().catch(() => ({}));
  if (!draftPaper) return NextResponse.json({ error: "paper.errors.draft_required" }, { status: 400 });
  const polished = await cachedAICall(draftPaper, "claude", { ttlSeconds: 86400 }, async () => Promise.resolve(humanizePaper(draftPaper)));
  return NextResponse.json({ polished });
}