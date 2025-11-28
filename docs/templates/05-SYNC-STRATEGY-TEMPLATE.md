---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "sync-strategy" # REQUIRED: Type identifier for MCP/RAG
module: "[module-name]" # REQUIRED: e.g., "inventory-sync", "sales-sync"
status: "approved" # REQUIRED: draft | in-review | approved | deprecated
version: "1.0.0" # REQUIRED: Semantic versioning
last_updated: "YYYY-MM-DD" # REQUIRED: ISO date format
author: "@username" # REQUIRED: GitHub username or team

# Keywords for semantic search
keywords:
  - "offline"
  - "synchronization"
  - "conflict-resolution"
  - "queue"
  - "[entity-name]" # e.g., "product-sync", "inventory-sync"
  - "crdt"
  - "optimistic-locking"
  - "delta-sync"
  - "eventual-consistency"

# Related documentation
related_docs:
  database_schema: "" # Path to DB schema
  api_design: "" # Path to API design
  feature_design: "" # Path to feature design
  ux_flow: "" # Path to UX flow (offline indicators)

# Sync-specific metadata
sync_metadata:
  sync_type: "" # "pull-only" | "push-only" | "bidirectional"
  conflict_strategy: "" # "last-write-wins" | "rebase" | "server-wins" | "manual"
  max_queue_size: 1000
  retry_strategy: "exponential-backoff"
  entities_synced: [] # List of entity names (e.g., ["Product", "Inventory"])
  consistency_model: "eventual" # "eventual" | "strong" | "causal"
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document is a TEMPLATE for Offline Synchronization Strategy Documentation.

  PURPOSE: Define sync mechanisms, conflict resolution, and offline behavior ONLY.

  CRITICAL RULES:
  1. NO database schema definitions (use Database Schema docs)
  2. NO API endpoint DTOs (use API Design docs)
  3. NO UI interaction flows (use UX Flow docs)
  4. FOCUS ON: Sync algorithms, conflict resolution rules, delta strategies, queue management

  WHERE TO DOCUMENT OTHER ASPECTS:
  - Database Structure > docs/technical/backend/database/
  - API Contracts > docs/technical/backend/api/
  - UI Flows > docs/technical/frontend/ux-flows/
  - Feature Implementation > docs/technical/backend/features/
-->
<!-- AI-INSTRUCTION: END -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="120" align="center" valign="middle">
      <img src="../../../libs/assets/src/images/logo.png" width="80" alt="Project Logo" />
    </td>
    <td align="left" valign="middle">
      <h1 style="margin: 0; border-bottom: none;">Sync Strategy: [Module Name]</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Offline Synchronization Strategy</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Approved-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Sync-Bidirectional-blue?style=flat-square" alt="Sync" />
  <img src="https://img.shields.io/badge/Last%20Updated-YYYY--MM--DD-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                        |
| :------------- | :--------------------------------------------------------------------------------- |
| **Context**    | This document defines the offline synchronization strategy for [Module Name].      |
| **Scope**      | ONLY sync algorithms, conflict resolution, delta strategies, and queue management. |
| **Constraint** | NO database schema, NO API DTOs, NO UI flows. Synchronization logic ONLY.          |
| **Related**    | [Database Schema], [API Design], [Feature Design]                                  |
| **Pattern**    | Optimistic UI, Delta Sync, CRDT-inspired conflict resolution.                      |

---

## 1. Executive Summary

_High-level overview of synchronization strategy._

**Module:** [e.g. "Inventory Management"]

**Sync Type:** Optimistic | Pessimistic | Hybrid

**Key Characteristics:**

- **Read-Heavy Operations:** [e.g. "Product catalog sync (pull model)"]
- **Write-Heavy Operations:** [e.g. "Stock movements (delta-based writes)"]
- **Conflict Likelihood:** Low | Medium | High
- **Network Dependency:** Can operate fully offline for [X] hours/days

**Success Criteria:**

- Data consistency across devices within [X] seconds of connectivity
- Zero data loss during offline operations
- Conflicts resolved automatically in [X]% of cases

---

## 2. Sync Architecture Overview

### 2.1. System Components

```text
┌─────────────────┐
│  Client Device  │
│  (Angular PWA)  │
├─────────────────┤
│ Local Storage   │◄──┐
│ (IndexedDB)     │   │
└────────┬────────┘   │
         │            │
    ┌────▼────┐       │
    │ Sync    │       │
    │ Engine  │       │
    └────┬────┘       │
         │            │
    ┌────▼────────────▼───┐
    │  Operation Queue    │
    │  (Pending Changes)  │
    └────┬────────────────┘
         │
    ┌────▼────┐
    │ Network │
    │ Layer   │
    └────┬────┘
         │
    ┌────▼────────────────┐
    │  API Server         │
    │  (NestJS)           │
    ├─────────────────────┤
    │ Conflict Resolver   │
    │ Version Control     │
    └────┬────────────────┘
         │
    ┌────▼────┐
    │Database │
    │(PostgreSQL)
    └─────────┘
```

### 2.2. Data Flow Patterns

**Pattern 1: Pull Sync (Read-Heavy)**

- Client requests data with `since` timestamp or version
- Server returns only changed records (delta)
- Client merges into local storage

**Pattern 2: Push Sync (Write-Heavy)**

- Client queues operations locally
- When online, pushes operations sequentially
- Server validates, applies, and responds with new state
- Client updates local version

**Pattern 3: Real-Time Updates (WebSocket)**

- Server broadcasts changes to connected clients
- Clients apply updates immediately if not in conflict

---

## 3. Synchronization Strategies by Entity

### 3.1. Catalog Data (Products, Categories)

**Type:** Pull Sync (Server > Client)

**Characteristics:**

- Read-only on client (managed by admin)
- Infrequent updates
- Large payload size

**Algorithm:**

```typescript
interface CatalogSyncRequest {
  lastSyncVersion: number; // Client's current version
  branchId: string; // Scope to branch catalog
}

interface CatalogSyncResponse {
  products: Product[]; // Changed products (created/updated)
  deletedIds: string[]; // Deleted product IDs
  categories: Category[];
  currentVersion: number; // Server's current version
}

async function syncCatalog(): Promise<void> {
  const lastVersion = await getLastSyncVersion("catalog");

  const response = await api.get<CatalogSyncResponse>("/sync/catalog", {
    params: { lastSyncVersion: lastVersion },
  });

  // Merge into local DB
  await db.transaction("rw", [db.products, db.categories], async () => {
    // Update/insert changed records
    for (const product of response.products) {
      await db.products.put(product);
    }

    // Delete removed records
    for (const id of response.deletedIds) {
      await db.products.delete(id);
    }

    // Update categories
    for (const category of response.categories) {
      await db.categories.put(category);
    }
  });

  // Save new sync version
  await setLastSyncVersion("catalog", response.currentVersion);
}
```

**Conflict Resolution:** N/A (read-only on client)

**Frequency:** Every 5 minutes when online, on app start

---

### 3.2. Stock Movements (Inventory Transactions)

**Type:** Push Sync (Client > Server) + Delta-Based

**Characteristics:**

- Write-heavy from client
- High conflict potential (multiple cashiers)
- Critical for data consistency

**Algorithm:**

```typescript
interface StockMovementOperation {
  id: string; // Client-generated UUID
  type: "SALE" | "RESTOCK" | "ADJUSTMENT";
  productId: string;
  variantId?: string;
  branchId: string;
  quantityDelta: number; // +N or -N (NOT absolute quantity)
  expectedVersion: number; // Optimistic locking
  timestamp: Date;
  metadata: Record<string, any>;
}

interface StockMovementResponse {
  success: boolean;
  newVersion: number;
  newQuantity: number;
  conflict?: ConflictInfo;
}

async function pushStockMovement(
  operation: StockMovementOperation,
): Promise<StockMovementResponse> {
  try {
    const response = await api.post<StockMovementResponse>(
      "/stock-movements",
      operation,
      { headers: { "X-Idempotency-Key": operation.id } },
    );

    if (response.success) {
      // Update local state with server's authoritative version
      await updateLocalInventory(
        operation.productId,
        response.newQuantity,
        response.newVersion,
      );

      return response;
    } else {
      // Conflict detected
      return handleStockConflict(operation, response.conflict);
    }
  } catch (error) {
    // Network error - queue for retry
    await queueOperation(operation);

    // Apply optimistically to local state
    await applyOptimisticUpdate(operation);

    throw error;
  }
}
```

**Conflict Resolution Strategy:**

```typescript
enum ConflictResolutionStrategy {
  SERVER_WINS = "SERVER_WINS", // Discard client change
  CLIENT_WINS = "CLIENT_WINS", // Force client change (dangerous)
  REBASE = "REBASE", // Recalculate delta based on new base
  MANUAL = "MANUAL", // Require user intervention
}

async function handleStockConflict(
  operation: StockMovementOperation,
  conflict: ConflictInfo,
): Promise<StockMovementResponse> {
  // Strategy 1: REBASE (preferred for stock movements)
  // Client expected version 10, server is now at version 12
  // Client wanted to do: quantity = 50 - 5 = 45
  // Server current: quantity = 48 (someone else adjusted)
  // Rebase: Apply same delta to new base: 48 - 5 = 43

  const rebasedOperation = {
    ...operation,
    expectedVersion: conflict.currentVersion,
    // Delta stays the same, just new base
  };

  // Retry with rebased operation
  return await api.post("/stock-movements", rebasedOperation);
}
```

**Frequency:** Immediate on operation, retry queue processed every 30 seconds

---

### 3.3. User Settings & Preferences

**Type:** Last-Write-Wins (LWW)

**Characteristics:**

- Low conflict impact (personal data)
- User expects their latest change to persist
- Small payload

**Algorithm:**

```typescript
interface UserPreference {
  key: string;
  value: any;
  updatedAt: Date;
  deviceId: string;
}

async function syncPreferences(): Promise<void> {
  const localPrefs = await db.preferences.toArray();
  const serverPrefs = await api.get<UserPreference[]>("/preferences");

  // Merge using Last-Write-Wins
  const merged = mergeLWW(localPrefs, serverPrefs);

  // Upload newer local prefs
  for (const pref of merged.toUpload) {
    await api.put(`/preferences/${pref.key}`, pref);
  }

  // Download newer server prefs
  for (const pref of merged.toDownload) {
    await db.preferences.put(pref);
  }
}

function mergeLWW(
  local: UserPreference[],
  server: UserPreference[],
): { toUpload: UserPreference[]; toDownload: UserPreference[] } {
  const toUpload: UserPreference[] = [];
  const toDownload: UserPreference[] = [];

  const localMap = new Map(local.map((p) => [p.key, p]));
  const serverMap = new Map(server.map((p) => [p.key, p]));

  // Check each local pref
  for (const [key, localPref] of localMap) {
    const serverPref = serverMap.get(key);

    if (!serverPref || localPref.updatedAt > serverPref.updatedAt) {
      toUpload.push(localPref);
    }
  }

  // Check each server pref
  for (const [key, serverPref] of serverMap) {
    const localPref = localMap.get(key);

    if (!localPref || serverPref.updatedAt > localPref.updatedAt) {
      toDownload.push(serverPref);
    }
  }

  return { toUpload, toDownload };
}
```

**Conflict Resolution:** Last-Write-Wins based on timestamp

**Frequency:** On app start, on preference change

---

## 4. Conflict Resolution Matrix

| Entity Type      | Conflict Likelihood | Resolution Strategy | User Intervention Required |
| :--------------- | :------------------ | :------------------ | :------------------------- |
| Product Catalog  | None                | N/A (read-only)     | No                         |
| Stock Movement   | High                | REBASE              | Rare (<1%)                 |
| Sale Transaction | Medium              | SERVER_WINS         | No (show notification)     |
| User Preferences | Low                 | LWW                 | No                         |
| Product Pricing  | Low                 | SERVER_WINS         | No (admin-controlled)      |
| Customer Data    | Medium              | REBASE              | Occasionally               |

---

## 5. Operation Queue Management

### 5.1. Queue Structure

```typescript
interface QueuedOperation {
  id: string; // UUID
  entityType: string; // 'product', 'stock', 'sale', etc.
  operation: "CREATE" | "UPDATE" | "DELETE";
  payload: any;
  createdAt: Date;
  attempts: number;
  maxAttempts: number; // Default: 5
  nextRetry: Date;
  status: "PENDING" | "PROCESSING" | "FAILED" | "SUCCESS";
  error?: string;
}

class SyncQueue {
  private queue: QueuedOperation[] = [];

  async enqueue(
    operation: Omit<QueuedOperation, "id" | "status" | "attempts">,
  ): Promise<void> {
    const queuedOp: QueuedOperation = {
      id: generateUUID(),
      status: "PENDING",
      attempts: 0,
      ...operation,
    };

    await db.syncQueue.add(queuedOp);
    this.queue.push(queuedOp);
  }

  async processQueue(): Promise<void> {
    const pending = this.queue.filter(
      (op) => op.status === "PENDING" && op.nextRetry <= new Date(),
    );

    for (const op of pending) {
      try {
        op.status = "PROCESSING";
        await this.executeOperation(op);

        op.status = "SUCCESS";
        await db.syncQueue.delete(op.id);
      } catch (error) {
        op.attempts++;

        if (op.attempts >= op.maxAttempts) {
          op.status = "FAILED";
          op.error = error.message;
          // Notify user
          await notifyUser(`Failed to sync: ${op.entityType}`, "error");
        } else {
          op.status = "PENDING";
          op.nextRetry = calculateBackoff(op.attempts);
        }

        await db.syncQueue.put(op);
      }
    }
  }

  private calculateBackoff(attempts: number): Date {
    // Exponential backoff: 2^attempts seconds
    const delayMs = Math.pow(2, attempts) * 1000;
    return new Date(Date.now() + delayMs);
  }
}
```

### 5.2. Queue Processing Strategy

**Trigger Conditions:**

1. Network connectivity restored (online event)
2. Every 30 seconds while online
3. User manually triggers sync
4. On app foreground (mobile)

**Ordering:**

- FIFO within same entity type
- Sales before adjustments (preserve transaction integrity)
- Creates before updates

---

## 6. Optimistic UI Patterns

### 6.1. Stock Sale Flow

```typescript
async function sellProduct(productId: string, quantity: number): Promise<void> {
  const product = await db.products.get(productId);
  const inventoryLevel = await db.inventory.get({ productId });

  // 1. Optimistic local update (instant UI feedback)
  const newQuantity = inventoryLevel.quantity - quantity;
  await db.inventory.update(
    { productId },
    {
      quantity: newQuantity,
      pendingSync: true, // Flag for UI indication
    },
  );

  // 2. Queue operation
  const operation: StockMovementOperation = {
    id: generateUUID(),
    type: "SALE",
    productId,
    quantityDelta: -quantity,
    expectedVersion: inventoryLevel.version,
    timestamp: new Date(),
    metadata: { saleId: "..." },
  };

  await syncQueue.enqueue(operation);

  // 3. Try to sync immediately (if online)
  if (navigator.onLine) {
    try {
      const response = await pushStockMovement(operation);

      // 4. Update with authoritative server data
      await db.inventory.update(
        { productId },
        {
          quantity: response.newQuantity,
          version: response.newVersion,
          pendingSync: false,
        },
      );
    } catch (error) {
      // Queued for retry, optimistic update remains
      console.log("Queued for sync", operation.id);
    }
  }
}
```

### 6.2. Rollback Strategy

```typescript
async function rollbackOperation(operationId: string): Promise<void> {
  const operation = await db.syncQueue.get(operationId);

  if (operation.entityType === "stock") {
    const inventory = await db.inventory.get({
      productId: operation.payload.productId,
    });

    // Reverse the delta
    const revertedQuantity =
      inventory.quantity - operation.payload.quantityDelta;

    await db.inventory.update(
      { productId: operation.payload.productId },
      {
        quantity: revertedQuantity,
        pendingSync: false,
      },
    );
  }

  await db.syncQueue.delete(operationId);
}
```

---

## 7. Network Detection & Handling

### 7.1. Connection State Management

```typescript
class NetworkMonitor {
  private isOnline: boolean = navigator.onLine;

  constructor() {
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());
  }

  private async handleOnline(): Promise<void> {
    this.isOnline = true;

    // Trigger full sync
    await syncCatalog();
    await syncQueue.processQueue();

    // Show notification
    showToast("Connected. Syncing...", "success");
  }

  private handleOffline(): void {
    this.isOnline = false;

    // Show offline indicator
    showToast("Sin conexión. Trabajando offline", "warning");
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-cache",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

### 7.2. Request Retry Logic

```typescript
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;

      // Don't retry on 4xx errors (client fault)
      if (error.message.includes("HTTP 4")) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }

  throw lastError;
}
```

---

## 8. Data Consistency Guarantees

### 8.1. ACID Properties

**Atomicity:**

- All operations are atomic at the entity level
- Composite operations use transaction boundaries

**Consistency:**

- Optimistic locking prevents concurrent modification
- Server validates all business rules before persisting

**Isolation:**

- Each client operates on its own snapshot
- Conflicts detected and resolved during sync

**Durability:**

- Server persists to PostgreSQL with WAL
- Client persists to IndexedDB (durable by default)

### 8.2. Eventual Consistency

**Guarantee:** All clients converge to same state within T seconds of sync

**T calculation:**

```
T = Network latency + Queue processing time + Conflict resolution time
T ≈ 5 seconds (typical)
T ≤ 60 seconds (worst case)
```

---

## 9. Testing & Validation

### 9.1. Sync Scenarios to Test

1. **Happy Path:**
   - Client online, server online > Immediate sync
2. **Client Offline:**
   - Client makes changes offline
   - Client comes online
   - Verify: All changes synced, no data loss

3. **Server Offline:**
   - Client attempts sync, server unreachable
   - Verify: Operations queued, retry logic works

4. **Concurrent Modifications:**
   - Two clients modify same entity simultaneously
   - Verify: Conflict detected and resolved correctly

5. **Network Interruption Mid-Sync:**
   - Sync starts, network drops during operation
   - Verify: Idempotency prevents duplicate operations

6. **Queue Overflow:**
   - 1000+ operations queued offline
   - Verify: All operations eventually synced in order

### 9.2. Performance Benchmarks

| Metric                         | Target       | Measured |
| :----------------------------- | :----------- | :------- |
| Catalog sync time (1000 items) | < 5 seconds  | TBD      |
| Stock movement latency         | < 500ms      | TBD      |
| Queue processing (100 ops)     | < 10 sec     | TBD      |
| Conflict resolution time       | < 1 second   | TBD      |
| IndexedDB write throughput     | > 1000 ops/s | TBD      |

---

## 10. Monitoring & Observability

### 10.1. Sync Metrics

```typescript
interface SyncMetrics {
  catalogSyncCount: number;
  catalogSyncDuration: number;
  queuedOperations: number;
  syncedOperations: number;
  failedOperations: number;
  conflictsDetected: number;
  conflictsResolved: number;
  averageLatency: number;
}

// Track in analytics
analytics.track("sync_completed", {
  duration: metrics.catalogSyncDuration,
  operations: metrics.syncedOperations,
  conflicts: metrics.conflictsDetected,
});
```

### 10.2. Health Checks

```typescript
async function syncHealthCheck(): Promise<SyncHealth> {
  const queueSize = await db.syncQueue.count();
  const oldestPending = await db.syncQueue
    .where("status")
    .equals("PENDING")
    .first();

  const health: SyncHealth = {
    status: "healthy",
    queueSize,
    oldestPendingAge: oldestPending
      ? Date.now() - oldestPending.createdAt.getTime()
      : 0,
  };

  if (queueSize > 100) {
    health.status = "degraded";
    health.warning = "Large sync queue";
  }

  if (health.oldestPendingAge > 3600000) {
    // 1 hour
    health.status = "unhealthy";
    health.error = "Operations stuck in queue";
  }

  return health;
}
```

---

## 11. Related Documentation

- [Database Schema](../../backend/database/04-INVENTORY-SCHEMA.md) - Data structure
- [API Design](../../backend/api/API-INVENTORY.md) - HTTP contracts
- [Offline Architecture ADR](../../architecture/adr/ADR-XXX-offline-first.md) - Decision rationale
- [IndexedDB Schema](../../frontend/INDEXEDDB-SCHEMA.md) - Client-side storage

---

## Appendix A: Change Log

| Date       | Version | Author     | Changes                             |
| :--------- | :------ | :--------- | :---------------------------------- |
| YYYY-MM-DD | 1.0.0   | @Architect | Initial sync strategy documentation |

---

## Appendix B: Algorithm Pseudocode

### Delta Sync Algorithm

```
function deltaSync(entityType):
  localVersion = getLocalVersion(entityType)

  // Pull changes from server
  delta = server.getDelta(entityType, since=localVersion)

  for each change in delta.created:
    localDB.insert(change)

  for each change in delta.updated:
    localDB.upsert(change)

  for each id in delta.deleted:
    localDB.delete(id)

  setLocalVersion(entityType, delta.currentVersion)

  // Push local changes
  localChanges = localDB.getPendingChanges(entityType)

  for each change in localChanges:
    try:
      server.apply(change)
      localDB.markSynced(change.id)
    catch ConflictError as e:
      resolveConflict(change, e.serverState)
```
