---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "general"
module: "backend"
status: "approved"
version: "1.0.0"
last_updated: "2025-11-27"
author: "@Architect"

# Keywords for semantic search
keywords:
  - "database"
  - "postgresql"
  - "prisma"
  - "er-diagram"
  - "schema"
  - "data-model"
  - "relational"
  - "soft-delete"

# Related documentation
related_docs:
  database_schema: "docs/technical/backend/database/"
  api_design: ""
  feature_design: ""
  ux_flow: ""

# Document-specific metadata
doc_metadata:
  audience: "developers"
  complexity: "high"
  estimated_read_time: "15 min"
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the DATABASE DESIGN.
  1. Preserve the Header Table and Metadata block.
  2. Fill in the "Agent Directives" to guide future AI interactions.
  3. Keep the structure strict for RAG (Retrieval Augmented Generation) efficiency.
-->
<!-- AI-INSTRUCTION: END -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="120" align="center" valign="middle">
      <img src="../../../libs/assets/src/images/logo.png" width="80" alt="Project Logo" />
    </td>
    <td align="left" valign="middle">
      <h1 style="margin: 0; border-bottom: none;">Database Design & ER Diagrams</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Entity-Relationship models and schema definitions</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-Backend-blue?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--27-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                                              |
| :------------- | :------------------------------------------------------------------------------------------------------- |
| **Context**    | This document defines the database schema and ER diagrams.                                               |
| **Constraint** | All schema changes MUST be modeled here first using PlantUML.                                            |
| **Pattern**    | Use the 'Code-First' approach but document here first.                                                   |
| **Rule**       | **Soft Delete:** ALWAYS use `deletedAt` (nullable timestamp). NEVER delete rows.                         |
| **Rule**       | **Schema Separation:** Use PostgreSQL schemas (`auth`, `business`, `payments`, etc.) to organize tables. |
| **Related**    | `apps/backend/prisma/schema.prisma`                                                                      |

---

## Design Progress Checklist

Use this checklist to track the maturity of the database design.

- [x] **Initial Design:** Core entities defined (User, Business, Product, Transaction).
- [x] **Schema 1 - Auth:** Multi-provider, Sessions, Audit Logs, MFA, Trusted Devices. **READY**
- [x] **Schema 2 - Business:** Roles, Permissions, Employee Management, Branches. **READY**
- [x] **Schema 3 - Communication:** Templates, Push, In-App Notifications, Logging. **READY**
- [x] **Schema 4 - Inventory:** Stock movements, Variants, Alerts. **READY**
- [ ] **Schema 5 - Sales:** Shifts, Transactions, Receipts.
- [ ] **Schema 6 - Payments:** Multi-country adapters, Idempotency.
- [ ] **Schema 7 - Billing:** Invoicing (SAT/DIAN/AFIP) structures.

---

## Database Design Principles & Rules (The Constitution)

These rules are mandatory for all database development in this project.

### 1. Integrity & Safety

- **Soft Deletes Only:** Destructive `DELETE` operations are forbidden in production. All tables must have a `deletedAt` column.
- **Idempotency:** Critical transactional tables (`Transaction`, `StockMovement`) MUST support an `idempotencyKey` to prevent duplicate processing during network retries or UI glitches.
- **Optimistic Locking:** High-concurrency entities (`Stock`, `Balance`) must use a `version` (Int) field to prevent race conditions (Lost Update Problem).

### 2. Financial Precision

- **No Floats:** NEVER use `Float` or `Double` for monetary values.
- **Decimal Standard:** Use `DECIMAL(19, 4)` for all currency fields to handle exchange rates and fractional cents correctly.
- **Snapshots:** Historical records (`SaleItem`, `Invoice`) must store a **snapshot** of the data (price, product name, tax rate) at the time of creation. Do not rely on relations to mutable master data.

### 3. Time & Localization

- **UTC Always:** All `TIMESTAMP` columns must be stored in UTC.
- **Timezones:** The `Branch` entity dictates the timezone for "End of Day" calculations.
- **Audit:** All tables must have `createdAt` and `updatedAt`.

### 4. Performance & Structure

- **Normalization:** Default to 3NF. Denormalize ONLY for read-heavy performance (e.g., storing `currentStock` on `Product` instead of summing `StockMovements` every time), but ensure eventual consistency.
- **Indexing:**
  - Index all Foreign Keys.
  - Index columns used in `WHERE`, `ORDER BY`, and `JOIN`.
  - Use Partial Indexes for queues (e.g., `WHERE status = 'PENDING'`).
- **JSONB Usage:** Use `JSONB` for:
  - Polymorphic data (e.g., `providerData` from different payment gateways).
  - Configuration/Settings (`features`, `preferences`).
  - **Do NOT** use JSONB for data that requires frequent relational queries or aggregation.

### 5. Security & Future-Proofing

- **Encryption:**
  - **At Rest & Transit:** Database storage must be encrypted. All connections must use TLS.
  - **Column Level:** Sensitive PII inside JSONB or specific columns should be considered for application-level encryption.
- **Immutability (Ledger Concept):**
  - Financial records (`Transaction`, `Invoice`) are **Immutable**. NEVER update a transaction status from `CONFIRMED` to `FAILED` directly; use a new compensating record (e.g., `Refund`).
  - This structure prepares the system for future integration with **Blockchain** or **Immutable Ledgers** for decentralized auditability.
- **Read/Write Splitting:**
  - The architecture supports Read Replicas. Heavy analytical queries MUST target the `READ` connection to avoid blocking the transactional `WRITE` master.

### 6. Auth & Identity Standards

- **Session Management:**
  - Use a dedicated `Session` table to track active devices/tokens.
  - Support revocation of specific sessions (e.g., "Log out of all other devices").
- **Audit Logging:**
  - Critical security events (login, password change, MFA update) MUST be logged in `AuditLog`.
  - This log is immutable and separate from operational logs.
- **PII Protection:**
  - Passwords MUST be hashed using **Argon2id**.
  - Phone numbers and Emails MUST be unique at the `User` level.

### 7. Notification Architecture

- **Hot vs Cold Storage:**
  - `InAppNotification` table is for "Hot" data (what the user sees in the bell icon).
  - **Retention Policy:** Records older than 30 days should be moved to cold storage (S3/Data Warehouse) or deleted.
  - `NotificationLog` is for audit/debugging only and should have a strict TTL (Time To Live).
- **Templates & Consistency:**
  - **Do NOT** store raw HTML in the application code.
  - Use `NotificationTemplate` to store the structure (MJML/Handlebars).
  - **Images:** Store images in a CDN (S3/Cloudinary). Never store base64 images in the database.
- **Performance:**
  - Sending emails/SMS must be **Async** via a Job Queue (BullMQ).
  - The API endpoint only creates the job; the worker handles the external API call (SendGrid/Twilio).

---

## Schema Documentation

The database is divided into logical schemas. Click on each module for detailed ER diagrams, constraints, and rules.

| Schema                                                     | Description                                 | Status |
| :--------------------------------------------------------- | :------------------------------------------ | :----- |
| [**Auth & Identity**](./database/01-AUTH-SCHEMA.md)        | Users, Sessions, MFA, Trusted Devices.      | Ready  |
| [**Business Core**](./database/02-BUSINESS-SCHEMA.md)      | Organizations, Branches, Employees, RBAC.   | Ready  |
| [**Communication**](./database/03-COMMUNICATION-SCHEMA.md) | Notifications, Templates, Push, Audit Logs. | Ready  |
| [**Inventory**](./database/04-INVENTORY-SCHEMA.md)         | Products, Variants, Stock, Alerts.          | Ready  |
| [**Sales (POS)**](./database/05-SALES-SCHEMA.md)           | Cash Registers, Shifts, Sales, Items.       | Draft  |
| [**Payments**](./database/06-PAYMENTS-SCHEMA.md)           | Transactions, Payment Methods, Idempotency. | Draft  |
| [**Billing**](./database/07-BILLING-SCHEMA.md)             | Fiscal Invoicing (SAT/DIAN).                | Draft  |

> **[View Full ER Diagram](./database/FULL-ER-DIAGRAM.md)** (All schemas combined)

---

## Platform vs Product Architecture

This database design supports a **"Platform with Multiple Products"** strategy. This allows a single user to have a unified identity while accessing different business tools (Restaurant, Retail, Service) based on their context.

### 1. Global Identity (The "Who")

The `User` entity represents the human being. This data is **immutable** across products.

- **Single Sign-On:** A user logs in once via `UserIdentity` (Google, Phone, Password).
- **Global Profile:** Name, email, phone are stored here.
- **UX & Engagement:**
  - **Notifications:** Users can receive alerts via Email, SMS, WhatsApp, or Push (PWA). Managed via `PushSubscription` and `preferences` JSON.
  - **Templates & Consistency:** All notifications use `NotificationTemplate` to ensure consistent branding (e.g., "Security Alert" vs "Marketing").
  - **Real-time Feed:** `InAppNotification` stores the persistent history of alerts shown in the "Bell" icon, while `PushSubscription` handles the "Wake up" signal.
  - **Offline Persistence:** The `Session` table supports long-lived refresh tokens (`expiresAt`), allowing the PWA to work offline and re-sync when connectivity returns.
  - **Identity Verification (KYC):** Progressive profiling (`kycLevel`) allows users to start with just a phone number and upgrade to full fiscal identity (`kycData`) only when needed (e.g., to issue invoices).

### 2. Contextual Profile (The "Where")

The `Employee` entity represents the user's role within a specific `Business`.

- **Context Switching:** A user can be an "Owner" in Business A (Restaurant) and a "Cashier" in Business B (Retail).
- **Separation of Concerns:** Permissions and roles are linked to the `Employee` record, not the `User`.

### 3. Business Types (The "What")

The `Business` entity determines the product experience via the `type` and `features` fields.

| Field      | Description                            | Example                                      |
| :--------- | :------------------------------------- | :------------------------------------------- |
| `type`     | Defines the primary vertical.          | `RESTAURANT`, `RETAIL`, `SERVICE`            |
| `features` | JSON flags to toggle specific modules. | `{ "kitchenDisplay": true, "tables": true }` |

**Frontend Behavior:**

- If `type === 'RESTAURANT'`, the app loads the Table Management and Kitchen modules.
- If `type === 'RETAIL'`, the app loads the Barcode Scanner and Quick POS modules.
