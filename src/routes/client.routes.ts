import * as express from "express";
import * as stripeController from "../controllers/stripe.controller";
import { verifyToken } from "../middlewares/auth";

const router = express.Router();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());
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
router.get(
  "/subscription/user/:userId",
  verifyToken,
  stripeController.getUserSubsctriptions
);

export default router;
