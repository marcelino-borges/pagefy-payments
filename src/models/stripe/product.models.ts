import { Schema } from "mongoose";

export interface Product {
  id: string;
  object: "product";
  active: boolean;
  created: number;
  default_price: string | null;
  description: string | null;
  images: string[];
  marketing_features: string[];
  livemode: boolean;
  metadata: Record<string, any>;
  name: string;
  package_dimensions: string | null;
  shippable: boolean | null;
  statement_descriptor: string | null;
  tax_code: string | null;
  unit_label: string | null;
  updated: number;
  url: string | null;
}

export const PRODUCT_SCHEMA = new Schema(
  {
    id: { type: String, required: true },
    object: { type: String, enum: ["product"], required: true },
    active: { type: Boolean, required: true },
    created: { type: Number, required: true },
    default_price: { type: String, default: null },
    description: { type: String, default: null },
    images: { type: [String], default: [] },
    marketing_features: { type: [String], default: [] },
    livemode: { type: Boolean, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    name: { type: String, required: true },
    package_dimensions: { type: String, default: null },
    shippable: { type: Boolean, default: null },
    statement_descriptor: { type: String, default: null },
    tax_code: { type: String, default: null },
    unit_label: { type: String, default: null },
    updated: { type: Number, required: true },
    url: { type: String, default: null },
  },
  {
    timestamps: true,
    _id: false,
  }
);
