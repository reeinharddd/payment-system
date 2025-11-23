<!--
  ~ TYPESCRIPT STRICT MODE STANDARDS
  ~ ============================================================================
  ~
  ~ This document defines the TYPESCRIPT STRICT MODE STANDARDS.
  ~
  ~ ----------------------------------------------------------------------------
  ~
  ~ GUIDELINES:
  ~ - Preserve the Header Table and Metadata block.
  ~ - Fill in the "Agent Directives" to guide future AI interactions.
  ~ - Keep the structure strict for RAG (Retrieval Augmented Generation) efficiency.
  ~
  ~ ============================================================================
  -->

# TypeScript Strict Mode Guide

<div align="center">

![TypeScript Strict Mode Guide](https://img.shields.io/badge/TypeScript-Strict%20Mode%20Guide-blue?style=for-the-badge&logo=typescript)
![Status Active](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Last Updated](https://img.shields.io/badge/Last%20Updated-October%202025-lightgrey?style=for-the-badge)

</div>

Comprehensive guide for extreme type safety.

---

## 🤖 Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                      |
| :------------- | :------------------------------------------------------------------------------- |
| **Context**    | This project uses TypeScript 5.3+ with ALL strict flags enabled.                 |
| **Constraint** | NEVER use `any`. Use `unknown` if type is truly dynamic, then validate with Zod. |
| **Pattern**    | Use Branded Types for IDs (`UserId`, `BusinessId`) to prevent mixing them.       |
| **Related**    | `docs/technical/foundations/TECHNICAL-FOUNDATIONS.md`                            |

---

## 1. Overview

This project uses TypeScript 5.3+ with all strict mode flags enabled to catch errors at compile time and improve code quality.

---

## 2. TSConfig Strict Configuration

### 2.1. Backend (NestJS)

**apps/backend/tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    },

    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,

    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,

    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "removeComments": false,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

### 2.2. Frontend (Angular)

**apps/merchant-web/tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@env/*": ["src/environments/*"]
    },

    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,

    "experimentalDecorators": true,
    "useDefineForClassFields": false,

    "sourceMap": true,
    "declaration": false,
    "resolveJsonModule": true
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true,
    "strictAttributeTypes": true
  }
}
```

---

## 3. Runtime Validation with Zod

### 3.1. Schema Definition

```typescript
import { z } from "zod";

// Basic schemas
export const PaymentCurrencySchema = z.enum(["MXN", "COP", "ARS", "CLP"]);
export const PaymentStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "FAILED",
  "REFUNDED",
]);

// Complex object schema
export const CreatePaymentSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(1000000, "Amount exceeds maximum"),
  currency: PaymentCurrencySchema,
  customerId: z.string().uuid().optional(),
  description: z.string().min(1).max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Infer TypeScript types from schemas
export type PaymentCurrency = z.infer<typeof PaymentCurrencySchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
```

### 3.2. NestJS Integration

```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: error.errors
      });
    }
  }
}

// Usage in controller
@Post('create-intent')
async createIntent(
  @Body(new ZodValidationPipe(CreatePaymentSchema)) dto: CreatePaymentDto
): Promise<PaymentIntent> {
  return this.paymentsService.createIntent(dto);
}
```

### 3.3. Angular Form Validation

```typescript
import { FormControl, FormGroup } from "@angular/forms";
import { CreatePaymentSchema } from "@/shared/schemas";

export class PaymentFormComponent {
  form = new FormGroup({
    amount: new FormControl<number>(0),
    currency: new FormControl<PaymentCurrency>("MXN"),
    description: new FormControl<string>(""),
  });

  onSubmit() {
    const result = CreatePaymentSchema.safeParse(this.form.value);

    if (!result.success) {
      console.error("Validation errors:", result.error.errors);
      return;
    }

    // result.data is fully typed
    this.paymentService.create(result.data);
  }
}
```

---

## 4. Branded Types

Prevent mixing incompatible IDs:

```typescript
// Utility type for branding
type Brand<K, T> = K & { __brand: T };

// Branded ID types
export type UserId = Brand<string, "UserId">;
export type BusinessId = Brand<string, "BusinessId">;
export type TransactionId = Brand<string, "TransactionId">;

// Constructor functions
export function UserId(id: string): UserId {
  if (!isValidUUID(id)) throw new Error("Invalid UUID");
  return id as UserId;
}

export function BusinessId(id: string): BusinessId {
  if (!isValidUUID(id)) throw new Error("Invalid UUID");
  return id as BusinessId;
}

// Type-safe usage
function getUserTransactions(userId: UserId): Transaction[] {
  // businessId cannot be passed here
  return db.transactions.findMany({ where: { userId } });
}

const userId = UserId("uuid-1");
const businessId = BusinessId("uuid-2");

getUserTransactions(userId); // ✓ Works
getUserTransactions(businessId); // ✗ Type error
```

---

## 5. Discriminated Unions

Model state machines with types:

```typescript
// Payment state machine
type PaymentState =
  | { status: "pending"; intentId: string; expiresAt: Date }
  | { status: "processing"; intentId: string; startedAt: Date }
  | {
      status: "confirmed";
      transactionId: string;
      confirmedAt: Date;
      receipt: string;
    }
  | { status: "failed"; intentId: string; error: PaymentError; failedAt: Date }
  | {
      status: "refunded";
      transactionId: string;
      refundId: string;
      refundedAt: Date;
    };

// Type guards
function isPending(
  payment: PaymentState,
): payment is Extract<PaymentState, { status: "pending" }> {
  return payment.status === "pending";
}

// Exhaustive pattern matching
function handlePayment(payment: PaymentState): string {
  switch (payment.status) {
    case "pending":
      return `Waiting for payment: ${payment.intentId}`;
    case "processing":
      return `Processing payment: ${payment.intentId}`;
    case "confirmed":
      return `Payment confirmed: ${payment.transactionId}`;
    case "failed":
      return `Payment failed: ${payment.error.message}`;
    case "refunded":
      return `Payment refunded: ${payment.refundId}`;
    // TypeScript ensures all cases are handled
  }
}
```

---

## 6. Utility Types

### 6.1. Deep Readonly

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};

// Usage
const config: DeepReadonly<AppConfig> = {
  database: {
    host: "localhost",
    port: 5432,
  },
};

config.database.host = "other"; // ✗ Type error
```

### 6.2. Exact Type Matching

```typescript
type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

function createUser<T extends Exact<T, { name: string; email: string }>>(
  user: T,
) {
  return user;
}

createUser({ name: "John", email: "john@example.com" }); // ✓
createUser({ name: "John", email: "john@example.com", extra: "not allowed" }); // ✗
```

### 6.3. Require At Least One

```typescript
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

interface SearchFilters {
  name?: string;
  email?: string;
  phone?: string;
}

// Must provide at least one filter
function searchUsers(filters: RequireAtLeastOne<SearchFilters>): User[] {
  // Implementation
}

searchUsers({}); // ✗ Type error
searchUsers({ name: "John" }); // ✓
searchUsers({ name: "John", email: "john@example.com" }); // ✓
```

---

## 7. Nullable Handling

### 7.1. Strict Null Checks

```typescript
// Bad: Implicit any
function getUser(id) {
  return users.find((u) => u.id === id);
}

// Good: Explicit nullability
function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

// Usage with null coalescing
const user = getUser("123") ?? { name: "Guest", email: "guest@example.com" };

// Optional chaining
const userName = user?.profile?.displayName ?? "Anonymous";
```

### 7.2. Non-Null Assertion Alternative

```typescript
// Bad: Non-null assertion (dangerous)
const element = document.getElementById("my-id")!;

// Good: Type guard
const element = document.getElementById("my-id");
if (!element) {
  throw new Error("Element not found");
}
// element is non-null here
element.addEventListener("click", handler);
```

---

## 8. Async Type Safety

### 8.1. Typed Promises

```typescript
// Return type inferred correctly
async function fetchPayments(): Promise<Payment[]> {
  const response = await fetch("/api/payments");

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: unknown = await response.json();

  // Validate at runtime
  const PaymentsArraySchema = z.array(PaymentSchema);
  return PaymentsArraySchema.parse(data);
}
```

### 8.2. Error Handling

```typescript
class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

type Result<T, E extends Error = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function createPayment(
  dto: CreatePaymentDto,
): Promise<Result<Payment, PaymentError>> {
  try {
    const payment = await api.createPayment(dto);
    return { success: true, data: payment };
  } catch (error) {
    if (error instanceof PaymentError) {
      return { success: false, error };
    }
    return {
      success: false,
      error: new PaymentError("Unknown error", "UNKNOWN", error),
    };
  }
}

// Usage
const result = await createPayment(dto);

if (result.success) {
  console.log("Payment created:", result.data.id);
} else {
  console.error("Payment failed:", result.error.code);
}
```

---

## 9. ESLint Configuration

**.eslintrc.json:**

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { "allowExpressions": true, "allowTypedFunctionExpressions": true }
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "prefix": ["I"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      },
      {
        "selector": "enum",
        "format": ["PascalCase"]
      }
    ],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

---

## 10. Type Testing

Use `tsd` for type assertion testing:

**types.test-d.ts:**

```typescript
import { expectType, expectError, expectAssignable } from "tsd";
import { UserId, BusinessId, getUserTransactions } from "./types";

// Test branded types
const userId = UserId("uuid-1");
expectType<UserId>(userId);

const businessId = BusinessId("uuid-2");
expectType<BusinessId>(businessId);

// Should not be interchangeable
expectError(getUserTransactions(businessId));

// Test discriminated unions
type PaymentState =
  | { status: "pending"; intentId: string }
  | { status: "confirmed"; transactionId: string };

function handlePayment(payment: PaymentState): void {
  if (payment.status === "pending") {
    expectType<string>(payment.intentId);
    expectError(payment.transactionId);
  } else {
    expectType<string>(payment.transactionId);
    expectError(payment.intentId);
  }
}
```

---

## 11. Migration Checklist

- [ ] Enable all strict flags in tsconfig.json
- [ ] Add Zod for runtime validation
- [ ] Replace string IDs with branded types
- [ ] Use discriminated unions for state machines
- [ ] Add explicit return types to all functions
- [ ] Remove all `any` types
- [ ] Add null checks before accessing properties
- [ ] Use optional chaining (`?.`) and nullish coalescing (`??`)
- [ ] Configure ESLint with strict rules
- [ ] Add type tests with `tsd`
- [ ] Enable strict templates in Angular
- [ ] Review and fix all type errors

---

## 12. Common Patterns

### 12.1. API Response Typing

```typescript
interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
  links?: {
    next?: string;
    prev?: string;
  };
}

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: ApiResponse<T>["meta"] & {
    page: number;
    pageSize: number;
    total: number;
  };
}

// Usage
async function getPayments(
  page: number,
): Promise<PaginatedApiResponse<Payment>> {
  const response = await fetch(`/api/payments?page=${page}`);
  return response.json();
}
```

### 12.2. Builder Pattern

```typescript
class PaymentBuilder {
  private payment: Partial<Payment> = {};

  withAmount(amount: number): this {
    this.payment.amount = amount;
    return this;
  }

  withCurrency(currency: PaymentCurrency): this {
    this.payment.currency = currency;
    return this;
  }

  withCustomer(customerId: UserId): this {
    this.payment.customerId = customerId;
    return this;
  }

  build(): Payment {
    if (!this.payment.amount || !this.payment.currency) {
      throw new Error("Amount and currency are required");
    }

    return {
      id: TransactionId(generateUUID()),
      amount: this.payment.amount,
      currency: this.payment.currency,
      customerId: this.payment.customerId,
      createdAt: new Date(),
      status: "pending",
    };
  }
}

// Usage
const payment = new PaymentBuilder()
  .withAmount(500)
  .withCurrency("MXN")
  .withCustomer(UserId("uuid-1"))
  .build();
```
