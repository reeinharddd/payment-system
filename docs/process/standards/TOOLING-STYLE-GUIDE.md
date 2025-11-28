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
  - "tooling"
  - "style-guide"
  - "bun"
  - "typescript"
  - "eslint"
  - "prettier"
  - "coding-standards"

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
  estimated_read_time: "20 min"
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document defines TOOLING STANDARDS and STYLE GUIDE.

  PURPOSE: Ensure consistency across all code, documentation, and development workflows.

  CRITICAL RULES FOR AI AGENTS:
  1. ALWAYS use the tools specified in this document
  2. NEVER introduce new tools without updating this document first
  3. ALWAYS follow the coding style guide
  4. ALWAYS validate output with linters before committing
-->
<!-- AI-INSTRUCTION: END -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="120" align="center" valign="middle">
      <img src="../../../libs/assets/src/images/logo.png" width="80" alt="Project Logo" />
    </td>
    <td align="left" valign="middle">
      <h1 style="margin: 0; border-bottom: none;">Tooling & Style Guide</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Mandatory tools, libraries, and coding standards</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Approved-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Mandatory-Yes-red?style=flat-square" alt="Mandatory" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--27-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.)._

| Directive      | Instruction                                                                                      |
| :------------- | :----------------------------------------------------------------------------------------------- |
| **Context**    | This document is the Single Source of Truth for ALL tooling and style decisions.                 |
| **Constraint** | MUST use specified tools. MUST NOT introduce new tools without explicit approval and doc update. |
| **Pattern**    | Before writing code: 1) Check this doc, 2) Use specified tools, 3) Validate with linters.        |
| **Related**    | `STANDARDS.md`, `DOCUMENTATION-WORKFLOW.md`, `AI-DEVELOPMENT-STANDARD.md`                        |

---

## 1. Executive Summary

This document establishes **mandatory tooling standards** for the payment system project to ensure:

- **Consistency:** All developers use the same tools and follow the same patterns
- **Quality:** Automated validation catches errors before code review
- **Efficiency:** Pre-configured tools reduce setup time
- **Maintainability:** Standardized code is easier to read and modify

**Key Principle:** Choose boring, stable, widely-adopted tools. Avoid bleeding-edge unless there's compelling justification (documented in ADR).

---

## 2. Core Technology Stack

### 2.1. Runtime & Package Manager

| Component          | Tool    | Version | Rationale                                    |
| :----------------- | :------ | :------ | :------------------------------------------- |
| JavaScript Runtime | **Bun** | 1.0+    | Fast, TypeScript-native, all-in-one tool     |
| Package Manager    | **Bun** | 1.0+    | 10-100x faster than npm, compatible lockfile |
| Node.js (Fallback) | Node.js | 20 LTS  | For tools not yet Bun-compatible             |

**Installation:**

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Verify
bun --version
```

**Commands:**

```bash
# Install dependencies
bun install

# Run script
bun run dev

# Add package
bun add <package>
bun add -D <package>  # Dev dependency

# Remove package
bun remove <package>
```

### 2.2. Monorepo Management

| Component         | Tool               | Version | Rationale                                 |
| :---------------- | :----------------- | :------ | :---------------------------------------- |
| Monorepo Tool     | **Turborepo**      | 1.10+   | Fast, caching, optimal task orchestration |
| Workspace Manager | **Bun Workspaces** | -       | Native to Bun, zero config                |

**Configuration:** `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "outputs": ["coverage/**"],
      "cache": false
    }
  }
}
```

**Commands:**

```bash
# Build all packages
bun run build

# Build specific package
bun run --filter backend build

# Run dev for all
bun run dev

# Run tests
bun run test
```

---

## 3. Backend Stack (NestJS)

### 3.1. Framework & Core Libraries

| Category          | Package                    | Version | Purpose                 |
| :---------------- | :------------------------- | :------ | :---------------------- |
| **Framework**     | `@nestjs/core`             | 10+     | Core framework          |
| **Platform**      | `@nestjs/platform-express` | 10+     | HTTP server (Express)   |
| **Validation**    | `class-validator`          | 0.14+   | DTO validation          |
|                   | `class-transformer`        | 0.5+    | DTO transformation      |
| **ORM**           | `prisma`                   | 5+      | Database ORM            |
|                   | `@prisma/client`           | 5+      | Generated Prisma client |
| **Configuration** | `@nestjs/config`           | 3+      | Environment config      |
| **Documentation** | `@nestjs/swagger`          | 7+      | OpenAPI spec generation |

### 3.2. Mandatory NestJS Patterns

**Module Structure:**

```typescript
// src/modules/[module-name]/[module-name].module.ts
import { Module } from '@nestjs/common';
import { [ModuleName]Controller } from './[module-name].controller';
import { [ModuleName]Service } from './[module-name].service';

@Module({
  controllers: [[ModuleName]Controller],
  providers: [[ModuleName]Service],
  exports: [[ModuleName]Service],  // If used by other modules
})
export class [ModuleName]Module {}
```

**Controller Pattern:**

```typescript
// MUST: Thin controllers, no business logic
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';

@ApiTags('[resource]')
@Controller('[resource]')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class [ModuleName]Controller {
  constructor(private readonly service: [ModuleName]Service) {}

  @Get()
  @ApiOperation({ summary: 'List all resources' })
  async findAll(): Promise<[Resource][]> {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create resource' })
  async create(@Body() dto: Create[Resource]Dto): Promise<[Resource]> {
    return this.service.create(dto);
  }
}
```

**Service Pattern:**

```typescript
// Business logic lives here
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class [ModuleName]Service {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<[Resource][]> {
    return this.prisma.[resource].findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<[Resource]> {
    const resource = await this.prisma.[resource].findUnique({ where: { id } });

    if (!resource || resource.deletedAt) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return resource;
  }
}
```

**DTO Pattern:**

```typescript
// ALL inputs MUST be validated with class-validator
import { IsString, IsNumber, IsOptional, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create[Resource]Dto {
  @ApiProperty({ example: 'Resource Name' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 10.99, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
```

### 3.3. Database (Prisma)

**Prisma Commands:**

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration_name>

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (DB GUI)
npx prisma studio

# Check migration status
npx prisma migrate status

# Format schema
npx prisma format
```

**Prisma Schema Patterns:**

```prisma
// schema.prisma - MUST follow these patterns

model Product {
  // Primary Key: UUID
  id        String   @id @default(uuid())

  // Multi-tenant: businessId on ALL models
  businessId String
  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)

  // Standard fields
  name       String   @db.VarChar(255)
  status     ProductStatus @default(ACTIVE)

  // Soft Delete: deletedAt nullable
  deletedAt  DateTime?

  // Optimistic Locking: version counter
  version    Int      @default(1)

  // Audit: createdAt, updatedAt
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Indexes
  @@index([businessId, status])
  @@unique([businessId, sku], name: "unique_sku_per_business")
  @@map("products")  // Table name in snake_case
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

---

## 4. Frontend Stack (Angular)

### 4.1. Framework & Core Libraries

| Category             | Package                   | Version | Purpose                        |
| :------------------- | :------------------------ | :------ | :----------------------------- |
| **Framework**        | `@angular/core`           | 21+     | Core framework (bleeding edge) |
| **State Management** | `@ngrx/signals`           | 18+     | Signal-based state             |
| **Routing**          | `@angular/router`         | 21+     | SPA routing                    |
| **HTTP**             | `@angular/common/http`    | 21+     | HTTP client                    |
| **Forms**            | `@angular/forms`          | 21+     | Reactive forms                 |
| **Styling**          | `tailwindcss`             | 4.0+    | Utility-first CSS              |
| **Icons**            | `lucide-angular`          | Latest  | Consistent icon library        |
| **Offline**          | `@angular/service-worker` | 21+     | PWA support                    |
| **Storage**          | `dexie`                   | 4+      | IndexedDB wrapper              |

### 4.2. Mandatory Angular Patterns

**Component Pattern (Standalone):**

```typescript
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-[component-name]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './[component-name].component.html',
  styleUrls: ['./[component-name].component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,  // ALWAYS OnPush
})
export class [ComponentName]Component {
  // MUST: Use signals for inputs (Angular 17+)
  name = input<string>('');
  count = input.required<number>();

  // MUST: Use signals for outputs
  valueChange = output<number>();

  // MUST: Use signals for internal state
  private internalState = signal<State>({ ... });

  // Computed values (derived state)
  displayValue = computed(() => {
    return this.name() + ': ' + this.count();
  });

  onButtonClick(): void {
    const newValue = this.count() + 1;
    this.valueChange.emit(newValue);
  }
}
```

**Store Pattern (NgRx Signal Store):**

```typescript
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { inject } from "@angular/core";

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
};

export const ProductsStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store, productsService = inject(ProductsService)) => ({
    async loadProducts(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        const products = await productsService.getAll();
        patchState(store, { products, loading: false });
      } catch (error) {
        patchState(store, { error: error.message, loading: false });
      }
    },

    addProduct(product: Product): void {
      patchState(store, (state) => ({
        products: [...state.products, product],
      }));
    },
  })),
);
```

**Service Pattern:**

```typescript
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

@Injectable({ providedIn: "root" })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = "/api/v1/products";

  async getAll(): Promise<Product[]> {
    return firstValueFrom(this.http.get<Product[]>(this.baseUrl));
  }

  async getById(id: string): Promise<Product> {
    return firstValueFrom(this.http.get<Product>(`${this.baseUrl}/${id}`));
  }

  async create(dto: CreateProductDto): Promise<Product> {
    return firstValueFrom(this.http.post<Product>(this.baseUrl, dto));
  }
}
```

### 4.3. Tailwind CSS Configuration

**tailwind.config.js:**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          // ... full palette
          950: "#082f49",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
```

**Usage in Templates:**

```html
<!-- MUST: Use utility classes, NO custom CSS unless necessary -->
<div
  class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"
>
  <h2 class="text-xl font-semibold text-gray-900">{{ title() }}</h2>
  <button
    class="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
    (click)="onAction()"
  >
    Action
  </button>
</div>
```

---

## 5. Code Quality & Linting

### 5.1. TypeScript Configuration

**tsconfig.json (strict mode ALWAYS):**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "DOM"],

    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 5.2. ESLint Configuration

**eslint.config.mjs:**

```javascript
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // TypeScript-specific
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
```

**Commands:**

```bash
# Lint all files
bun run lint

# Lint specific package
bun run --filter backend lint

# Auto-fix issues
bun run lint --fix
```

### 5.3. Prettier Configuration

**. prettierrc:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Commands:**

```bash
# Format all files
bunx prettier --write .

# Check formatting
bunx prettier --check .
```

### 5.4. Markdownlint Configuration

**.markdownlint.json:**

```json
{
  "default": true,
  "MD001": true,
  "MD003": { "style": "atx" },
  "MD007": { "indent": 2 },
  "MD013": false,
  "MD033": false,
  "MD036": true,
  "MD040": true,
  "MD041": false
}
```

**Commands:**

```bash
# Lint markdown files
bunx markdownlint docs/**/*.md

# Auto-fix
bunx markdownlint --fix docs/**/*.md
```

---

## 6. Git Workflow & Commit Standards

### 6.1. Conventional Commits

**Format:**

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**

| Type       | Description                                        |
| :--------- | :------------------------------------------------- |
| `feat`     | New feature                                        |
| `fix`      | Bug fix                                            |
| `docs`     | Documentation only changes                         |
| `style`    | Code style changes (formatting, no logic change)   |
| `refactor` | Code refactor (neither fixes bug nor adds feature) |
| `perf`     | Performance improvement                            |
| `test`     | Adding or updating tests                           |
| `chore`    | Maintenance tasks (deps update, build config)      |
| `ci`       | CI/CD changes                                      |
| `revert`   | Revert previous commit                             |

**Scopes:**

- `backend` - Backend changes
- `frontend` - Frontend changes
- `docs` - Documentation changes
- `database` - Database schema changes
- `inventory`, `sales`, `payments`, etc. - Module-specific

**Examples:**

```bash
# Feature
git commit -m "feat(inventory): add barcode scanning support"

# Bug fix
git commit -m "fix(sales): correct tax calculation for multiple items"

# Breaking change
git commit -m "feat(database)!: rename costPrice to averageCostPrice

BREAKING CHANGE: Column renamed, requires migration"

# Documentation
git commit -m "docs(api): update inventory API with new endpoints"
```

### 6.2. Branch Naming

**Pattern:** `<type>/<short-description>`

**Examples:**

```
feat/inventory-barcode-scanning
fix/sales-tax-calculation
docs/api-inventory-update
refactor/product-service-cleanup
```

### 6.3. Pre-Commit Hooks (Husky)

**Installation:**

```bash
bun add -D husky lint-staged

# Initialize
bunx husky init
```

**.husky/pre-commit:**

```bash
#!/bin/sh
bun run lint-staged
```

**package.json:**

```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.md": ["markdownlint --fix"]
  }
}
```

---

## 7. Testing Standards

### 7.1. Backend Testing (Jest)

**Configuration:** `jest.config.js`

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.spec.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.module.ts", "!src/main.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

**Test Pattern:**

```typescript
describe('[ModuleName]Service', () => {
  let service: [ModuleName]Service;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [[ModuleName]Service, PrismaService],
    }).compile();

    service = module.get<[ModuleName]Service>([ModuleName]Service);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return all resources', async () => {
      const mockResources = [{ id: '1', name: 'Resource 1' }];
      jest.spyOn(prisma.[resource], 'findMany').mockResolvedValue(mockResources);

      const result = await service.findAll();

      expect(result).toEqual(mockResources);
      expect(prisma.[resource].findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
```

**Commands:**

```bash
# Run all tests
bun run test

# Run with coverage
bun run test:cov

# Watch mode
bun run test:watch

# E2E tests
bun run test:e2e
```

### 7.2. Frontend Testing (Jasmine/Karma)

**Test Pattern:**

```typescript
describe('[ComponentName]Component', () => {
  let component: [ComponentName]Component;
  let fixture: ComponentFixture<[ComponentName]Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [[ComponentName]Component],
    }).compileComponents();

    fixture = TestBed.createComponent([ComponentName]Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit value on button click', () => {
    jest.spyOn(component.valueChange, 'emit');

    component.onButtonClick();

    expect(component.valueChange.emit).toHaveBeenCalledWith(expect.any(Number));
  });
});
```

---

## 8. Documentation Standards

### 8.1. Code Comments

**TypeScript/JavaScript:**

```typescript
/**
 * Calculates the weighted average cost of a product.
 *
 * @param currentStock - Current quantity in stock
 * @param currentCost - Current average cost per unit
 * @param newQuantity - Quantity being added
 * @param newCost - Cost per unit of new stock
 * @returns The new weighted average cost
 *
 * @example
 * calculateWeightedAverage(100, 10.00, 50, 12.00)
 * // Returns: 10.67
 */
function calculateWeightedAverage(
  currentStock: number,
  currentCost: number,
  newQuantity: number,
  newCost: number,
): number {
  const totalValue = currentStock * currentCost + newQuantity * newCost;
  const totalQuantity = currentStock + newQuantity;
  return totalValue / totalQuantity;
}
```

**What to Comment:**

- YES - Why the code exists (rationale, business rules)
- YES - Complex algorithms or non-obvious logic
- YES - Public APIs and interfaces
- YES - Workarounds or hacks (with ticket reference)

**What NOT to Comment:**

- NO - What the code does (code should be self-documenting)
- NO - Obvious statements (`// Increment counter`)
- NO - Commented-out code (use git history)

### 8.2. Markdown Documentation

**Structure:**

````markdown
# Title (H1 - Only one per document)

## Section (H2)

### Subsection (H3)

#### Detail (H4 - Use sparingly)

**Key Points:**

- Use **bold** for emphasis
- Use `code` for technical terms
- Use [links](#) for cross-references

```code
Code blocks MUST have language tags
```
````

> Important notes in blockquotes

````

**Language Tags for Code Blocks:**

- `typescript` - TypeScript code
- `javascript` - JavaScript code
- `bash` - Shell commands
- `sql` - SQL queries
- `json` - JSON data
- `yaml` - YAML config
- `html` - HTML markup
- `css` - CSS styles
- `prisma` - Prisma schema
- `text` - Plain text / pseudocode

---

## 9. Environment & Secrets Management

### 9.1. Environment Variables

**.env.example:**

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/payment_system"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION="7d"

# API
API_PORT=3000
API_PREFIX="/api/v1"

# Frontend
VITE_API_URL="http://localhost:3000"
````

**NEVER commit `.env` files. Always use `.env.example` as template.**

### 9.2. Secrets in Production

**Use environment-specific secrets:**

- Development: `.env.development`
- Staging: `.env.staging`
- Production: Managed by deployment platform (Vercel, Railway, etc.)

---

## 10. Continuous Integration

### 10.1. GitHub Actions Workflow

**.github/workflows/ci.yml:**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:cov
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
```

---

## 11. Quick Reference: Common Commands

```bash
# Development
bun run dev                 # Start all dev servers
bun run --filter backend dev  # Start backend only
bun run --filter merchant-web dev  # Start frontend only

# Build
bun run build               # Build all packages
bun run --filter backend build

# Test
bun run test                # Run all tests
bun run test:cov            # With coverage
bun run test:e2e            # E2E tests

# Lint & Format
bun run lint                # Lint all
bun run lint --fix          # Auto-fix
bunx prettier --write .     # Format all

# Database
npx prisma generate         # Generate Prisma Client
npx prisma migrate dev      # Create & apply migration
npx prisma studio           # Open DB GUI

# Git
git commit -m "feat(scope): message"  # Conventional commit
git push                    # Pre-commit hooks run automatically
```

---

## Appendix A: Change Log

| Date       | Version | Author  | Changes                         |
| :--------- | :------ | :------ | :------------------------------ |
| 2025-11-27 | 1.0.0   | @Scribe | Initial tooling and style guide |

---

## Appendix B: Tool Decision Rationale

| Tool         | Why Chosen                                                           | Alternatives Considered |
| :----------- | :------------------------------------------------------------------- | :---------------------- |
| Bun          | 10-100x faster than npm, TypeScript-native, all-in-one               | npm, pnpm, yarn         |
| Turborepo    | Best-in-class monorepo caching and task orchestration                | Nx, Lerna               |
| Prisma       | Type-safe ORM, excellent DX, migration management                    | TypeORM, Drizzle        |
| Tailwind     | Utility-first, fast prototyping, consistent design                   | Bootstrap, Material UI  |
| NgRx Signals | Modern, Signal-based state (Angular 17+), less boilerplate than RxJS | RxJS BehaviorSubject    |
| Jest         | Industry standard, great DX, extensive ecosystem                     | Vitest, Mocha           |
