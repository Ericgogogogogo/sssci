import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user!.email! }, include: { subscription: true, usageLimit: true } });
  if (!user) redirect("/login");
  const plan = user.subscription?.planType ?? "FREE";
  const status = user.subscription?.status ?? "ACTIVE";
  const usage = user.usageLimit;
  const remainingTopic = plan === "FREE" ? Math.max(0, 5 - (usage?.topicGenerationsUsed ?? 0)) : Infinity;
  return <SettingsClient plan={plan} status={status} usage={usage} remainingTopic={remainingTopic} />;
}