import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateAnalysisGuide } from "@/lib/ai/analysis-guide";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const { projectId, designId } = await req.json().catch(() => ({}));
  if (!projectId || !designId) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const design = await prisma.researchDesign.findUnique({ where: { id: designId } });
  const latestFramework = await prisma.frameworkGeneration.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
  const selectedIdx = latestFramework?.selectedFrameworkId ? Number(latestFramework.selectedFrameworkId) : 0;
  const framework = ((latestFramework?.generatedFrameworks as any[]) ?? [])[selectedIdx] ?? null;
  const guide = generateAnalysisGuide(design?.designContent ?? {}, framework?.hypotheses ?? [], design?.methodType ?? "QUANTITATIVE");
  return NextResponse.json({ guide });
}