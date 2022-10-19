import { CallbackError } from "mongoose";
import SubscriptionsDB, {
  IPaymentIntent,
  ISubscriptionCreationResult,
} from "../models/subscription.models";
import log from "../utils/logs";

export const getUserSubsctriptions = async (userId: string) => {
  return await SubscriptionsDB.find({
    userId: userId,
  });
};

export const saveSubscriptionResult = async (
  subscription: ISubscriptionCreationResult
): Promise<ISubscriptionCreationResult> => {
  return (
    await SubscriptionsDB.create(subscription)
  ).toObject() as ISubscriptionCreationResult;
};

export const updateSubscriptionResultFromPaymentIntent = async (
  paymentIntent: IPaymentIntent
) => {
  return await SubscriptionsDB.findOneAndUpdate(
    {
      latestInvoice: {
        payment_intent: {
          id: paymentIntent.id,
        },
      },
    },
    {
      latestInvoice: {
        payment_intent: paymentIntent,
      },
      status: paymentIntent.status,
    },
    {
      new: true,
    },
    (error: CallbackError, doc: any) => {
      if (error) log.error("error", error);
      log.error("doc found", doc);
    }
  );
};

export const updateSubscriptionResult = async (
  subscription: ISubscriptionCreationResult
): Promise<ISubscriptionCreationResult | undefined> => {
  return (
    await SubscriptionsDB.findOneAndUpdate(
      { subscriptionId: subscription.subscriptionId },
      { ...subscription },
      {
        new: true,
      }
    )
  )?.toObject();
};

export const cancelSubscriptionResult = async (
  subscriptionId: string
): Promise<ISubscriptionCreationResult | undefined> => {
  return (
    await SubscriptionsDB.findOneAndUpdate(
      { subscriptionId: subscriptionId },
      { status: "canceled" },
      {
        new: true,
      }
    )
  )?.toObject();
};
