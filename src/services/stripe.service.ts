import Stripe from "stripe";
import { initializeStripe } from "../config/stripe";
import { AppErrorsMessages } from "../constants";
import { IUser, PlansTypes } from "../models/user.models";
import SubscriptionsDB, {
  IPaymentIntent,
  ISubscriptionCreationResult,
  SubscriptionStatus,
} from "../models/subscription.models";
import { getPriceIdByRecurrencyAndPlanType } from "../utils/stripe";
import log from "../utils/logs";

export const createCustomer = async (
  user: IUser
): Promise<Stripe.Customer | null> => {
  let stripeInstance: Stripe | null = await initializeStripe();
  if (!stripeInstance) return null;

  const params: Stripe.CustomerCreateParams = {
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    metadata: {
      authId: user.authId || null,
      userId: user._id?.toString() || null,
    },
  };

  const customer: Stripe.Customer = await stripeInstance.customers.create(
    params
  );

  if (customer) return customer;
  return null;
};

export const assureStripeCustomerCreated = async (
  user: IUser
): Promise<IUser> => {
  if (user.paymentId) {
    return user;
  }

  const customer: Stripe.Customer | null = await createCustomer(user);

  if (!customer)
    throw new Error(AppErrorsMessages.PAYMENT_CUSTOMER_NOT_CREATED);

  return {
    ...user,
    paymentId: customer.id,
  };
};

export const getSubsctriptionPaymentIntent = async (
  paymentIntentId: string
) => {
  let stripeInstance: Stripe | null = await initializeStripe();
  if (!stripeInstance) return null;

  if (!paymentIntentId) {
    return null;
  }

  const paymentIntent = stripeInstance.paymentIntents.retrieve(paymentIntentId);

  if (!paymentIntent) {
    return null;
  }
  return paymentIntent;
};

export const createSubscriptionOnStripe = async (
  paymentId: string,
  currency: string,
  recurrency: "month" | "year",
  planType: PlansTypes
) => {
  let stripeInstance: Stripe | null = await initializeStripe();
  if (!stripeInstance) return null;

  if (!paymentId) {
    return null;
  }

  const priceId = getPriceIdByRecurrencyAndPlanType(recurrency, planType);

  if (!priceId) {
    return null;
  }

  const subscription = stripeInstance.subscriptions.create({
    customer: paymentId,
    items: [
      {
        price: priceId,
      },
    ],
    cancel_at_period_end: true,
    currency,
    collection_method: "charge_automatically",
    payment_settings: { save_default_payment_method: "on_subscription" },
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });

  if (!subscription) {
    return null;
  }
  return subscription;
};

export const cancelSubscriptionOnStripe = async (subscriptionId: string) => {
  let stripeInstance: Stripe | null = await initializeStripe();
  if (!stripeInstance) return null;

  const subscriptionUpdated = await SubscriptionsDB.findOneAndUpdate(
    {
      subscriptionId,
    },
    {
      status: SubscriptionStatus.canceled,
    },
    {
      new: true,
    }
  );

  if (!subscriptionUpdated) {
    return null;
  }

  const subscription = stripeInstance.subscriptions.del(subscriptionId);

  if (!subscription) {
    return null;
  }

  return subscriptionUpdated;
};

export const createSubscriptionSchedule = async (subscriptionId: string) => {
  let stripeInstance: Stripe | null = await initializeStripe();
  if (!stripeInstance) return null;

  return stripeInstance.subscriptionSchedules
    .create({
      from_subscription: subscriptionId,
    })
    .then((response: Stripe.Response<Stripe.SubscriptionSchedule>) => {
      return response;
    })
    .catch((error: any) => {
      log.error(
        `Error on createSubscriptionSchedule() for subscription ${subscriptionId}. `,
        error.message
      );
    });
};
