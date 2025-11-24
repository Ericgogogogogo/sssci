import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateDesign } from "@/lib/ai/design-generator";
import { toFriendlyMessage, recordError } from "@/lib/errors/handler";
import { logApiCall } from "@/lib/monitoring/logger";
import { logger } from "@/lib/logging/logger";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const { projectId, methodType, userDescription, iteration } = await req.json().catch(() => ({}));
  if (!projectId || !methodType || !userDescription) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const userId = (session.user as any).id as string;
  const start = Date.now();
  try {
    const latestTopic = await prisma.topicGeneration.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
    const latestFramework = await prisma.frameworkGeneration.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
    const selectedTopicIdx = latestTopic?.selectedTopicId ? Number(latestTopic.selectedTopicId) : 0;
    const selectedFrameworkIdx = latestFramework?.selectedFrameworkId ? Number(latestFramework.selectedFrameworkId) : 0;
    const topic = ((latestTopic?.generatedTopics as any[]) ?? [])[selectedTopicIdx] ?? null;
    const framework = ((latestFramework?.generatedFrameworks as any[]) ?? [])[selectedFrameworkIdx] ?? null;
    const { designContent, actionPlan } = generateDesign(topic, framework, methodType, userDescription);
    const record = await prisma.researchDesign.create({
      data: {
        projectId,
        methodType,
        userDescription,
        designContent,
        hypothesesValidation: {},
        materials: {},
        actionPlan,
        status: "DRAFT",
      },
    });
    await logApiCall({ route: "/api/modules/design/generate", status: 200, durationMs: Date.now() - start, provider: "internal", endpoint: "design-generator", success: true, userId, projectId });
    logger.info("design.generate", { userId, projectId, methodType })
    return NextResponse.json({ designId: record.id, designContent, actionPlan });
  } catch (e) {
    const fm = toFriendlyMessage(e)
    await recordError(e, { userId, projectId, route: "/api/modules/design/generate" })
    await logApiCall({ route: "/api/modules/design/generate", status: 500, durationMs: Date.now() - start, provider: "internal", endpoint: "design-generator", success: false, userId, projectId, error: String(e) })
    logger.error("design.generate.error", { userId, projectId, error: String(e) })
    return NextResponse.json({ error: fm.title, detail: fm.description }, { status: 500 })
  }
}