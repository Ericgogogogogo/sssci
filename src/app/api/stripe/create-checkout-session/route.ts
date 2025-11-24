import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, PLANS } from "@/lib/stripe/config";
import { prisma } from "@/lib/db/client";
import { allowRateLimit } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "stripe.errors.not_logged_in" }, { status: 401 });
    const ip = (await headers()).get("x-forwarded-for") ?? undefined;
    const rl = allowRateLimit(`stripe:checkout:${ip ?? session.user.email}`, 20, 60_000);
    if (!rl.allowed) return NextResponse.json({ error: "stripe.errors.rate_limited" }, { status: 429 });
    const { planType } = await req.json();
    if (!["PRO", "TEAM"].includes(planType)) return NextResponse.json({ error: "stripe.errors.unsupported_plan" }, { status: 400 });
    const priceId = PLANS[planType as "PRO" | "TEAM"].priceId;
    if (!priceId) return NextResponse.json({ error: "stripe.errors.missing_price" }, { status: 500 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "stripe.errors.user_not_found" }, { status: 404 });

    // 建立/复用 Stripe Customer
    const existingSub = await prisma.subscription.findUnique({ where: { userId: user.id } });
    let customerId = existingSub?.stripeCustomerId ?? undefined;
    const stripe = getStripe();
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name ?? undefined });
      customerId = customer.id;
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { stripeCustomerId: customerId },
        create: {
          userId: user.id,
          planType: "FREE",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          stripeCustomerId: customerId,
        },
      });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/settings?canceled=true`,
    });
    return NextResponse.json({ url: checkout.url }, { status: 200 });
  } catch (e) {
    if ((e as Error).message === "STRIPE_NOT_CONFIGURED") {
      return NextResponse.json({ error: "stripe.errors.not_configured" }, { status: 500 });
    }
    return NextResponse.json({ error: "stripe.errors.server_error" }, { status: 500 });
  }
}