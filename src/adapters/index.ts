import { HttpStatusCode } from "axios";
import { AppErrorsMessages } from "../constants";
import { AppError } from "../utils/app-error";
import stripe from "../config/stripe";

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
