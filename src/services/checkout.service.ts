import { adaptCheckoutToUserSubscription } from "@/adapters";
import { checkoutDB, UserSubscription } from "@/models/checkout.models";
import {
  Subscription,
  SubscriptionStatus,
} from "@/models/stripe/subscription.models";
import { AppError } from "@/utils/app-error";
import { HttpStatusCode } from "axios";

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

export const getUserActiveSubscription = async (userId: string) => {
  try {
    const checkouts = await checkoutDB
      .find({
        userId,
        "subscription.status": SubscriptionStatus.ACTIVE,
      })
      .sort({
        updatedAt: "asc",
      });

    const adaptedToUserSubscription = checkouts.map((checkout) =>
      adaptCheckoutToUserSubscription(checkout)
    );

    return adaptedToUserSubscription[0] as UserSubscription;
  } catch (error) {
    throw new AppError("Error finding user active subscription.");
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
