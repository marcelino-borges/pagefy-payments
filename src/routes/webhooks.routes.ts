import * as express from "express";
import * as stripeController from "../controllers/stripe.controller";

const router = express.Router();

/*
 * Webhooks Stripe
 */

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeController.hookPaymentFromStripe
);

export default router;
