import { model, Schema } from "mongoose";

export interface IInvoice {
  id: string;
  account_country: string;
  account_name: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  billing_reason: string;
  charge: string;
  collection_method: string;
  created: number;
  currency: string;
  custom_fields: any;
  customer_email: string;
  discount: any;
  discounts: any[];
  from_invoice: any;
  hosted_invoice_url: string;
  invoice_pdf: string;
  last_finalization_error: any;
  latest_revision: any;
  lines: {
    object: string;
    data: any;
    has_more: boolean;
    total_count: number;
  };
  metadata: any;
  next_payment_attempt: any;
  number: string;
  paid: boolean;
  payment_intent: string;
  period_end: number;
  period_start: number;
  receipt_number: any;
  status: string;
  status_transitions: {
    finalized_at: number;
    marked_uncollectible_at: number;
    paid_at: number;
    voided_at: number;
  };
  subscription: string;
  subtotal: number;
  subtotal_excluding_tax: number;
  total: number;
  total_discount_amounts: any[];
  total_excluding_tax: number;
  total_tax_amounts: any[];
  webhooks_delivered_at: number;
}

const invoicesSchema = new Schema<IInvoice>(
  {
    id: { type: String },
    account_country: { type: String },
    account_name: { type: String },
    amount_due: { type: Number },
    amount_paid: { type: Number },
    amount_remaining: { type: Number },
    billing_reason: { type: String },
    charge: { type: String },
    collection_method: { type: String },
    created: { type: Number },
    currency: { type: String },
    custom_fields: { type: Object },
    customer_email: { type: String },
    discount: { type: Object },
    discounts: { type: Array },
    from_invoice: { type: Object },
    hosted_invoice_url: { type: String },
    invoice_pdf: { type: String },
    last_finalization_error: { type: Object },
    latest_revision: { type: Object },
    lines: {
      object: { type: String },
      data: { type: Object },
      has_more: { type: Boolean },
      total_count: { type: Number },
      url: { type: String },
    },
    metadata: { type: Object },
    next_payment_attempt: { type: Object },
    number: { type: String },
    paid: { type: Number },
    payment_intent: { type: String },
    period_end: { type: Number },
    period_start: { type: Number },
    receipt_number: { type: Object },
    status: { type: String },
    status_transitions: {
      finalized_at: { type: Number },
      marked_uncollectible_at: { type: Number },
      paid_at: { type: Number },
      voided_at: { type: Number },
    },
    subscription: { type: String },
    subtotal: { type: Number },
    subtotal_excluding_tax: { type: Number },
    total: { type: Number },
    total_discount_amounts: { type: Array },
    total_excluding_tax: { type: Number },
    total_tax_amounts: { type: Array },
    webhooks_delivered_at: { type: Number },
  },
  {
    timestamps: true,
  }
);

export default model<IInvoice>("Invoices", invoicesSchema);
