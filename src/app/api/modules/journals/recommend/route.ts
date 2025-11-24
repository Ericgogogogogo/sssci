import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recommendJournals } from "@/lib/ai/journal-recommender";
import { cachedAICall } from "@/lib/cache/ai-cache";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "journals.errors.not_logged_in" }, { status: 401 });
  const { topic, method, field, score } = await req.json().catch(() => ({}));
  const prompt = JSON.stringify({ topic, method, field, score });
  const json = await cachedAICall(prompt, "gpt-4", { ttlSeconds: 86400 }, async () => Promise.resolve(JSON.stringify(recommendJournals({ topic, method, field, score }))));
  const rec = JSON.parse(json);
  return NextResponse.json({ recommendations: rec });
}