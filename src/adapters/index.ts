import { HttpStatusCode } from "axios";
import { AppErrorsMessages } from "@/constants";
import { AppError } from "@/utils/app-error";
import stripe from "@/config/stripe";
import { Checkout, UserSubscription } from "@/models/checkout.models";
import { Plan } from "@/models/stripe/plan.models";

export const buildStripeEvent = (requestBody: any, signatureHeader: string) => {
  if (!stripe) {
    throw new AppError(
      AppErrorsMessages.INTERNAL_ERROR,
      HttpStatusCode.InternalServerError,
      new Error("Stripe instance not initialized.")
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new AppError(
      AppErrorsMessages.INTERNAL_ERROR,
      HttpStatusCode.InternalServerError,
      new Error("Stripe webhook secret not found.")
    );
  }

  try {
    return stripe.webhooks.constructEvent(
      requestBody,
      signatureHeader,
      webhookSecret
    );
  } catch (error) {
    throw new AppError(
      AppErrorsMessages.INTERNAL_ERROR,
      HttpStatusCode.InternalServerError,
      error as Error
    );
  }
};

export const adaptCheckoutToUserSubscription = (
  checkout: Checkout
): UserSubscription => ({
  subscriptionId: checkout.subscription!.id,
  stripeProductId: checkout.product!.id,
  isActive: checkout.subscription!.status === "active",
  interval: (checkout.subscription!.items.data[0].plan as Plan).interval,
  currency: checkout.session.currency,
  onlineReceiptUrl: checkout.invoice?.hosted_invoice_url ?? "",
  price: checkout.invoice?.total ?? 0,
  captureDate: checkout.charge ? new Date(checkout.charge.created * 100) : null,
  planName: checkout.product!.name,
  planImageUrl: checkout.product!.images[0],
  invoiceOnlineUrl: checkout.invoice!.hosted_invoice_url,
  invoiceDownloadPdf: checkout.invoice!.invoice_pdf,
  willCancelAt: checkout.subscription!.cancel_at
    ? new Date(checkout.subscription!.cancel_at * 1000)
    : new Date(checkout.subscription!.current_period_end * 1000),
  canceledAt: checkout.subscription!.canceled_at
    ? new Date(checkout.subscription!.canceled_at * 1000)
    : null,
  currentPeriodStart: new Date(
    checkout.subscription!.current_period_start * 1000
  ),
  currentPeriodEnd: new Date(checkout.subscription!.current_period_end * 1000),
});
