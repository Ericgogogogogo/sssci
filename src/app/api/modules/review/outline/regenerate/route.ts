import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateOutline } from "@/lib/ai/review-outline";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { projectId, settings, userInput } = body ?? {};
  if (!projectId || !settings) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const latestFramework = await prisma.frameworkGeneration.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
  const selectedIdx = latestFramework?.selectedFrameworkId ? Number(latestFramework.selectedFrameworkId) : 0;
  const frameworks = (latestFramework?.generatedFrameworks as any[]) ?? [];
  const selectedFramework = frameworks[selectedIdx] ?? frameworks[0] ?? null;
  const latestTopic = await prisma.topicGeneration.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
  const selectedTopicIdx = latestTopic?.selectedTopicId ? Number(latestTopic.selectedTopicId) : 0;
  const topics = (latestTopic?.generatedTopics as any[]) ?? [];
  const selectedTopic = topics[selectedTopicIdx] ?? topics[0] ?? null;
  const outline = generateOutline(selectedTopic, selectedFramework, settings, userInput ?? "")
  await prisma.literatureReview.updateMany({ where: { projectId }, data: { outline } })
  return NextResponse.json({ outline: outline.sections })
}