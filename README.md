# Pagefy Registration - Microservice

## NodeJS

- Typescript
- Execute `npm start` to run locally

### Stripe

- Receive webhooks in localhost:
  1. `stripe login`
  2. `stripe listen --forward-to localhost:4242/api/v1/webhook`
  3. Manual trigger webhook: `stripe trigger payment_intent.succeeded`
