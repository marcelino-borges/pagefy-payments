import Stripe from "stripe";
import stripe, { initializeStripe } from "../config/stripe";
import { AppErrorsMessages } from "../constants";
import AppResult from "../errors/app-error";
import UserDb, { IUser, PlansTypes } from "../models/user.models";
import { Request, Response } from "express";
import SubscriptionsDB, {
  IPaymentIntent,
  ISubscriptionCreationResult,
  SubscriptionStatus,
} from "../models/subscription.models";
import { getDictionayByLanguage } from "../utils/localization";
import { IEmailRecipient } from "../models/email.models";
import { sendEmailToUser } from "./email.service";
import log from "./../utils/logs";

let stripeInstance: Stripe | null = stripe;

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

export const getSubsctriptionPaymentIntent = async (
  paymentIntentId: string
) => {
  if (!stripeInstance) stripeInstance = await initializeStripe();

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
  if (!stripeInstance) stripeInstance = await initializeStripe();

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
  if (!stripeInstance) stripeInstance = await initializeStripe();

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

export const hookPaymentFromStripe = async (req: Request, res: Response) => {
  if (!stripeInstance) stripeInstance = await initializeStripe();
  if (!stripeInstance) return null;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(AppErrorsMessages.INTERNAL_ERROR);
  }

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"] as any,
      webhookSecret
    );
    res.send();
  } catch (error: any) {
    log.error(`Webhook Error ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  if (!event) return null;

  const paymentIntent: IPaymentIntent = event.data.object as IPaymentIntent;

  const updatedSubscription = await SubscriptionsDB.findOneAndUpdate(
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
    }
  );

  if (!updatedSubscription) return null;

  const userFound = await UserDb.findOne({
    _id: updatedSubscription.userId,
  }).lean();

  if (!userFound) return null;

  const dictionary = getDictionayByLanguage("en");
  let userRecipient: IEmailRecipient | undefined = undefined;
  log.warn("event.type: " + event.type);

  // Handle the event
  switch (event.type) {
    case "payment_intent.payment_failed":
      log.warn("Pagamento falhou, do usuario " + userFound.email);
      userRecipient = {
        name: userFound.firstName,
        email: userFound.email,
        subject: `[Socialbio] ${dictionary.payment}`,
        language: "en",
        message: `
          <b>Hey ${userFound.firstName},</b><br>
          <br>
          Sorry, your payment failed!<br>
          Please try to subscribe again.<br>
          <a href"https://socialbio.me">Click here to try again.</a>          
          `,
      };
      break;
    case "payment_intent.succeeded":
      log.warn("Pagamento com sucesso do usuario " + userFound.email);
      userRecipient = {
        name: userFound.firstName,
        email: userFound.email,
        subject: `[Socialbio] ${dictionary.payment}`,
        language: "en",
        message: `
        <b>Hey ${userFound.firstName},</b><br>
        <br>
        Congratulations! Your payment was finished with success!<br>
        You are now a ${getPlanByPriceId(
          updatedSubscription.priceId
        )} subscriber!<br>
        Welcome onboard!
        `,
      };
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }

  if (!userRecipient) return null;

  sendEmailToUser(userRecipient);
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

const getPlanByPriceId = (priceId: string) => {
  if (
    priceId === process.env.STRIPE_PRICE_VIP_MONTH_ID ||
    priceId === process.env.STRIPE_PRICE_VIP_YEAR_ID
  )
    return PlansTypes.VIP;
  else if (
    priceId === process.env.STRIPE_PRICE_PLATINUM_MONTH_ID ||
    priceId === process.env.STRIPE_PRICE_PLATINUM_YEAR_ID
  )
    return PlansTypes.PLATINUM;
  else return PlansTypes.FREE;
};
