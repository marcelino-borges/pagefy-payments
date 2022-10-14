import * as express from "express";
import * as stripeController from "../controllers/stripe.controller";
import { verifyToken } from "../middlewares/auth";

const router = express.Router();

/*
 * SUBSCRIPTION
 */

// Private routes
router.post("/subscription", verifyToken, stripeController.createSubsctription);
router.put(
  "/subscription/cancel/:subscriptionId",
  verifyToken,
  stripeController.cancelSubsctription
);
router.get(
  "/subscription/paymentintent/:paymentIntentId",
  verifyToken,
  stripeController.getSubsctriptionPaymentIntent
);

/*
 * Webhooks Stripe
 */

router.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeController.hookPaymentFromStripe
);

export default router;
