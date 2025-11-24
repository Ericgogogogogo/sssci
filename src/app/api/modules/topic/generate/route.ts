import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { checkUsageLimit } from "@/lib/middleware/usage-limit";
import { generateTopics } from "@/lib/ai/topic-orchestrator";
import { toFriendlyMessage, recordError } from "@/lib/errors/handler";
import { logger } from "@/lib/logging/logger";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { projectId, keywords, description, field, iteration } = body ?? {};
  if (!projectId || !Array.isArray(keywords) || !description || !field || !iteration) {
    return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  }
  const userId = (session.user as any).id as string;
  const usage = await checkUsageLimit(userId, "topic_generation");
  if (!usage.ok) return NextResponse.json({ error: "usage.errors.limit_reached", upgrade: usage.upgrade }, { status: 403 });

  let lastError: any = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { topics } = await generateTopics({ projectId, keywords, description, field, iteration });
      const record = await prisma.topicGeneration.create({
        data: {
          projectId,
          iteration,
          userInput: { keywords, description, field },
          generatedTopics: topics,
        },
      });
      logger.info("topic.generate", { userId, projectId, iteration })
      return NextResponse.json({ topics, iteration, remainingAttempts: usage.remaining ?? null });
    } catch (e) {
      lastError = e;
      if (String((e as any)?.name) === "TimeoutError" || String((e as any)?.message) === "TIMEOUT") {
        setTimeout(async () => {
          try {
            const { topics } = await generateTopics({ projectId, keywords, description, field, iteration });
            await prisma.topicGeneration.create({
              data: {
                projectId,
                iteration,
                userInput: { keywords, description, field },
                generatedTopics: topics,
              },
            });
          } catch (err) {
            await recordError(err, { userId, projectId, route: "/api/modules/topic/generate/background" })
          }
        }, 0)
        const fm = toFriendlyMessage(e)
        logger.warn("topic.generate.timeout", { userId, projectId, iteration })
        return NextResponse.json({ processing: true, message: fm.description }, { status: 202 })
      }
    }
  }
  const fm = toFriendlyMessage(lastError)
  await recordError(lastError, { userId, projectId, route: "/api/modules/topic/generate" })
  logger.error("topic.generate.error", { userId, projectId, error: String(lastError) })
  return NextResponse.json({ error: fm.title, detail: fm.description }, { status: 500 });
}