<!-- AI-INSTRUCTION: START -->
<!--
  This document is a TEMPLATE for Feature Designs.
  1. Preserve the Header Table and Metadata block.
  2. Fill in the "Agent Directives" to guide future AI interactions.
  3. Keep the structure strict for RAG (Retrieval Augmented Generation) efficiency.
-->
<!-- AI-INSTRUCTION: END -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="120" align="center" valign="middle">
      <img src="../../libs/assets/src/images/logo.png" width="80" alt="Project Logo" />
    </td>
    <td align="left" valign="middle">
      <h1 style="margin: 0; border-bottom: none;">FEAT-XXX: [Feature Name]</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Feature Design Document</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Draft-yellow?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Priority-Medium-blue?style=flat-square" alt="Priority" />
  <img src="https://img.shields.io/badge/Owner-@Team-lightgrey?style=flat-square" alt="Owner" />

</div>

---

## 🤖 Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                           |
| :------------- | :-------------------------------------------------------------------- |
| **Context**    | This document defines the technical specification for [Feature Name]. |
| **Constraint** | [e.g. Must use Signals for state management]                          |
| **Pattern**    | [e.g. Follow the 'Repository Pattern' for data access]                |
| **Related**    | [Related Files or Docs]                                               |

---

## 1. Overview

_What is this feature? What value does it provide to the user?_

## 2. User Stories / Requirements

- **US-01:** As a [role], I want to [action], so that [benefit].
- **US-02:** ...

## 3. Technical Architecture

### 3.1. Database Changes (Prisma)

```prisma
// Copy relevant schema changes here
model Example {
  id String @id @default(uuid())
}
```

```

### 3.2. API Endpoints (Backend)

| Method | Endpoint           | Description            |
| :----- | :----------------- | :--------------------- |
| POST   | `/api/v1/resource` | Creates a new resource |

### 3.3. UI Components (Frontend)

- `FeatureContainerComponent` (Standalone)
- `FeatureStore` (SignalStore)

## 4. Implementation Plan

1. [ ] Database Migration
2. [ ] Backend Service & Controller
3. [ ] Frontend Store & UI
4. [ ] E2E Tests

## 5. Open Questions / Risks

- *Are there any performance concerns?*
- *Dependencies on other teams?*

```
