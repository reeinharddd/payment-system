---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "general"
module: "onboarding"
status: "approved"
version: "1.0.0"
last_updated: "2025-11-27"
author: "@Architect"

# Keywords for semantic search
keywords:
  - "onboarding"
  - "getting-started"
  - "development"
  - "setup"
  - "prerequisites"
  - "installation"
  - "workflow"

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
  This document is the MANDATORY ENTRY POINT for all developers.
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
      <h1 style="margin: 0; border-bottom: none;">Getting Started with Development</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Mandatory reading before writing any code</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Mandatory-red?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-Developers-blue?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--01-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                                       |
| :------------- | :------------------------------------------------------------------------------------------------ |
| **Context**    | This is the primary onboarding guide for new developers.                                          |
| **Constraint** | All code changes must follow the "10-Step Development Cycle" defined here.                        |
| **Pattern**    | Use the provided templates for Services, Controllers, DTOs, and Components.                       |
| **Related**    | `docs/process/workflow/DEVELOPMENT-RULES.md`, `docs/technical/architecture/PRELIMINARY-DESIGN.md` |

---

## 1. Executive Summary

This guide links all construction rules, templates, and patterns. It is the single source of truth for the development workflow, environment setup, and coding standards. Failure to follow these guidelines will result in rejected Pull Requests.

## 2. Prerequisites

Before starting development, ensure you have:

- **Read and understood:**
  1. [Development Rules](../workflow/DEVELOPMENT-RULES.md) - Universal workflow for ALL changes
  2. [Preliminary Design](../../technical/architecture/PRELIMINARY-DESIGN.md) - Base architecture understanding
  3. [Design Patterns](../../technical/architecture/DESIGN-PATTERNS.md) - Patterns used in codebase
  4. [Standards](../standards/STANDARDS.md) - Documentation and code standards

- **Environment setup:**
  - Bun >= 1.0.0
  - Docker Desktop
  - PostgreSQL 16+ (or use Docker)
  - Redis 7+ (or use Docker)
  - VSCode with recommended extensions (auto-prompted when opening project)
  - Git hooks (Husky) installed automatically via `bun install`

## 3. The 10-Step Development Cycle

**EVERY feature, bug fix, or change follows this exact sequence from [Development Rules](../workflow/DEVELOPMENT-RULES.md):**

```
1. PLAN       > Define acceptance criteria
2. DESIGN     > Document interfaces and data model changes
3. BRANCH     > Create feature branch (never work on main)
4. IMPLEMENT  > Write failing test first, then implement
5. DOCUMENT   > Update README, JSDoc, architecture docs
6. TEST       > Unit, integration, E2E, manual testing
7. REVIEW     > Self-review, check no secrets, no console.logs
8. MERGE      > Get approval, resolve comments, merge
9. DEPLOY     > CI/CD passes, staging, then production
10. CLOSE     > Update ticket, document learnings, update changelog
```

**Time Allocation:** Planning 10% | Design 15% | Implementation 40% | Documentation 15% | Testing 20%

## 4. Module Structure Template

From [Preliminary Design](../../technical/architecture/PRELIMINARY-DESIGN.md):

```
modules/feature-name/
├── feature-name.module.ts        # Module definition
├── feature-name.controller.ts    # REST endpoints
├── feature-name.service.ts       # Business logic
├── feature-name.repository.ts    # Complex queries (optional)
├── dto/
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   └── feature-response.dto.ts
├── entities/
│   └── feature.entity.ts         # Prisma model
├── interfaces/
│   └── feature.interface.ts      # TypeScript interfaces
├── exceptions/
│   └── feature.exception.ts      # Custom exceptions
├── events/
│   ├── feature.events.ts         # Event definitions
│   └── feature.listener.ts       # Event handlers
└── tests/
    ├── feature.service.spec.ts
    ├── feature.controller.spec.ts
    └── feature.e2e-spec.ts
```

## 5. Backend Code Templates

### 5.1. Service Method Template

From [Development Rules](../workflow/DEVELOPMENT-RULES.md) - Rule 2:

````typescript
/**
 * Brief description of what the method does
 *
 * @param param1 - Description of param1
 * @param param2 - Description of param2
 * @returns Description of return value
 * @throws {NotFoundException} When resource not found
 * @throws {BadRequestException} When validation fails
 *
 * @example
 * ```typescript
 * const result = await service.methodName('value', 123);
 * console.log(result.id); // Output: generated-uuid
 * ```
 */
async methodName(
  param1: string,
  param2: number,
): Promise<ReturnType> {
  // 1. VALIDATE INPUT
  if (param2 < 0) {
    throw new BadRequestException('Param2 must be positive');
  }

  // 2. CHECK PERMISSIONS
  // await this.checkPermissions(userId, resource);

  // 3. BUSINESS LOGIC
  try {
    const result = await this.performOperation(param1, param2);

    // 4. SIDE EFFECTS
    // await this.notificationService.notify(...);

    return result;
  } catch (error) {
    // 5. ERROR HANDLING
    this.logger.error(`Error in methodName: ${error.message}`, error.stack);
    throw error;
  }
}
````

### 5.2. Controller Endpoint Template

From [Development Rules](../workflow/DEVELOPMENT-RULES.md) - Rule 3:

```typescript
/**
 * Brief description of endpoint purpose
 */
@Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Create new resource' })
@ApiResponse({ status: 201, description: 'Resource created', type: ResourceResponseDto })
@ApiResponse({ status: 400, description: 'Invalid input' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async create(
  @Body() dto: CreateResourceDto,
  @CurrentUser() user: User,
): Promise<ResourceResponseDto> {
  this.logger.log(`Creating resource for user ${user.id}`);

  const result = await this.service.create(dto, user.id);

  return new ResourceResponseDto(result);
}
```

### 5.3. DTO Template

From [Development Rules](../workflow/DEVELOPMENT-RULES.md) - Rule 4:

```typescript
import { IsString, IsNumber, Length, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data Transfer Object for creating a resource
 */
export class CreateResourceDto {
  @ApiProperty({
    description: "Resource name",
    example: "My Resource",
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiProperty({
    description: "Resource value",
    example: 42,
    minimum: 1,
    maximum: 1000000,
  })
  @IsNumber()
  @Min(1)
  @Max(1000000)
  value: number;
}
```

## 6. Frontend Code Templates

### 6.1. Component Template

From [Development Rules](../workflow/DEVELOPMENT-RULES.md) - Rule 5:

```typescript
import { Component, signal, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";

/**
 * Component description
 */
@Component({
  selector: "app-resource-create",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./resource-create.component.html",
  styleUrl: "./resource-create.component.scss",
})
export class ResourceCreateComponent {
  // SERVICES
  private resourceService = inject(ResourceService);
  private toastService = inject(ToastService);

  // SIGNALS
  loading = signal(false);
  error = signal<string | null>(null);

  // COMPUTED
  canSubmit = computed(() => !this.loading() && this.form.valid);

  // FORM
  form = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.minLength(3)]),
    value: new FormControl(0, [Validators.required, Validators.min(1)]),
  });

  // LIFECYCLE
  ngOnInit(): void {
    // Initialization
  }

  // PUBLIC METHODS
  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.resourceService.create(this.form.value);
      this.toastService.success("Resource created successfully");
      this.form.reset();
    } catch (err) {
      this.error.set(err.message);
      this.toastService.error("Failed to create resource");
    } finally {
      this.loading.set(false);
    }
  }
}
```

## 7. Design Patterns Quick Reference

From [Design Patterns](../../technical/architecture/DESIGN-PATTERNS.md):

### 7.1. When to Use What

| Pattern          | Use Case                                  | Example                                        |
| ---------------- | ----------------------------------------- | ---------------------------------------------- |
| **Factory**      | Create objects based on runtime condition | Payment provider selection by country          |
| **Repository**   | Complex database queries                  | Analytics queries with aggregations            |
| **Adapter**      | Wrap external API with our interface      | SMS provider (Twilio, SNS)                     |
| **Strategy**     | Interchangeable algorithms                | Payment methods (QR, Link, Transfer)           |
| **Observer**     | One-to-many notifications                 | Payment confirmed triggers notifications       |
| **CQRS**         | Separate read/write operations            | Transaction writes vs. reporting reads         |
| **Signal Store** | Component state management                | Payments list with filters and computed values |

### 7.2. Critical Pattern: Multi-Country Payment

From [Preliminary Design](../../technical/architecture/PRELIMINARY-DESIGN.md):

```typescript
// 1. Interface (contract)
interface IPaymentProvider {
  readonly country: string;
  readonly currency: string;
  createPaymentIntent(dto): Promise<PaymentIntent>;
  generateQRCode(id): Promise<QRCodeData>;
}

// 2. Adapters (one per country)
class ConektaPaymentProvider implements IPaymentProvider {
  readonly country = "MX";
  readonly currency = "MXN";
  // Implementation
}

// 3. Factory (selector)
class PaymentProviderFactory {
  getProvider(country: string): IPaymentProvider {
    return this.providers.get(country);
  }
}

// 4. Service (orchestration)
class PaymentsService {
  async createPayment(dto, userId) {
    const business = await this.getBusinessByUserId(userId);
    const provider = this.factory.getProvider(business.country);
    return await provider.createPaymentIntent(dto);
  }
}
```

**Rule:** NEVER call payment gateway directly. ALWAYS use factory.

## 8. Testing Requirements

From [Development Rules](../workflow/DEVELOPMENT-RULES.md):

### 8.1. Coverage Minimums

- **Unit tests:** 80% line coverage
- **Integration tests:** Critical paths only
- **E2E tests:** Happy path + 1 error case per feature

### 8.2. What MUST Be Tested

1. **Services:** All public methods, error handling, edge cases
2. **Controllers:** Authorization, DTO validation, response format
3. **Components:** User interactions, loading states, error states

### 8.3. Test Template

```typescript
describe("PaymentsService", () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: {
            transaction: { create: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get(PaymentsService);
    prisma = module.get(PrismaService);
  });

  it("should create payment successfully", async () => {
    // ARRANGE
    const dto = { amount: 100, currency: "MXN" };

    // ACT
    const result = await service.createPayment(dto, "user-123");

    // ASSERT
    expect(result).toBeDefined();
  });
});
```

## 9. Git Workflow

From [Development Rules](../workflow/DEVELOPMENT-RULES.md):

### 9.1. Branch Naming

```
<type>/<ticket-id>-<short-description>

Examples:
feat/PAY-123-add-qr-generation
fix/PAY-456-transaction-validation
refactor/PAY-789-extract-payment-adapter
```

### 9.2. Commit Messages

```
<type>(<scope>): <subject>

Examples:
feat(payments): add QR code generation
fix(auth): correct JWT expiration validation
docs(api): update payment endpoints documentation
```

### 9.3. Pull Request Checklist

Before requesting review:

- [ ] Run full test suite locally (`bun test`)
- [ ] Check code coverage (`bun run test:cov`)
- [ ] Run linter (`bun run lint`)
- [ ] Remove debug code (console.log, debugger)
- [ ] Update documentation
- [ ] Test manually in dev environment
- [ ] Check no secrets committed
- [ ] Verify no merge conflicts
- [ ] Read through entire diff

## 10. Code Review Checklist

From [Development Rules](../workflow/DEVELOPMENT-RULES.md):

### 10.1. For Reviewer

**Functionality:**

- [ ] Code does what PR says
- [ ] Edge cases handled
- [ ] Error handling present

**Design:**

- [ ] Follows established patterns
- [ ] No code duplication
- [ ] Single Responsibility Principle

**Testing:**

- [ ] Tests cover main functionality
- [ ] Tests cover error cases
- [ ] Coverage meets 80% minimum

**Security:**

- [ ] No secrets in code
- [ ] Input validation present
- [ ] Authorization checks present

**Performance:**

- [ ] No N+1 queries
- [ ] Large operations paginated

## 11. Common Anti-Patterns to Avoid

From [Design Patterns](../../technical/architecture/DESIGN-PATTERNS.md):

1. **God Objects** - Service doing everything > Split into focused services
2. **Hardcoded Values** - Magic numbers/URLs > Use config injection
3. **Callback Hell** - Nested callbacks > Use async/await
4. **No Interfaces** - Directly using concrete classes > Use abstractions
5. **Ignoring Errors** - Empty catch blocks > Log and rethrow appropriately

## 12. Documentation Templates

### 12.1. ADR (Architecture Decision Record)

From [Development Rules](../workflow/DEVELOPMENT-RULES.md):

```markdown
# ADR NNN: Title of Decision

**Status:** Proposed | Accepted | Deprecated

**Date:** YYYY-MM-DD

## Context

What is the issue we're seeing?

## Decision

What is the change we're proposing?

## Consequences

### Positive

- Benefit 1

### Negative

- Cost 1

## Alternatives Considered

Why alternatives were rejected.
```

### 12.2. API Endpoint Documentation

From [Development Rules](../workflow/DEVELOPMENT-RULES.md):

````markdown
# Endpoint Name

## Request

**Method:** POST
**URL:** `/api/v1/resource/{id}`
**Authentication:** Required

### Request Body

```json
{
  "name": "string",
  "value": 42
}
```
````

## Response

### Success (200 OK)

```json
{
  "id": "uuid",
  "name": "Resource Name"
}
```

### Error (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Validation failed"
}
```

```

## 13. Quick Start Checklist

Before writing your first line of code:

- [ ] Read [Development Rules](../workflow/DEVELOPMENT-RULES.md) completely
- [ ] Read [Preliminary Design](../../technical/architecture/PRELIMINARY-DESIGN.md) for architecture understanding
- [ ] Skim [Design Patterns](../../technical/architecture/DESIGN-PATTERNS.md) for pattern reference
- [ ] Review [Standards](../standards/STANDARDS.md) for documentation style
- [ ] Setup development environment (Bun, Docker, PostgreSQL, Redis)
- [ ] Clone repository and run `bun install` (installs dependencies and git hooks)
- [ ] Copy `.env.example` to `.env` and configure
- [ ] Run `docker-compose -f docker-compose.dev.yml up -d` for services
- [ ] Run `bun run docker:dev` to start development servers (Hot Reload enabled)
- [ ] **NEVER** start servers independently (e.g., `ng serve` or `nest start`)
- [ ] Verify tests pass: `bun test`
- [ ] Create feature branch following naming convention
- [ ] Code following templates and patterns
- [ ] Test thoroughly (unit, integration, manual)
- [ ] Document changes
- [ ] Self-review using checklist
- [ ] Create Pull Request

## 14. Need Help?

**Documentation Index:**

1. **Process:** [Development Rules](../workflow/DEVELOPMENT-RULES.md) - How to develop
2. **Architecture:** [Preliminary Design](../../technical/architecture/PRELIMINARY-DESIGN.md) - What to build
3. **Patterns:** [Design Patterns](../../technical/architecture/DESIGN-PATTERNS.md) - How to structure code
4. **Standards:** [Standards](../standards/STANDARDS.md) - How to document
5. **Setup:** [Monorepo Guide](../standards/MONOREPO-GUIDE.md) - How to work with monorepo
6. **Deploy:** [Docker Guide](../../technical/infrastructure/DOCKER-GUIDE.md) - How to deploy

**Questions?**
- Check existing ADRs in `docs/adr/`
- Review similar code in codebase
- Ask in team chat
- Create GitHub issue for clarification

---

**Version:** 1.0.0
**Last Updated:** 2025-11-01
**Status:** Mandatory Reading - Start Here
```
