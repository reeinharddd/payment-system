---
document_type: "general"
module: "general"
status: "approved"
version: "1.0.0"
last_updated: "2025-12-01"
author: "@Architect"

keywords:
  - "glossary"
  - "terminology"
  - "definitions"
  - "ubiquitous-language"
---

# Ubiquitous Language & Glossary

This document defines the standard terminology for the Payment System. These terms must be used consistently across Code, Database, and Documentation.

## Core Entities

| Term         | Definition                                                                  | Code Reference                         |
| :----------- | :-------------------------------------------------------------------------- | :------------------------------------- |
| **Merchant** | A business entity that uses our system to process payments.                 | `Merchant` (Prisma), `MerchantService` |
| **Customer** | The end-user making a purchase from a Merchant.                             | `Customer` (Prisma)                    |
| **Provider** | An external gateway (e.g., Stripe, Conekta) that processes the transaction. | `IPaymentProvider`                     |

## Payment Lifecycle

| Term              | Definition                                                                     | Synonyms (Forbidden)         |
| :---------------- | :----------------------------------------------------------------------------- | :--------------------------- |
| **Authorization** | The initial step where funds are reserved on the card but not taken.           | Pre-auth, Hold               |
| **Capture**       | The action of finalizing an authorized transaction and moving funds.           | Charge, Complete             |
| **Refund**        | Returning funds to the customer _after_ capture.                               | Reversal (incorrect context) |
| **Void**          | Cancelling an authorization _before_ capture.                                  | Cancel                       |
| **Settlement**    | The actual transfer of funds from the Provider to the Merchant's bank account. | Payout                       |

## Technical Concepts

| Term                | Definition                                                                              |
| :------------------ | :-------------------------------------------------------------------------------------- |
| **Idempotency Key** | A unique key sent with requests to prevent duplicate operations during network retries. |
| **Webhook**         | An HTTP callback received from a Provider to update transaction status asynchronously.  |
| **Tokenization**    | Replacing sensitive card data (PAN) with a non-sensitive token.                         |
