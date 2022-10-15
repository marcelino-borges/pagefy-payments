import Stripe from "stripe";
import stripe, { initializeStripe } from "../config/stripe";
import { AppErrorsMessages, SYSTEM_EMAIL_CREDENTIALS } from "../constants";
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
import { IInvoice } from "./../models/invoices.models";
import {
  convertPaymentAmountToDecimalString,
  getLanguageFromCurrency,
  getPlanByPriceId,
  getPriceIdByRecurrencyAndPlanType,
} from "../utils/stripe";

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
  if (!stripeInstance)
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, undefined, 500));

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

  if (event.type.includes("payment_intent")) {
    handlePaymentIntent(event);
  } else if (event.type.includes("invoice")) {
    handleInvoice(event);
  }

  return res.send();
};

const handlePaymentIntent = async (event: any) => {
  const paymentIntent: IPaymentIntent = event.data.object;

  const userFound = await UserDb.findOne({
    email: paymentIntent.receipt_email,
  }).lean();

  if (userFound) {
    const currency = paymentIntent.currency;
    const language = getLanguageFromCurrency(currency);
    const dictionary = getDictionayByLanguage(language);
    let userRecipient: IEmailRecipient | undefined = undefined;
    const amount: string = convertPaymentAmountToDecimalString(
      paymentIntent.amount_received
    );

    const updatedSubscription = await updateSubscriptionFromPaymentIntent(
      paymentIntent
    );

    if (updatedSubscription) {
      const plan = getPlanByPriceId(updatedSubscription.priceId);

      switch (event.type) {
        case "payment_intent.payment_failed":
          log.warn(`⛈️ Pagamento do usuario ${userFound.email} falhou`);

          userRecipient = {
            name: userFound.firstName,
            email: userFound.email,
            subject: `[Socialbio] ${dictionary.payment}`,
            message: `
        <b>Hey ${userFound.firstName},</b><br>
        <br>
        Sorry, your payment failed!<br>
        Please try to subscribe again.<br>
        <a href"https://socialbio.me">Click here to try again.</a>        
        <br>
        <br>
        Socialbio Team<br>  
        `,
          };
          break;
        case "payment_intent.succeeded":
          log.success(
            "💰 Pagamento com sucesso para o usuario " + userFound.email
          );

          const getEmailMessageByLanguage = (lang: string) => {
            switch (lang) {
              case "pt":
                return `
              <b>Olá, ${userFound.firstName}!</b><br>
              <br>
              Parabéns! Seu pagamento foi finalizado com sucesso!<br>
              Agora você é um assinante ${plan}!<br>
              Bem-vindo a bordo!<br>
              <br>
              <br>
              Equipe Socialbio<br>
              <a href"https://socialbio.me">https://www.socialbio.me</a>   
              `;
              default:
                return `
              <b>Hey ${userFound.firstName},</b><br>
              <br>
              Congratulations! Your payment was finished with success!<br>
              You are now a ${getPlanByPriceId(
                updatedSubscription.priceId
              )} subscriber!<br>
              Welcome onboard!<br>
              <br>
              <br>
              Socialbio Team<br>
              <a href"https://socialbio.me">https://www.socialbio.me</a>   
              `;
            }
          };

          userRecipient = {
            name: userFound.firstName,
            email: userFound.email,
            subject: `[Socialbio] ${dictionary.paymentSucceed}`,
            message: getEmailMessageByLanguage(language),
          };

          if (SYSTEM_EMAIL_CREDENTIALS?.user) {
            const systemRecipient: IEmailRecipient = {
              name: "System",
              email: SYSTEM_EMAIL_CREDENTIALS.user,
              subject: `[Socialbio] ${dictionary.payment}`,
              message: `
              <b>Hey Team!</b><br>
              <br>
              User ${userFound.firstName} (${
                userFound.email
              }) has just paid for a ${plan} subscription of ${amount} (${currency.toUpperCase()})<br>
              Socialbio System<br>  
              `,
            };
            sendEmailToUser(systemRecipient);
          }
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
          break;
      }
    }
  }
};

const handleInvoice = async (event: any) => {
  const invoice: IInvoice = event.data.object as IInvoice;

  const userFound = await UserDb.findOne({
    email: invoice.customer_email,
  }).lean();

  if (userFound) {
    const currency = invoice.currency;
    const language = getLanguageFromCurrency(currency);
    const dictionary = getDictionayByLanguage(language);
    let userRecipient: IEmailRecipient | undefined = undefined;
    const amount: string = convertPaymentAmountToDecimalString(
      invoice.amount_paid
    );

    log.success(`📄 Nota fiscal ${userFound.email} disponível.`);

    const getEmailMessageByLanguage = (lang: string) => {
      switch (lang) {
        case "pt":
          return `
          <b>Olá, ${userFound.firstName}!</b><br>
          <br>
          A nota fiscal para a sua nova assinatura já está disponível!<br>
          Você pode visualizar e baixar aqui: <a href"${invoice.invoice_pdf}">CLICANDO AQUI</a><br>
          <br>
          <br>
          Equipe Socialbio<br>
          <a href"https://socialbio.me">https://www.socialbio.me</a>   
          `;
        default:
          return `
          <b>Hey ${userFound.firstName},</b><br>
          <br>
          The invoice for your new subscription is available!<br>
          You can view and download <a href"${invoice.invoice_pdf}">CLICKING HERE</a><br>
          <br>
          <br>
          Socialbio Team<br>
          <a href"https://socialbio.me">https://www.socialbio.me</a>   
          `;
      }
    };

    switch (event.type) {
      case "invoice.paid":
        userRecipient = {
          name: userFound.firstName,
          email: userFound.email,
          subject: `[Socialbio] ${dictionary.paymentSucceed}`,
          message: getEmailMessageByLanguage(language),
        };
        break;
      default:
        log.error(`Unhandled event type ${event.type}`);
        break;
    }

    if (userRecipient) sendEmailToUser(userRecipient);
  }
};

const updateSubscriptionFromPaymentIntent = async (
  paymentIntent: IPaymentIntent
) => {
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
  return updatedSubscription;
};
