---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "general"
module: "architecture"
status: "approved"
version: "1.0.0"
last_updated: "2025-11-27"
author: "@Architect"

# Keywords for semantic search
keywords:
  - "offline"
  - "pwa"
  - "security"
  - "fraud-prevention"
  - "signed-state"
  - "zero-trust"
  - "cryptographic-snapshot"
  - "hmac"
  - "offline-sync"

# Related documentation
related_docs:
  database_schema: "docs/technical/backend/database/01-AUTH-SCHEMA.md"
  api_design: ""
  feature_design: ""
  sync_strategy: "docs/technical/frontend/OFFLINE-SYNC.md"

# Document-specific metadata
doc_metadata:
  audience: "developers"
  complexity: "high"
  estimated_read_time: "25 min"
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the Security Architecture for Offline POS Operations.
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
      <h1 style="margin: 0; border-bottom: none;">Secure Offline POS Architecture</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Auth Integration, Fraud Prevention & Data Sync</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Proposed-blue?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Scope-Full%20Stack-purple?style=flat-square" alt="Scope" />
  <img src="https://img.shields.io/badge/Security-High-red?style=flat-square" alt="Security" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                                                  |
| :------------- | :----------------------------------------------------------------------------------------------------------- |
| **Context**    | Defines how the PWA handles authentication and critical data while offline to prevent fraud.                 |
| **Constraint** | **Zero Trust:** The backend MUST re-validate all offline transactions upon sync.                             |
| **Pattern**    | **Cryptographic Snapshot:** Critical local data (Prices, Permissions) is signed by the server.               |
| **Rule**       | **Risk Gating:** High-risk actions (Refunds, User Management) are DISABLED offline.                          |
| **Related**    | `docs/technical/backend/database/01-AUTH-SCHEMA.md`, `docs/technical/backend/database/02-BUSINESS-SCHEMA.md` |

---

## 1. The Challenge

In a PWA (Progressive Web App) environment, the code runs on the client's device, which is untrusted. When offline, we cannot verify a session with the server. This creates risks:

1.  **Price Tampering:** A malicious user modifies IndexedDB to change a product price from $100 to $1.
2.  **Permission Bypass:** A user modifies their local role to enable "Refunds".
3.  **Ghost Sales:** Creating fake sales to balance cash withdrawals.

## 2. The Solution: "Signed State" Architecture

We implement a **Signed Bootstrap Payload** strategy. The server sends data with a cryptographic signature (HMAC) that the client must present back during sync.

### 2.1. The Bootstrap Payload (Login)

When a user logs in (Online), the server returns a comprehensive payload:

```json
{
  "session": {
    "token": "jwt_access_token",
    "expiresAt": "2025-11-28T10:00:00Z"
  },
  "context": {
    "businessId": "uuid",
    "branchId": "uuid",
    "role": {
      "permissions": ["SALES_CREATE", "CASH_SHIFT"],
      "signature": "hmac_sha256_of_permissions_and_userid"
    }
  },
  "catalog": {
    "products": [{ "id": "p1", "price": 100, "hash": "sha256_of_price" }],
    "catalogSignature": "hmac_sha256_of_all_product_hashes"
  }
}
```

**Security Mechanism:**

1.  **Permission Signature:** The backend signs the permission list. If the user edits IndexedDB to add `SALES_REFUND`, the signature won't match.
2.  **Catalog Signature:** Ensures the price list hasn't been tampered with.

### 2.2. Offline Operation Mode

When the app detects it is offline, it switches to **Restricted Mode**:

| Feature              | Status     | Reason                                                |
| :------------------- | :--------- | :---------------------------------------------------- |
| **Login**            | [BLOCKED]  | Cannot verify credentials. Must be already logged in. |
| **POS (Sales)**      | [ACTIVE]   | Low risk. Revenue generation is priority.             |
| **Refunds**          | [DISABLED] | High risk. Requires real-time fraud check.            |
| **Inventory Adjust** | [DISABLED] | High risk. Prevents theft hiding.                     |
| **Settings**         | [DISABLED] | Configuration requires server validation.             |
| **Reports**          | [CACHED]   | Read-only view of last known state.                   |

**The "Long Offline" Session:**

- If the JWT expires while offline, the PWA **allows POS access** to continue (Business Continuity), but flags all transactions as `AUTH_EXPIRED`.
- These transactions are flagged for manual review by the Manager upon sync.

### 2.3. Synchronization & Fraud Detection

When the device comes back online, it pushes the `SyncQueue`. The backend processes each job through a **Fraud Filter**:

#### Step 1: Integrity Check

The backend verifies the `permissionSignature` sent with the batch.

- **Mismatch?** Reject entire batch. Potential hacking attempt. Log security alert.

#### Step 2: Price Validation

For each sale, compare the `soldPrice` with the `historicalPrice` at that timestamp.

- **Match?** Process normally.
- **Mismatch?**
  - If `soldPrice < historicalPrice`: Flag as **"Price Variance"**.
  - If `soldPrice` matches a known discount rule: Auto-approve.
  - Otherwise: Create an **Audit Alert** for the Manager.

#### Step 3: Inventory Reconciliation

- Apply the sales to inventory.
- If stock goes negative: Allow it (Physical Reality Principle), but trigger **"Overselling Alert"**.

## 3. Fiscal & Legal Compliance Strategy

To ensure the system meets tax regulations (SAT, DIAN, AFIP) even when offline, we implement a **Provisional Fiscality** model.

### 3.1. Invoice Numbering (The Gap Problem)

**Problem:** We cannot generate official UUIDs (Fiscal Folios) offline because we might duplicate numbers or skip sequences, which is illegal in many countries.

**Solution: Provisional IDs**

1.  **Offline:** The POS generates a `provisionalId` (e.g., `OFF-20251127-001`).
2.  **Receipt:** The printed ticket says **"Ticket Provisional - Validez Fiscal Pendiente"**.
3.  **Sync:** The server receives the sale, requests the official UUID from the Tax Authority (PAC), and links it.
4.  **Finalization:** The system emails the final PDF/XML to the customer automatically.

### 3.2. Data Immutability (The Local Chain)

**Problem:** A user might delete a cash sale from IndexedDB before syncing to steal the money.

**Solution: Local Blockchain (Hash Chaining)**
Every offline transaction includes the hash of the _previous_ transaction.

```typescript
interface OfflineTransaction {
  id: string;
  prevHash: string; // Hash of the previous transaction
  data: SaleData;
  hash: string; // SHA256(prevHash + JSON.stringify(data))
}
```

**Verification:**

1.  When syncing, the server checks the chain.
2.  If `Tx3.prevHash != Tx2.hash`, it means **Tx2 was deleted or modified**.
3.  **Action:** The server flags the batch as **"Tampered"** and alerts the owner immediately.

## 4. Standards & Certifications

To build trust and ensure enterprise-grade quality, we align with the following standards:

| Standard           | Application       | Implementation                                                                                                                                            |
| :----------------- | :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PCI-DSS**        | Payment Security  | **Scope Reduction:** We never touch card numbers. We use external terminals (Smart POS) or redirect to secure gateways. The app only receives `authCode`. |
| **ISO/IEC 25010**  | Software Quality  | Focus on **Reliability** (Offline Sync) and **Usability** (PWA Performance).                                                                              |
| **Local Tax Laws** | Fiscal Compliance | **MX:** CFDI 4.0 compliant. **CO:** Electronic Invoice compliant. **AR:** AFIP Web Service compliant.                                                     |

## 5. Implementation Details

### 5.1. Frontend (Angular)

**`AuthService`:**

- Persists the `context` and `signatures` to `SecureStorage` (or IndexedDB if non-sensitive).
- `canActivate` guards check `navigator.onLine`. If offline, block restricted routes.

**`SalesService`:**

- When creating an offline sale, attach the `catalogSignature` active at that moment.

### 3.2. Backend (NestJS)

**`SyncController`:**

- Endpoint: `POST /sync/batch`
- Middleware: `OfflineSignatureValidator`.

**`FraudDetectionService`:**

- Async worker that analyzes synced batches.
- Rules Engine:
  - "More than 5 offline voids in 1 hour" -> Alert.
  - "Offline sale > $5,000" -> Flag for review.

## 4. User Experience (The "Vibe")

1.  **Going Offline:** A subtle toast appears: _"You are offline. POS is active, but Admin features are paused."_
2.  **Selling:** Works exactly the same. Fast, snappy.
3.  **Coming Online:** A spinner shows "Syncing...".
4.  **Resolution:** If alerts are generated, the Manager sees a "Daily Reconciliation" card:
    - _"3 Offline sales had price variances. [Review]"_
    - _"Stock for 'Coca Cola' is -5. [Adjust]"_

This ensures the owner feels **in control** without blocking the cashier from working.
