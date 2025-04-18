import * as express from "express";
import * as stripeController from "@/controllers/stripe.controller";
import { verifyToken } from "@/middlewares/auth.middleware";
import {
  getSubsctriptionsByUserId,
  getSystemUserActiveSubscription,
  getUserActiveSubscription,
} from "@/controllers/checkouts.controller";
import { verifyApiKey } from "@/middlewares/api-key.middleware";
import { getAllPlansFeatures } from "@/controllers/plans-features.service";

const router = express.Router();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.get("/plans/:planId", stripeController.getPlanById);
router.get("/plans", stripeController.getAllPlans);
router.post("/checkout", verifyToken, stripeController.createCheckoutSession);

router.get(
  "/checkout/session/:sessionId",
  stripeController.getCheckoutSessionById
);

router.get("/invoice/:invoiceId", stripeController.getInvoiceById);

router.patch(
  "/subscription/cancel",
  verifyToken,
  stripeController.cancelSubsctription
);

router.get(
  "/subscription/:subscriptionId",
  verifyToken,
  stripeController.getSubsctriptionById
);

router.get(
  "/subscription/user/:userId",
  verifyToken,
  getSubsctriptionsByUserId
);

router.get(
  "/subscription/active/user/:userId",
  verifyToken,
  getUserActiveSubscription
);

router.get(
  "/system/subscription/active/user/:userId",
  verifyApiKey,
  getSystemUserActiveSubscription
);

router.get("/coupon/:couponId", verifyToken, stripeController.getCouponById);

/*
 * SYSTEM ROUTES (VIA API KEY)
 */

router.get("/system/plans-features", verifyApiKey, getAllPlansFeatures);

router.get(
  "/system/subscription/user/:userId",
  verifyApiKey,
  getSubsctriptionsByUserId
);

export default router;
