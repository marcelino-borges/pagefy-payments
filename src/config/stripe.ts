import Stripe from "stripe";
import log from "../utils/logs";
import { getLatestVersionFromChangelog } from "./changelog";

let stripe: Stripe | null = null;

export const initializeStripe = async () => {
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2022-08-01",
        typescript: true,
      });
    }
  } catch (error: any) {
    log.error("ERROR INITIALIZING STRIPE: ", error.message);
  } finally {
    return stripe;
  }
};

export default stripe;
