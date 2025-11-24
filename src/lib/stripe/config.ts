import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key) throw new Error("STRIPE_NOT_CONFIGURED");
  return new Stripe(key);
}

export const PLANS = {
  FREE: {
    name: "FREE",
    priceId: null as string | null,
    features: { projects: 1, topicGenerations: 5 },
  },
  PRO: {
    name: "PRO",
    priceId: process.env.STRIPE_PRICE_PRO ?? "",
    features: { projects: 5, topicGenerations: Infinity },
  },
  TEAM: {
    name: "TEAM",
    priceId: process.env.STRIPE_PRICE_TEAM ?? "",
    features: { projects: Infinity, topicGenerations: Infinity },
  },
} as const;