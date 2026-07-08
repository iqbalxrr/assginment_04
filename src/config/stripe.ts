import Stripe from "stripe";
import { env } from "./env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-06-24.dahlia",
});

export const STRIPE_CURRENCY = "usd";

export const toStripeAmount = (amount: number): number => Math.round(amount * 100);
