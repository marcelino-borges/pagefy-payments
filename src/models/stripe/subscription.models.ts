import { Schema } from "mongoose";
import { Plan } from "./plan.models";
import { Price } from "./price.models";
import { Discount } from "./discount.models";

export enum SubscriptionStatus {
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  TRIALING = "trialing",
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  UNPAID = "unpaid",
  PAUSED = "paused",
}

export interface Subscription {
  id: string;
  object: "subscription";
  application: string | null;
  application_fee_percent: number | null;
  automatic_tax: {
    disabled_reason: string | null;
    enabled: boolean;
    liability: string | null;
  };
  billing_cycle_anchor: number;
  billing_cycle_anchor_config: string | null;
  billing_thresholds: string | null;
  cancel_at: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  cancellation_details: {
    comment: string | null;
    feedback: string | null;
    reason: string | null;
  };
  collection_method: string;
  created: number;
  currency: string;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  days_until_due: number | null;
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: any[];
  description: string | null;
  discount: Discount | string | null;
  discounts: Discount[] | string[];
  ended_at: number | null;
  invoice_settings: {
    account_tax_ids: string | null;
    issuer: {
      type: string;
    };
  };
  items: {
    object: string;
    data: {
      id: string;
      object: string;
      billing_thresholds: string | null;
      created: number;
      discounts: any[];
      metadata: Record<string, any>;
      plan: string | Plan;
      price: string | Price;
      quantity: number;
      subscription: string;
      tax_rates: any[];
    }[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  latest_invoice: string;
  livemode: boolean;
  metadata: Record<string, any>;
  next_pending_invoice_item_invoice: string | null;
  on_behalf_of: string | null;
  pause_collection: string | null;
  payment_settings: {
    payment_method_options: {
      acss_debit: string | null;
      bancontact: string | null;
      card: {
        network: string | null;
        request_three_d_secure: string;
      };
      customer_balance: string | null;
      konbini: string | null;
      sepa_debit: string | null;
      us_bank_account: string | null;
    };
    payment_method_types: string | null;
    save_default_payment_method: string;
  };
  pending_invoice_item_interval: string | null;
  pending_setup_intent: string | null;
  pending_update: string | null;
  plan: string | Plan;
  quantity: number;
  schedule: string | null;
  start_date: number;
  status: string;
  test_clock: string | null;
  transfer_data: string | null;
  trial_end: number | null;
  trial_settings: {
    end_behavior: {
      missing_payment_method: string;
    };
  };
  trial_start: number | null;
}

export const SUBSCRIPTION_SCHEMA = new Schema(
  {
    id: { type: String, required: true },
    object: { type: String, enum: ["subscription"], required: true },
    application: { type: String, default: null },
    application_fee_percent: { type: Number, default: null },
    automatic_tax: {
      disabled_reason: { type: String, default: null },
      enabled: { type: Boolean, required: true },
      liability: { type: String, default: null },
    },
    billing_cycle_anchor: { type: Number, required: true },
    billing_cycle_anchor_config: { type: String, default: null },
    billing_thresholds: { type: String, default: null },
    cancel_at: { type: Number, default: null },
    cancel_at_period_end: { type: Boolean, required: true },
    canceled_at: { type: Number, default: null },
    cancellation_details: {
      comment: { type: String, default: null },
      feedback: { type: String, default: null },
      reason: { type: String, default: null },
    },
    collection_method: { type: String, required: true },
    created: { type: Number, required: true },
    currency: { type: String, required: true },
    current_period_end: { type: Number, required: true },
    current_period_start: { type: Number, required: true },
    customer: { type: Schema.Types.Mixed, required: true },
    days_until_due: { type: Number, default: null },
    default_payment_method: { type: String, default: null },
    default_source: { type: String, default: null },
    default_tax_rates: { type: Array, default: [] },
    description: { type: String, default: null },
    discount: { type: Schema.Types.Mixed },
    discounts: { type: Array, default: [] },
    ended_at: { type: Number, default: null },
    invoice_settings: {
      account_tax_ids: { type: String, default: null },
      issuer: { type: Object, required: true },
    },
    items: {
      object: { type: String, required: true },
      data: { type: Array, required: true },
      has_more: { type: Boolean, required: true },
      total_count: { type: Number, required: true },
      url: { type: String, required: true },
    },
    latest_invoice: { type: Schema.Types.Mixed, required: true },
    livemode: { type: Boolean, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed },
    status: { type: String, required: true },
    trial_end: { type: Number, default: null },
    trial_start: { type: Number, default: null },
  },
  {
    timestamps: true,
    _id: false,
  }
);
