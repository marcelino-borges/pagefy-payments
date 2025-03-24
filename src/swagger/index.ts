import { getPackageJson } from "@/config/package-json";
import {
  userModel,
  errorModel,
  planModel,
  checkoutModel,
  invoiceModel,
  subscriptionModel,
  couponModel,
} from "./models";

import swaggerAutogen from "swagger-autogen";

export const runSwaggerAutogen = async (apiVersion: string) => {
  const SWAGGER_OUTPUT_PATH = "./swagger_output.json";
  const ROUTES_PATH = [
    "./src/routes/client.routes.ts",
    "./src/routes/webhooks.routes.ts",
  ];
  const apiDescription = (await getPackageJson()).description;

  const doc = {
    info: {
      version: apiVersion,
      title: apiDescription.description,
    },
    host: "http://pagefy-payments-api.onrender.com",
    basePath: "/",
    consumes: ["application/json"],
    definitions: {
      User: userModel,
      Error: errorModel,
      Plan: planModel,
      Plans: [planModel],
      Checkout: checkoutModel,
      Invoice: invoiceModel,
      Subscription: subscriptionModel,
      Subscriptions: [subscriptionModel],
      Coupon: couponModel,
    },
  };

  swaggerAutogen()(SWAGGER_OUTPUT_PATH, ROUTES_PATH, doc);
};
