import Stripe from "stripe";
import { Subscription } from "@/models/stripe/subscription.models";
import { updateSubscriptionFromWebhook } from "@/services/checkout.service";

export const handleSubscriptionDeleted = async (
  subscription: Stripe.Subscription
) => {
  await updateSubscriptionFromWebhook(subscription as Subscription);
};
