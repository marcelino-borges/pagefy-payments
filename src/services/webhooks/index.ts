import stripe, { initializeStripe } from "../../config/stripe";
import { Request, Response } from "express";
import AppResult from "../../errors/app-error";
import { AppErrorsMessages } from "../../constants";
import log from "../../utils/logs";
import { handlePaymentIntent } from "./payment-intent.service";
import { handleInvoice } from "./invoice.service";
import Stripe from "stripe";

let stripeInstance: Stripe | null = stripe;

export const hookEventsFromStripe = async (req: Request, res: Response) => {
  if (!stripeInstance) stripeInstance = await initializeStripe();
  if (!stripe)
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, undefined, 500));

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(AppErrorsMessages.INTERNAL_ERROR);
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"] as any,
      webhookSecret
    );
  } catch (error: any) {
    log.error(`Webhook Error ${error.message}`);
    return res
      .status(500)
      .json(new AppResult(`Webhook Error`, error.message, 500));
  }
  if (!event)
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, undefined, 500));

  console.log("🔔 Received event " + event.type);
  if (event.type.includes("payment_intent")) {
    handlePaymentIntent(event);
  } else if (event.type.includes("invoice")) {
    handleInvoice(event);
  } else if (event.type.includes("subscription_schedule")) {
    handleInvoice(event);
  }

  return res.send();
};
