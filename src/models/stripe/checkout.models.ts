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

export interface CheckoutSession {
  id: string;
  object: string;
  adaptive_pricing: string | null;
  after_expiration: string | null;
  allow_promotion_codes: boolean | null;
  amount_subtotal: number;
  amount_total: number;
  automatic_tax: AutomaticTax;
  billing_address_collection: string | null;
  cancel_url: string;
  client_reference_id: string | null;
  client_secret: string | null;
  collected_information: string | null;
  consent: string | null;
  consent_collection: string | null;
  created: number;
  currency: string;
  currency_conversion: string | null;
  custom_fields: any[];
  custom_text: Record<string, any>;
  customer: string | null;
  customer_creation: string;
  customer_details: string | null;
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
