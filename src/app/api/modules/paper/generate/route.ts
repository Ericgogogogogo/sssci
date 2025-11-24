import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateFullPaper } from "@/lib/ai/paper-generator";
import { cachedAICall } from "@/lib/cache/ai-cache";
import { logApiCall } from "@/lib/monitoring/logger";
import { recordError } from "@/lib/errors/handler";
import { logger } from "@/lib/logging/logger";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("", { status: 401 });
  const userId = (session.user as any).id as string;
  const { reviewId, designId, review, design, results, projectId } = await req.json().catch(() => ({}));
  let reviewData = review;
  let designData = design;
  if (projectId && !reviewData) {
    const r = await prisma.literatureReview.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
    reviewData = r?.sections ?? r?.outline ?? r?.finalHtml ?? reviewData;
  } else if (reviewId) {
    const r = await prisma.literatureReview.findUnique({ where: { id: reviewId } });
    reviewData = r?.sections ?? r?.outline ?? r?.finalHtml ?? reviewData;
  }
  if (projectId && !designData) {
    const d = await prisma.researchDesign.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
    designData = d?.designContent ?? designData;
  } else if (designId) {
    const d = await prisma.researchDesign.findUnique({ where: { id: designId } });
    designData = d?.designContent ?? designData;
  }
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      send("progress", { stage: "assembling" });
      Promise.resolve().then(async () => {
        send("progress", { stage: "writing" });
        const prompt = JSON.stringify({ review: reviewData, design: designData, results: results ?? {} });
        const md = await cachedAICall(prompt, "gpt-4", { ttlSeconds: 86400 }, async () => Promise.resolve(JSON.stringify(generateFullPaper(reviewData, designData, results ?? {}))));
        const paper = JSON.parse(md);
        send("complete", { paper });
        await logApiCall({ route: "/api/modules/paper/generate", status: 200, durationMs: 0, provider: "internal", endpoint: "paper-generator", success: true, userId, projectId })
        logger.info("paper.generate", { userId, projectId })
        controller.close();
      }).catch(() => {
        send("error", { message: "paper.errors.server_error" });
        recordError(new Error("paper.errors.server_error"), { userId, projectId, route: "/api/modules/paper/generate" })
        logApiCall({ route: "/api/modules/paper/generate", status: 500, durationMs: 0, provider: "internal", endpoint: "paper-generator", success: false, userId, projectId, error: "paper.errors.server_error" })
        logger.error("paper.generate.error", { userId, projectId })
        controller.close();
      });
    }
  });
  return new NextResponse(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
}