import { PlansTypes } from "@/models/user.models";

export const getPriceIdByRecurrencyAndPlanType = (
  recurrency: "month" | "year",
  planType: PlansTypes
) => {
  if (planType === PlansTypes.VIP) {
    if (recurrency === "month") {
      return process.env.STRIPE_PRICE_VIP_MONTH_ID;
    } else if (recurrency === "year") {
      return process.env.STRIPE_PRICE_VIP_YEAR_ID;
    }
  } else if (planType === PlansTypes.PLATINUM) {
    if (recurrency === "month") {
      return process.env.STRIPE_PRICE_PLATINUM_MONTH_ID;
    } else if (recurrency === "year") {
      return process.env.STRIPE_PRICE_PLATINUM_YEAR_ID;
    }
  }
  return undefined;
};

export const getPlanByPriceId = (priceId: string) => {
  if (
    priceId === process.env.STRIPE_PRICE_VIP_MONTH_ID ||
    priceId === process.env.STRIPE_PRICE_VIP_YEAR_ID
  )
    return PlansTypes.VIP.toString();
  else if (
    priceId === process.env.STRIPE_PRICE_PLATINUM_MONTH_ID ||
    priceId === process.env.STRIPE_PRICE_PLATINUM_YEAR_ID
  )
    return PlansTypes.PLATINUM.toString();
  else return PlansTypes.FREE.toString();
};

export const convertPaymentAmountToDecimalString = (int: number) => {
  const asString: string = String(int);
  return (
    asString.slice(0, asString.length - 2) +
    "," +
    asString.slice(asString.length - 2, asString.length)
  );
};

export const getLanguageFromCurrency = (currency: string) => {
  switch (currency) {
    case "brl":
      return "pt";
    default:
      return "en";
  }
};
