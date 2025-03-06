import Stripe from "stripe";
import { AppErrorsMessages } from "../constants";
import { IUser, PlansTypes } from "../models/user.models";
import SubscriptionsDB, {
  SubscriptionStatus,
} from "../models/subscription.models";
import { getPriceIdByRecurrencyAndPlanType } from "../utils/stripe";
import log from "../utils/logs";
import stripe from "../config/stripe";
import { AppError } from "../utils/app-error";
import { HttpStatusCode } from "axios";
import { CheckoutSession } from "../models/checkout.models";
import { Invoice } from "../models/invoice.models";

export const getAllPlans = async () => {
  if (!stripe) return null;

  const products = await stripe.products.list({ active: true });

  const pagefyProducts = products.data.filter(
    (product) =>
      product.statement_descriptor?.toLowerCase().includes("pagefy_sub") &&
      product.default_price
  );

  const withFilledPrices = [];

  for (const product of pagefyProducts) {
    const productPrices = await stripe.prices.list({
      active: true,
      product: product.id,
    });

    const {
      // removed props
      package_dimensions,
      shippable,
      unit_label,
      livemode,
      attributes,
      object,
      active,
      marketing_features,
      statement_descriptor,
      tax_code,
      type,
      // adapted props
      name,
      metadata,
      updated,
      created,
      ...withoutMetadata
    } = product as any;

    const features = {
      pt: metadata.features_pt.split(";"),
      en: metadata.features_en.split(";"),
    };

    withFilledPrices.push({
      ...withoutMetadata,
      features,
      created_at: new Date(created * 1000),
      updated_at: new Date(updated * 1000),
      name: name.replace("Pagefy ", ""),
      prices: productPrices.data.map(
        ({
          // removed props
          livemode,
          billing_scheme,
          object,
          active,
          custom_unit_amount,
          metadata,
          nickname,
          tax_behavior,
          tiers_mode,
          transform_quantity,
          // adapted props
          created,
          ...price
        }) => ({
          ...price,
          created_at: new Date(created * 1000),
        })
      ),
    });
  }

  return withFilledPrices;
};

export const createCheckoutSession = async (priceId: string) => {
  const appUrl = process.env.APP_URL;

  if (!stripe || !process.env.APP_URL)
    throw new AppError(
      AppErrorsMessages.INTERNAL_ERROR,
      HttpStatusCode.InternalServerError
    );

  const newSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    ui_mode: "hosted",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
  });

  return newSession as CheckoutSession;
};

export const getCheckoutSessionById = async (sessionId: string) => {
  if (!stripe)
    throw new AppError(
      AppErrorsMessages.INTERNAL_ERROR,
      HttpStatusCode.InternalServerError
    );

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  let invoice: Invoice | undefined;

  if (session.invoice && typeof session.invoice === "string") {
    invoice = await getInvoiceById(session.invoice);
  }

  return {
    ...session,
    invoice: invoice ?? session.invoice,
  };
};

export const getInvoiceById = async (invoiceId: string) => {
  if (!stripe)
    throw new AppError(
      AppErrorsMessages.INTERNAL_ERROR,
      HttpStatusCode.InternalServerError
    );

  const invoice = await stripe.invoices.retrieve(invoiceId);

  return invoice as unknown as Invoice;
};

export const cancelSubscriptionAtPeriodEnd = async (subscriptionId: string) => {
  if (!stripe)
    throw new AppError(
      AppErrorsMessages.INTERNAL_ERROR,
      HttpStatusCode.InternalServerError
    );

  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
};

export const createCustomer = async (
  user: IUser
): Promise<Stripe.Customer | null> => {
  if (!stripe) return null;

  const params: Stripe.CustomerCreateParams = {
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    metadata: {
      authId: user.authId || null,
      userId: user._id?.toString() || null,
    },
  };

  const customer: Stripe.Customer = await stripe.customers.create(params);

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
  if (!stripe) return null;

  if (!paymentIntentId) {
    return null;
  }

  const paymentIntent = stripe.paymentIntents.retrieve(paymentIntentId);

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
  if (!stripe) return null;

  if (!paymentId) {
    return null;
  }

  const priceId = getPriceIdByRecurrencyAndPlanType(recurrency, planType);

  if (!priceId) {
    return null;
  }

  const subscription = stripe.subscriptions.create({
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
  if (!stripe) return null;

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

  const subscription = stripe.subscriptions.cancel(subscriptionId);

  if (!subscription) {
    return null;
  }

  return subscriptionUpdated;
};

export const createSubscriptionSchedule = async (subscriptionId: string) => {
  if (!stripe) return null;

  return stripe.subscriptionSchedules
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
