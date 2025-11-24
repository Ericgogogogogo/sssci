import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchSemanticScholar, searchGoogleScholar } from "@/lib/literature/search";
import { mergeDeduplicate } from "@/lib/literature/deduplication";
import { cacheGet, cacheSet, hashKey } from "@/lib/cache";
import { logApiCall } from "@/lib/monitoring/logger";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const query = String(body?.query ?? "").trim();
  const sources = Array.isArray(body?.sources) ? body.sources : ["semantic", "google"];
  const limit = Number(body?.limit ?? 20);
  if (!query) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const key = `literature:${hashKey(JSON.stringify({ query, sources, limit }))}`;
  const cached = await cacheGet<{ papers: any[]; total: number }>(key);
  if (cached) return NextResponse.json({ papers: cached.papers, total: cached.total, cached: true });
  const sem = sources.includes("semantic") ? await searchSemanticScholar(query, limit) : { papers: [] };
  const goo = sources.includes("google") ? await searchGoogleScholar(query, limit, {}) : { papers: [] };
  const unified = mergeDeduplicate(sem.papers, goo.papers);
  await cacheSet(key, { papers: unified, total: unified.length }, 7 * 24 * 60 * 60 * 1000);
  const userId = (session.user as any).id as string;
  await logApiCall({ route: "/api/literature/search", status: 200, durationMs: 0, provider: "internal", endpoint: "unified_search", success: true, userId });
  return NextResponse.json({ papers: unified, total: unified.length, cached: false });
}