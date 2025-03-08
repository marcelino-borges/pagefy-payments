import { Schema } from "mongoose";
import { AutomaticTax } from "./session.models";

interface PaymentSettings {
  default_mandate: string | null;
  payment_method_options:
    | {
        acss_debit: string | null;
        bancontact: string | null;
        card: { request_three_d_secure: "automatic" | "any" };
        customer_balance: string | null;
        konbini: string | null;
        sepa_debit: string | null;
        us_bank_account: string | null;
      }
    | null
    | string;
  payment_method_types: string | null;
}

interface StatusTransitions {
  finalized_at: number | null;
  marked_uncollectible_at: number | null;
  paid_at: number | null;
  voided_at: number | null;
}

interface InvoiceLineItem {
  id: string;
  object: string;
  amount: number;
  amount_excluding_tax: number;
  currency: string;
  description: string;
  discount_amounts: any[];
  discountable: boolean;
  discounts: any[];
  invoice: string;
  livemode: boolean;
  metadata: Record<string, any>;
  period: { end: number; start: number };
  plan: {
    id: string;
    object: string;
    active: boolean;
    amount: number;
    amount_decimal: string;
    billing_scheme: string;
    created: number;
    currency: string;
    interval: string;
    interval_count: number;
    livemode: boolean;
    metadata: Record<string, any>;
    product: string;
    usage_type: string;
  };
  price: {
    id: string;
    object: string;
    active: boolean;
    billing_scheme: string;
    created: number;
    currency: string;
    lookup_key: string;
    metadata: Record<string, any>;
    product: string;
    recurring: {
      aggregate_usage: string | null;
      interval: string;
      interval_count: number;
      meter: string | null;
      trial_period_days: number | null;
      usage_type: string;
    };
    type: string;
    unit_amount: number;
    unit_amount_decimal: string;
  };
  quantity: number;
  subscription: string;
  subscription_item: string;
  tax_amounts: any[];
  tax_rates: any[];
  type: string;
}

interface InvoiceLines {
  object: string;
  data: InvoiceLineItem[];
  has_more: boolean;
  total_count: number;
  url: string;
}

export interface Invoice {
  id: string;
  object: string;
  account_country: string;
  account_name: string;
  account_tax_ids: string | null;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  amount_shipping: number;
  application: string | null;
  application_fee_amount: number | null;
  attempt_count: number;
  attempted: boolean;
  auto_advance: boolean;
  automatic_tax: AutomaticTax;
  automatically_finalizes_at: number | null;
  billing_reason: string;
  charge: string | null;
  collection_method: string;
  created: number;
  currency: string;
  custom_fields: any | null;
  customer: string;
  customer_address: Record<string, any> | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  customer_shipping: string | null;
  customer_tax_exempt: string;
  customer_tax_ids: any[];
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: any[];
  description: string | null;
  discount: string | null;
  discounts: any[];
  due_date: number | null;
  effective_at: number | null;
  ending_balance: number;
  footer: string | null;
  from_invoice: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  issuer: { type: string };
  last_finalization_error: string | null;
  latest_revision: string | null;
  lines: InvoiceLines;
  livemode: boolean;
  metadata: Record<string, any>;
  next_payment_attempt: number | null;
  number: string | null;
  on_behalf_of: string | null;
  paid: boolean;
  paid_out_of_band: boolean;
  payment_intent: string | null;
  payment_settings: PaymentSettings;
  period_end: number;
  period_start: number;
  post_payment_credit_notes_amount: number;
  pre_payment_credit_notes_amount: number;
  quote: string | null;
  receipt_number: string | null;
  rendering: string | null;
  shipping_cost: string | null;
  shipping_details: string | null;
  starting_balance: number;
  statement_descriptor: string | null;
  status: string;
  status_transitions: StatusTransitions;
  subscription: string | null;
  subscription_details: { metadata: Record<string, any> };
  subtotal: number;
  subtotal_excluding_tax: number;
  tax: string | null;
  test_clock: string | null;
  total: number;
  total_discount_amounts: any[];
  total_excluding_tax: number;
  total_pretax_credit_amounts: any[];
  total_tax_amounts: any[];
  transfer_data: string | null;
  webhooks_delivered_at: number;
}

export const INVOICE_SCHEMA = new Schema(
  {
    id: { type: String, required: true },
    object: { type: String, required: true },
    account_country: { type: String, required: true },
    account_name: { type: String, required: true },
    account_tax_ids: { type: String, default: null },
    amount_due: { type: Number, required: true },
    amount_paid: { type: Number, required: true },
    amount_remaining: { type: Number, required: true },
    amount_shipping: { type: Number, required: true },
    application: { type: String, default: null },
    application_fee_amount: { type: Number, default: null },
    attempt_count: { type: Number, required: true },
    attempted: { type: Boolean, required: true },
    auto_advance: { type: Boolean, required: true },
    automatic_tax: {
      enabled: { type: Boolean, required: true },
      status: { type: String, default: null },
    },
    automatically_finalizes_at: { type: Number, default: null },
    billing_reason: { type: String, required: true },
    charge: { type: String, default: null },
    collection_method: { type: String, required: true },
    created: { type: Number, required: true },
    currency: { type: String, required: true },
    custom_fields: { type: Schema.Types.Mixed, default: null },
    customer: { type: String, required: true },
    customer_address: { type: Map, of: Schema.Types.Mixed, default: null },
    customer_email: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_phone: { type: String, default: null },
    customer_shipping: { type: String, default: null },
    customer_tax_exempt: { type: String, required: true },
    customer_tax_ids: { type: Array, default: [] },
    default_payment_method: { type: String, default: null },
    default_source: { type: String, default: null },
    default_tax_rates: { type: Array, default: [] },
    description: { type: String, default: null },
    discount: { type: String, default: null },
    discounts: { type: Array, default: [] },
    due_date: { type: Number, default: null },
    effective_at: { type: Number, default: null },
    ending_balance: { type: Number, required: true },
    footer: { type: String, default: null },
    from_invoice: { type: String, default: null },
    hosted_invoice_url: { type: String, default: null },
    invoice_pdf: { type: String, default: null },
    issuer: {
      type: { type: String, required: true },
    },
    last_finalization_error: { type: String, default: null },
    latest_revision: { type: String, default: null },
    lines: { type: Schema.Types.Mixed, required: true },
    livemode: { type: Boolean, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed },
    next_payment_attempt: { type: Number, default: null },
    number: { type: String, default: null },
    on_behalf_of: { type: String, default: null },
    paid: { type: Boolean, required: true },
    paid_out_of_band: { type: Boolean, required: true },
    payment_intent: { type: String, default: null },
    payment_settings: { type: Schema.Types.Mixed, required: true },
    period_end: { type: Number, required: true },
    period_start: { type: Number, required: true },
    post_payment_credit_notes_amount: { type: Number, required: true },
    pre_payment_credit_notes_amount: { type: Number, required: true },
    quote: { type: String, default: null },
    receipt_number: { type: String, default: null },
    rendering: { type: String, default: null },
    shipping_cost: { type: String, default: null },
    shipping_details: { type: String, default: null },
    starting_balance: { type: Number, required: true },
    statement_descriptor: { type: String, default: null },
    status: { type: String, required: true },
    status_transitions: { type: Schema.Types.Mixed, required: true },
    subscription: { type: String, default: null },
    subscription_details: {
      metadata: { type: Map, of: Schema.Types.Mixed, required: true },
    },
    subtotal: { type: Number, required: true },
    subtotal_excluding_tax: { type: Number, required: true },
    tax: { type: String, default: null },
    test_clock: { type: String, default: null },
    total: { type: Number, required: true },
    total_discount_amounts: { type: Array, default: [] },
    total_excluding_tax: { type: Number, required: true },
    total_pretax_credit_amounts: { type: Array, default: [] },
    total_tax_amounts: { type: Array, default: [] },
    transfer_data: { type: String, default: null },
    webhooks_delivered_at: { type: Number, required: true },
  },
  {
    timestamps: true,
    _id: false,
  }
);
