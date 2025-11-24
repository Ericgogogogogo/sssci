import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { validateReview, autoCorrectIssues } from "@/lib/ai/review-validation";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const { reviewId } = await req.json().catch(() => ({}));
  if (!reviewId) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const review = await prisma.literatureReview.findUnique({ where: { id: reviewId } });
  const full = Array.isArray(review?.sections) ? (review!.sections as any[]).map((s) => s.content ?? "").join("\n\n") : "";
  const refs = review?.references as any[] ?? [];
  const result = validateReview(full, refs);
  const corrected = autoCorrectIssues(full, result.issues);
  return NextResponse.json({ result, corrected });
}