import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/config";
import { prisma } from "@/lib/db/client";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(rawBody, sig ?? "", process.env.STRIPE_WEBHOOK_SECRET ?? "");
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as any).email as string;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) break;
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await prisma.subscription.upsert({
          where: { userId: user.id },
          update: {
            status: "ACTIVE",
            planType: (((sub as any).items?.data?.[0]?.plan?.nickname as string | undefined)?.toUpperCase() as any) ?? "PRO",
            currentPeriodStart: new Date((sub as any).current_period_start * 1000),
            currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
          },
          create: {
            userId: user.id,
            status: "ACTIVE",
            planType: "PRO",
            currentPeriodStart: new Date((sub as any).current_period_start * 1000),
            currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
          },
        });
        // 保证 UsageLimit 存在
        await prisma.usageLimit.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            resetDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        });
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const sub = await stripe.subscriptions.retrieve(subscription.id);
        const customerId = sub.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as any).email as string;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) break;
        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            status: subscription.status === "active" ? "ACTIVE" : subscription.status === "canceled" ? "CANCELED" : "PAST_DUE",
            currentPeriodStart: new Date((sub as any).current_period_start * 1000),
            currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as any).email as string;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) break;
        await prisma.subscription.update({
          where: { userId: user.id },
          data: { status: "CANCELED" },
        });
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    if ((err as Error).message === "STRIPE_NOT_CONFIGURED") {
      return NextResponse.json({ error: "stripe.errors.not_configured" }, { status: 500 });
    }
    return NextResponse.json({ error: "stripe.errors.signature_invalid" }, { status: 400 });
  }
}