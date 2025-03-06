interface Features {
  pt: string[];
  en: string[];
}

interface Recurring {
  aggregate_usage: string | null;
  interval: "day" | "week" | "month" | "year";
  interval_count: number;
  meter: string | null;
  trial_period_days: number | null;
  usage_type: "licensed" | "metered";
}

interface Price {
  id: string;
  object: "price";
  created_at: string;
  currency: string;
  lookup_key: string;
  nickname: string | null;
  product: string;
  recurring: Recurring;
  type: "one_time" | "recurring";
  unit_amount: number;
  unit_amount_decimal: string;
}

export interface SubscriptionPlan {
  id: string;
  default_price: string;
  description: string;
  features: Features;
  images: string[];
  url: string | null;
  name: string;
  prices: Price[];
  created_at: string;
  updated_at: string;
}
