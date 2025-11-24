import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { checkUsageLimit } from "@/lib/middleware/usage-limit";
import { generateFrameworks } from "@/lib/ai/framework-orchestrator";
import { toFriendlyMessage, recordError } from "@/lib/errors/handler";
import { logApiCall } from "@/lib/monitoring/logger";
import { logger } from "@/lib/logging/logger";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { projectId, userDescription, iteration } = body ?? {};
  if (!projectId || !userDescription || !iteration) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const userId = (session.user as any).id as string;
  const usage = await checkUsageLimit(userId, "framework_generation");
  if (!usage.ok) return NextResponse.json({ error: "usage.errors.limit_reached", upgrade: usage.upgrade }, { status: 403 });
  const start = Date.now();
  try {
    const latestTopic = await prisma.topicGeneration.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
    const selectedIdx = latestTopic?.selectedTopicId ? Number(latestTopic.selectedTopicId) : 0;
    const topics = (latestTopic?.generatedTopics as any[]) ?? [];
    const selectedTopic = topics[selectedIdx] ?? topics[0] ?? null;
    const { hotResearch, frameworks } = await generateFrameworks(selectedTopic, userDescription);
    const record = await prisma.frameworkGeneration.create({
      data: {
        projectId,
        iteration,
        selectedTopic: selectedTopic ?? {},
        userDescription,
        hotResearch,
        generatedFrameworks: frameworks,
      },
    });
    await logApiCall({ route: "/api/modules/framework/generate", status: 200, durationMs: Date.now() - start, provider: "internal", endpoint: "framework-orchestrator", success: true, userId, projectId });
    logger.info("framework.generate", { userId, projectId, iteration });
    return NextResponse.json({ frameworks, iteration, remainingAttempts: usage.remaining ?? null });
  } catch (e) {
    const fm = toFriendlyMessage(e);
    await recordError(e, { userId, projectId, route: "/api/modules/framework/generate" });
    await logApiCall({ route: "/api/modules/framework/generate", status: 500, durationMs: Date.now() - start, provider: "internal", endpoint: "framework-orchestrator", success: false, userId, projectId, error: String(e) });
    logger.error("framework.generate.error", { userId, projectId, error: String(e) });
    return NextResponse.json({ error: fm.title, detail: fm.description }, { status: 500 });
  }
}
