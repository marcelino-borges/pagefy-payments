import { Schema } from "mongoose";
import { Discount } from "./discount.models";

export interface Customer {
  id: string;
  object: "customer";
  address: {
    city: string | null;
    country: string | null;
    line1: string | null;
    line2: string | null;
    postal_code: string | null;
    state: string | null;
  } | null;
  balance: number;
  created: number;
  currency: string;
  default_source: string | null;
  delinquent: boolean;
  description: string | null;
  discount: Discount | null;
  email: string;
  invoice_prefix: string;
  invoice_settings: {
    custom_fields: string | null;
    default_payment_method: string | null;
    footer: string | null;
    rendering_options: Record<string, any> | null;
  };
  livemode: boolean;
  metadata: Record<string, any>;
  name: string | null;
  next_invoice_sequence: number;
  phone: string | null;
  preferred_locales: string[];
  shipping: any | null;
  tax_exempt: string;
  test_clock: string | null;
}

export const CUSTOMER_SCHEMA = new Schema(
  {
    id: { type: String, required: true },
    object: { type: String, enum: ["customer"], required: true },
    address: {
      city: { type: String, default: null },
      country: { type: String, default: null },
      line1: { type: String, default: null },
      line2: { type: String, default: null },
      postal_code: { type: String, default: null },
      state: { type: String, default: null },
    },
    balance: { type: Number, required: true },
    created: { type: Number, required: true },
    currency: { type: String, required: true },
    default_source: { type: String, default: null },
    delinquent: { type: Boolean, required: true },
    description: { type: String, default: null },
    discount: { type: Schema.Types.Mixed, default: null },
    email: { type: String, required: true },
    invoice_prefix: { type: String, required: true },
    invoice_settings: {
      custom_fields: { type: String, default: null },
      default_payment_method: { type: String, default: null },
      footer: { type: String, default: null },
      rendering_options: { type: Map, of: Schema.Types.Mixed, default: null },
    },
    livemode: { type: Boolean, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed },
    name: { type: String, default: null },
    next_invoice_sequence: { type: Number, required: true },
    phone: { type: String, default: null },
    preferred_locales: { type: [String], required: true },
    shipping: { type: Schema.Types.Mixed, default: null },
    tax_exempt: { type: String, required: true },
    test_clock: { type: String, default: null },
  },
  {
    timestamps: true,
    _id: false,
  }
);
