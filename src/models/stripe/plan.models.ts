import { Schema } from "mongoose";

export interface Plan {
  id: string;
  object: string;
  active: boolean;
  aggregate_usage: string | null;
  amount: number;
  amount_decimal: string;
  billing_scheme: string;
  created: number;
  currency: string;
  interval: string;
  interval_count: number;
  livemode: boolean;
  metadata: Record<string, any>;
  meter: string | null;
  nickname: string | null;
  product: string;
  tiers_mode: string | null;
  transform_usage: string | null;
  trial_period_days: number | null;
  usage_type: string;
}

export const PLAN_SCHEMA = new Schema(
  {
    id: { type: String, required: true },
    object: { type: String, required: true },
    active: { type: Boolean, required: true },
    aggregate_usage: { type: String, default: null },
    amount: { type: Number, required: true },
    amount_decimal: { type: String, required: true },
    billing_scheme: { type: String, required: true },
    created: { type: Number, required: true },
    currency: { type: String, required: true },
    interval: { type: String, required: true },
    interval_count: { type: Number, required: true },
    livemode: { type: Boolean, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    meter: { type: String, default: null },
    nickname: { type: String, default: null },
    product: { type: String, required: true },
    tiers_mode: { type: String, default: null },
    transform_usage: { type: String, default: null },
    trial_period_days: { type: Number, default: null },
    usage_type: { type: String, required: true },
  },
  {
    timestamps: true,
    _id: false,
  }
);
