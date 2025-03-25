import { adaptCheckoutToUserSubscription } from "@/adapters";
import { checkoutModel, UserSubscription } from "@/models/checkout.models";
import {
  Subscription,
  SubscriptionStatus,
} from "@/models/stripe/subscription.models";
import { AppError } from "@/utils/app-error";
import { HttpStatusCode } from "axios";
import { getAllPlansFeatures } from "./plans-features.service";

export const getSubsctriptionsByUserId = async (userId: string) => {
  try {
    const checkouts = await checkoutModel
      .find({
        userId,
        subscription: {
          $ne: null,
        },
        invoice: {
          $ne: null,
        },
      })
      .sort({
        updatedAt: "desc",
      });

    const adaptedToUserSubscription = checkouts.map((checkout) =>
      adaptCheckoutToUserSubscription(checkout)
    );

    return adaptedToUserSubscription as UserSubscription[];
  } catch (error) {
    throw AppError.fromUnknownError(error, 400, "Error finding subscriptions.");
  }
};

export const getUserActiveSubscription = async (userId: string) => {
  try {
    const checkout = await checkoutModel
      .findOne({
        userId,
        $and: [
          {
            subscription: {
              $ne: null,
            },
          },
          {
            "subscription.status": SubscriptionStatus.ACTIVE,
          },
          {
            invoice: {
              $ne: null,
            },
          },
        ],
      })
      .sort({
        updatedAt: "asc",
      })
      .lean();

    if (!checkout) {
      throw new AppError("No active subscription found for this user", 400);
    }

    const subscription = adaptCheckoutToUserSubscription(
      checkout
    ) as UserSubscription;

    const plansFeatures = await getAllPlansFeatures();

    const planFeatures = plansFeatures.find(
      (features) => features.stripeProductId === subscription.stripeProductId
    );

    if (!planFeatures) {
      throw new AppError(
        "No active subscription found with compatible plan features for this user",
        400
      );
    }

    return {
      subscription,
      features: planFeatures,
    };
  } catch (error) {
    throw AppError.fromUnknownError(
      error,
      400,
      "Error finding user active subscription."
    );
  }
};

export const updateSubscriptionFromWebhook = async (
  subscription: Subscription
) => {
  try {
    const checkout = await checkoutModel.findOneAndUpdate(
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
    throw AppError.fromUnknownError(error, 400, "Error updating subscription.");
  }
};
