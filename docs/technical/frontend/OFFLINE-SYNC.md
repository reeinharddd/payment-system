---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "sync-strategy"
module: "frontend"
status: "approved"
version: "1.0.0"
last_updated: "2025-11-27"
author: "@Frontend"

# Keywords for semantic search
keywords:
  - "offline"
  - "sync"
  - "indexeddb"
  - "dexie"
  - "pwa"
  - "service-worker"
  - "conflict-resolution"
  - "eventual-consistency"

# Related documentation
related_docs:
  database_schema: ""
  api_design: ""
  feature_design: ""
  sync_strategy: "docs/technical/architecture/SECURE-OFFLINE-POS.md"

# Sync-specific metadata
sync_metadata:
  sync_type: "bidirectional"
  conflict_strategy: "last-write-wins"
  storage_engine: "IndexedDB (Dexie.js)"
  max_offline_duration: "7 days"
  batch_size: 50
  consistency_model: "eventual"

# Document-specific metadata
doc_metadata:
  audience: "developers"
  complexity: "high"
  estimated_read_time: "30 min"
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the Offline Synchronization Strategy.
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
      <h1 style="margin: 0; border-bottom: none;">Offline Synchronization</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">PWA & Data Sync Strategy</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Draft-yellow?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Tech-Angular%20PWA-red?style=flat-square" alt="Technology" />
  <img src="https://img.shields.io/badge/Storage-IndexedDB-blue?style=flat-square" alt="Storage" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                      |
| :------------- | :------------------------------------------------------------------------------- |
| **Context**    | This document defines how the frontend handles offline data and synchronization. |
| **Constraint** | Use `Dexie.js` for IndexedDB interaction.                                        |
| **Pattern**    | Implement the 'Command Pattern' for the Sync Queue.                              |
| **Related**    | `docs/technical/architecture/adr/002-OFFLINE-STRATEGY.md`                        |

---

## 1. Overview

To support merchants in areas with unstable internet, the application adopts an **Offline-First** architecture. This means the UI primarily reads from a local database (`IndexedDB`) and synchronizes with the backend in the background.

## 2. Architecture

### 2.1. Local Database (Dexie.js)

We mirror critical collections locally:

```typescript
class AppDatabase extends Dexie {
  products: Table<Product, string>;
  sales: Table<Sale, string>;
  syncQueue: Table<SyncJob, number>; // Auto-increment ID

  constructor() {
    super("ImpulsaDB");
    this.version(1).stores({
      products: "id, name, sku",
      sales: "id, createdAt, status",
      syncQueue: "++id, type, status", // type: 'CREATE_SALE', 'UPDATE_INVENTORY'
    });
  }
}
```

### 2.2. Sync Queue (The Outbox)

When a user performs an action (e.g., "Create Sale"):

1.  **Optimistic UI:** The app immediately updates the local `sales` table and the UI reflects the change.
2.  **Queueing:** A job is added to the `syncQueue` table.
    - `{ type: 'CREATE_SALE', payload: { ... }, status: 'PENDING' }`
3.  **Background Sync:**
    - The `SyncService` listens for the `online` event.
    - It iterates through `PENDING` jobs in the queue.
    - It sends them to the backend API.
    - On success: Deletes the job.
    - On failure: Marks as `RETRY` (with exponential backoff).

### 2.3. Data Pull (Downstream Sync)

On application load (and periodically):

1.  The app requests a "Delta Update" from the server (e.g., `GET /api/sync?lastSync=TIMESTAMP`).
2.  The server returns only changed records.
3.  The app updates the local `IndexedDB`.

## 3. Conflict Resolution Strategy

### 3.1. The "Physical Reality" Principle

In a retail environment, if a cashier hands a product to a customer and takes cash, the sale **has happened**. The digital system cannot reject it retroactively. Therefore, **Offline Sales always win**.

### 3.2. Scenario: Overselling (Negative Inventory)

- **Situation:**
  - Server Stock: 10 units.
  - User A (Offline) sells 3 units. Local stock: 7.
  - User B (Online) sells 10 units. Server stock: 0.
  - User A comes online and syncs the sale of 3 units.
- **Resolution:**
  1.  **Accept the Sale:** The backend accepts User A's transaction.
  2.  **Update Inventory:** The stock becomes **-3**.
  3.  **Flag Discrepancy:** The system creates an `InventoryAlert` (Type: `OVERSELLING`).
  4.  **Notification:** The Admin/Manager receives a notification: _"Stock discrepancy detected for Product X. Expected: 0, Actual: -3. Please reconcile."_
- **Justification:** It is better to have a negative number that reflects the financial reality (cash in drawer) than to reject a valid sale. The manager can then adjust stock (maybe there were actually 13 items physically, or it's a loss).

### 3.3. Scenario: Price Change

- **Situation:** Product price changes from $10 to $12 while User A is offline. User A sells at $10.
- **Resolution:** Accept the sale at $10. Record the "Price Variance" for reporting. The customer paid what they saw on the screen.

### 3.4. Scenario: Deleted Product

- **Situation:** Product is deleted (soft delete) on server. User A sells it offline.
- **Resolution:** Accept the sale. Reactivate the product (or keep soft deleted but link the sale). Flag for review.

## 4. Security Considerations

- **Token Expiry:** If the JWT expires while offline, the user can continue using the POS (Point of Sale) features but cannot access Admin settings or sync until they re-login.
- **Encryption:** We do not encrypt the entire IndexedDB (performance cost), but we do not store sensitive customer PII locally.

## 5. Implementation Plan

1.  [ ] Install `@angular/pwa` and `dexie`.
2.  [ ] Create `DatabaseService` (Singleton).
3.  [ ] Implement `SyncService` with `window.addEventListener('online', ...)`
4.  [ ] Update `SalesService` to write to Dexie instead of calling HTTP directly.
