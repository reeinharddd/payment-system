---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "general"
module: "foundations"
status: "approved"
version: "1.0.0"
last_updated: "2025-11-27"
author: "@Architect"

# Keywords for semantic search
keywords:
  - "technical-foundations"
  - "why-angular"
  - "why-nestjs"
  - "why-postgresql"
  - "technology-choices"
  - "rationale"
  - "bun"
  - "monorepo"

# Related documentation
related_docs:
  database_schema: ""
  api_design: ""
  feature_design: ""
  ux_flow: ""

# Document-specific metadata
doc_metadata:
  audience: "developers"
  complexity: "medium"
  estimated_read_time: "25 min"
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the TECHNICAL FOUNDATIONS.
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
      <h1 style="margin: 0; border-bottom: none;">Technical Foundations Guide</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Deep technical understanding of core technologies</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-Developers-blue?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--04-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                                            |
| :------------- | :----------------------------------------------------------------------------------------------------- |
| **Context**    | This document explains the "WHY" behind our technology choices.                                        |
| **Constraint** | Do NOT suggest alternative frameworks (e.g., React, Express) unless explicitly asked for a comparison. |
| **Pattern**    | When explaining concepts, use the "Misconception vs Reality" format.                                   |
| **Related**    | `docs/technical/backend/TYPESCRIPT-STRICT.md`, `docs/technical/frontend/ANGULAR-ZONELESS.md`           |

---

## 1. Standardized Stack Versions (Single Source of Truth)

This section defines the **mandatory** versions for all development in this monorepo. All documentation must reference these versions to maintain consistency.

| Technology   | Version             | Status        | Rationale                                           |
| :----------- | :------------------ | :------------ | :-------------------------------------------------- |
| **Runtime**  | **Bun 1.3+**        | Stable        | Replaces Node.js/npm/Jest. Faster builds & runtime. |
| **Backend**  | **NestJS 10+**      | Stable        | Enterprise standard for Node.js architectures.      |
| **Frontend** | **Angular 21+**     | Bleeding Edge | Zoneless by default, Signals-first, Standalone.     |
| **Database** | **PostgreSQL 16+**  | Stable        | JSONB support, performance, reliability.            |
| **ORM**      | **Prisma 5+**       | Stable        | Type-safe database access.                          |
| **Language** | **TypeScript 5.3+** | Strict        | Required for all code. No `any`.                    |

---

## 2. JavaScript Runtime: Bun

### 2.1. What Bun Actually Is

**Common Misconception:** "Bun is just another Node.js clone"

**Reality:** Bun is an all-in-one toolkit (runtime, bundler, test runner, package manager) built from scratch in Zig, using Safari's JavaScriptCore engine (unlike Node's V8). It is designed for speed and developer experience.

### 2.2. Core Concepts

#### 1. Drop-in Node.js Compatibility

Bun implements most of the Node.js API (fs, path, http, etc.), so existing libraries work.

```javascript
// Works in Bun just like Node
import fs from "node:fs";
const data = fs.readFileSync("file.txt");
```

#### 2. Native TypeScript Support

Bun executes `.ts` files directly. No `tsc`, no `ts-node`, no build step for development.

```bash
# Run TypeScript directly
bun run index.ts
```

#### 3. All-in-One Tooling

- **Runtime:** Replaces Node.js
- **Package Manager:** Replaces npm/yarn/pnpm (`bun install` is 30x faster)
- **Test Runner:** Replaces Jest/Vitest (`bun test`)
- **Bundler:** Replaces Webpack/Rollup/Vite

### 2.3. Bun Performance Characteristics

#### What Bun is GOOD at

- **Startup Time:** Near instant (great for serverless/CLI)
- **I/O Operations:** Optimized system calls via Zig
- **Package Installation:** Global cache, hard links, parallel downloads
- **Testing:** Native test runner is significantly faster than Jest

#### Example: HTTP Server

```javascript
// Bun.serve (Native API - 4x faster than Node http)
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Bun!");
  },
});
```

### 2.4. Alternatives to Bun

#### Node.js (The Legacy Standard)

- Pros: Massive ecosystem, 10+ years of stability
- Cons: Slower, fragmented tooling (npm + jest + tsc + nodemon)
- Verdict: Use only if a specific legacy library is incompatible with Bun

#### Deno

- Pros: Secure by default, URL imports
- Cons: Different philosophy (not drop-in Node compatible by default)
- Verdict: Good, but Bun offers better migration path

#### Why We Choose Bun

- **Speed:** Faster builds, tests, and runtime
- **Simplicity:** One tool replaces five (npm, jest, tsc, nodemon, webpack)
- **DX:** Native TypeScript support eliminates config hell

---

## 3. TypeScript Type System

### 3.1. What TypeScript Actually Is

**Common Misconception:** "TypeScript is a different language"

**Reality:** TypeScript is a superset of JavaScript with a compile-time type checker. It compiles to plain JavaScript.

### 3.2. Core Type System Concepts

#### 1. Structural Typing (Duck Typing)

```typescript
// TypeScript uses STRUCTURE, not names
interface PaymentGateway {
  charge(amount: number): Promise<string>;
}

class ConektaGateway {
  // No explicit "implements PaymentGateway" needed
  charge(amount: number): Promise<string> {
    return Promise.resolve("tx_123");
  }
}

// This works! Structure matches
const gateway: PaymentGateway = new ConektaGateway();
```

#### Why This Matters

- Adapters work naturally (payment providers, tax calculators)
- Easier testing (mock objects just need matching structure)
- Interfaces document contracts without tight coupling

#### 2. Type Inference (Smart Compiler)

```typescript
// TypeScript infers types - you don't always need annotations
const amount = 100; // inferred as: number
const user = { name: "John", age: 30 }; // inferred as: { name: string; age: number }

// Function return type inferred
function getTotal(items: Array<{ price: number }>) {
  return items.reduce((sum, item) => sum + item.price, 0); // inferred as: number
}
```

#### 3. Union Types (Multiple Possibilities)

```typescript
// Payment can be in multiple states
type PaymentStatus = "pending" | "confirmed" | "failed" | "refunded";

function handlePayment(status: PaymentStatus) {
  // TypeScript ensures you handle ALL cases
  switch (status) {
    case "pending":
      return "Waiting...";
    case "confirmed":
      return "Success!";
    case "failed":
      return "Error";
    case "refunded":
      return "Refunded";
    // Forget a case? TypeScript error!
  }
}
```

#### 4. Generics (Type Parameters)

```typescript
// Without generics: Lose type information
function getFirstElement(array: any[]): any {
  return array[0]; // Could be anything!
}

// With generics: Preserve type information
function getFirstElement<T>(array: T[]): T {
  return array[0]; // TypeScript knows exact type
}

const firstNumber = getFirstElement([1, 2, 3]); // Type: number
const firstString = getFirstElement(["a", "b"]); // Type: string
```

#### Use Case in Our System

```typescript
// Generic repository pattern
class Repository<T> {
  async findById(id: string): Promise<T | null> {
    // Implementation
  }

  async save(entity: T): Promise<T> {
    // Implementation
  }
}

// Type-safe repositories
const userRepo = new Repository<User>();
const user = await userRepo.findById("123"); // Type: User | null
```

### 3.3. TypeScript Strict Mode (Why We Use It)

```json
// tsconfig.json - All strict flags enabled
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### What Strict Mode Catches

```typescript
// 1. Null/undefined errors
function getUser(id: string) {
  const user = users.find((u) => u.id === id); // Type: User | undefined
  return user.name; // ERROR! user might be undefined

  // Fix: Check before accessing
  if (!user) throw new Error("User not found");
  return user.name; // OK now
}

// 2. Implicit any
function process(data) {
  // ERROR! data has implicit 'any' type
  return data.value;
}

// Fix: Add explicit type
function process(data: PaymentData) {
  return data.value; // OK, TypeScript knows structure
}

// 3. This binding errors
class PaymentProcessor {
  process() {
    setTimeout(function () {
      console.log(this.amount); // ERROR! 'this' is undefined
    }, 1000);
  }

  // Fix: Use arrow function
  process() {
    setTimeout(() => {
      console.log(this.amount); // OK, arrow function preserves 'this'
    }, 1000);
  }
}
```

### 3.4. Runtime Type Validation (TypeScript Limitation)

#### Critical Understanding

TypeScript types DISAPPEAR at runtime!

```typescript
// This type only exists during compilation
interface PaymentRequest {
  amount: number;
  currency: string;
}

// After compilation, it's just JavaScript
function processPayment(req: PaymentRequest) {
  // TypeScript thinks req.amount is a number
  // But at runtime, it could be a string from API!
  return req.amount * 1.1; // Might return "1001.1" instead of 110!
}
```

#### Solution: Runtime Validation with Zod

```typescript
import { z } from "zod";

// Zod schema = Runtime validation + TypeScript types
const PaymentRequestSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(["MXN", "COP", "ARS"]),
});

// Infer TypeScript type from schema
type PaymentRequest = z.infer<typeof PaymentRequestSchema>;

function processPayment(req: unknown) {
  // Validate at runtime
  const validated = PaymentRequestSchema.parse(req); // Throws if invalid

  // Now we KNOW validated.amount is a number
  return validated.amount * 1.1; // Safe!
}
```

### 3.5. Alternatives to TypeScript

#### Flow (Facebook's type checker)

- Pros: Similar to TypeScript, gradual typing
- Cons: Smaller ecosystem, Facebook abandoned it
- Verdict: Dead, don't use

#### JSDoc (Comments-based typing)

```javascript
/**
 * @param {number} amount
 * @param {string} currency
 * @returns {Promise<string>}
 */
function processPayment(amount, currency) {
  // Regular JavaScript with type hints in comments
}
```

- Pros: No build step, still JavaScript
- Cons: Verbose, weaker type checking
- Verdict: Use for small scripts, not production apps

#### Why We Choose TypeScript

- Industry standard (90%+ of new projects)
- Catches bugs before runtime
- Better IDE support (autocomplete, refactoring)
- Large ecosystem (DefinitelyTyped has 9000+ type definitions)

---

## 4. Docker and Containerization

### 4.1. What Docker Actually Is

**Common Misconception:** "Docker is a lightweight VM"

**Reality:** Docker uses Linux kernel features (namespaces, cgroups) to isolate processes. Containers share the host OS kernel.

### 4.2. Core Docker Concepts

#### 1. Images vs Containers

```text
Image: Immutable blueprint (like a class)
Container: Running instance (like an object)

┌─────────────────┐
│   Docker Image  │ < Built once, never changes
│   (Immutable)   │
└────────┬────────┘
         │ docker run
         ↓
┌─────────────────┐
│   Container 1   │ < Running instance
│   (Mutable)     │
└─────────────────┘
┌─────────────────┐
│   Container 2   │ < Another instance from same image
│   (Mutable)     │
└─────────────────┘
```

#### 2. Layers and Caching

```dockerfile
# Each instruction creates a layer
FROM oven/bun:1               # Layer 1 (base OS + Bun)
WORKDIR /app                  # Layer 2 (working directory)
COPY package.json bun.lockb ./ # Layer 3 (dependency files)
RUN bun install --frozen-lockfile # Layer 4 (install dependencies) < CACHED
COPY . .                      # Layer 5 (application code)
RUN bun run build             # Layer 6 (build application)
```

#### Why Layer Order Matters

```dockerfile
# BAD: Code changes invalidate ALL layers below
FROM oven/bun:1
COPY . .                      # Changes often
RUN bun install               # Re-installs EVERY time code changes!
RUN bun run build

# GOOD: Separate dependencies from code
FROM oven/bun:1
COPY package.json bun.lockb ./ # Changes rarely
RUN bun install --frozen-lockfile # Only re-runs when deps change
COPY . .                      # Changes often
RUN bun run build             # Only rebuilds when code changes
```

#### 3. Multi-Stage Builds (Smaller Images)

```dockerfile
# Stage 1: Build (includes dev dependencies, source code)
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
# Image size here: ~500MB

# Stage 2: Production (only runtime dependencies, built code)
FROM oven/bun:1 AS production
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production # Only prod dependencies
COPY --from=builder /app/dist ./dist
USER bun                     # Run as non-root (security)
CMD ["bun", "dist/main.js"]
# Image size here: ~150MB
```

#### Why Multi-Stage

- Smaller images = faster deployment
- No dev dependencies in production = smaller attack surface
- No source code in production image = IP protection

#### 4. Volumes (Persistent Data)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      # Named volume: Docker manages location
      - postgres_data:/var/lib/postgresql/data

  backend:
    volumes:
      # Bind mount: Map host directory to container
      - ./apps/backend:/app # Hot reload in development

volumes:
  postgres_data: # Persists even if container deleted
```

#### Volume Types

```text
Named Volume (Managed by Docker):
Host:      /var/lib/docker/volumes/postgres_data/_data
Container: /var/lib/postgresql/data
Use case:  Database data, production

Bind Mount (Direct mapping):
Host:      /home/user/project/apps/backend
Container: /app
Use case:  Development hot reload

tmpfs (RAM only, not persistent):
Container: /tmp
Use case:  Temporary files, cache
```

### 4.3. Docker Networking

#### Bridge Network (Default)

```text
Host Machine: 192.168.1.100
    ↓
Docker Bridge: 172.17.0.0/16
    ├─ Container 1: 172.17.0.2 (backend)
    ├─ Container 2: 172.17.0.3 (postgres)
    └─ Container 3: 172.17.0.4 (redis)

Containers can talk to each other by name:
postgres://postgres:5432  < "postgres" resolves to 172.17.0.3
```

#### Custom Networks (Better Isolation)

```yaml
networks:
  payment-network: # Internal services
    driver: bridge
  public-network: # Exposed services
    driver: bridge

services:
  postgres:
    networks:
      - payment-network # Only accessible to backend

  backend:
    networks:
      - payment-network # Can access postgres
      - public-network # Can be accessed from outside
```

### 4.4. Docker vs Alternatives

#### Podman (Docker alternative)

- Pros: Rootless (more secure), daemonless, OCI-compliant
- Cons: Docker Compose support incomplete, smaller ecosystem
- Verdict: Good for security-critical environments, but Docker more mature

#### LXC/LXD (Linux Containers)

- Pros: True system containers (full OS), better for VMs-like use
- Cons: Heavier than Docker, slower startup
- Verdict: Use for system-level isolation, not app containers

#### Kubernetes (Container Orchestration)

- Not a Docker alternative, but orchestrates Docker containers
- Use when: >10 services, need auto-scaling, multi-node clusters
- Our case: Overkill for MVP, consider after 50K+ merchants

#### Why We Choose Docker

- Industry standard (all cloud providers support it)
- Development-production parity (same image everywhere)
- Easy local development (docker-compose)
- Great for microservices (each service isolated)

### 4.5. Docker Best Practices for Our System

#### 1. Use Alpine Linux (Smaller Base Images)

```dockerfile
FROM oven/bun:1-alpine
# vs
FROM oven/bun:1
```

#### 2. Run as Non-Root User

```dockerfile
USER bun  # Built-in user in Bun images
# vs
USER root  # < NEVER do this in production
```

#### 3. Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD bun healthcheck.js || exit 1
```

#### 4. Environment-Specific Configs

```yaml
# docker-compose.dev.yml (Development)
services:
  backend:
    build:
      context: .
      target: development  # Use dev stage
    volumes:
      - ./apps/backend:/app  # Hot reload
    environment:
      NODE_ENV: development

# docker-compose.prod.yml (Production)
services:
  backend:
    build:
      context: .
      target: production  # Use production stage
    # No volumes (use image code)
    environment:
      NODE_ENV: production
```

---

## 5. NestJS Architecture

### 5.1. What NestJS Actually Is

**Common Misconception:** "NestJS is a framework like Express"

**Reality:** NestJS is an architectural framework built ON TOP of Express/Fastify that enforces patterns (Dependency Injection, Modules, Decorators).

### 5.2. Core NestJS Concepts

#### 1. Dependency Injection (IoC Container)

```typescript
// Without DI (tightly coupled)
class PaymentService {
  private db = new Database();  // < Creates own dependency
  private gateway = new PaymentGateway();  // < Hard to test

  async processPayment() {
    await this.db.save(...);
    await this.gateway.charge(...);
  }
}

// With DI (loosely coupled)
@Injectable()
class PaymentService {
  constructor(
    private readonly db: Database,  // < Injected
    private readonly gateway: PaymentGateway,  // < Injected
  ) {}

  async processPayment() {
    await this.db.save(...);
    await this.gateway.charge(...);
  }
}

// Testing becomes easy
const mockDb = { save: jest.fn() };
const mockGateway = { charge: jest.fn() };
const service = new PaymentService(mockDb, mockGateway);
```

#### How NestJS Resolves Dependencies

```text
Application Startup:
1. NestJS scans for @Injectable() classes
2. Builds dependency graph
3. Resolves dependencies (singleton by default)
4. Injects into constructors

┌─────────────────────────┐
│   PaymentController     │
└───────────┬─────────────┘
            │ needs
            ↓
┌─────────────────────────┐
│   PaymentService        │ < Created once (singleton)
└───────────┬─────────────┘
            │ needs
            ↓
┌─────────────────────────┐
│   PrismaService         │ < Shared across all services
└─────────────────────────┘
```

#### 2. Modules (Organize Code)

```typescript
// payments.module.ts
@Module({
  imports: [
    DatabaseModule, // Other modules this module needs
  ],
  controllers: [
    PaymentsController, // HTTP endpoints
  ],
  providers: [
    PaymentsService, // Business logic
    PaymentProviderFactory, // Available for injection
  ],
  exports: [
    PaymentsService, // Other modules can import this
  ],
})
export class PaymentsModule {}
```

#### Module Dependency Graph

```text
AppModule
  ├─ AuthModule (exports: AuthService, JwtStrategy)
  ├─ PaymentsModule (imports: AuthModule, DatabaseModule)
  │    ├─ PaymentsController (uses: AuthGuard, PaymentsService)
  │    └─ PaymentsService (uses: PrismaService, PaymentProviderFactory)
  ├─ DatabaseModule (exports: PrismaService)
  └─ ConfigModule (global, exports: ConfigService)
```

#### 3. Guards (Authentication/Authorization)

```typescript
// JWT Guard: Checks if request has valid JWT
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    // 1. Extract JWT from header
    // 2. Verify signature
    // 3. Check expiration
    // 4. Attach user to request
    return super.canActivate(context);
  }
}

// Roles Guard: Checks if user has required role
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}

// Usage in controller
@Controller("payments")
@UseGuards(JwtAuthGuard, RolesGuard) // Applied to all routes
export class PaymentsController {
  @Post()
  @Roles("merchant") // Only merchants can create payments
  async create(@Body() dto: CreatePaymentDto) {
    // User is already authenticated and authorized here
  }
}
```

#### Guard Execution Order

```text
Request > Guard 1 > Guard 2 > Interceptor > Pipe > Controller > Service
          ↓ fail    ↓ fail     ↓           ↓        ↓           ↓
          401       403        Transform   Validate Process    DB
```

#### 4. Pipes (Validation/Transformation)

```typescript
// DTOs with validation
export class CreatePaymentDto {
  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount: number;

  @IsString()
  @IsIn(['MXN', 'COP', 'ARS'])
  currency: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;
}

// Controller automatically validates
@Post()
async create(@Body() dto: CreatePaymentDto) {
  // If validation fails, NestJS returns 400 with details
  // If passes, dto is guaranteed to match type
  return this.paymentsService.create(dto);
}
```

#### 5. Interceptors (AOP - Aspect Oriented Programming)

```typescript
// Logging interceptor: Log all requests/responses
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    console.log(`> ${request.method} ${request.url}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        console.log(`< ${request.method} ${request.url} [${duration}ms]`);
      }),
    );
  }
}

// Transform response interceptor: Wrap all responses
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

### 5.3. NestJS vs Alternatives

#### Express (Low-level)

```javascript
// Express: Manual everything
app.post("/payments", async (req, res) => {
  // Manual validation
  if (!req.body.amount || typeof req.body.amount !== "number") {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // Manual auth
  const token = req.headers.authorization;
  const user = await verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Manual dependency creation
  const db = new Database();
  const service = new PaymentService(db);

  // Business logic
  const result = await service.create(req.body);
  res.json(result);
});
```

#### NestJS: Declarative

```typescript
@Controller("payments")
@UseGuards(JwtAuthGuard) // Auth handled
export class PaymentsController {
  constructor(
    private readonly service: PaymentsService, // DI handled
  ) {}

  @Post()
  async create(
    @Body() dto: CreatePaymentDto, // Validation handled
  ) {
    return this.service.create(dto); // Just business logic
  }
}
```

#### Fastify (NestJS Alternative Backend)

- NestJS can use Fastify instead of Express
- 2x faster than Express
- Better TypeScript support
- Use when: Performance critical (>10K req/s)

#### Why We Choose NestJS

- Enforces clean architecture (SOLID principles)
- Built-in: validation, auth, caching, queues, WebSockets
- TypeScript-first (not bolted on)
- Scales to large teams (clear patterns)
- Angular-like (familiar to frontend devs)

---

## 6. Angular Framework

### 6.1. What Angular Actually Is

**Common Misconception:** "Angular is just a UI library like React"

**Reality:** Angular is a complete framework with: dependency injection, routing, forms, HTTP client, testing, CLI, build tools - all batteries included.

### 6.2. Core Angular Concepts

#### 1. Components (Building Blocks)

```typescript
// Traditional component with template
@Component({
  selector: "app-payment-form",
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="amount" type="number" />
      <button type="submit">Pay</button>
    </form>
  `,
})
export class PaymentFormComponent {
  form = new FormGroup({
    amount: new FormControl(0, [Validators.required, Validators.min(1)]),
  });

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

#### Component Lifecycle

```text
Creation:
  constructor() > Called when class instantiated
  ↓
  ngOnInit() > Called after first change detection
  ↓
Updates:
  ngOnChanges() > Called when input properties change
  ↓
  ngDoCheck() > Called on every change detection
  ↓
Destruction:
  ngOnDestroy() > Called before component destroyed (cleanup)
```

#### 2. Signals (New Reactivity System - Angular 19+)

```typescript
// Old: RxJS Observables (complex)
export class OldComponent {
  count$ = new BehaviorSubject(0);
  doubled$ = this.count$.pipe(map((n) => n * 2));

  increment() {
    this.count$.next(this.count$.value + 1);
  }
}

// New: Signals (simple, performant)
export class NewComponent {
  count = signal(0); // Writable signal
  doubled = computed(() => this.count() * 2); // Computed signal

  increment() {
    this.count.update((n) => n + 1); // Update signal
  }
}
```

#### Why Signals

- Fine-grained reactivity (only update what changed)
- No Zone.js needed (faster change detection)
- Simpler than RxJS for simple state
- Better performance (no unnecessary checks)

#### 3. Dependency Injection (Services)

```typescript
// Service: Business logic + state
@Injectable({
  providedIn: "root", // Singleton across entire app
})
export class PaymentsService {
  private http = inject(HttpClient); // Modern inject() function

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>("/api/payments");
  }

  createPayment(data: CreatePaymentDto): Observable<Payment> {
    return this.http.post<Payment>("/api/payments", data);
  }
}

// Component: UI logic only
@Component({
  selector: "app-payment-list",
  standalone: true, // No NgModule needed (Angular 19+)
})
export class PaymentListComponent {
  private paymentsService = inject(PaymentsService); // Injected

  payments = signal<Payment[]>([]);

  ngOnInit() {
    this.paymentsService
      .getPayments()
      .subscribe((payments) => this.payments.set(payments));
  }
}
```

#### 4. Standalone Components (Angular 19+ - No Modules)

```typescript
// Old: NgModule (boilerplate heavy)
@NgModule({
  declarations: [PaymentFormComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [PaymentFormComponent],
})
export class PaymentsModule {}

// New: Standalone (direct imports)
@Component({
  selector: "app-payment-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Import directly
  template: `...`,
})
export class PaymentFormComponent {}
```

#### 5. Control Flow Syntax (Angular 19+ - No *ngIf/*ngFor)

```typescript
// Old syntax (directives)
@Component({
  template: `
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="!loading && data">
      <div *ngFor="let item of data">{{ item }}</div>
    </div>
  `
})

// New syntax (built-in)
@Component({
  template: `
    @if (loading()) {
      <div>Loading...</div>
    } @else if (error()) {
      <div>Error: {{ error() }}</div>
    } @else {
      @for (item of data(); track item.id) {
        <div>{{ item }}</div>
      }
    }
  `
})
```

#### 6. Zoneless Change Detection (Angular 19+)

```typescript
// Traditional: Zone.js patches all async operations
// Overhead: ~15% performance cost

// New: Zoneless with signals
bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(), // Enable zoneless
  ],
});

// Components use signals for reactivity
@Component({
  template: `{{ count() }}`, // Auto-updates when signal changes
})
export class CounterComponent {
  count = signal(0); // Signal-based state

  increment() {
    this.count.update((n) => n + 1); // Triggers precise update
  }
}
```

### 6.3. Angular vs Alternatives

#### React (Library, not framework)

```jsx
// React: Manual everything
function PaymentForm() {
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");

  // Manual validation
  const validate = () => {
    if (amount < 1) {
      setError("Amount must be positive");
      return false;
    }
    return true;
  };

  // Manual HTTP
  const submit = async () => {
    if (!validate()) return;
    const response = await fetch("/api/payments", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  };

  return (
    <form onSubmit={submit}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {error && <span>{error}</span>}
      <button>Pay</button>
    </form>
  );
}
```

#### Angular: Batteries included

```typescript
@Component({
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="amount" type="number" />
      @if (form.controls.amount.errors?.["min"]) {
        <span>Amount must be positive</span>
      }
      <button>Pay</button>
    </form>
  `,
})
export class PaymentFormComponent {
  private http = inject(HttpClient);

  form = new FormGroup({
    amount: new FormControl(0, [Validators.min(1)]), // Built-in validation
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.http.post("/api/payments", this.form.value).subscribe(); // Built-in HTTP
  }
}
```

#### Vue (Simpler than Angular)

- Pros: Easier learning curve, smaller bundle, flexible
- Cons: Less opinionated, smaller enterprise adoption
- Verdict: Good for small teams, but Angular better for large teams

#### Svelte (Compile-time framework)

- Pros: No runtime, tiny bundles, fast
- Cons: Smaller ecosystem, newer
- Verdict: Promising but wait for maturity

#### Why We Choose Angular

- Complete framework (routing, forms, HTTP, testing)
- TypeScript-first (strong typing everywhere)
- Enterprise-ready (used by Google, Microsoft, Samsung)
- Large talent pool (many developers know Angular)
- Long-term support (predictable release cycle)

---

## 7. PostgreSQL Database

### 7.1. What PostgreSQL Actually Is

**Common Misconception:** "PostgreSQL is just a SQL database"

**Reality:** PostgreSQL is an object-relational database with: JSONB, full-text search, geospatial data, custom types, and extensibility.

### 7.2. Core PostgreSQL Concepts

#### 1. ACID Transactions

```sql
-- Transaction: All or nothing
BEGIN;
  -- 1. Deduct inventory
  UPDATE products SET stock = stock - 1 WHERE id = 123;

  -- 2. Create sale
  INSERT INTO sales (product_id, quantity, amount) VALUES (123, 1, 500);

  -- 3. Record payment
  INSERT INTO transactions (sale_id, status) VALUES (456, 'CONFIRMED');
COMMIT;
-- If ANY step fails, ALL steps roll back
```

#### ACID Guarantees

- **Atomicity:** All or nothing (no partial updates)
- **Consistency:** Database always in valid state
- **Isolation:** Concurrent transactions don't interfere
- **Durability:** Committed data survives crashes

#### 2. Indexes (Performance)

```sql
-- Without index: Full table scan (slow)
SELECT * FROM transactions WHERE business_id = '123';
-- Scans 1,000,000 rows > 500ms

-- With index: Index lookup (fast)
CREATE INDEX idx_transactions_business_id ON transactions(business_id);
SELECT * FROM transactions WHERE business_id = '123';
-- Scans 100 rows > 5ms
```

#### Index Types

```sql
-- B-Tree (default): Equality and range queries
CREATE INDEX idx_amount ON transactions(amount);
SELECT * FROM transactions WHERE amount > 100;

-- Hash: Only equality queries (faster but limited)
CREATE INDEX idx_status ON transactions USING hash(status);
SELECT * FROM transactions WHERE status = 'CONFIRMED';

-- GIN (Generalized Inverted Index): JSONB and full-text search
CREATE INDEX idx_metadata ON transactions USING gin(metadata);
SELECT * FROM transactions WHERE metadata @> '{"country": "MX"}';

-- Partial Index: Index only some rows
CREATE INDEX idx_pending ON transactions(created_at) WHERE status = 'PENDING';
```

#### 3. JSONB (Schema Flexibility)

```sql
-- Store flexible data
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  amount NUMERIC NOT NULL,
  metadata JSONB  -- Can store any JSON
);

-- Query JSONB
INSERT INTO transactions (id, amount, metadata) VALUES (
  uuid_generate_v4(),
  500,
  '{"provider": "Conekta", "reference": "tx_123", "customer": {"email": "user@example.com"}}'
);

-- Query operators
SELECT * FROM transactions WHERE metadata->>'provider' = 'Conekta';
SELECT * FROM transactions WHERE metadata @> '{"provider": "Conekta"}';
SELECT * FROM transactions WHERE metadata->'customer'->>'email' = 'user@example.com';

-- Index JSONB fields
CREATE INDEX idx_provider ON transactions USING gin((metadata->'provider'));
```

#### When to use JSONB

- Payment provider-specific data (varies by provider)
- Webhook payloads (preserve exact structure)
- Feature flags or settings (flexible schema)
- Event logs (different event types)

#### When NOT to use JSONB

- Core business data (use proper columns + foreign keys)
- Frequently queried fields (indexes less efficient)
- Data with relationships (use proper tables)

#### 4. Row-Level Security (Multi-Tenancy)

```sql
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Merchants can only see their own transactions
CREATE POLICY merchant_transactions ON transactions
  FOR SELECT
  USING (business_id = current_setting('app.business_id')::UUID);

-- Application sets context
SET app.business_id = '123e4567-e89b-12d3-a456-426614174000';

-- Now this query only returns merchant's transactions
SELECT * FROM transactions;
-- Automatically adds: WHERE business_id = '123e4567...'
```

#### 5. Full-Text Search

```sql
-- Add tsvector column
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Update search vector
UPDATE products SET search_vector =
  to_tsvector('spanish', name || ' ' || description);

-- Index for fast search
CREATE INDEX idx_search ON products USING gin(search_vector);

-- Search query
SELECT * FROM products
WHERE search_vector @@ to_tsquery('spanish', 'coca cola');

-- Ranked results
SELECT *, ts_rank(search_vector, query) AS rank
FROM products, to_tsquery('spanish', 'coca cola') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

### 7.3. PostgreSQL vs Alternatives

#### MySQL

- Pros: Slightly faster for simple queries, more hosts support it
- Cons: Weaker data integrity, no JSONB, limited features
- Verdict: Use PostgreSQL (better for complex apps)

#### MongoDB (NoSQL)

- Pros: Flexible schema, horizontal scaling
- Cons: No ACID (multi-document), no joins, eventual consistency
- Verdict: Use PostgreSQL with JSONB (same flexibility + ACID)

#### SQLite

- Pros: Zero setup, embedded, perfect for dev
- Cons: No concurrent writes, no network access
- Verdict: Use for testing, not production

#### Why We Choose PostgreSQL

- ACID transactions (critical for payments!)
- JSONB (flexibility when needed)
- Full-text search (product search)
- Mature (30+ years old)
- Open source (no vendor lock-in)

---

## 8. Redis and Caching

### 8.1. What Redis Actually Is

**Common Misconception:** "Redis is just a cache"

**Reality:** Redis is an in-memory data structure server that can be used as: cache, queue, pub/sub, session store, rate limiter, leaderboard, etc.

### 8.2. Core Redis Concepts

#### 1. Data Structures

```redis
# String (most common)
SET payment:123:status "confirmed"
GET payment:123:status
INCR payment:123:retry_count

# Hash (object storage)
HSET user:456 name "John" email "john@example.com" balance 1000
HGET user:456 balance
HINCRBY user:456 balance -100

# List (queue)
LPUSH queue:emails "email1@example.com"
RPOP queue:emails

# Set (unique values)
SADD user:456:permissions "create_payment" "view_reports"
SISMEMBER user:456:permissions "create_payment"

# Sorted Set (leaderboard)
ZADD leaderboard 1000 "merchant1" 2000 "merchant2"
ZRANGE leaderboard 0 9 WITHSCORES  # Top 10
```

#### 2. Caching Strategies

##### Cache-Aside (Lazy Loading)

```typescript
async getPayment(id: string): Promise<Payment> {
  // 1. Check cache
  const cached = await redis.get(`payment:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Cache miss - query database
  const payment = await db.payment.findUnique({ where: { id } });

  // 3. Store in cache
  await redis.set(`payment:${id}`, JSON.stringify(payment), 'EX', 3600);

  return payment;
}
```

##### Write-Through (Eager Loading)

```typescript
async updatePayment(id: string, data: UpdatePaymentDto): Promise<Payment> {
  // 1. Update database
  const payment = await db.payment.update({
    where: { id },
    data,
  });

  // 2. Update cache immediately
  await redis.set(`payment:${id}`, JSON.stringify(payment), 'EX', 3600);

  return payment;
}
```

##### Cache Invalidation

```typescript
async deletePayment(id: string): Promise<void> {
  // 1. Delete from database
  await db.payment.delete({ where: { id } });

  // 2. Invalidate cache
  await redis.del(`payment:${id}`);
  await redis.del(`business:${payment.businessId}:payments`);  // Related cache
}
```

#### 3. Rate Limiting

```typescript
async checkRateLimit(userId: string): Promise<boolean> {
  const key = `rate_limit:${userId}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, 60);  // 60 seconds window
  }

  return current <= 100;  // Max 100 requests per minute
}

// Usage
if (!await checkRateLimit(user.id)) {
  throw new TooManyRequestsException();
}
```

#### 4. Pub/Sub (Real-Time Notifications)

```typescript
// Publisher: Payment confirmed
await redis.publish(
  "payment:confirmed",
  JSON.stringify({
    paymentId: "123",
    businessId: "456",
    amount: 500,
  }),
);

// Subscriber: Listen for payments
redis.subscribe("payment:confirmed", (message) => {
  const data = JSON.parse(message);
  // Notify merchant via WebSocket
  websocketGateway.emit(`business:${data.businessId}`, {
    type: "PAYMENT_CONFIRMED",
    data,
  });
});
```

#### 5. Session Store

```typescript
// Store session
await redis.set(
  `session:${sessionId}`,
  JSON.stringify({ userId, roles, createdAt }),
  "EX",
  86400, // 24 hours
);

// Retrieve session
const session = await redis.get(`session:${sessionId}`);
if (!session) {
  throw new UnauthorizedException("Session expired");
}
```

### 8.3. Redis Persistence Options

#### RDB (Snapshotting)

```text
Save entire dataset to disk periodically
- Pros: Compact, fast restart
- Cons: Can lose minutes of data if crash
- Config: save 900 1  (save after 15min if 1 change)
```

#### AOF (Append-Only File)

```text
Log every write operation
- Pros: Minimal data loss (1 second)
- Cons: Larger files, slower restart
- Config: appendonly yes, appendfsync everysec
```

#### Our Strategy

- Use AOF for critical data (sessions, rate limits)
- Use RDB for cache (okay to lose on crash)
- Persist to PostgreSQL for permanent data

### 8.4. Redis vs Alternatives

#### Memcached

- Pros: Simpler, slightly faster for pure caching
- Cons: Only strings (no data structures), no persistence
- Verdict: Redis is superset of Memcached, use Redis

#### Hazelcast (Distributed cache)

- Pros: Distributed by default, better for huge scale
- Cons: Java-based, heavier, more complex
- Verdict: Overkill for our scale, use Redis

#### DragonflyDB (Redis alternative)

- Pros: 25x faster than Redis, drop-in replacement
- Cons: Newer, less battle-tested
- Verdict: Promising, revisit when mature

#### Why We Choose Redis

- Fast (sub-millisecond latency)
- Versatile (cache, queue, pub/sub, rate limiter)
- Battle-tested (Twitter, GitHub, Airbnb use it)
- Simple (easy to learn and operate)

---

## 9. Summary: Technology Selection Rationale

| Technology      | Why Chosen                                | When to Reconsider                        |
| --------------- | ----------------------------------------- | ----------------------------------------- |
| **Bun**         | Speed, DX, TypeScript support             | Legacy Node.js compatibility issues       |
| **TypeScript**  | Type safety, catches bugs early           | Never (industry standard)                 |
| **NestJS**      | Enforces architecture, batteries included | Microservices (consider lightweight)      |
| **Angular 21+** | Complete framework, enterprise-ready      | Simple sites (overkill)                   |
| **PostgreSQL**  | ACID + JSONB, most versatile              | Pure key-value (use Redis)                |
| **Redis**       | Fast caching, pub/sub, rate limiting      | Persistent primary storage (use Postgres) |
| **Docker**      | Dev-prod parity, easy orchestration       | Single static binary (overkill)           |
| **Prisma**      | Type-safe ORM, great DX                   | Complex queries (raw SQL)                 |
