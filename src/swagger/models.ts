export const errorModel = {
  statusCode: 200,
  errorDetails: "Details of the error (if any)",
  message: "Summary of the result",
};

export const userModel = {
  _id: "asd123asd-asd12asd",
  authId: "123d1d1c1c1c",
  paymentId: "s90df090d9s08s7g7809s",
  firstName: "John",
  lastName: "Doe",
  email: "example@email.com",
  profileImageUrl: "https://www.url.com",
  agreePrivacy: true,
  receiveCommunications: true,
  plan: 0,
};

export const planModel = {
  id: "prod_1234",
  default_price: "price_1234",
  description: "Pagefy Bla Subscription",
  features: {
    pt: ["Funcionalidade 1", "Funcionalidade 2"],
    en: ["Feature 1", "Feature 2"],
  },
  images: ["https://files.stripe.com/links/1234"],
  url: null,
  name: "Boost",
  prices: [
    {
      id: "price_1234",
      object: "price",
      created_at: "2025-03-04T20:21:23.000Z",
      currency: "brl",
      lookup_key: "pagefy_sub_bla_month",
      nickname: null,
      product: "prod_1234",
      recurring: {
        aggregate_usage: null,
        interval: "month",
        interval_count: 1,
        meter: null,
        trial_period_days: null,
        usage_type: "licensed",
      },
      type: "recurring",
      unit_amount: 3990,
      unit_amount_decimal: "3990",
    },
  ],
  created_at: "2025-03-04T20:21:23.000Z",
  updated_at: "2025-03-04T20:33:32.000Z",
};

export const checkoutModel = {
  id: "cs_1234",
  object: "checkout.session",
  adaptive_pricing: null,
  after_expiration: null,
  allow_promotion_codes: null,
  amount_subtotal: 3990,
  amount_total: 3990,
  automatic_tax: { enabled: false, liability: null, status: null },
  billing_address_collection: null,
  cancel_url: "https://example.me",
  client_reference_id: null,
  client_secret: null,
  collected_information: null,
  consent: null,
  consent_collection: null,
  created: 1741211151,
  currency: "brl",
  currency_conversion: null,
  custom_fields: [],
  custom_text: {
    after_submit: null,
    shipping_address: null,
    submit: null,
    terms_of_service_acceptance: null,
  },
  customer: null,
  customer_creation: "always",
  customer_details: null,
  customer_email: null,
  discounts: [],
  expires_at: 1741297551,
  invoice: null,
  invoice_creation: null,
  livemode: false,
  locale: null,
  metadata: {},
  mode: "subscription",
  payment_intent: null,
  payment_link: null,
  payment_method_collection: "always",
  payment_method_configuration_details: null,
  payment_method_options: { card: { request_three_d_secure: "automatic" } },
  payment_method_types: ["card"],
  payment_status: "unpaid",
  phone_number_collection: { enabled: false },
  recovered_from: null,
  saved_payment_method_options: {
    allow_redisplay_filters: ["always"],
    payment_method_remove: null,
    payment_method_save: null,
  },
  setup_intent: null,
  shipping_address_collection: null,
  shipping_cost: null,
  shipping_options: [],
  status: "open",
  submit_type: null,
  subscription: null,
  success_url: "https://example.me",
  total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
  ui_mode: "hosted",
  url: "https://checkout.stripe.com/c/pay/cs_1234",
};

export const invoiceModel = {
  id: "in_1234",
  object: "invoice",
  account_country: "BR",
  account_name: "Lorem",
  account_tax_ids: null,
  amount_due: 3990,
  amount_paid: 3990,
  amount_remaining: 0,
  amount_shipping: 0,
  application: null,
  application_fee_amount: null,
  attempt_count: 1,
  attempted: true,
  auto_advance: false,
  automatic_tax: {
    disabled_reason: null,
    enabled: false,
    liability: null,
    status: null,
  },
  automatically_finalizes_at: null,
  billing_reason: "subscription_create",
  charge: "ch_1234",
  collection_method: "charge_automatically",
  created: 1741215676,
  currency: "brl",
  custom_fields: null,
  customer: "cus_1234",
  customer_address: {
    city: null,
    country: "BR",
    line1: null,
    line2: null,
    postal_code: null,
    state: null,
  },
  customer_email: "email@email.com",
  customer_name: "John",
  customer_phone: null,
  customer_shipping: null,
  customer_tax_exempt: "none",
  customer_tax_ids: [],
  default_payment_method: null,
  default_source: null,
  default_tax_rates: [],
  description: null,
  discount: null,
  discounts: [],
  due_date: null,
  effective_at: 1741215676,
  ending_balance: 0,
  footer: null,
  from_invoice: null,
  hosted_invoice_url: "https://invoice.stripe.com/i/acct_1234/abcd?s=ap",
  invoice_pdf: "https://pay.stripe.com/invoice/acct_1234/abcd/pdf?s=ap",
  issuer: {
    type: "self",
  },
  last_finalization_error: null,
  latest_revision: null,
  lines: {
    object: "list",
    data: [
      {
        id: "il_1234",
        object: "line_item",
        amount: 3990,
        amount_excluding_tax: 3990,
        currency: "usd",
        description: "1 × Lorem Product (at $ 99.90 / month)",
        discount_amounts: [],
        discountable: true,
        discounts: [],
        invoice: "in_1234",
        livemode: false,
        metadata: {},
        period: {
          end: 1743894076,
          start: 1741215676,
        },
        plan: {
          id: "price_1234",
          object: "plan",
          active: true,
          aggregate_usage: null,
          amount: 3990,
          amount_decimal: "3990",
          billing_scheme: "per_unit",
          created: 1741119684,
          currency: "brl",
          interval: "month",
          interval_count: 1,
          livemode: false,
          metadata: {},
          meter: null,
          nickname: null,
          product: "prod_1234",
          tiers_mode: null,
          transform_usage: null,
          trial_period_days: null,
          usage_type: "licensed",
        },
        pretax_credit_amounts: [],
        price: {
          id: "price_1234",
          object: "price",
          active: true,
          billing_scheme: "per_unit",
          created: 1741119684,
          currency: "brl",
          custom_unit_amount: null,
          livemode: false,
          lookup_key: "pagefy_sub_lorem",
          metadata: {},
          nickname: null,
          product: "prod_1234",
          recurring: {
            aggregate_usage: null,
            interval: "month",
            interval_count: 1,
            meter: null,
            trial_period_days: null,
            usage_type: "licensed",
          },
          tax_behavior: "unspecified",
          tiers_mode: null,
          transform_quantity: null,
          type: "recurring",
          unit_amount: 3990,
          unit_amount_decimal: "3990",
        },
        proration: false,
        proration_details: {
          credited_items: null,
        },
        quantity: 1,
        subscription: "sub_1234",
        subscription_item: "si_1234",
        tax_amounts: [],
        tax_rates: [],
        type: "subscription",
        unit_amount_excluding_tax: "3990",
      },
    ],
    has_more: false,
    total_count: 1,
    url: "/v1/invoices/in_1234/lines",
  },
  livemode: false,
  metadata: {},
  next_payment_attempt: null,
  number: "E7F24301-0001",
  on_behalf_of: null,
  paid: true,
  paid_out_of_band: false,
  payment_intent: "pi_1234",
  payment_settings: {
    default_mandate: null,
    payment_method_options: {
      acss_debit: null,
      bancontact: null,
      card: {
        request_three_d_secure: "automatic",
      },
      customer_balance: null,
      konbini: null,
      sepa_debit: null,
      us_bank_account: null,
    },
    payment_method_types: null,
  },
  period_end: 1741215676,
  period_start: 1741215676,
  post_payment_credit_notes_amount: 0,
  pre_payment_credit_notes_amount: 0,
  quote: null,
  receipt_number: null,
  rendering: null,
  shipping_cost: null,
  shipping_details: null,
  starting_balance: 0,
  statement_descriptor: null,
  status: "paid",
  status_transitions: {
    finalized_at: 1741215676,
    marked_uncollectible_at: null,
    paid_at: 1741215678,
    voided_at: null,
  },
  subscription: "sub_1234",
  subscription_details: {
    metadata: {},
  },
  subtotal: 3990,
  subtotal_excluding_tax: 3990,
  tax: null,
  test_clock: null,
  total: 3990,
  total_discount_amounts: [],
  total_excluding_tax: 3990,
  total_pretax_credit_amounts: [],
  total_tax_amounts: [],
  transfer_data: null,
  webhooks_delivered_at: 1741215680,
};

export const subscriptionModel = {
  id: "sub_1MowQVLkdIwHu7ixeRlqHVzs",
  object: "subscription",
  application: null,
  application_fee_percent: null,
  automatic_tax: {
    enabled: false,
    liability: null,
  },
  billing_cycle_anchor: 1679609767,
  billing_thresholds: null,
  cancel_at: null,
  cancel_at_period_end: false,
  canceled_at: null,
  cancellation_details: {
    comment: null,
    feedback: null,
    reason: null,
  },
  collection_method: "charge_automatically",
  created: 1679609767,
  currency: "usd",
  current_period_end: 1682288167,
  current_period_start: 1679609767,
  customer: "cus_Na6dX7aXxi11N4",
  days_until_due: null,
  default_payment_method: null,
  default_source: null,
  default_tax_rates: [],
  description: null,
  discount: null,
  discounts: null,
  ended_at: null,
  invoice_settings: {
    issuer: {
      type: "self",
    },
  },
  items: {
    object: "list",
    data: [
      {
        id: "si_Na6dzxczY5fwHx",
        object: "subscription_item",
        billing_thresholds: null,
        created: 1679609768,
        metadata: {},
        plan: {
          id: "price_1MowQULkdIwHu7ixraBm864M",
          object: "plan",
          active: true,
          aggregate_usage: null,
          amount: 1000,
          amount_decimal: "1000",
          billing_scheme: "per_unit",
          created: 1679609766,
          currency: "usd",
          discounts: null,
          interval: "month",
          interval_count: 1,
          livemode: false,
          metadata: {},
          nickname: null,
          product: "prod_Na6dGcTsmU0I4R",
          tiers_mode: null,
          transform_usage: null,
          trial_period_days: null,
          usage_type: "licensed",
        },
        price: {
          id: "price_1MowQULkdIwHu7ixraBm864M",
          object: "price",
          active: true,
          billing_scheme: "per_unit",
          created: 1679609766,
          currency: "usd",
          custom_unit_amount: null,
          livemode: false,
          lookup_key: null,
          metadata: {},
          nickname: null,
          product: "prod_Na6dGcTsmU0I4R",
          recurring: {
            aggregate_usage: null,
            interval: "month",
            interval_count: 1,
            trial_period_days: null,
            usage_type: "licensed",
          },
          tax_behavior: "unspecified",
          tiers_mode: null,
          transform_quantity: null,
          type: "recurring",
          unit_amount: 1000,
          unit_amount_decimal: "1000",
        },
        quantity: 1,
        subscription: "sub_1MowQVLkdIwHu7ixeRlqHVzs",
        tax_rates: [],
      },
    ],
    has_more: false,
    total_count: 1,
    url: "/v1/subscription_items?subscription=sub_1MowQVLkdIwHu7ixeRlqHVzs",
  },
  latest_invoice: "in_1MowQWLkdIwHu7ixuzkSPfKd",
  livemode: false,
  metadata: {},
  next_pending_invoice_item_invoice: null,
  on_behalf_of: null,
  pause_collection: null,
  payment_settings: {
    payment_method_options: null,
    payment_method_types: null,
    save_default_payment_method: "off",
  },
  pending_invoice_item_interval: null,
  pending_setup_intent: null,
  pending_update: null,
  schedule: null,
  start_date: 1679609767,
  status: "active",
  test_clock: null,
  transfer_data: null,
  trial_end: null,
  trial_settings: {
    end_behavior: {
      missing_payment_method: "create_invoice",
    },
  },
  trial_start: null,
};

export const couponModel = {
  id: "jMT0WJUD",
  object: "coupon",
  amount_off: null,
  created: 1678037688,
  currency: null,
  duration: "repeating",
  duration_in_months: 3,
  livemode: false,
  max_redemptions: null,
  metadata: {},
  name: null,
  percent_off: 25.5,
  redeem_by: null,
  times_redeemed: 0,
  valid: true,
};
