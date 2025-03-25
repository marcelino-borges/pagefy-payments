import { model, ObjectId, Schema } from "mongoose";
import { Session, SESSION_SCHEMA } from "./stripe/session.models";
import { Charge, CHARGE_SCHEMA } from "./stripe/charge.models";
import {
  Subscription,
  SUBSCRIPTION_SCHEMA,
} from "./stripe/subscription.models";
import { Invoice, INVOICE_SCHEMA } from "./stripe/invoice.models";
import { Customer, CUSTOMER_SCHEMA } from "./stripe/customer.models";
import { Plan, PLAN_SCHEMA } from "./stripe/plan.models";
import { Price, PRICE_SCHEMA } from "./stripe/price.models";
import { Product, PRODUCT_SCHEMA } from "./stripe/product.models";

export interface Checkout {
  _id: ObjectId;
  userId: string;
  session: Session;
  charge: Charge | null;
  subscription: Subscription | null;
  invoice: Invoice | null;
  customer: Customer | null;
  price: Price | null;
  plan: Plan | null;
  product: Product | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
  subscriptionId: string;
  stripeProductId: string;
  isActive: boolean;
  interval: string;
  currency: string;
  onlineReceiptUrl: string;
  price: number;
  captureDate: Date | null;
  planName: string;
  planImageUrl: string;
  invoiceOnlineUrl: string | null;
  invoiceDownloadPdf: string | null;
  willCancelAt: Date | null;
  canceledAt: Date | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

const checkoutSchema = new Schema<Checkout>(
  {
    userId: { type: String, required: true },
    session: { type: SESSION_SCHEMA, required: true },
    charge: { type: CHARGE_SCHEMA, default: null },
    subscription: { type: SUBSCRIPTION_SCHEMA, default: null },
    invoice: { type: INVOICE_SCHEMA, default: null },
    customer: { type: CUSTOMER_SCHEMA, default: null },
    price: { type: PRICE_SCHEMA, default: null },
    plan: { type: PLAN_SCHEMA, default: null },
    product: { type: PRODUCT_SCHEMA, default: null },
  },
  {
    timestamps: true,
  }
);

export const checkoutModel = model<Checkout>("checkouts", checkoutSchema);
