export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateSection } from "@/lib/ai/review-section";
import { recordError } from "@/lib/errors/handler";
import { logApiCall } from "@/lib/monitoring/logger";
import { logger } from "@/lib/logging/logger";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("", { status: 401 });
  const userId = (session.user as any).id as string;
  const { reviewId, sectionId } = await req.json().catch(() => ({}));
  if (!reviewId || !sectionId) return new Response("", { status: 400 });
  const ts = new TransformStream();
  const writer = ts.writable.getWriter();
  const enc = new TextEncoder();
  const send = async (event: string, data: any) => {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    await writer.write(enc.encode(`event: ${event}\n`));
    await writer.write(enc.encode(`data: ${payload}\n\n`));
  };
  (async () => {
    try {
      await send("start", { sectionId });
      const review = await prisma.literatureReview.findUnique({ where: { id: reviewId } });
      const outline = (review?.outline as any)?.sections ?? [];
      const section = outline.find((s: any) => s.id === sectionId) ?? { id: sectionId, title: "章节", keywords: ["research"], estimatedReferences: 10 };
      const previousIndex = (section.order ?? 1) - 2;
      const previousContent = previousIndex >= 0 ? (review?.sections as any[] ?? [])[previousIndex]?.content ?? "" : "";
      await send("retrieving", { found: 0 });
      const result = await generateSection(section, previousContent);
      await send("writing", { words: result.wordCount });
      const newSections = Array.isArray(review?.sections) ? [...(review?.sections as any[])] : [];
      const idx = newSections.findIndex((s: any) => s.id === sectionId);
      const payload = { id: sectionId, content: result.content, references: result.references, status: "COMPLETED" };
      if (idx >= 0) newSections[idx] = payload; else newSections.push(payload);
      await prisma.literatureReview.update({ where: { id: reviewId }, data: { sections: newSections } });
      await send("complete", { sectionId, words: result.wordCount, citations: result.citationCount, issues: result.issues });
      await logApiCall({ route: "/api/modules/review/section/generate", status: 200, durationMs: 0, provider: "internal", endpoint: "review-section", success: true, userId, projectId: review?.projectId })
      logger.info("review.section.generate", { userId, reviewId, sectionId })
    } catch (e) {
      await send("error", { message: String(e) });
      await recordError(e, { userId, route: "/api/modules/review/section/generate" })
      await logApiCall({ route: "/api/modules/review/section/generate", status: 500, durationMs: 0, provider: "internal", endpoint: "review-section", success: false, userId, error: String(e) })
      logger.error("review.section.generate.error", { userId, reviewId, sectionId, error: String(e) })
    } finally {
      await writer.close();
    }
  })();
  return new Response(ts.readable, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
}