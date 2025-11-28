---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "adr"
module: "architecture"
status: "accepted"
version: "1.0.0"
last_updated: "2025-11-27"
author: "@Architect"

# Keywords for semantic search
keywords:
  - "adr"
  - "offline-first"
  - "pwa"
  - "indexeddb"
  - "sync-queue"
  - "eventual-consistency"
  - "service-worker"
  - "dexie"

# Related documentation
related_docs:
  database_schema: ""
  api_design: ""
  feature_design: ""
  sync_strategy: "docs/technical/frontend/OFFLINE-SYNC.md"
  superseded_by: ""

# ADR-specific metadata
adr_metadata:
  adr_number: 2
  decision_date: "2025-11-25"
  review_date: "2026-11-25"
  stakeholders: ["@Architect", "@Frontend"]
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document is a TEMPLATE for Architecture Decision Records (ADR).
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
      <h1 style="margin: 0; border-bottom: none;">ADR-002: Offline-First Strategy</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Architecture Decision Record</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Accepted-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Impact-High-red?style=flat-square" alt="Impact" />
  <img src="https://img.shields.io/badge/Date-2025--11--25-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                         |
| :------------- | :---------------------------------------------------------------------------------- |
| **Context**    | This document records the decision to use PWA + IndexedDB for offline capabilities. |
| **Constraint** | All critical merchant features (POS, Inventory) MUST work offline.                  |
| **Pattern**    | Use 'Sync Queue' pattern for data synchronization.                                  |
| **Related**    | `docs/technical/frontend/OFFLINE-SYNC.md`                                           |

---

## 1. Context & Problem Statement

Merchants in LATAM often face unstable internet connections or power outages. However, their business (cash sales, inventory management) cannot stop. They need a system that allows them to continue operating seamlessly without an active internet connection and synchronizes data automatically when connectivity is restored.

## 2. Decision Drivers

- **Business Continuity:** Merchants must be able to sell (cash) even if the internet is down.
- **User Experience:** The app should feel instant and reliable, regardless of network latency.
- **Cost:** Developing separate native desktop apps (Electron) adds significant maintenance overhead compared to a single web codebase.
- **Data Integrity:** We need a robust way to handle data created offline.

## 3. Considered Options

- **Option 1: Electron App (Desktop)**
  - _Description:_ Build a wrapped desktop application using Electron.
  - _Pros:_ Full access to file system, native feel, easy SQLite integration.
  - _Cons:_ Requires users to download/install updates, separate build pipeline, larger file size, harder to distribute.
- **Option 2: Progressive Web App (PWA) + IndexedDB**
  - _Description:_ Enhance the Angular web app with Service Workers for caching and IndexedDB for local data storage.
  - _Pros:_ Single codebase, instant updates (web), works on any device (tablet/desktop/mobile), zero install friction.
  - _Cons:_ Browser storage limits (though high enough for text data), slightly more complex sync logic in JS.
- **Option 3: Native Mobile Apps (Flutter/React Native)**
  - _Description:_ Build separate mobile apps.
  - _Pros:_ Best performance on mobile.
  - _Cons:_ Doesn't solve the Desktop/Laptop use case well, triples the codebase (Web + iOS + Android).

## 4. Decision Outcome

Chosen option: **Option 2: Progressive Web App (PWA) + IndexedDB**.

**Justification:**
The PWA approach aligns perfectly with our "Low Cost / High Reach" philosophy. It allows a merchant to use any existing laptop or tablet without installing heavy software. Angular's ecosystem (`@angular/pwa`, `RxDB` or `Dexie.js`) provides robust tools for this.

### 4.1. Positive Consequences

- **Universal Access:** Works on ChromeOS, Windows, macOS, Android, and iOS.
- **Zero Install:** Users just visit the URL and click "Install".
- **Unified Logic:** We write the business logic once in TypeScript/Angular.

### 4.2. Negative Consequences

- **Sync Complexity:** We must implement a robust "Sync Queue" to handle conflicts and retries.
- **Storage Management:** We need to manage quota and eviction policies (though `navigator.storage.persist()` helps).

## 5. Implementation Strategy

1.  **Local Database:** Use **Dexie.js** (wrapper for IndexedDB) to mirror critical tables (`Products`, `Sales`, `Settings`).
2.  **Sync Queue:** Actions performed offline are stored in a `MutationQueue` table.
3.  **Service Worker:** Cache static assets (HTML, CSS, JS) and fonts for offline load.
4.  **Conflict Resolution:** "Server Wins" for configuration/inventory updates, "Append" for new sales.

## 6. Links

- [Angular PWA Documentation](https://angular.io/guide/service-worker-intro)
- [Dexie.js Documentation](https://dexie.org/)
