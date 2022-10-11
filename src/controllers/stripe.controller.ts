import {
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

    const subscriptionResult: ISubscriptionCreationResult = {
      subscriptionId: subscription.id,
      subscriptionEnd: subscription.current_period_end,
      subscriptionStart: subscription.current_period_start,
      currency: subscription.items.data[0].price.currency,
      priceId: subscription.items.data[0].price.id,
      recurrency: subscription.items.data[0].price.recurring?.interval,
      customer: subscription.customer,
      latestInvoice: subscription.latest_invoice,
      userId: userWithPaymentId._id,
      status: subscription.status,
    };

    const subscriptionSaved = await stripeService.saveSubscriptionResult(
      subscriptionResult
    );

    if (!subscriptionSaved) {
      return res
        .status(400)
        .json(
          new AppResult(AppErrorsMessages.SUBSCRIPTION_NOT_CREATED, null, 400)
        );
    }

    return res.status(201).json(subscriptionSaved);
  } catch (e: any) {
    log.error("[StripeController.createSubsctription] EXCEPTION: ", e);
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};
