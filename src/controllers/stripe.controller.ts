import SubscriptionsDB, {
  ICreateSubscriptionProps,
  ISubscriptionCreationResult,
} from "../models/subscription.models";
import * as userService from "../services/user.service";
import * as stripeService from "../services/stripe.service";
import { Request, Response } from "express";
import AppResult from "../errors/app-error";
import { AppErrorsMessages } from "../constants";
import log from "../utils/logs";
import Stripe from "stripe";
import { IUser } from "./../models/user.models";
import { updateUser } from "./../services/user.service";
import * as stripeWebhooks from "../services/webhooks";
import * as subscriptionsResultsService from "./../services/subscriptions-results.service";

export const createSubsctription = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['Subscription']
    #swagger.summary = 'Creates a new subscription for a given user'
    #swagger.description  = 'Creates a new subscription for a given user'
    #swagger.parameters['currency'] = {
      in: 'body',
      description: 'User currency',
      required: true,
      type: 'string'
    }
    #swagger.parameters['recurrency'] = {
      in: 'body',
      description: 'month or year',
      required: true,
      type: 'string'
    }
    #swagger.parameters['planType'] = {
      in: 'body',
      description: 'Plan type',
      required: true,
      type: number
    }
    #swagger.responses[201] = {
      description: 'Subscription created'
    }
    #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
    #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
  */
  const {
    currency,
    recurrency,
    planType,
    tokenEmail,
  }: ICreateSubscriptionProps = req.body as ICreateSubscriptionProps;

  if (!currency || !recurrency || !planType) {
    return res
      .status(400)
      .json(new AppResult(AppErrorsMessages.MISSING_PROPS, null, 400));
  }

  try {
    const userFound: IUser | null = await userService.getUserByEmail(
      tokenEmail
    );

    if (!userFound) {
      return res
        .status(400)
        .json(new AppResult(AppErrorsMessages.USER_NOT_FOUND, null, 400));
    }

    const userWithPaymentId: IUser =
      await stripeService.assureStripeCustomerCreated(userFound);

    if (
      !userWithPaymentId ||
      !userWithPaymentId.paymentId ||
      !userWithPaymentId._id
    ) {
      throw new Error(AppErrorsMessages.SUBSCRIPTION_NOT_CREATED);
    }

    updateUser(userWithPaymentId).catch((error: any) => {
      log.error("ERROR UPDATING USER WITH PAYMENT ID. ", error);
    });

    const subscription: Stripe.Subscription | null | undefined =
      await stripeService.createSubscriptionOnStripe(
        userWithPaymentId.paymentId,
        currency,
        recurrency,
        planType
      );

    if (!subscription) {
      return res
        .status(400)
        .json(
          new AppResult(AppErrorsMessages.SUBSCRIPTION_NOT_CREATED, null, 400)
        );
    }

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    const subscriptionResult: ISubscriptionCreationResult = {
      subscriptionId: subscription.id,
      subscriptionEnd: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      subscriptionStart: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      currency: subscription.items.data[0].price.currency,
      priceId: subscription.items.data[0].price.id,
      recurrency: subscription.items.data[0].price.recurring?.interval,
      customer: subscription.customer,
      paymentIntentId: paymentIntent.id,
      latestInvoice: invoice,
      userId: userWithPaymentId._id,
      status: subscription.status,
    };

    let clientSecret = paymentIntent?.client_secret;

    if (paymentIntent?.client_secret)
      subscriptionResult.latestInvoice.payment_intent.client_secret = null;

    const subscriptionSaved =
      await subscriptionsResultsService.saveSubscriptionResult(
        subscriptionResult
      );

    if (!subscriptionSaved) {
      return res
        .status(400)
        .json(
          new AppResult(AppErrorsMessages.SUBSCRIPTION_NOT_CREATED, null, 400)
        );
    }

    subscriptionSaved.latestInvoice.payment_intent.client_secret = clientSecret;
    return res.status(201).json(subscriptionSaved);
  } catch (e: any) {
    log.error("[StripeController.createSubsctription] EXCEPTION: ", e);
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};

export const cancelSubsctription = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['Subscription']
    #swagger.summary = 'Cancels a subscription'
    #swagger.description  = 'Cancels a subscription'
    #swagger.parameters['subscriptionId'] = {
      in: 'params',
      description: 'Subscription ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Subscription created'
    }
    #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
    #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
  */
  const { subscriptionId } = req.params;

  if (!subscriptionId) {
    return res
      .status(400)
      .json(new AppResult(AppErrorsMessages.MISSING_PROPS, null, 400));
  }

  try {
    const subscriptionCanceled: ISubscriptionCreationResult | null =
      await stripeService.cancelSubscriptionOnStripe(subscriptionId);

    if (!subscriptionCanceled) {
      return res
        .status(400)
        .json(
          new AppResult(AppErrorsMessages.SUBSCRIPTION_NOT_CANCELED, null, 400)
        );
    }

    return res.status(200).json(subscriptionCanceled);
  } catch (e: any) {
    log.error("[StripeController.cancelSubsctription] EXCEPTION: ", e);
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};

export const getSubsctriptionPaymentIntent = async (
  req: Request,
  res: Response
) => {
  /* 
    #swagger.tags = ['Subscription']
    #swagger.summary = 'Gets a payment intent from a subscription'
    #swagger.description  = 'Gets a payment intent from a subscription'
    #swagger.parameters['paymentIntentId'] = {
      in: 'query',
      description: 'Payment Intent ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Subscription created'
    }
    #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
    #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
  */
  const { paymentIntentId } = req.params;

  if (!paymentIntentId) {
    return res
      .status(400)
      .json(new AppResult(AppErrorsMessages.MISSING_PROPS, null, 400));
  }

  try {
    const paymentIntent: any = await stripeService.cancelSubscriptionOnStripe(
      paymentIntentId
    );

    if (!paymentIntent) {
      return res
        .status(400)
        .json(
          new AppResult(AppErrorsMessages.PAYMENT_INTENT_NOT_FOUND, null, 400)
        );
    }

    return res.status(200).json(paymentIntent);
  } catch (e: any) {
    log.error(
      "[StripeController.getSubsctriptionPaymentIntent] EXCEPTION: ",
      e
    );
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};

export const getUserSubsctriptions = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['Subscription']
    #swagger.summary = 'Gets all subscriptions belonging to an user'
    #swagger.description  = 'Gets all subscriptions belonging to an user'
    #swagger.parameters['userId'] = {
      in: 'params',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Subscription created'
    }
    #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
    #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
  */
  const { userId } = req.params;

  if (!userId) {
    return res
      .status(400)
      .json(new AppResult(AppErrorsMessages.MISSING_PROPS, null, 400));
  }

  try {
    const subscriptions: any =
      await subscriptionsResultsService.getUserSubsctriptions(userId);

    if (!subscriptions?.length) {
      return res
        .status(400)
        .json(
          new AppResult(
            AppErrorsMessages.USER_HAS_NOT_SUBSCRIPTIONS,
            AppErrorsMessages.USER_HAS_NOT_SUBSCRIPTIONS,
            400
          )
        );
    }

    return res.status(200).json(subscriptions);
  } catch (e: any) {
    log.error("[StripeController.getUserSubsctriptions] EXCEPTION: ", e);
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};

export const hookEventsFromStripe = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['Webhooks']
    #swagger.summary = 'Receives webhook events from Stripe'
    #swagger.description  = 'Receives webhook events from Stripe'
    #swagger.parameters['event'] = {
      in: 'body',
      description: 'Payment Intent',
      required: true,
      type: object
    }
    #swagger.responses[200] = {
      description: 'Subscription created'
    }
    #swagger.responses[400] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
    #swagger.responses[500] = {
      schema: { $ref: "#/definitions/Error" },
      description: 'Message of error'
    }
  */
  try {
    stripeWebhooks.hookEventsFromStripe(req, res);
  } catch (e: any) {
    log.error(
      "[StripeController.getSubsctriptionPaymentIntent] EXCEPTION: ",
      e
    );
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};
