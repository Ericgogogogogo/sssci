import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { validateHypothesisTestability } from "@/lib/ai/hypothesis-validator";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const { designId } = await req.json().catch(() => ({}));
  if (!designId) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const design = await prisma.researchDesign.findUnique({ where: { id: designId } });
  const latestFramework = await prisma.frameworkGeneration.findFirst({ where: { projectId: design?.projectId ?? "" }, orderBy: { createdAt: "desc" } });
  const selectedIdx = latestFramework?.selectedFrameworkId ? Number(latestFramework.selectedFrameworkId) : 0;
  const framework = ((latestFramework?.generatedFrameworks as any[]) ?? [])[selectedIdx] ?? null;
  const validations = await validateHypothesisTestability(design?.designContent ?? {}, framework?.hypotheses ?? []);
  await prisma.researchDesign.update({ where: { id: designId }, data: { hypothesesValidation: validations, status: validations.overall_testable ? "TESTABLE" : "NEEDS_REVISION" } });
  return NextResponse.json({ validations });
}