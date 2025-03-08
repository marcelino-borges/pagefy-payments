import { Schema } from "mongoose";

export interface Charge {
  id: string;
  object: "charge";
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  application: string | null;
  application_fee: string | null;
  application_fee_amount: number | null;
  balance_transaction: string;
  billing_details: {
    address: {
      city: string | null;
      country: string | null;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
    email: string | null;
    name: string | null;
    phone: string | null;
  };
  calculated_statement_descriptor: string;
  captured: boolean;
  created: number;
  currency: string;
  customer: string | null;
  description: string | null;
  destination: string | null;
  dispute: string | null;
  disputed: boolean;
  failure_balance_transaction: string | null;
  failure_code: string | null;
  failure_message: string | null;
  fraud_details: Record<string, any>;
  invoice: string | null;
  livemode: boolean;
  metadata: Record<string, any>;
  on_behalf_of: string | null;
  order: string | null;
  outcome: {
    advice_code: string | null;
    network_advice_code: string | null;
    network_decline_code: string | null;
    network_status: string;
    reason: string | null;
    risk_level: string;
    risk_score: number;
    seller_message: string;
    type: string;
  };
  paid: boolean;
  payment_intent: string;
  payment_method: string;
  payment_method_details: {
    card: {
      amount_authorized: number;
      authorization_code: string | null;
      brand: string;
      checks: {
        address_line1_check: string | null;
        address_postal_code_check: string | null;
        cvc_check: string | null;
      };
      country: string;
      exp_month: number;
      exp_year: number;
      extended_authorization: {
        status: string;
      };
      fingerprint: string;
      funding: string;
      incremental_authorization: {
        status: string;
      };
      installments: string | null;
      last4: string;
      mandate: string | null;
      multicapture: {
        status: string;
      };
      network: string;
      network_token: {
        used: boolean;
      };
      network_transaction_id: string;
      overcapture: {
        maximum_amount_capturable: number;
        status: string;
      };
      regulated_status: string;
      three_d_secure: string | null;
      wallet: string | null;
    };
    type: string;
  };
  radar_options: Record<string, any>;
  receipt_email: string | null;
  receipt_number: string | null;
  receipt_url: string;
  refunded: boolean;
  review: string | null;
  shipping: string | null;
  source: string | null;
  source_transfer: string | null;
  statement_descriptor: string;
  statement_descriptor_suffix: string | null;
  status: string;
  transfer_data: string | null;
  transfer_group: string | null;
}

export const CHARGE_SCHEMA = new Schema(
  {
    id: { type: String, required: true },
    object: { type: String, enum: ["charge"], required: true },
    amount: { type: Number, required: true },
    amount_captured: { type: Number, required: true },
    amount_refunded: { type: Number, required: true },
    application: { type: String, default: null },
    application_fee: { type: String, default: null },
    application_fee_amount: { type: Number, default: null },
    balance_transaction: { type: String, required: true },
    billing_details: {
      address: {
        city: { type: String, default: null },
        country: { type: String, default: null },
        line1: { type: String, default: null },
        line2: { type: String, default: null },
        postal_code: { type: String, default: null },
        state: { type: String, default: null },
      },
      email: { type: String, default: null },
      name: { type: String, default: null },
      phone: { type: String, default: null },
    },
    calculated_statement_descriptor: { type: String, required: true },
    captured: { type: Boolean, required: true },
    created: { type: Number, required: true },
    currency: { type: String, required: true },
    customer: { type: String, default: null },
    description: { type: String, default: null },
    destination: { type: String, default: null },
    dispute: { type: String, default: null },
    disputed: { type: Boolean, required: true },
    failure_balance_transaction: { type: String, default: null },
    failure_code: { type: String, default: null },
    failure_message: { type: String, default: null },
    fraud_details: { type: Map, of: Schema.Types.Mixed },
    invoice: { type: String, default: null },
    livemode: { type: Boolean, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed },
    on_behalf_of: { type: String, default: null },
    order: { type: String, default: null },
    outcome: {
      advice_code: { type: String, default: null },
      network_advice_code: { type: String, default: null },
      network_decline_code: { type: String, default: null },
      network_status: { type: String, required: true },
      reason: { type: String, default: null },
      risk_level: { type: String, required: true },
      risk_score: { type: Number, required: true },
      seller_message: { type: String, required: true },
      type: { type: String, required: true },
    },
    paid: { type: Boolean, required: true },
    payment_intent: { type: String, required: true },
    payment_method: { type: String, required: true },
    payment_method_details: {
      card: {
        amount_authorized: { type: Number, required: true },
        authorization_code: { type: String, default: null },
        brand: { type: String, required: true },
        checks: {
          address_line1_check: { type: String, default: null },
          address_postal_code_check: { type: String, default: null },
          cvc_check: { type: String, default: null },
        },
        country: { type: String, required: true },
        exp_month: { type: Number, required: true },
        exp_year: { type: Number, required: true },
        extended_authorization: { status: { type: String, required: true } },
        fingerprint: { type: String, required: true },
        funding: { type: String, required: true },
        incremental_authorization: { status: { type: String, required: true } },
        installments: { type: String, default: null },
        last4: { type: String, required: true },
        mandate: { type: String, default: null },
        multicapture: { status: { type: String, required: true } },
        network: { type: String, required: true },
        network_token: { used: { type: Boolean, required: true } },
        network_transaction_id: { type: String, required: true },
        overcapture: {
          maximum_amount_capturable: { type: Number, required: true },
          status: { type: String, required: true },
        },
        regulated_status: { type: String, required: true },
        three_d_secure: { type: String, default: null },
        wallet: { type: String, default: null },
      },
      type: { type: String, required: true },
    },
    radar_options: { type: Map, of: Schema.Types.Mixed },
    receipt_email: { type: String, default: null },
    receipt_number: { type: String, default: null },
    receipt_url: { type: String, required: true },
    refunded: { type: Boolean, required: true },
    review: { type: String, default: null },
    shipping: { type: String, default: null },
    source: { type: String, default: null },
    source_transfer: { type: String, default: null },
    statement_descriptor: { type: String, required: true },
    statement_descriptor_suffix: { type: String, default: null },
    status: { type: String, required: true },
    transfer_data: { type: String, default: null },
    transfer_group: { type: String, default: null },
  },
  {
    timestamps: true,
    _id: false,
  }
);
