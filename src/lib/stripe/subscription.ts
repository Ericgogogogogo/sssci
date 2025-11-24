import { prisma } from "@/lib/db/client";

export async function checkSubscriptionStatus(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return sub ?? null;
}

export async function hasFeatureAccess(userId: string, feature: "topic_generation" | "framework_generation" | "review_generation") {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return feature === "topic_generation"; // FREE 默认创建后按使用限制判断
  if (sub.planType === "PRO" || sub.planType === "TEAM") return true;
  if (feature === "topic_generation") return true; // FREE: topic 受限但可用
  return false;
}

export async function ensureUsageLimit(userId: string) {
  const existing = await prisma.usageLimit.findUnique({ where: { userId } });
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  if (!existing) {
    return prisma.usageLimit.create({
      data: {
        userId,
        resetDate: currentMonthStart,
      },
    });
  }
  if (existing.resetDate < currentMonthStart) {
    return prisma.usageLimit.update({
      where: { userId },
      data: {
        topicGenerationsUsed: 0,
        frameworkGenerationsUsed: 0,
        reviewSectionsUsed: 0,
        resetDate: currentMonthStart,
      },
    });
  }
  return existing;
}