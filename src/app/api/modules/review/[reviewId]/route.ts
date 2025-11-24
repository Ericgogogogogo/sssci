import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(_: NextRequest, context: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await context.params;
  const review = await prisma.literatureReview.findUnique({ where: { id: reviewId } });
  if (!review) return NextResponse.json({ error: "projects.errors.project_not_found" }, { status: 404 });
  return NextResponse.json({ review });
}