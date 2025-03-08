import { Date, model, ObjectId, Schema, Types } from "mongoose";
import { Session, SESSION_SCHEMA } from "./session.models";
import { Charge, CHARGE_SCHEMA } from "./charge.models";
import { Subscription, SUBSCRIPTION_SCHEMA } from "./subscription.models";
import { Invoice, INVOICE_SCHEMA } from "./invoice.models";
import { Customer, CUSTOMER_SCHEMA } from "./customer.models";
import { Plan, PLAN_SCHEMA } from "./plan.models";
import { Price, PRICE_SCHEMA } from "./price.models";

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
  createdAt: Date;
  updatedAt: Date;
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
  },
  {
    timestamps: true,
  }
);

export const checkoutDB = model<Checkout>("checkouts", checkoutSchema);
