import * as stripeService from "@/services/stripe.service";
import { Request, Response } from "express";
import AppResult from "@/utils/app-result";
import { AppErrorsMessages } from "@/constants";
import log from "@/utils/logs";
import { AppError } from "@/utils/app-error";
import { HttpStatusCode } from "axios";
import { buildStripeEvent } from "@/adapters";
import { handleCheckoutSessionComplete } from "@/services/webhooks/stripe/checkout-session-complete.service";
import { handleCustomerCreated } from "@/services/webhooks/stripe/customer-created.service";

export const getAllPlans = async (_: Request, res: Response) => {
  /* 
    #swagger.tags = ['Plans']
    #swagger.summary = 'Gets all plans'
    #swagger.description  = 'Gets all plans'
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/Plans" },
      description: 'List of plans with its prices'
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
    const products: any = await stripeService.getAllPlans();

    res.status(HttpStatusCode.Ok).json(products);
  } catch (e: any) {
    log.error("[StripeController.getAllPlans] EXCEPTION: ", e);
    res
      .status(HttpStatusCode.InternalServerError)
      .json(
        new AppResult(
          AppErrorsMessages.INTERNAL_ERROR,
          e.message,
          HttpStatusCode.InternalServerError
        )
      );
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['Plans']
    #swagger.summary = 'Gets a plan by its ID'
    #swagger.description  = 'Gets a plan by its ID'
    #swagger.parameters['planId'] = {
      in: 'params',
      description: 'ID of the plan in Stripe',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/Plan" },
      description: 'Plan details'
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

  const { planId } = req.params;

  try {
    if (!planId?.length) {
      throw new AppError(AppErrorsMessages.PLAN_ID_REQUIRED);
    }

    const products: any = await stripeService.getPlanById(planId);

    res.status(HttpStatusCode.Ok).json(products);
  } catch (e: any) {
    log.error("[StripeController.getPlanById] EXCEPTION: ", e);
    res
      .status(HttpStatusCode.InternalServerError)
      .json(
        new AppResult(
          AppErrorsMessages.INTERNAL_ERROR,
          e.message,
          HttpStatusCode.InternalServerError
        )
      );
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['Checkout']
    #swagger.summary = 'Creates a new checkout session'
    #swagger.description  = 'Creates a new checkout session'
    #swagger.parameters['priceId'] = {
      in: 'body',
      description: 'ID of the price in Stripe',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/Checkout" },
      description: 'New Stripe session'
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

  if (!(req as any).userAuthId) {
    res
      .status(HttpStatusCode.Forbidden)
      .json(
        new AppResult(
          AppErrorsMessages.FORBIDDEN,
          null,
          HttpStatusCode.Forbidden
        )
      );
    return;
  }

  const { priceId, email, currency, locale } = req.body;

  if (
    !priceId?.length ||
    !email?.length ||
    !currency?.length ||
    !locale?.length
  ) {
    throw new AppError(AppErrorsMessages.MISSING_PROPS);
  }

  try {
    const newSession = await stripeService.createCheckoutSession(
      priceId,
      email,
      currency,
      locale,
      (req as any).userId
    );

    res.status(HttpStatusCode.Ok).json(newSession);
  } catch (error: any) {
    log.error("[StripeController.createCheckoutSession] EXCEPTION: ", error);

    const result = AppResult.fromError(error);

    res.status(result.statusCode).json(result);
  }
};

export const getCheckoutSessionById = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['Checkout']
    #swagger.summary = 'Gets a checkout session by ID'
    #swagger.description  = 'Gets a checkout session by ID'
    #swagger.parameters['sessionId'] = {
      in: 'params',
      description: 'ID of the checkout session in Stripe',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/Checkout" },
      description: 'New Stripe session'
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

  const { sessionId } = req.params;

  if (!sessionId?.length) {
    throw new AppError(AppErrorsMessages.SESSION_ID_REQUIRED);
  }

  try {
    const newSession = await stripeService.getCheckoutSessionById(sessionId);

    res.status(HttpStatusCode.Ok).json(newSession);
  } catch (error: any) {
    log.error("[StripeController.getCheckoutSessionById] EXCEPTION: ", error);

    const result = AppResult.fromError(error);

    res.status(result.statusCode).json(result);
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['Invoice']
    #swagger.summary = 'Gets an invoice by ID'
    #swagger.description  = 'Gets an invoice by ID'
    #swagger.parameters['invoiceId'] = {
      in: 'params',
      description: 'ID of the invoice in Stripe',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/Invoice" },
      description: 'Invoice in Stripe'
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

  const { invoiceId } = req.params;

  if (!invoiceId?.length) {
    throw new AppError(AppErrorsMessages.INVOICE_ID_REQUIRED);
  }

  try {
    const invoice = await stripeService.getInvoiceById(invoiceId);

    res.status(HttpStatusCode.Ok).json(invoice);
  } catch (error: any) {
    log.error("[StripeController.getInvoiceById] EXCEPTION: ", error);

    const result = AppResult.fromError(error);

    res.status(result.statusCode).json(result);
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
    res
      .status(HttpStatusCode.BadRequest)
      .json(
        new AppResult(
          AppErrorsMessages.MISSING_PROPS,
          null,
          HttpStatusCode.BadRequest
        )
      );
    return;
  }

  try {
    await stripeService.cancelSubscriptionOnStripe(subscriptionId);

    res
      .status(HttpStatusCode.Ok)
      .json(new AppResult("Subscription canceled", null, HttpStatusCode.Ok));
  } catch (error: any) {
    log.error("[StripeController.cancelSubsctription] EXCEPTION: ", error);

    const result = AppResult.fromError(error);

    res.status(result.statusCode).json(result);
  }
};

export const getSubsctriptionById = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['Subscription']
    #swagger.summary = 'Gets a subscriptions by ID from Stripe'
    #swagger.description  = 'Gets a subscriptions by ID from Stripe'
    #swagger.parameters['subscriptionId'] = {
      in: 'params',
      description: 'Subscription ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Subscription from Stripe'
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
    res
      .status(HttpStatusCode.BadRequest)
      .json(
        new AppResult(
          AppErrorsMessages.MISSING_PROPS,
          null,
          HttpStatusCode.BadRequest
        )
      );
    return;
  }

  try {
    const subscriptionFound = await stripeService.getSubscriptionByIdOnStripe(
      subscriptionId
    );

    res.status(HttpStatusCode.Ok).send(subscriptionFound);
  } catch (error) {
    log.error(
      "[StripeController.getSubscriptionByIdOnStripe] EXCEPTION: ",
      error
    );

    const result = AppResult.fromError(error);
    res.status(result.statusCode).json(result);
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
    const event = buildStripeEvent(
      req.body,
      req.headers["stripe-signature"] as string
    );

    if (event.type === "checkout.session.completed") {
      console.log(
        `🔔 Received event [checkout.session.completed][${event.id}]`
      );
      console.table(event);
      handleCheckoutSessionComplete(event.data.object);
    } else if (event.type === "customer.created") {
      console.log(`🔔 Received event [customer.created][${event.id}]`);
      console.table(event);
      handleCustomerCreated(event.data.object);
    }

    res.send(new AppResult("Webhook received", null, HttpStatusCode.Ok));
  } catch (error) {
    log.error("[StripeController.hookEventsFromStripe] EXCEPTION: ", error);

    const result = AppResult.fromError(error);
    res.status(result.statusCode).json(result);
  }
};
