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
  name: "Boost",
};
