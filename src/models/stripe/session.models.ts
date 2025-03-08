import { model, Schema } from "mongoose";

export interface CreateCheckoutSessionPayload {
  priceId: string;
}

/*
 * Stripe types
 */

export interface AutomaticTax {
  disabled_reason?: string | null;
  enabled: boolean;
  liability: string | null;
  status: string | null;
}

interface PaymentMethodOptions {
  card: {
    request_three_d_secure: "automatic" | "any";
  };
}

interface SavedPaymentMethodOptions {
  allow_redisplay_filters: string[];
  payment_method_remove: string | null;
  payment_method_save: string | null;
}

interface TotalDetails {
  amount_discount: number;
  amount_shipping: number;
  amount_tax: number;
}

export interface Session {
  id: string;
  object: string;
  adaptive_pricing: any;
  after_expiration: any;
  allow_promotion_codes: boolean | null;
  amount_subtotal: number;
  amount_total: number;
  automatic_tax: AutomaticTax;
  billing_address_collection: string | null;
  cancel_url: string;
  client_reference_id: string | null;
  client_secret: string | null;
  collected_information: any;
  consent: string | null;
  consent_collection: string | null;
  created: number;
  currency: string;
  currency_conversion: string | null;
  custom_fields: any[];
  custom_text: Record<string, any>;
  customer: string | null;
  customer_creation: string;
  customer_details: any;
  customer_email: string | null;
  discounts: any[];
  expires_at: number;
  invoice: string | null;
  invoice_creation: string | null;
  livemode: boolean;
  locale: string | null;
  metadata: Record<string, any>;
  mode: string;
  payment_intent: string | null;
  payment_link: string | null;
  payment_method_collection: string;
  payment_method_configuration_details: string | null;
  payment_method_options: PaymentMethodOptions;
  payment_method_types: string[];
  payment_status: string;
  phone_number_collection: { enabled: boolean };
  recovered_from: string | null;
  saved_payment_method_options: SavedPaymentMethodOptions;
  setup_intent: string | null;
  shipping_address_collection: string | null;
  shipping_cost: string | null;
  shipping_options: any[];
  status: string;
  submit_type: string | null;
  subscription: string | null;
  success_url: string;
  total_details: TotalDetails;
  ui_mode: string;
  url: string;
}

export const SESSION_SCHEMA = new Schema<Session>(
  {
    id: { type: String, required: true },
    object: { type: String, required: true },
    adaptive_pricing: { type: String, default: null },
    after_expiration: { type: String, default: null },
    allow_promotion_codes: { type: Boolean, default: null },
    amount_subtotal: { type: Number, required: true },
    amount_total: { type: Number, required: true },
    automatic_tax: {
      type: {
        enabled: Boolean,
        status: String,
      },
      required: true,
    },
    billing_address_collection: { type: String, default: null },
    cancel_url: { type: String, required: true },
    client_reference_id: { type: String, default: null },
    client_secret: { type: String, default: null },
    collected_information: { type: Schema.Types.Mixed, default: null },
    consent: { type: String, default: null },
    consent_collection: { type: String, default: null },
    created: { type: Number, required: true },
    currency: { type: String, required: true },
    currency_conversion: { type: String, default: null },
    custom_fields: { type: [Schema.Types.Mixed], default: [] },
    custom_text: { type: Map, of: Schema.Types.Mixed },
    customer: { type: String, default: null },
    customer_creation: { type: String, required: true },
    customer_details: { type: Schema.Types.Mixed, default: null },
    customer_email: { type: String, default: null },
    discounts: { type: [Schema.Types.Mixed], default: [] },
    expires_at: { type: Number, required: true },
    invoice: { type: String, default: null },
    invoice_creation: { type: String, default: null },
    livemode: { type: Boolean, required: true },
    locale: { type: String, default: null },
    metadata: { type: Map, of: Schema.Types.Mixed },
    mode: { type: String, required: true },
    payment_intent: { type: String, default: null },
    payment_link: { type: String, default: null },
    payment_method_collection: { type: String, required: true },
    payment_method_configuration_details: { type: String, default: null },
    payment_method_options: {
      type: {
        card: {
          installments: String,
          request_three_d_secure: String,
        },
        ach_debit: {
          verification_method: String,
        },
      },
      required: true,
    },
    payment_method_types: { type: [String], required: true },
    payment_status: { type: String, required: true },
    phone_number_collection: {
      type: {
        enabled: Boolean,
      },
      required: true,
    },
    recovered_from: { type: String, default: null },
    saved_payment_method_options: {
      type: {
        allow_prepaid_cards: Boolean,
      },
      required: true,
    },
    setup_intent: { type: String, default: null },
    shipping_address_collection: { type: String, default: null },
    shipping_cost: { type: String, default: null },
    shipping_options: { type: [Schema.Types.Mixed], default: [] },
    status: { type: String, required: true },
    submit_type: { type: String, default: null },
    subscription: { type: String, default: null },
    success_url: { type: String, required: true },
    total_details: {
      type: {
        amount_discount: Number,
        amount_shipping: Number,
        amount_tax: Number,
      },
      required: true,
    },
    ui_mode: { type: String, required: true },
    url: { type: String, required: true },
  },
  {
    timestamps: true,
    _id: false,
  }
);
