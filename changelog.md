# Changelog

---

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- Given a version number MAJOR.MINOR.PATCH, increment the:
  1. MAJOR version when you make incompatible API changes
  2. MINOR version when you add functionality in a backwards compatible manner
  3. PATCH version when you make backwards compatible bug fixes
  4. Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

---

## Versions

### [0.11.0] - 2025-03-05

- Feat: new endpoint to cancel an existing subscription

### [0.10.0] - 2025-03-05

- Feat: new endpoint to retrieve a Stripe's invoice by ID
- Feat: endpoint to retrieve checkout session now fulfills invoice details

### [0.9.0] - 2025-03-05

- Feat: new endpoint to retrieve a Stripe's checkout session by ID

### [0.8.0] - 2025-03-05

- Feat: new endpoint to create a new Stripe's checkout session

### [0.7.1] - 2025-03-05

- Fix: removed auth from endpoint to retrieve Stripe plans

### [0.7.0] - 2025-03-05

- Feat: endpoint to retrieve Stripe plans

### [0.6.1] - 2022-10-19

- Fix: Webhook fix to return from controller

### [0.6.0] - 2022-10-17

- Feature: Implemented endpoint to get all user subscriptions

### [0.5.0] - 2022-10-17

- Feature: Implemented createSubscriptionSchedule, called when a stripe hook is received for the payment_intent.succeeded.
- Feature: Implemented Stripe webhook for subscription_schedule.expiring

### [0.4.0] - 2022-10-16

- Feature: Subscription endpoints
- Feature: Webhooks to handle Stripe events of payment_intent.succeeded, payment_intent.failed and invoice.paid
- Feature: email communications to the user and system when a payment is received and when an invoice is emitted (using enhanced html for the email body)

### [0.3.0] - 2022-10-13

- Feature: Endpoint to get payment intent

### [0.2.0] - 2022-10-13

- Feature: Endpoint to cancel subscription

### [0.1.0] - 2022-10-11

- Feature: Creation of subscription on Stripe
- Feature: Creation of subscription on Socialbio
- Feature: On subscription creation, assures user already have a stripe's customer id (if the hasn't, creates a customer profile and automatically saves to the user profile on socialbio)

### [0.0.0] - 2022-10-10

- Basic project set up;
