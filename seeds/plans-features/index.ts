import mongoose from "mongoose";
import {
  PlanFeaturesCreate,
  planFeaturesModel,
} from "./../../src/models/plans-features.models";
import log from "../../src/utils/logs";
import connectMongo from "../../src/config/mongo.ts";

const NEON_PLAN: PlanFeaturesCreate = {
  stripeProductId: "prod_RsnOS5J48DEoTt",
  description: "Neon",
  maxPages: 5,
  animations: true,
  specialSupport: false,
  componentActivationSchedule: false,
  analytics: false,
  customJs: false,
};

const BOOST_PLAN: PlanFeaturesCreate = {
  stripeProductId: "prod_RsnZloJ9sxFlQn",
  description: "Boost",
  maxPages: 99999,
  animations: true,
  specialSupport: true,
  componentActivationSchedule: true,
  analytics: true,
  customJs: true,
};

const seedPlansFeatures = async () => {
  log.info("Starting seeds for PlanFeatures...");
  try {
    await connectMongo();
    await planFeaturesModel.create([NEON_PLAN, BOOST_PLAN]);
    log.success("Seeds for PlanFeatures successful.");
  } catch (error) {
    log.error("Seeds for PlanFeatures failed: ", error);
  } finally {
    await mongoose.connection.close();
    log.info("MongoDB connection closed.");
  }
};

seedPlansFeatures();
