import Stripe from "stripe";
import { Types } from "mongoose";
import { HttpStatusCode } from "axios";
import { AppErrorsMessages } from "@/constants";
import stripe from "@/config/stripe";
import { AppError } from "@/utils/app-error";
import { Invoice } from "@/models/stripe/invoice.models";
import { Session } from "@/models/stripe/session.models";
import { checkoutModel } from "@/models/checkout.models";
import log from "@/utils/logs";
import { buildStripeClientError } from "@/utils";
import {
  Subscription,
  SubscriptionStatus,
} from "@/models/stripe/subscription.models";
import { Plan } from "@/models/stripe/plan.models";

export const getAllPlans = async () => {
  if (!stripe) throw buildStripeClientError("Services.Stripe.getAllPlans");

  const products = await stripe.products.list({ active: true });

  const pagefyProducts = products.data.filter(
    (product) =>
      product.statement_descriptor?.toLowerCase().includes("pagefy_sub") &&
      product.default_price
  );

  let withFilledPrices = [];

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

  withFilledPrices = withFilledPrices.sort((a: any, b: any) => {
    const priceA =
      a.prices.find((p: any) => p.recurring?.interval === "month")
        ?.unit_amount || 0;
    const priceB =
      b.prices.find((p: any) => p.recurring?.interval === "month")
        ?.unit_amount || 0;

    return priceA - priceB; // Ordena em ordem crescente (menor preço primeiro)
  });

  return withFilledPrices;
};

export const createCheckoutSession = async (
  priceId: string,
  email: string,
  currency: string,
  locale: string,
  coupon: string,
  userId: string
) => {
  const appUrl = process.env.APP_URL;

  if (!stripe || !process.env.APP_URL)
    throw buildStripeClientError("Services.Stripe.createCheckoutSession");

  const price = (await stripe.prices.retrieve(priceId, {
    expand: ["product"],
  })) as Omit<Stripe.Price, "product"> & { product: Stripe.Product };

  const newSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    ui_mode: "hosted",
    payment_method_types: ["card"],
    customer_email: email,
    currency,
    discounts: coupon?.length
      ? [
          {
            coupon,
          },
        ]
      : undefined,
    locale: locale as Stripe.Checkout.SessionCreateParams.Locale,
    custom_fields: [
      {
        key: "cpf",
        label: {
          custom: "CPF/ID",
          type: "custom",
        },
        type: "numeric",
        numeric: {
          maximum_length: 11,
          minimum_length: 11,
        },
      },
    ],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product_id=${price.product}&product_name=${price.product.name}`,
    cancel_url: `${appUrl}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}&product_id=${price.product}&product_name=${price.product.name}`,
  });

  try {
    await checkoutModel.create({
      userId: new Types.ObjectId(userId),
      session: newSession,
    });
    log.success("Checkout Session created in MongoDB");
  } catch (error) {
    throw new AppError(
      AppErrorsMessages.CREATE_CHECKOUT_SESSION,
      HttpStatusCode.BadRequest,
      error as Error
    );
  }

  return newSession as Session;
};

export const getCheckoutSessionById = async (sessionId: string) => {
  if (!stripe)
    throw buildStripeClientError("Services.Stripe.getCheckoutSessionById");

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

export const getPlanById = async (planId: string) => {
  if (!stripe) throw buildStripeClientError("Services.Stripe.getPlanById");

  const product = await stripe.products.retrieve(planId);

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

  const finalProduct = {
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
  };

  return finalProduct;
};

export const getInvoiceById = async (invoiceId: string) => {
  if (!stripe) throw buildStripeClientError("Services.Stripe.getInvoiceById");

  const invoice = await stripe.invoices.retrieve(invoiceId);

  return invoice as unknown as Invoice;
};

export const getExpandedCheckoutSessionByIdOnStripe = async (
  sessionId: string
) => {
  if (!stripe)
    throw buildStripeClientError(
      "Services.Stripe.getExpandedCheckoutSessionByIdOnStripe"
    );

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: [
      "invoice",
      "invoice.charge",
      "subscription",
      "subscription.items.data.plan",
      "subscription.items.data.price",
      "customer",
    ],
  });

  const productId = (
    (session.subscription as Subscription).items.data[0].plan as Plan
  ).product;

  const product = await stripe.products.retrieve(productId);

  return { ...session, product };
};

export const getSubscriptionByIdOnStripe = async (subscriptionId: string) => {
  if (!stripe)
    throw buildStripeClientError("Services.Stripe.getSubscriptionByIdOnStripe");

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return subscription;
};

export const getExpandedSubscriptionByIdOnStripe = async (
  subscriptionId: string
) => {
  if (!stripe)
    throw buildStripeClientError(
      "Services.Stripe.getExpandedSubscriptionByIdOnStripe"
    );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: [
      "latest_invoice",
      "items.data.plan",
      "items.data.price",
      "customer",
    ],
  });

  return subscription;
};

export const cancelSubscriptionOnStripe = async (
  subscriptionId: string,
  userId: string
) => {
  if (!stripe)
    throw buildStripeClientError("Services.Stripe.cancelSubscriptionOnStripe");

  try {
    const checkout = await checkoutModel.findOne({
      userId,
      "subscription.id": subscriptionId,
    });

    if (!checkout?.subscription) {
      throw new AppError(
        "Subscription not found for this user.",
        HttpStatusCode.BadRequest
      );
    }

    await stripe.subscriptions.cancel(subscriptionId);

    await checkout.update({
      subscription: {
        ...checkout.subscription,
        canceled_at: new Date().getTime(),
        cancellation_details: {
          comment: null,
          feedback: null,
          reason: "cancellation_requested",
        },
        status: SubscriptionStatus.CANCELED,
      },
    });
  } catch (error) {
    throw new AppError(
      "Error canceling subscription.",
      HttpStatusCode.BadRequest,
      error as Error
    );
  }
};

export const getCouponById = async (couponId: string) => {
  if (!stripe) throw buildStripeClientError("Services.Stripe.getCouponDetails");

  try {
    const coupon = await stripe.coupons.retrieve(couponId);

    return coupon;
  } catch (error) {
    throw new AppError(
      "Error retrieving Stripe coupon.",
      HttpStatusCode.BadRequest,
      error as Error
    );
  }
};
