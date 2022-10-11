import { Request, Response } from "express";

import * as userService from "../services/user.service";
import AppResult from "../errors/app-error";
import { AppErrorsMessages } from "../constants";
import { log } from "../utils/utils";

export const charge = async (req: Request, res: Response) => {
  /* 
    #swagger.tags = ['Charge']
    #swagger.summary = 'Makes a charge by credit card'
    #swagger.description  = 'Makes a charge by credit card'
    #swagger.parameters['encryptedCard'] = {
      in: 'body',
      description: 'Credit card number encrypted',
      required: true,
      type: 'string'
    }
    #swagger.parameters['value'] = {
      in: 'query',
      description: 'Charge value',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      schema: { $ref: "#/definitions/User" },
      description: 'User data'
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
  const email: string = req.query.email as string;
  const userId: string = req.query.userId as string;

  if (!email && !userId) {
    return res
      .status(400)
      .json(
        new AppResult(AppErrorsMessages.USERID_OR_EMAIL_REQUIRED, null, 400)
      );
  }

  try {
    let userFound;

    if (userId && userId.length > 0) {
      userFound = await userService.getUserById(email);
    }

    if (!userFound && email && email.length > 0) {
      userFound = await userService.getUserByEmail(email);
    }

    if (!userFound) {
      return res
        .status(400)
        .json(new AppResult(AppErrorsMessages.USER_NOT_FOUND, null, 400));
    }
    return res.status(200).json(userFound);
  } catch (e: any) {
    log("[UserController.getUser] EXCEPTION: ", e);
    return res
      .status(500)
      .json(new AppResult(AppErrorsMessages.INTERNAL_ERROR, e.message, 500));
  }
};
