export enum AppErrorsMessages {
  EMAIL_REQUIRED = "Email requiied.",
  UNAUTHORIZED = "Not authorized.",
  FORBIDDEN = "Forbidden.",
  NO_TOKEN_PROVIDED = "No token provided.",
  NO_API_KEY_PROVIDED = "No api key provided.",
  USER_NOT_FOUND = "User not found.",
  USERID_OR_EMAIL_REQUIRED = "UserID or user email are required.",
  MISSING_PROPS = "Props missing.",
  INTERNAL_ERROR = "Internal error.",
  INVALID_PAYMENT_INSTANCE = "Invalid Payment instance.",
  PAYMENT_CUSTOMER_NOT_CREATED = "Payment customer not created.",
  SUBSCRIPTION_NOT_CREATED = "Subscription not created.",
  SUBSCRIPTION_NOT_CANCELED = "Subscription not canceled.",
  PAYMENT_INTENT_NOT_FOUND = "Payment intent not found.",
  USER_HAS_NOT_SUBSCRIPTIONS = "User has no subscriptions.",
  ERROR_ON_CONSTRUCT_EVENT = "Error constructing event.",
  PRICE_ID_REQUIRED = "PriceId required.",
  SESSION_ID_REQUIRED = "SessionId required.",
  INVOICE_ID_REQUIRED = "InvoiceId required.",
  SUBSCRIPTION_ID_REQUIRED = "SubscriptionId required.",
  PLAN_ID_REQUIRED = "PlanId required.",
  CREATE_CHECKOUT_SESSION = "Error creating checkout session.",
}

export const SYSTEM_EMAIL_CREDENTIALS = {
  user: process.env.SYSTEM_EMAIL,
  password: process.env.SYSTEM_EMAIL_PASSWORD,
};

export const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL;
