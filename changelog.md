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

### [0.1.0] - 2022-10-11

- Feature: Creation of subscription on Stripe
- Feature: Creation of subscription on Socialbio
- Feature: On subscription creation, assures user already have a stripe's customer id (if the hasn't, creates a customer profile and automatically saves to the user profile on socialbio)

### [0.0.0] - 2022-10-10

- Basic project set up;
