import { adaptCheckoutToUserSubscription } from "@/adapters";
import { checkoutDB, UserSubscription } from "@/models/checkout.models";
import { Plan } from "@/models/stripe/plan.models";
import { Subscription } from "@/models/stripe/subscription.models";
import { AppError } from "@/utils/app-error";
import { HttpStatusCode } from "axios";
import Stripe from "stripe";

export const getSubsctriptionsByUserId = async (userId: string) => {
  try {
    const checkouts = await checkoutDB
      .find({
        userId,
        subscription: {
          $ne: null,
        },
        invoice: {
          $ne: null,
        },
        charge: {
          $ne: null,
        },
      })
      .sort({
        updatedAt: "asc",
      });

    const adaptedToUserSubscription = checkouts.map((checkout) =>
      adaptCheckoutToUserSubscription(checkout)
    );

    return adaptedToUserSubscription as UserSubscription[];
  } catch (error) {
    throw new AppError("Error finding subscriptions.");
  }
};

export const updateSubscriptionFromWebhook = async (
  subscription: Subscription
) => {
  try {
    const checkout = await checkoutDB.findOneAndUpdate(
      {
        "subscription.id": subscription.id,
      },
      {
        subscription,
      },
      {
        new: true,
      }
    );

    if (!checkout) {
      throw new AppError("Subscription not found.", HttpStatusCode.BadRequest);
    }
  } catch (error) {
    throw new AppError(
      "Error updating subscription.",
      HttpStatusCode.BadRequest,
      error as Error
    );
  }
};
