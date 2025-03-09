import { model, Schema } from "mongoose";

export interface PlanFeatures {
  _id: string;
  stripeProductId: string;
  description: string;
  maxPages: number;
  animations: boolean;
  specialSupport: boolean;
  componentActivationSchedule: boolean;
  analytics: boolean;
  customJs: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PlanFeaturesCreate = Omit<
  PlanFeatures,
  "_id" | "createdAt" | "updatedAt"
>;

const planFeaturesSchema = new Schema<PlanFeatures>(
  {
    stripeProductId: { type: String, required: true },
    description: { type: String, required: true },
    maxPages: { type: Number, required: true },
    animations: { type: Boolean, required: true },
    specialSupport: { type: Boolean, required: true },
    componentActivationSchedule: { type: Boolean, required: true },
    analytics: { type: Boolean, required: true },
    customJs: { type: Boolean, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const planFeaturesModel = model<PlanFeatures>(
  "plan-features",
  planFeaturesSchema
);
