import Stripe from "stripe";
import log from "../utils/logs";

const initializeStripe = () => {
  let stripe: Stripe | null = null;

  try {
    if (process.env.STRIPE_SECRET_KEY) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        appInfo: {
          name: "Pagefy",
        },
        apiVersion: "2025-02-24.acacia",
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

const stripe = initializeStripe();

export default stripe;
