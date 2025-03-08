import { AppErrorsMessages } from "@/constants";
import { HttpStatusCode } from "axios";
import { AppError } from "./app-error";

export const replaceAllSpacesByUnderlines = (
  text: string,
  lowerCase: boolean = true
) => {
  let result = text.replace(new RegExp(" ", "g"), "_");
  if (lowerCase) result.toLowerCase();
  return result;
};

export const buildAuthHeadersJwt = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const buildRegistrationAuthHeadersApiKey = () => ({
  "py-api-key": process.env.REGISTRATION_API_KEY,
});

export const buildStripeClientError = (location: string) =>
  new AppError(
    AppErrorsMessages.INTERNAL_ERROR,
    HttpStatusCode.InternalServerError,
    new Error(`[${location}] Stripe client not initialized.`)
  );
