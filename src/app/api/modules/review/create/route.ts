import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateOutline } from "@/lib/ai/review-outline";
import { toFriendlyMessage, recordError } from "@/lib/errors/handler";
import { logApiCall } from "@/lib/monitoring/logger";
import { logger } from "@/lib/logging/logger";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { projectId, settings, userInput } = body ?? {};
  if (!projectId || !settings) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const userId = (session.user as any).id as string;
  const start = Date.now();
  try {
    const latestFramework = await prisma.frameworkGeneration.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
    const selectedIdx = latestFramework?.selectedFrameworkId ? Number(latestFramework.selectedFrameworkId) : 0;
    const frameworks = (latestFramework?.generatedFrameworks as any[]) ?? [];
    const selectedFramework = frameworks[selectedIdx] ?? frameworks[0] ?? null;
    const latestTopic = await prisma.topicGeneration.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
    const selectedTopicIdx = latestTopic?.selectedTopicId ? Number(latestTopic.selectedTopicId) : 0;
    const topics = (latestTopic?.generatedTopics as any[]) ?? [];
    const selectedTopic = topics[selectedTopicIdx] ?? topics[0] ?? null;
    const outline = generateOutline(selectedTopic, selectedFramework, settings, userInput ?? "")
    const record = await prisma.literatureReview.create({ data: { projectId, settings, outline, sections: [], references: [], status: "PLANNING" } });
    await logApiCall({ route: "/api/modules/review/create", status: 200, durationMs: Date.now() - start, provider: "internal", endpoint: "review-outline", success: true, userId, projectId });
    logger.info("review.create", { userId, projectId })
    return NextResponse.json({ reviewId: record.id, outline: outline.sections, status: "PLANNING" })
  } catch (e) {
    const fm = toFriendlyMessage(e)
    await recordError(e, { userId, projectId, route: "/api/modules/review/create" })
    await logApiCall({ route: "/api/modules/review/create", status: 500, durationMs: Date.now() - start, provider: "internal", endpoint: "review-outline", success: false, userId, projectId, error: String(e) })
    logger.error("review.create.error", { userId, projectId, error: String(e) })
    return NextResponse.json({ error: fm.title, detail: fm.description }, { status: 500 })
  }
}