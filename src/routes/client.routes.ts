import * as express from "express";
import * as stripeController from "@/controllers/stripe.controller";
import { verifyToken } from "@/middlewares/auth.middleware";
import {
  getSubsctriptionsByUserId,
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

/*
 * SYSTEM ROUTES (VIA API KEY)
 */

router.get("/system/plans-features", verifyApiKey, getAllPlansFeatures);

export default router;
