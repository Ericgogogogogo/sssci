import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const { reviewId, sectionId } = await req.json().catch(() => ({}));
  if (!reviewId || !sectionId) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const review = await prisma.literatureReview.findUnique({ where: { id: reviewId } });
  const sections = Array.isArray(review?.sections) ? (review!.sections as any[]) : [];
  const idx = sections.findIndex((s) => s.id === sectionId);
  if (idx >= 0) sections[idx] = { ...sections[idx], status: "CONFIRMED" };
  await prisma.literatureReview.update({ where: { id: reviewId }, data: { sections } });
  return NextResponse.json({ ok: true });
}