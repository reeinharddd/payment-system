# Feature Design: [Feature Name]

> **Feature ID:** [FEAT-XXX]
> **Status:** [Draft | Approved | In Progress | Completed]
> **Owner:** @[User]

## 1. Overview

*What is this feature? What value does it provide to the user?*

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

### 3.2. API Endpoints (Backend)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/v1/resource` | Creates a new resource |

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
