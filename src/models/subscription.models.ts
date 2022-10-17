import { model, Schema } from "mongoose";
import { PlansTypes } from "./user.models";

export interface ICreateSubscriptionProps {
  currency: string;
  recurrency: "month" | "year";
  planType: PlansTypes;
  tokenEmail: string;
  tokenUid: string;
}

export interface ISubscriptionCreationResult {
  subscriptionId: string;
  subscriptionEnd: string;
  subscriptionStart: string;
  currency: string;
  priceId: string;
  recurrency?: string;
  customer: any;
  paymentIntentId?: string;
  latestInvoice: any;
  userId: string;
  status: string;
}

export enum SubscriptionStatus {
  active = "active",
  past_due = "past_due",
  unpaid = "unpaid",
  canceled = "canceled",
  incomplete = "incomplete",
  incomplete_expired = "incomplete_expired",
  trialing = "trialing",
  all = "all",
  ended = "ended",
}

export interface IPaymentIntent {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_details: any;
  amount_received: number;
  application: any;
  application_fee_amount: any;
  automatic_payment_methods: any;
  canceled_at: any;
  cancellation_reason: any;
  capture_method: string;
  charges: {
    object: string;
    data: [];
    has_more: false;
    url: string;
  };
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: any;
  description: string;
  invoice: any;
  last_payment_error: any;
  livemode: false;
  metadata: {};
  next_action: any;
  on_behalf_of: any;
  payment_method: any;
  payment_method_options: {
    card: {
      installments: any;
      mandate_options: any;
      network: any;
      request_three_d_secure: string;
    };
  };
  payment_method_types: [string];
  processing: any;
  receipt_email: any;
  review: any;
  setup_future_usage: any;
  shipping: any;
  statement_descriptor: any;
  statement_descriptor_suffix: any;
  status: string;
  transfer_data: any;
  transfer_group: any;
}

const subscriptionSchema = new Schema<ISubscriptionCreationResult>(
  {
    subscriptionId: { type: String },
    subscriptionEnd: { type: String },
    subscriptionStart: { type: String },
    currency: { type: String },
    priceId: { type: String },
    recurrency: { type: String },
    customer: { type: Object },
    latestInvoice: { type: Object },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    status: { type: String },
  },
  {
    timestamps: true,
  }
);

export default model<ISubscriptionCreationResult>(
  "Subscriptions",
  subscriptionSchema
);
