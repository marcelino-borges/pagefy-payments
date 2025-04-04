import { AppErrorsMessages } from "@/constants";
import * as checkoutsService from "@/services/checkout.service";
import AppResult from "@/utils/app-result";
import log from "@/utils/logs";
import { HttpStatusCode } from "axios";
import { Request, Response } from "express";

export const getSubsctriptionsByUserId = async (
  req: Request,
  res: Response
) => {
  /* 
    #swagger.tags = ['Subscription']
    #swagger.summary = 'Gets all user subscriptions'
    #swagger.description  = 'Gets all user subscriptions'
    #swagger.parameters['userId'] = {
      in: 'params',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Subscriptions',
      schema: { $ref: "#/definitions/Subscriptions" },
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
    const subscriptions = await checkoutsService.getSubsctriptionsByUserId(
      userId
    );

    res.status(HttpStatusCode.Ok).send(subscriptions);
  } catch (error) {
    log.error(
      "[StripeController.getSubsctriptionsByUserId] EXCEPTION: ",
      error
    );

    const result = AppResult.fromError(error);
    res.status(result.statusCode).json(result);
  }
};

export const getUserActiveSubscription = async (
  req: Request,
  res: Response
) => {
  /* 
    #swagger.tags = ['Subscription']
    #swagger.summary = 'Gets user active subscription'
    #swagger.description  = 'Gets user active subscription'
    #swagger.parameters['userId'] = {
      in: 'params',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Subscriptions',
      schema: { $ref: "#/definitions/Subscription" },
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
  const tokenUserId = (req as any).userId;

  if (userId !== tokenUserId) {
    const result = AppResult.buildForbidden(
      "Attempt to access another user's data."
    );

    res.status(result.statusCode).json(result);
    return;
  }

  if (!userId) {
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
    const subscriptions = await checkoutsService.getUserActiveSubscription(
      userId
    );

    res.status(HttpStatusCode.Ok).send(subscriptions);
  } catch (error) {
    log.error(
      "[StripeController.getUserActiveSubscription] EXCEPTION: ",
      error
    );

    const result = AppResult.fromError(error);
    res.status(result.statusCode).json(result);
  }
};

export const getSystemUserActiveSubscription = async (
  req: Request,
  res: Response
) => {
  /* 
    #swagger.tags = ['Subscription']
    #swagger.summary = 'Gets user active subscription'
    #swagger.description  = 'Gets user active subscription'
    #swagger.parameters['userId'] = {
      in: 'params',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Subscriptions',
      schema: { $ref: "#/definitions/Subscription" },
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
    const subscriptions = await checkoutsService.getUserActiveSubscription(
      userId
    );

    res.status(HttpStatusCode.Ok).send(subscriptions);
  } catch (error) {
    log.error(
      "[StripeController.getSystemUserActiveSubscription] EXCEPTION: ",
      error
    );

    const result = AppResult.fromError(error);
    res.status(result.statusCode).json(result);
  }
};
