import Stripe from "stripe";
import { initializeStripe } from "../config/stripe";
import { AppErrorsMessages } from "../constants";
import { IUser, PlansTypes } from "../models/user.models";
import SubscriptionsDB, {
  ISubscriptionCreationResult,
} from "../models/subscription.models";
import log from "../utils/logs";

let stripeInstance: Stripe | null = null;

export const createCustomer = async (
  user: IUser
): Promise<Stripe.Customer | null> => {
  if (!stripeInstance) stripeInstance = await initializeStripe();

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
  if (!stripeInstance) stripeInstance = await initializeStripe();

  if (!stripeInstance)
    throw new Error(AppErrorsMessages.INVALID_PAYMENT_INSTANCE);

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

export const createSubscriptionOnStripe = async (
  paymentId: string,
  currency: string,
  recurrency: "month" | "year",
  planType: PlansTypes
) => {
  if (!stripeInstance) stripeInstance = await initializeStripe();

  if (!stripeInstance) return;

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

export const saveSubscriptionResult = async (
  subscription: ISubscriptionCreationResult
): Promise<ISubscriptionCreationResult> => {
  return (
    await SubscriptionsDB.create(subscription)
  ).toObject() as ISubscriptionCreationResult;
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

const getPriceIdByRecurrencyAndPlanType = (
  recurrency: "month" | "year",
  planType: PlansTypes
) => {
  if (planType === PlansTypes.VIP) {
    if (recurrency === "month") {
      return process.env.STRIPE_PRICE_VIP_MONTH_ID;
    } else if (recurrency === "year") {
      return process.env.STRIPE_PRICE_VIP_YEAR_ID;
    }
  } else if (planType === PlansTypes.PLATINUM) {
    if (recurrency === "month") {
      return process.env.STRIPE_PRICE_PLATINUM_MONTH_ID;
    } else if (recurrency === "year") {
      return process.env.STRIPE_PRICE_PLATINUM_YEAR_ID;
    }
  }
  return undefined;
};
