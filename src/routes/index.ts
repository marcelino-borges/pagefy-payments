import * as express from "express";
import * as userController from "../controllers/user.controller";
import * as stripeController from "../controllers/stripe.controller";
import { verifyToken } from "../middlewares/auth";

const router = express.Router();

/*
 * SUBSCRIPTION
 */

// Private routes
router.post("/subscription", verifyToken, stripeController.createSubsctription);

export default router;
