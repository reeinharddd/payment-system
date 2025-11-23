<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the STRICT DEVELOPMENT RULES.
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
      <h1 style="margin: 0; border-bottom: none;">Development Rules and Standards</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Strict construction rules, workflows, templates, and patterns</p>
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

## 🤖 Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                           |
| :------------- | :-------------------------------------------------------------------- |
| **Context**    | This document defines the non-negotiable rules for code construction. |
| **Constraint** | All generated code MUST follow the templates in Section 2.            |
| **Pattern**    | Use the "Universal Development Cycle" (Section 1) for all tasks.      |
| **Related**    | `docs/process/onboarding/GETTING-STARTED-DEVELOPMENT.md`              |

---

## 1. Development Workflow

### 1.1. Universal Development Cycle

**EVERY feature, bug fix, or change follows this exact sequence:**

```
1. PLAN
   ├── Create/update ticket (GitHub Issue or similar)
   ├── Define acceptance criteria
   ├── Identify affected modules
   └── Estimate complexity (S/M/L/XL)

2. DESIGN
   ├── Document interface/API changes
   ├── Update architecture diagrams if needed
   ├── Define data model changes (Prisma schema)
   └── Review design with team

3. BRANCH
   ├── Pull latest main
   ├── Create feature branch: feat/TICKET-ID-short-description
   └── Never work directly on main

4. IMPLEMENT
   ├── Write failing test first (TDD when possible)
   ├── Implement minimum code to pass test
   ├── Add JSDoc comments
   ├── Run linter and fix issues
   └── Commit with conventional commit message

5. DOCUMENT
   ├── Update README if public API changed
   ├── Update inline code comments
   ├── Add/update JSDoc for public methods
   ├── Update architecture docs if patterns changed
   └── Add examples if new feature

6. TEST
   ├── Unit tests pass (bun test)
   ├── Integration tests pass (bun run test:e2e)
   ├── Manual testing in dev environment
   ├── Check coverage (minimum 80%)
   └── Test edge cases and error scenarios

7. REVIEW
   ├── Self-review code changes
   ├── Run full test suite
   ├── Check no console.logs or debugger statements
   ├── Verify no secrets in code
   └── Create Pull Request

8. MERGE
   ├── Get approval from at least 1 reviewer
   ├── Resolve all comments
   ├── Squash commits if needed
   ├── Merge to main
   └── Delete feature branch

9. DEPLOY
   ├── Verify CI/CD passes
   ├── Deploy to staging
   ├── Run smoke tests
   ├── Deploy to production (if approved)
   └── Monitor for errors

10. CLOSE
    ├── Update ticket status
    ├── Document any learnings
    └── Update changelog
```

**Estimated Time Allocation:**

- Planning: 10%
- Design: 15%
- Implementation: 40%
- Documentation: 15%
- Testing: 20%

**Rule:** If you skip a step, you MUST document why in the PR description.

## 2. Code Construction Rules

### 2.1. Backend (NestJS)

#### Rule 1: Feature Module Structure

**ALWAYS follow this exact structure for new features:**

```
modules/
└── feature-name/
    ├── feature-name.module.ts        # Module definition
    ├── feature-name.controller.ts    # REST endpoints
    ├── feature-name.service.ts       # Business logic
    ├── feature-name.repository.ts    # Database access (if complex queries)
    ├── dto/
    │   ├── create-feature.dto.ts
    │   ├── update-feature.dto.ts
    │   └── feature-response.dto.ts
    ├── entities/
    │   └── feature.entity.ts         # Prisma model representation
    ├── interfaces/
    │   └── feature.interface.ts      # TypeScript interfaces
    ├── exceptions/
    │   └── feature.exception.ts      # Custom exceptions
    └── tests/
        ├── feature-name.service.spec.ts
        ├── feature-name.controller.spec.ts
        └── feature-name.e2e-spec.ts
```

#### Rule 2: Service Method Template

**Every service method MUST follow this structure:**

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
  // 1. VALIDATE INPUT (beyond DTO validation if needed)
  if (param2 < 0) {
    throw new BadRequestException('Param2 must be positive');
  }

  // 2. CHECK PERMISSIONS (if applicable)
  // await this.checkPermissions(userId, resource);

  // 3. BUSINESS LOGIC
  try {
    // Main implementation
    const result = await this.performOperation(param1, param2);

    // 4. SIDE EFFECTS (after success)
    // await this.notificationService.notify(...);
    // await this.auditService.log(...);

    return result;
  } catch (error) {
    // 5. ERROR HANDLING
    this.logger.error(`Error in methodName: ${error.message}`, error.stack);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Resource already exists');
      }
    }

    throw error;
  }
}
````

#### Rule 3: Controller Endpoint Template

**Every controller endpoint MUST follow this structure:**

```typescript
/**
 * Brief description of endpoint purpose
 *
 * @param dto - Request body validation
 * @param user - Current authenticated user (from JWT)
 * @returns Response with created resource
 *
 * @example
 * POST /api/resource
 * Body: { "name": "Example", "value": 123 }
 * Response: { "id": "uuid", "name": "Example", "value": 123 }
 */
@Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Create new resource' })
@ApiResponse({ status: 201, description: 'Resource created', type: ResourceResponseDto })
@ApiResponse({ status: 400, description: 'Invalid input' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 409, description: 'Resource already exists' })
async create(
  @Body() dto: CreateResourceDto,
  @CurrentUser() user: User,
): Promise<ResourceResponseDto> {
  this.logger.log(`Creating resource for user ${user.id}`);

  const result = await this.service.create(dto, user.id);

  return new ResourceResponseDto(result);
}
```

#### Rule 4: DTO Validation Template

**Every DTO MUST have validation and documentation:**

```typescript
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Length,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Data Transfer Object for creating a resource
 */
export class CreateResourceDto {
  /**
   * Resource name
   * @example "My Resource"
   */
  @ApiProperty({
    description: "Resource name",
    example: "My Resource",
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @Length(3, 100)
  name: string;

  /**
   * Resource value (must be positive)
   * @example 42
   */
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

  /**
   * Optional description
   * @example "This is a description"
   */
  @ApiPropertyOptional({
    description: "Optional description",
    example: "This is a description",
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}
```

### 2.2. Frontend (Angular)

#### Rule 5: Component Structure Template

**Every component MUST follow this structure:**

````typescript
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
 *
 * @example
 * ```html
 * <app-resource-create (created)="handleCreated($event)" />
 * ```
 */
@Component({
  selector: "app-resource-create",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./resource-create.component.html",
  styleUrl: "./resource-create.component.scss",
})
export class ResourceCreateComponent {
  // SERVICES (inject at top)
  private resourceService = inject(ResourceService);
  private toastService = inject(ToastService);

  // SIGNALS (state)
  loading = signal(false);
  error = signal<string | null>(null);

  // COMPUTED (derived state)
  canSubmit = computed(() => !this.loading() && this.form.valid);

  // FORM
  form = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.minLength(3)]),
    value: new FormControl(0, [Validators.required, Validators.min(1)]),
  });

  // LIFECYCLE
  ngOnInit(): void {
    // Initialization logic
  }

  // PUBLIC METHODS (event handlers)
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

  // PRIVATE METHODS (helpers)
  private validateSomething(): boolean {
    // Helper logic
    return true;
  }
}
````

#### Rule 6: Service Template

**Every service MUST follow this structure:**

````typescript
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "@env/environment";

/**
 * Service for managing resources
 *
 * @example
 * ```typescript
 * const service = inject(ResourceService);
 * const resources = await service.getAll();
 * ```
 */
@Injectable({
  providedIn: "root",
})
export class ResourceService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/resources`;

  /**
   * Get all resources
   *
   * @returns Promise resolving to array of resources
   * @throws {HttpErrorResponse} When API request fails
   */
  async getAll(): Promise<Resource[]> {
    try {
      return await firstValueFrom(this.http.get<Resource[]>(this.baseUrl));
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      throw error;
    }
  }

  /**
   * Create new resource
   *
   * @param data - Resource creation data
   * @returns Promise resolving to created resource
   */
  async create(data: CreateResourceDto): Promise<Resource> {
    return await firstValueFrom(this.http.post<Resource>(this.baseUrl, data));
  }
}
````

## 3. Documentation Templates

### 3.1. ADR (Architecture Decision Record) Template

**File:** `docs/adr/NNN-title-with-dashes.md`

```markdown
# ADR NNN: Title of Decision

**Status:** Proposed | Accepted | Deprecated | Superseded

**Date:** YYYY-MM-DD

**Deciders:** Name1, Name2

---

## Context

What is the issue we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive

- Benefit 1
- Benefit 2

### Negative

- Cost 1
- Cost 2

### Neutral

- Tradeoff 1

## Alternatives Considered

### Alternative 1

Description of alternative 1 and why it was rejected.

### Alternative 2

Description of alternative 2 and why it was rejected.

## References

- Link to related issue
- Link to design doc
- Link to similar ADR
```

### 3.2. API Endpoint Documentation Template

**File:** `docs/api/endpoint-name.md`

````markdown
# Endpoint Name

Brief description of what this endpoint does.

---

## Request

**Method:** POST | GET | PUT | DELETE

**URL:** `/api/v1/resource/{id}`

**Authentication:** Required (JWT Bearer token)

**Rate Limit:** 100 requests per minute

### Path Parameters

| Parameter | Type          | Required | Description         |
| --------- | ------------- | -------- | ------------------- |
| id        | string (UUID) | Yes      | Resource identifier |

### Query Parameters

| Parameter | Type   | Required | Default | Description    |
| --------- | ------ | -------- | ------- | -------------- |
| page      | number | No       | 1       | Page number    |
| limit     | number | No       | 20      | Items per page |

### Request Body

```json
{
  "name": "string",
  "value": 42,
  "description": "optional string"
}
```
````

### Headers

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

---

## Response

### Success (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Resource Name",
  "value": 42,
  "description": "Description",
  "createdAt": "2025-11-01T12:00:00Z",
  "updatedAt": "2025-11-01T12:00:00Z"
}
```

### Error Responses

**400 Bad Request**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "name must be longer than 3 characters"
    }
  ]
}
```

**401 Unauthorized**

```json
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

**404 Not Found**

```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

---

## Examples

### cURL

```bash
curl -X POST https://api.example.com/api/v1/resource \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example Resource",
    "value": 42
  }'
```

### TypeScript (Frontend)

```typescript
const resource = await resourceService.create({
  name: "Example Resource",
  value: 42,
});
console.log(resource.id);
```

---

## Business Rules

- Name must be unique per user
- Value must be positive
- Description is optional, max 500 characters

## Performance

- Average response time: < 100ms
- Database queries: 2 (SELECT + INSERT)
- Cacheable: No (creates new resource)

## Security

- Requires authentication
- User can only create resources for themselves
- Input sanitized to prevent XSS
- SQL injection prevented by Prisma

---

**Version:** 1.0.0
**Last Updated:** 2025-11-01

````

## 4. Architecture Patterns

### 4.1. Pattern 1: Multi-Country Payment Adapter (Strategy + Factory)

**When to use:** Integrating country-specific external services (payments, billing, etc.)

**Structure:**

```typescript
// 1. INTERFACE (defines contract)
export interface IPaymentProvider {
  readonly country: string;
  readonly currency: string;

  createPaymentIntent(dto: CreatePaymentDto): Promise<PaymentIntent>;
  generateQRCode(intentId: string): Promise<QRCodeData>;
  confirmPayment(intentId: string): Promise<PaymentConfirmation>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

// 2. ADAPTERS (one per country)
@Injectable()
export class ConektaPaymentProvider implements IPaymentProvider {
  readonly country = 'MX';
  readonly currency = 'MXN';

  constructor(
    @Inject('CONEKTA_CONFIG') private config: ConektaConfig,
  ) {}

  async createPaymentIntent(dto: CreatePaymentDto): Promise<PaymentIntent> {
    // Conekta-specific implementation
  }
}

// 3. FACTORY (selects adapter)
@Injectable()
export class PaymentProviderFactory {
  constructor(
    @Inject('PAYMENT_PROVIDERS') private providers: Map<string, IPaymentProvider>,
  ) {}

  getProvider(country: string): IPaymentProvider {
    const provider = this.providers.get(country);
    if (!provider) {
      throw new BadRequestException(`Payment provider not available for ${country}`);
    }
    return provider;
  }
}

// 4. SERVICE (uses factory)
@Injectable()
export class PaymentsService {
  constructor(
    private factory: PaymentProviderFactory,
    private prisma: PrismaService,
  ) {}

  async createPayment(dto: CreatePaymentDto, userId: string): Promise<PaymentIntent> {
    // Get user's business to determine country
    const business = await this.getBusinessByUserId(userId);

    // Get appropriate provider
    const provider = this.factory.getProvider(business.country);

    // Use provider
    return await provider.createPaymentIntent(dto);
  }
}
````

**When to create new adapter:**

- Adding new country support
- Integrating different payment gateway
- Switching providers for existing country

### 4.2. Pattern 2: Repository Pattern (Complex Queries)

**When to use:** Complex database queries that don't fit in service layer

**Structure:**

```typescript
@Injectable()
export class TransactionRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Find transactions with complex filtering
   */
  async findWithFilters(filters: TransactionFilters): Promise<Transaction[]> {
    const where: Prisma.TransactionWhereInput = {
      businessId: filters.businessId,
      status: filters.status,
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    };

    if (filters.minAmount || filters.maxAmount) {
      where.amount = {
        gte: filters.minAmount,
        lte: filters.maxAmount,
      };
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        business: true,
        paymentMethod: true,
      },
      orderBy: { createdAt: "desc" },
      skip: filters.skip,
      take: filters.take,
    });
  }
}
```

### 4.3. Pattern 3: Event-Driven Side Effects

**When to use:** Actions that should happen after main operation (notifications, analytics, etc.)

**Structure:**

```typescript
// 1. EVENT (domain event)
export class PaymentConfirmedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly businessId: string,
    public readonly amount: number,
  ) {}
}

// 2. SERVICE (emits event)
@Injectable()
export class PaymentsService {
  constructor(private eventEmitter: EventEmitter2) {}

  async confirmPayment(id: string): Promise<void> {
    const transaction = await this.updateStatus(id, "CONFIRMED");

    // Emit event (non-blocking)
    this.eventEmitter.emit(
      "payment.confirmed",
      new PaymentConfirmedEvent(
        transaction.id,
        transaction.businessId,
        transaction.amount,
      ),
    );
  }
}

// 3. LISTENER (handles side effects)
@Injectable()
export class PaymentEventsListener {
  constructor(
    private notificationService: NotificationService,
    private analyticsService: AnalyticsService,
  ) {}

  @OnEvent("payment.confirmed")
  async handlePaymentConfirmed(event: PaymentConfirmedEvent): Promise<void> {
    // These run async, don't block main flow
    await Promise.all([
      this.notificationService.notifyMerchant(event.businessId, event.amount),
      this.analyticsService.trackPayment(event),
    ]);
  }
}
```

### 4.4. Pattern 4: Signal Store (Frontend State)

**When to use:** Managing component state that needs to be shared or computed

**Structure:**

```typescript
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
} from "@ngrx/signals";
import { computed, inject } from "@angular/core";

// 1. STATE INTERFACE
interface PaymentsState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  filters: PaymentFilters;
}

// 2. INITIAL STATE
const initialState: PaymentsState = {
  payments: [],
  loading: false,
  error: null,
  filters: { status: "ALL", dateRange: "THIS_MONTH" },
};

// 3. STORE DEFINITION
export const PaymentsStore = signalStore(
  { providedIn: "root" },

  withState(initialState),

  withComputed(({ payments, filters }) => ({
    filteredPayments: computed(() => {
      return payments().filter((p) => matchesFilters(p, filters()));
    }),

    totalAmount: computed(() => {
      return payments().reduce((sum, p) => sum + p.amount, 0);
    }),

    isEmpty: computed(() => payments().length === 0),
  })),

  withMethods((store, api = inject(PaymentsService)) => ({
    async loadPayments(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        const payments = await api.getAll();
        patchState(store, { payments, loading: false });
      } catch (error) {
        patchState(store, {
          error: error.message,
          loading: false,
        });
      }
    },

    setFilters(filters: Partial<PaymentFilters>): void {
      patchState(store, {
        filters: { ...store.filters(), ...filters },
      });
    },
  })),
);
```

## 5. Testing Requirements

### 5.1. Test Coverage Rules

**Minimum Coverage:**

- Unit tests: 80% line coverage
- Integration tests: Critical paths only
- E2E tests: Happy path + 1 error case per feature

**What MUST be tested:**

1. **Services:**
   - All public methods
   - Error handling
   - Edge cases (null, empty, invalid input)
   - Business logic validation

2. **Controllers:**
   - Authorization checks
   - DTO validation
   - Response format

3. **Components:**
   - User interactions (button clicks, form submit)
   - Loading states
   - Error states
   - Computed values

**What CAN be skipped:**

- Pure DTOs (only validation decorators)
- Simple getters/setters
- Prisma generated code
- Third-party library wrappers

### 5.2. Test Template (Backend)

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsService } from "./payments.service";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentProviderFactory } from "./factories/payment-provider.factory";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let factory: PaymentProviderFactory;

  // SETUP
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: {
            transaction: {
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: PaymentProviderFactory,
          useValue: {
            getProvider: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    factory = module.get<PaymentProviderFactory>(PaymentProviderFactory);
  });

  // TEARDOWN
  afterEach(() => {
    jest.clearAllMocks();
  });

  // TESTS ORGANIZED BY METHOD
  describe("createPayment", () => {
    it("should create payment successfully", async () => {
      // ARRANGE
      const dto = { amount: 100, currency: "MXN" };
      const userId = "user-123";
      const mockProvider = {
        createPaymentIntent: jest.fn().mockResolvedValue({ id: "intent-123" }),
      };

      jest.spyOn(factory, "getProvider").mockReturnValue(mockProvider as any);
      jest
        .spyOn(prisma.transaction, "create")
        .mockResolvedValue({ id: "tx-123" } as any);

      // ACT
      const result = await service.createPayment(dto, userId);

      // ASSERT
      expect(result).toBeDefined();
      expect(factory.getProvider).toHaveBeenCalledWith("MX");
      expect(mockProvider.createPaymentIntent).toHaveBeenCalledWith(dto);
      expect(prisma.transaction.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException for invalid amount", async () => {
      // ARRANGE
      const dto = { amount: -100, currency: "MXN" };
      const userId = "user-123";

      // ACT & ASSERT
      await expect(service.createPayment(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw NotFoundException when business not found", async () => {
      // ARRANGE
      const dto = { amount: 100, currency: "MXN" };
      const userId = "invalid-user";

      jest.spyOn(prisma.transaction, "findFirst").mockResolvedValue(null);

      // ACT & ASSERT
      await expect(service.createPayment(dto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

### 5.3. Test Template (Frontend)

```typescript
import { TestBed } from "@angular/core/testing";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ResourceService } from "./resource.service";
import { provideHttpClient } from "@angular/common/http";

describe("ResourceService", () => {
  let service: ResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ResourceService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should fetch all resources", async () => {
    const mockResources = [{ id: "1", name: "Test" }];

    // Use HttpTestingController here for actual http mocking

    const result = await service.getAll();
    expect(result).toEqual(mockResources);
  });
});
```

## 6. Git Workflow

### 6.1. Branch Naming

**Format:** `<type>/<ticket-id>-<short-description>`

**Types:**

- `feat/` - New feature
- `fix/` - Bug fix
- `refactor/` - Code refactoring
- `docs/` - Documentation only
- `test/` - Adding tests
- `chore/` - Maintenance tasks

**Examples:**

- `feat/PAY-123-add-qr-generation`
- `fix/PAY-456-transaction-validation`
- `refactor/PAY-789-extract-payment-adapter`

### 6.2. Commit Messages

**Enforcement:**

- Commit messages are linted by `commitlint` via Husky hooks.
- Non-compliant commits will be rejected automatically.

**Format:** `<type>(<scope>): <subject>`

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**

```
feat(payments): add QR code generation
fix(auth): correct JWT expiration validation
docs(api): update payment endpoints documentation
refactor(inventory): extract stock validation logic
test(payments): add webhook signature validation tests
```

### 6.3. Pull Request Template

```markdown
## Description

Brief description of what this PR does.

Closes #TICKET_NUMBER

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Changes Made

- Change 1
- Change 2
- Change 3

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Manual testing completed

## Screenshots (if applicable)

[Add screenshots here]

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.log or debugger statements
- [ ] No secrets in code
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] CI checks pass (Lint, Test, Build)
- [ ] No merge conflicts
```

## 7. Code Review Checklist

### 7.1. For Reviewer

**Functionality:**

- [ ] Code does what PR description says
- [ ] Edge cases handled
- [ ] Error handling present and appropriate
- [ ] No obvious bugs

**Design:**

- [ ] Follows established patterns
- [ ] No code duplication
- [ ] Appropriate abstraction level
- [ ] Single Responsibility Principle followed

**Testing:**

- [ ] Tests cover main functionality
- [ ] Tests cover error cases
- [ ] Tests are readable and maintainable
- [ ] Coverage meets 80% minimum

**Documentation:**

- [ ] JSDoc comments for public APIs
- [ ] Inline comments for complex logic
- [ ] README updated if needed
- [ ] API docs updated if endpoints changed

**Security:**

- [ ] No secrets in code
- [ ] Input validation present
- [ ] Authorization checks present
- [ ] SQL injection prevented
- [ ] XSS prevention implemented

**Performance:**

- [ ] No N+1 queries
- [ ] Appropriate indexes used
- [ ] Large operations paginated
- [ ] No blocking operations in critical path

**Style:**

- [ ] Linter passes
- [ ] Consistent naming
- [ ] No commented-out code
- [ ] No console.log statements

### 7.2. For Author (Self-Review)

Before requesting review:

- [ ] Run full test suite locally
- [ ] Check code coverage
- [ ] Run linter and fix all issues
- [ ] Remove debug code
- [ ] Update documentation
- [ ] Test manually in dev environment
- [ ] Check no secrets committed
- [ ] Verify no merge conflicts
- [ ] Read through entire diff

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-01  
**Author:** Engineering Team  
**Status:** Active - MUST FOLLOW
