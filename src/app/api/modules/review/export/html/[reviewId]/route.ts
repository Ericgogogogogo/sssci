import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { exportReviewToHTML } from "@/lib/export/review-html";

export async function GET(_: NextRequest, context: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await context.params;
  const review = await prisma.literatureReview.findUnique({ where: { id: reviewId } });
  if (!review) return NextResponse.json({ error: "projects.errors.project_not_found" }, { status: 404 });
  const html = exportReviewToHTML(review, (review.references as any[]) ?? [], (review.settings as any) ?? {});
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `attachment; filename=Review_${review.projectId}_${new Date().toISOString().slice(0,10)}.html` } });
}