import { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";
import { AppErrorsMessages } from "@/constants";
import AppResult from "@/utils/app-result";
import * as userService from "@/services/user.service";
import log from "@/utils/logs";

export const verifyToken = async (req: Request, res: Response, next: any) => {
  const bearer = req.headers["authorization"] as string;

  if (!bearer) {
    res
      .status(HttpStatusCode.Unauthorized)
      .json(
        new AppResult(
          AppErrorsMessages.NO_TOKEN_PROVIDED,
          null,
          HttpStatusCode.Unauthorized
        )
      );
    return;
  }

  const token = bearer.split(" ")[1];

  try {
    const decodedToken: DecodedIdToken = await getAuth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    const userFound = await findUser(uid, token);

    if (!userFound) {
      res
        .status(HttpStatusCode.Unauthorized)
        .json(
          new AppResult(
            AppErrorsMessages.UNAUTHORIZED,
            AppErrorsMessages.USER_NOT_FOUND,
            HttpStatusCode.Unauthorized
          )
        );
      return;
    }

    (req as any).userEmail = email;
    (req as any).userAuthId = uid;
    (req as any).userId = userFound._id;
    (req as any).token = token;

    next();
  } catch (error) {
    log.error("[verifyToken] EXCEPTION: " + JSON.stringify(error));
    res
      .status(HttpStatusCode.Unauthorized)
      .json(
        new AppResult(
          AppErrorsMessages.UNAUTHORIZED,
          (error as Error).message,
          HttpStatusCode.Unauthorized
        )
      );
  }
};

export const findUser = async (
  userAuthId: string | undefined,
  token: string
) => {
  if (!userAuthId) return null;

  const foundUser = await userService.getUserByAuthId(userAuthId, token);

  return foundUser;
};
