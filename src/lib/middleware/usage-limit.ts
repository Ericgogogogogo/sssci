import { prisma } from "@/lib/db/client";
import type { UsageLimit } from "@prisma/client";

type Feature = "topic_generation" | "framework_generation" | "review_generation";

const FREE_LIMITS: Record<Feature, number> = {
  topic_generation: 5,
  framework_generation: 0,
  review_generation: 0,
};

export async function checkUsageLimit(userId: string, feature: Feature) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  let usage = await prisma.usageLimit.findUnique({ where: { userId } });

  if (!usage) {
    usage = await prisma.usageLimit.create({
      data: { userId, resetDate: monthStart },
    });
  } else if (usage.resetDate < monthStart) {
    usage = await prisma.usageLimit.update({
      where: { userId },
      data: {
        topicGenerationsUsed: 0,
        frameworkGenerationsUsed: 0,
        reviewSectionsUsed: 0,
        resetDate: monthStart,
      },
    });
  }

  const plan = sub?.planType ?? "FREE";
  if (plan === "PRO" || plan === "TEAM") {
    await increment(userId, feature);
    return { ok: true, remaining: Infinity, limit: Infinity } as const;
  }

  const used = getUsed(usage, feature);
  const limit = FREE_LIMITS[feature];
  if (used >= limit) {
    return {
      ok: false as const,
      error: "使用次数已达上限",
      upgrade: "PRO",
      remaining: 0,
      limit,
    };
  }

  await increment(userId, feature);
  return { ok: true as const, remaining: limit - used - 1, limit };
}

function getUsed(usage: UsageLimit, feature: Feature): number {
  if (feature === "topic_generation") return usage.topicGenerationsUsed ?? 0;
  if (feature === "framework_generation") return usage.frameworkGenerationsUsed ?? 0;
  return usage.reviewSectionsUsed ?? 0;
}

async function increment(userId: string, feature: Feature): Promise<void> {
  if (feature === "topic_generation") {
    await prisma.usageLimit.update({ where: { userId }, data: { topicGenerationsUsed: { increment: 1 } } });
  } else if (feature === "framework_generation") {
    await prisma.usageLimit.update({ where: { userId }, data: { frameworkGenerationsUsed: { increment: 1 } } });
  } else {
    await prisma.usageLimit.update({ where: { userId }, data: { reviewSectionsUsed: { increment: 1 } } });
  }
}