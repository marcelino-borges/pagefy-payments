import Stripe from "stripe";
import log from "../utils/logs";

export const initializeStripe = async () => {
  let stripe: Stripe | null = null;
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        appInfo: {
          name: "Socialbio",
        },
        apiVersion: "2022-08-01",
        typescript: true,
      });
    } else {
      log.error("Error getting process.env.STRIPE_SECRET_KEY");
    }
  } catch (error: any) {
    log.error("ERROR INITIALIZING STRIPE: ", error.message);
  } finally {
    return stripe;
  }
};
