import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getStripe } from "@/lib/stripe/config";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "stripe.errors.not_logged_in" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "stripe.errors.user_not_found" }, { status: 404 });
  const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  if (!sub?.stripeSubscriptionId) return NextResponse.json({ error: "stripe.errors.subscription_not_found" }, { status: 400 });
  try {
    const stripe = getStripe();
    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    await prisma.subscription.update({ where: { userId: user.id }, data: { status: "CANCELED" } });
    return NextResponse.json({ ok: true, message: "stripe.messages.canceled" });
  } catch (e) {
    if ((e as Error).message === "STRIPE_NOT_CONFIGURED") {
      return NextResponse.json({ error: "stripe.errors.not_configured" }, { status: 500 });
    }
    return NextResponse.json({ error: "stripe.errors.server_error" }, { status: 500 });
  }
}