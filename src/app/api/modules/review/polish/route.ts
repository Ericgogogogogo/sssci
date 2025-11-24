import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { polishReview } from "@/lib/ai/review-validation";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "usage.errors.not_logged_in" }, { status: 401 });
  const { content } = await req.json().catch(() => ({}));
  if (!content) return NextResponse.json({ error: "auth.errors.invalid_params" }, { status: 400 });
  const polished = await polishReview(content);
  return NextResponse.json({ polished });
}