import { registrationApi } from "@/config/axios";
import { IUser } from "@/models/user.models";
import {
  buildAuthHeadersJwt,
  buildRegistrationAuthHeadersApiKey,
} from "@/utils";
import log from "@/utils/logs";

export const getUserByAuthId = async (authId: string, token: string) => {
  try {
    const res = await registrationApi.get(`/user?authId=${authId}`, {
      headers: buildAuthHeadersJwt(token),
    });

    return res.data;
  } catch (error) {
    log.error(
      `[Services.User.getUserByAuthId] Error finding user by authId ${authId} from ${registrationApi.getUri()}: `,
      error
    );
    return null;
  }
};

export const getUserByEmailThroughApiKey = async (email: string) => {
  try {
    const res = await registrationApi.get(`/system/user/${email}`, {
      headers: buildRegistrationAuthHeadersApiKey(),
    });

    return res.data as IUser;
  } catch (error) {
    log.error(
      "[Services.User.getUserByEmailThroughApiKey] Error finding user by email: ",
      error
    );
    return null;
  }
};

export const updateUserPaymentId = async (email: string, paymentId: string) => {
  try {
    const res = await registrationApi.patch(
      "/system/user/payment-id",
      {
        email,
        paymentId,
      },
      {
        headers: buildRegistrationAuthHeadersApiKey(),
      }
    );

    return res.data as IUser;
  } catch (error) {
    log.error(
      "[Services.User.updateUserPaymentId] Error updating user's paymentId: ",
      error
    );
    return null;
  }
};
