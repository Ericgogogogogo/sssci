import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { generateQuestionnaire, generateInterviewGuide, generateExperimentStimuli } from "@/lib/ai/design-generator";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const { designId } = await req.json().catch(() => ({}));
  if (!designId) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const design = await prisma.researchDesign.findUnique({ where: { id: designId } });
  const methodType = design?.methodType ?? "QUANTITATIVE";
  let materials: any = {};
  if (methodType === "QUANTITATIVE") materials = generateQuestionnaire(design?.designContent ?? {}, []);
  else if (methodType === "QUALITATIVE") materials = generateInterviewGuide(design?.designContent ?? {});
  else if (methodType === "EXPERIMENTAL") materials = generateExperimentStimuli(design?.designContent ?? {});
  else materials = { questionnaire: generateQuestionnaire(design?.designContent ?? {}, []), interview: generateInterviewGuide(design?.designContent ?? {}) };
  await prisma.researchDesign.update({ where: { id: designId }, data: { materials, status: "READY" } });
  return NextResponse.json({ materials });
}