# AI Agent Guide - Payment System

## 🤖 AI Agent Workflow (MANDATORY)

This project uses a **Model Context Protocol (MCP)** server to enforce standards.
**Before starting any task, you MUST:**

1. **Check for Standards:** Use the `payment-system-mcp` server to retrieve the latest rules.
   - List resources to see available documentation (`docs://...`).
   - Use `search_docs` tool to find specific rules if needed.
2. **Use Templates:** When creating features, use `get_prompt('scaffold-feature')`.
3. **Commit Rules:** When committing, use `get_prompt('generate-commit')`.
4. **Documentation:** If you are unsure about a pattern, read the resource `docs://standards/development`.

---

## 🛠️ Tool Usage & Agent Personas

### 🧠 Beast Mode Strategy (MANDATORY)

**1. Proactive Tool Usage:**

- Do not wait for the user to ask for validation.
- **ALWAYS** run `bun run build` or `bun test` after making significant changes.
- **ALWAYS** use `read_file` or `grep_search` to gather context before editing.
- **ALWAYS** use `fetch_webpage` to verify library usage if you are unsure.

**2. Code-First Architecture (Back-to-Front):**
Since the AI cannot "draw" in Figma, we use **Strict Code Modeling** as our design phase.

- **Step 0: Documentation & Design (MANDATORY):**
  - **Diagrams:** Use Mermaid.js to visualize flows and architecture.
  - **Database:** Create Entity-Relationship (ER) diagrams before writing schema.
  - **UI:** Define Atomic Design components (Atoms -> Molecules -> Organisms).
- **Step 1: Data Layer:** Define `schema.prisma` (The Truth).
- **Step 2: Contract Layer:** Define DTOs and Interfaces (The Bridge).
- **Step 3: Logic Layer:** Define Services and State Management (The Brain).
- **Step 4: UI Layer:** Implement Components and HTML (The Skin).

**3. No "Blind" Coding:**

- Never implement a UI component without first defining the data structure it displays.
- Never implement an API endpoint without first defining the DTOs it accepts/returns.

### Agent Personas (Roles)

The AI will assume specific roles based on the task. Each role has a specific "Knowledge Base" (RAG context) it prioritizes.

| Agent          | Responsibility                          | Key Documents                                  | Output Style                        |
| :------------- | :-------------------------------------- | :--------------------------------------------- | :---------------------------------- |
| **@Architect** | System design, patterns, data modeling. | `SYSTEM-ARCHITECTURE.md`, `DESIGN-PATTERNS.md` | Diagrams, Interfaces, Schema.prisma |
| **@Backend**   | API, Business Logic, DB interactions.   | `TYPESCRIPT-STRICT.md`, `NestJS Docs`          | Services, Controllers, DTOs         |
| **@Frontend**  | UI/UX, State Management, Client Logic.  | `ANGULAR-ZONELESS.md`, `STANDARDS.md`          | Components, Signals, HTML/CSS       |
| **@QA**        | Testing, Mock Data, Validation.         | `CONSTRUCTION-CHECKLIST.md`                    | Spec files, E2E scripts             |
| **@Scribe**    | Documentation, Commits, Changelogs.     | `MONOREPO-GUIDE.md`                            | Markdown, Git messages              |

### Tool Usage

You have access to the `payment-system-mcp` tools. You MUST use them to ensure compliance with project standards.

- **`mcp_payment-syste_search_docs`**: Use this to search the project documentation (`docs/`) for specific rules, patterns, or architectural decisions.
  - _Example:_ "Search for 'payment provider factory' to understand how to add a new country."
- **Prompts (Simulated):**
  - **`scaffold-feature`**: When asked to design a feature, follow the template in `docs/templates/01-FEATURE-DESIGN-TEMPLATE.md`.
  - **`generate-commit`**: When asked to generate a commit message, follow the Conventional Commits standard defined in `docs/process/workflow/DEVELOPMENT-RULES.md`.

---

## Project Vision

Local payment and business management system designed to modernize small businesses without expensive infrastructure. Single codebase supporting multiple countries (Mexico, Colombia, Argentina, Chile) by swapping only the payment processing layer.

**Philosophy:** "Not making them pay more, making them earn more"

---

## Technology Stack

### Backend

- **Framework:** NestJS 10+ with TypeScript 5.3+ (strict mode)
- **ORM:** Prisma 5+ (schema in `apps/backend/prisma/schema.prisma`)
- **Database:** PostgreSQL 16+ (multi-schema, JSONB, full-text search)
- **Cache/Queue:** Redis 7+ with Bull MQ
- **Authentication:** Passport.js + JWT (access + refresh tokens)
- **Validation:** class-validator + class-transformer
- **Testing:** Jest + Supertest

### Frontend

- **Framework:** Angular 19+ standalone components (no NgModules)
- **Features:** Signals, control flow (@if/@for), inject() function
- **State:** NgRx Signal Store
- **UI:** Angular Material 18+ or PrimeNG
- **HTTP:** HttpClient with interceptors
- **Testing:** Jasmine/Karma (unit), Playwright (e2e)

---

## Key Architecture

### 1. Interchangeable Payment Layer (Multi-Country)

**Pattern:** Strategy + Factory

Business logic is country-agnostic. Payments process through abstraction:

```typescript
// Common interface for all providers
interface IPaymentProvider {
  readonly country: string;
  readonly currency: string;
  createPaymentIntent(params: CreatePaymentDTO): Promise<PaymentIntent>;
  generateQRCode(intentId: string): Promise<QRCodeData>;
  confirmPayment(intentId: string): Promise<PaymentConfirmation>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

// Factory that injects the correct provider based on country
@Injectable()
export class PaymentProviderFactory {
  getProvider(country: string): IPaymentProvider {
    // Returns: ConektaProvider (MX), PayUProvider (CO), MercadoPagoProvider (AR)
  }
}
```

**Location:** `apps/backend/src/modules/payments/`

**Country Adapters:**

- `providers/mexico/conekta-provider.service.ts` (Conekta + SPEI)
- `providers/colombia/payu-provider.service.ts` (PayU + PSE)
- `providers/argentina/mercadopago-provider.service.ts` (Mercado Pago)

**Rule:** When adding payment functionality, ALWAYS use the abstraction. NEVER call a gateway directly.

### 2. Modular Structure (NestJS)

Main Modules:

- `auth/` - Authentication, KYC, roles (RBAC)
- **`payments/`** - ⭐ Payment orchestration, webhooks, factory
- `business/` - Merchants, branches, employees
- `inventory/` - Products, stock, alerts
- `sales/` - Sales, cash register, closings
- `billing/` - Invoices (SAT Mexico, DIAN Colombia, AFIP Argentina)
- `notifications/` - SMS/Email/Push (Bull Queue)
- `analytics/` - Reports, dashboards, metrics

**Convention:** Each module has its folder with:

- `*.module.ts` (NestJS module)
- `*.controller.ts` (REST endpoints)
- `*.service.ts` (business logic)
- `dto/*.dto.ts` (validation with class-validator)
- `entities/*.entity.ts` (Prisma models)

### 3. Database (Prisma)

**Schema:** `apps/backend/prisma/schema.prisma`

**Core Entities:**

- `User` (multi-role: ADMIN, MERCHANT, CUSTOMER)
- `Business` (merchants, with `country` field to determine adapter)
- `Branch` (branches)
- `Product` (catalog, inventory)
- `Transaction` (payments, with `providerAdapter` and `providerData` JSONB)
- `Sale` (registered sales)
- `Invoice` (receipts/invoices with fiscal metadata per country)
- `CashRegister` (cash registers, shift closings)
- `PaymentMethod` (static, dynamic QR, links)

**Rules:**

- Use UUIDs for `id` (no auto-increment)
- Mandatory fields: `createdAt`, `updatedAt`
- Soft deletes: `deletedAt` optional
- JSONB for country/provider specific data

**Migrations:**

```bash
bun run --filter backend db:migrate --name <description>
bun run --filter backend db:generate  # Regenerates Prisma Client
```

### 4. Frontend (Angular 19+)

**Structure:**

- `core/` - Singleton services (auth, api, websocket, storage)
- `shared/` - Reusable components/pipes/directives
- `features/` - Feature modules (auth, dashboard, payments, sales, inventory)
- `layouts/` - Layouts (main, auth)

**Standalone Components Pattern:**

```typescript
@Component({
  selector: "app-payment-create",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QRCodeComponent],
  templateUrl: "./payment-create.component.html",
})
export class PaymentCreateComponent {
  private paymentsService = inject(PaymentsService);
  private store = inject(PaymentsStore);

  // Signals (Angular 19)
  amount = signal(0);
  qrCode = signal<string | null>(null);

  // Computed
  isValid = computed(() => this.amount() > 0);
}
```

**Signal Store (State):**

```typescript
export const PaymentsStore = signalStore(
  withState({ payments: [], loading: false }),
  withComputed(({ payments }) => ({
    total: computed(() => payments().reduce((sum, p) => sum + p.amount, 0)),
  })),
  withMethods((store, api = inject(PaymentsService)) => ({
    async load() {
      patchState(store, { loading: true });
      const data = await api.getPayments();
      patchState(store, { payments: data, loading: false });
    },
  })),
);
```

---

## 📋 Coding Rules

### General

1. **TypeScript Strict Mode:** Always active, do not use `any` (use `unknown` if necessary)
2. **Async/Await:** Prefer over `.then()` for promises
3. **Error Handling:**
   - Backend: NestJS `HttpException` with appropriate status codes
   - Frontend: Global interceptors + toast notifications
4. **Logging:** Winston (backend), console with levels (frontend dev)
5. **Validation:** DTO with `class-validator` decorators

### Backend (NestJS)

```typescript
// ✅ CORRECT: DTO with validation
export class CreatePaymentDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsIn(['MXN', 'COP', 'ARS', 'CLP'])
  currency: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;
}

// ✅ CORRECT: Service with injection
@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly factory: PaymentProviderFactory,
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  async createPayment(dto: CreatePaymentDto, userId: string): Promise<PaymentIntent> {
    // 1. Get user business
    const business = await this.prisma.business.findFirst({ where: { ownerId: userId } });
    if (!business) throw new NotFoundException('Business not found');

    // 2. Get provider based on business country
    const provider = this.factory.getProvider(business.country);

    // 3. Create intent in external gateway
    const intent = await provider.createPaymentIntent(dto);

    // 4. Save transaction in DB
    const transaction = await this.prisma.transaction.create({
      data: {
        businessId: business.id,
        amount: dto.amount,
        currency: dto.currency,
        status: 'PENDING',
        paymentMethod: 'QR',
        country: business.country,
        providerAdapter: provider.constructor.name,
        providerData: intent.providerData,
      },
    });

    return intent;
  }
}

// ❌ INCORRECT: Call gateway directly
async createPayment(dto: CreatePaymentDto) {
  // DO NOT do this - breaks multi-country abstraction
  const conekta = new Conekta(apiKey);
  return conekta.createOrder(...);
}
```

### Frontend (Angular)

```typescript
// ✅ CORRECT: Standalone component with signals
@Component({
  selector: "app-payment-form",
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    @if (loading()) {
      <app-spinner />
    } @else {
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <input formControlName="amount" />
        @if (form.controls.amount.errors?.["min"]) {
          <span>Minimum amount: $1</span>
        }
      </form>
    }
  `,
})
export class PaymentFormComponent {
  private paymentsService = inject(PaymentsService);

  loading = signal(false);

  form = new FormGroup({
    amount: new FormControl(0, [Validators.required, Validators.min(1)]),
  });

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    try {
      const intent = await this.paymentsService.createPayment(this.form.value);
      // Navigate to QR screen
    } catch (error) {
      // Error interceptor handles it
    } finally {
      this.loading.set(false);
    }
  }
}

// ❌ INCORRECT: Do not use NgModules, do not use unnecessary observables
@NgModule({
  /* ... */
}) // ❌ Do not use NgModules in Angular 19
export class PaymentModule {}

// ❌ Do not convert everything to observable if signal is sufficient
amount$ = new BehaviorSubject(0); // Use signal() instead
```

### Prisma

```typescript
// ✅ CORRECT: Soft delete with explicit select
async deleteProduct(id: string) {
  return this.prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}

// ✅ CORRECT: Atomic transactions
async createSaleWithTransaction(dto: CreateSaleDto) {
  return this.prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({ data: dto });
    await tx.product.update({
      where: { id: dto.productId },
      data: { stock: { decrement: dto.quantity } }
    });
    return sale;
  });
}

// ❌ INCORRECT: N+1 Queries
const businesses = await prisma.business.findMany();
for (const b of businesses) {
  const branches = await prisma.branch.findMany({ where: { businessId: b.id } });
}
// Use include or select with relations
```

---

## 🚀 Critical Flows

### Flow 1: Dynamic QR Payment

1. Merchant in app clicks "Charge" → enters amount
2. Frontend → `POST /api/payments/create-intent`
3. Backend → `PaymentProviderFactory.getProvider(country)`
4. Backend → `provider.createPaymentIntent()` (call to Conekta/PayU/etc)
5. Backend → Saves `Transaction` in DB with status `PENDING`
6. Backend → Returns QR + link to frontend
7. Customer scans QR and pays in their bank
8. Gateway → `POST /webhooks/{provider}` to backend
9. Backend → Validates signature, updates `Transaction` to `CONFIRMED`
10. Backend → Publishes `payment.confirmed` event in Redis
11. Frontend (WebSocket) → Receives real-time notification
12. Backend (async) → Generates PDF receipt, sends SMS/email

**Files involved:**

- `apps/backend/src/modules/payments/payments.service.ts`
- `apps/backend/src/modules/payments/factories/payment-provider.factory.ts`
- `apps/backend/src/modules/payments/providers/{country}/*.service.ts`
- `apps/merchant-web/src/app/features/payments/payment-create/`

### Flow 2: New Merchant Onboarding

1. User → Registers phone + country
2. Backend → Sends OTP via SMS (Twilio)
3. User → Verifies OTP
4. Backend → Creates `User` (role=MERCHANT, kycLevel=0)
5. Frontend → Business data form (name, RFC/NIT, type)
6. Backend → Creates `Business` + `Branch` default
7. Backend → Generates static QR via `PaymentProviderFactory`
8. Frontend → Interactive tutorial (test charge)
9. User completes first simulated charge
10. Frontend → Redirects to dashboard

**Progressive KYC:**

- Level 0: Phone only → limit $500/day
- Level 1: + ID/Passport → limit $5,000/day
- Level 2: + proof of address + fiscal data → no limits + invoicing

---

## 🔍 Debugging and Testing

### Backend

```bash
# Unit tests
bun test payments.service.spec.ts

# E2E tests
bun run test:e2e -- payments.e2e-spec.ts

# Debug in VSCode
# Use launch.json preset "Debug NestJS"
```

**Recommended tests:**

- Mock `PaymentProviderFactory` in `PaymentsService` tests
- Use in-memory Prisma for integration tests
- Mock external webhooks with fixtures

### Frontend

```bash
# Unit tests
bun run --filter merchant-web test --include='**/payment-create.component.spec.ts'

# E2E tests
bun run --filter merchant-web test:e2e

# Debug in Chrome DevTools
bun run --filter merchant-web dev --open --configuration=development
```

**Recommended tests:**

- TestBed for components with `provideHttpClientTesting()`
- Harness for Material components
- Mock `PaymentsService` with signals spy

---

## 📦 Add New Country (Example: Chile)

1. **Create adapter:**

   ```bash
   touch apps/backend/src/modules/payments/providers/chile/khipu-provider.service.ts
   ```

2. **Implement `IPaymentProvider`:**

   ```typescript
   @Injectable()
   export class KhipuPaymentProvider implements IPaymentProvider {
     readonly country = "CL";
     readonly currency = "CLP";
     // ... implement methods
   }
   ```

3. **Register in factory:**

   ```typescript
   // payments.module.ts
   {
     provide: 'PAYMENT_PROVIDERS',
     useFactory: () => {
       const map = new Map<string, IPaymentProvider>();
       map.set('MX', new ConektaPaymentProvider());
       map.set('CO', new PayUPaymentProvider());
       map.set('AR', new MercadoPagoPaymentProvider());
       map.set('CL', new KhipuPaymentProvider());  // ← New
       return map;
     }
   }
   ```

4. **Add configuration:**

   ```typescript
   // config/payment.config.ts
   CL: {
     adapter: 'KhipuPaymentProvider',
     apiKey: process.env.KHIPU_API_KEY,
     features: ['qr', 'bank_transfer']
   }
   ```

5. **Frontend (environment):**
   ```typescript
   // environments/environment.cl.ts
   export const environment = {
     country: "CL",
     currency: "CLP",
     apiUrl: "https://api-cl.example.com",
   };
   ```

**Estimated time:** ~3-5 days (adapter + tests + documentation)

---

## 🎨 Code Style

### Commits (Conventional Commits)

```
feat(payments): adds support for payments in Chile
fix(auth): fixes RFC validation in Mexico
docs(api): updates swagger for payment endpoints
refactor(billing): extracts SAT logic to separate provider
test(payments): adds tests for KhipuProvider
chore(deps): updates Prisma to 5.8.0
```

### Code Review Checklist

- [ ] Uses `IPaymentProvider` abstraction instead of direct calls?
- [ ] DTOs with `class-validator` validation?
- [ ] Error handling with appropriate `HttpException`?
- [ ] Unit tests with coverage > 80%?
- [ ] Swagger documentation updated?
- [ ] Prisma migrations if DB modified?
- [ ] Logs with appropriate level (no `console.log`)?
- [ ] Sensitive variables in `.env` not hardcoded?

---

## 📚 Quick References

- **Docs:** `/docs/VISION-Y-ARQUITECTURA.md`
- **Structure:** `/docs/ESTRUCTURA-PROYECTO.md`
- **Diagrams:** `/docs/diagrams/*.puml`
- **API Spec:** `/docs/api/openapi.yaml` (TODO)
- **Prisma Schema:** `/apps/backend/prisma/schema.prisma`

---

## 🆘 Common Troubleshooting

### Error: "Cannot find module @prisma/client"

```bash
cd apps/backend && bun run db:generate
```

### Error: "Provider not found for country XX"

Verify that the country is registered in `PaymentProviderFactory` and `payment.config.ts`

### Webhooks do not arrive in local development

Use ngrok or webhook.site for tunnel:

```bash
ngrok http 3000
# Update URL in gateway dashboard
```

### Angular: "NG0203: inject() must be called from an injection context"

Use `inject()` only in constructors or class field initializers

---

**Last updated:** October 2025
**Version:** 1.0.0
