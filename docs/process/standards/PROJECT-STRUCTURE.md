---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "general"
module: "standards"
status: "approved"
version: "1.0.0"
last_updated: "2025-11-27"
author: "@Architect"

# Keywords for semantic search
keywords:
  - "project-structure"
  - "file-organization"
  - "folder-structure"
  - "naming-conventions"
  - "architecture"

# Related documentation
related_docs:
  database_schema: ""
  api_design: ""
  feature_design: ""
  ux_flow: ""

# Document-specific metadata
doc_metadata:
  audience: "developers"
  complexity: "low"
  estimated_read_time: "15 min"
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the PROJECT STRUCTURE. When creating new files:
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
      <h1 style="margin: 0; border-bottom: none;">Project Structure</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Organization and naming conventions for the payment system monorepo</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Approved-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-Developers-blue?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--22-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                    |
| :------------- | :----------------------------------------------------------------------------- |
| **Context**    | This document defines the file system layout and naming conventions.           |
| **Constraint** | Do NOT create files outside the specified folder structure.                    |
| **Pattern**    | Use `kebab-case` for files, `PascalCase` for classes, `camelCase` for methods. |
| **Related**    | `docs/process/standards/MONOREPO-GUIDE.md`                                     |

---

## 1. Executive Summary

This document outlines the directory structure, file naming conventions, and module organization for the Payment System monorepo. It serves as the definitive guide for where code should live and how it should be named to maintain consistency across the project.

## 2. Context & Motivation

A consistent project structure is vital for maintainability in a monorepo. By strictly defining where files belong and how they are named, we reduce cognitive load for developers and ensure that the codebase remains navigable as it scales.

## 3. Core Content

### 3.1. Monorepo Layout

```
/
├── package.json              # Root workspace configuration
├── turbo.json                # Turborepo pipeline
├── tsconfig.json             # Base TypeScript config
├── .eslintrc.json            # Shared ESLint rules
├── .prettierrc               # Code formatting config
├── commitlint.config.js      # Commit message linting rules
├── .lintstagedrc             # Pre-commit linting config
│
├── apps/
│   ├── backend/              # NestJS API
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/       # Configuration
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── payment.config.ts
│   │   │   │   └── app.config.ts
│   │   │   │
│   │   │   ├── common/       # Shared utilities
│   │   │   │   ├── decorators/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── pipes/
│   │   │   │   └── filters/
│   │   │   │
│   │   │   └── modules/
│   │   │       ├── auth/
│   │   │       ├── payments/
│   │   │       ├── business/
│   │   │       ├── inventory/
│   │   │       ├── sales/
│   │   │       ├── billing/
│   │   │       ├── notifications/
│   │   │       └── analytics/
│   │   │
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   │
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── .env.example
│   │
│   └── merchant-web/         # Angular 21+ merchant dashboard
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/     # Singleton services
│       │   │   ├── shared/   # Reusable components
│       │   │   ├── features/ # Feature modules
│       │   │   ├── layouts/
│       │   │   ├── app.config.ts
│       │   │   ├── app.routes.ts
│       │   │   └── app.component.ts
│       │   │
│       │   ├── assets/
│       │   ├── environments/
│       │   ├── index.html
│       │   └── main.ts
│       │
│       ├── angular.json
│       ├── package.json
│       └── tsconfig.json
│
├── libs/                     # Shared libraries
│   ├── assets/               # Static assets (logos, images)
│   ├── shared-types/         # Common TypeScript types
│   └── shared-utils/         # Common utilities
│
├── services/
│   └── mcp-server/           # Model Context Protocol server
│
├── docs/                     # Documentation
│   ├── business/
│   ├── process/
│   ├── technical/
│   └── templates/
│
├── docker/                   # Docker configurations
├── .github/                  # GitHub workflows and templates
│   └── workflows/            # CI/CD pipelines
├── .husky/                   # Git hooks
└── .vscode/                  # Editor settings
```

### 3.2. Naming Conventions

#### Backend (NestJS)

**Files:**

- Modules: `*.module.ts`
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Entities: `*.entity.ts`
- DTOs: `*.dto.ts` (e.g., `create-payment.dto.ts`)
- Interfaces: `*.interface.ts`
- Guards: `*.guard.ts`
- Interceptors: `*.interceptor.ts`
- Pipes: `*.pipe.ts`

**Classes:**

- PascalCase: `PaymentService`, `ConektaPaymentProvider`
- Interfaces: Prefix `I`: `IPaymentProvider`

**Methods:**

- camelCase: `createPaymentIntent()`, `handleWebhook()`
- Async methods always return `Promise<T>`

**Constants:**

- UPPER_SNAKE_CASE: `DEFAULT_CURRENCY`, `MAX_RETRY_ATTEMPTS`

#### Frontend (Angular)

**Files:**

- Components: `*.component.ts` + `.html` + `.scss`
- Services: `*.service.ts`
- Guards: `*.guard.ts`
- Pipes: `*.pipe.ts`
- Directives: `*.directive.ts`
- Stores: `*.store.ts`
- Routes: `*.routes.ts`

**Selectors:**

- Prefix `app-`: `<app-button>`, `<app-payment-form>`

**Classes:**

- PascalCase: `PaymentCreateComponent`, `AuthService`

**Signals/Observables:**

- Signals: No suffix: `const count = signal(0)`
- Observables: Suffix `$`: `payments$`, `loading$`

#### Database (Prisma)

**Tables:**

- PascalCase singular: `User`, `Transaction`, `Business`

**Fields:**

- camelCase: `createdAt`, `businessId`, `taxId`

**Relations:**

- Singular: `business`, `user`
- Plural: `transactions`, `branches`

### 3.3. Module Organization

#### Backend Module Structure

Each NestJS module follows this pattern:

```
payments/
├── payments.module.ts         # Module definition with providers
├── payments.controller.ts     # REST endpoints
├── payments.service.ts        # Business logic
├── dto/                       # Data Transfer Objects
│   ├── create-payment.dto.ts
│   ├── update-payment.dto.ts
│   └── payment-response.dto.ts
├── entities/                  # Prisma entities or TypeORM
│   └── payment.entity.ts
├── interfaces/                # TypeScript interfaces
│   └── payment-provider.interface.ts
├── factories/                 # Factory patterns
│   └── payment-provider.factory.ts
├── providers/                 # Adapter implementations
│   ├── mexico/
│   ├── colombia/
│   └── argentina/
└── tests/
    ├── payments.service.spec.ts
    └── payments.controller.spec.ts
```

#### Frontend Feature Structure

Each Angular feature follows this pattern:

```
payments/
├── payment-create/
│   ├── payment-create.component.ts
│   ├── payment-create.component.html
│   ├── payment-create.component.scss
│   ├── payment-create.component.spec.ts
│   └── payment-create.store.ts
├── payment-history/
│   └── ...
├── services/
│   ├── payments.service.ts
│   └── payments.service.spec.ts
├── models/
│   └── payment.model.ts
└── payments.routes.ts
```

### 3.4. Configuration Files

#### ESLint Configuration

Root `.eslintrc.json`:

```json
{
  "root": true,
  "extends": [
    "@nestjs",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

#### Prettier Configuration

Root `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

#### Commitlint Configuration

Root `commitlint.config.js`:

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "ci",
        "perf",
        "build",
        "revert",
      ],
    ],
    "scope-case": [2, "always", "kebab-case"],
  },
};
```

#### Husky Pre-commit Hook

`.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

Root `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### 3.5. Commit Conventions

Follow Conventional Commits specification:

```
feat: add QR payment endpoint (MX-123)
fix: correct RFC validation for Mexico
docs: update architecture diagram
refactor: extract webhook logic to factory
test: add tests for ConektaProvider
chore: update Prisma dependencies
```

**Format:** `<type>(<scope>): <subject> (<ticket>)`

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Scope (optional):**

- Module or feature: `payments`, `auth`, `billing`

## 4. References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Angular Documentation](https://angular.dev/)
