import { Request, Response } from "express";
import { AppErrorsMessages } from "../constants";
import AppResult from "../utils/app-result";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";
import log from "../utils/logs";
import * as userService from "../services/user.service";

export const verifyToken = async (req: Request, res: Response, next: any) => {
  const bearer = req.headers["authorization"] as string;

  if (!bearer) {
    res
      .status(401)
      .json(new AppResult(AppErrorsMessages.NO_TOKEN_PROVIDED, null, 401));
    return;
  }

  const token = bearer.replace("Bearer ", "");

  getAuth()
    .verifyIdToken(token)
    .then(async (decodedToken: DecodedIdToken) => {
      const { uid, email } = decodedToken;
      (req.body as any).tokenEmail = email;
      (req.body as any).tokenUid = uid;

      if (!isUserAuthorized(uid)) {
        res
          .status(401)
          .json(new AppResult(AppErrorsMessages.NOT_AUTHORIZED, null, 401));
        return;
      }
      next();
    })
    .catch((error) => {
      log.error("[verifyToken] EXCEPTION: " + JSON.stringify(error));
      res
        .status(401)
        .json(
          new AppResult(AppErrorsMessages.NOT_AUTHORIZED, error.message, 401)
        );
      return;
    });
};

export const isUserAuthorized = async (tokenUid: string | undefined) => {
  if (tokenUid) {
    const foundUser = await userService.getUserByAuthId(tokenUid);
    if (foundUser) {
      return true;
    }
  }
  return false;
};
