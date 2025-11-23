<!-- AI-INSTRUCTION: START -->
<!-- 
  This document defines the CONSTRUCTION CHECKLIST.
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
      <h1 style="margin: 0; border-bottom: none;">Construction Rules Checklist</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Quick reference checklist for all construction rules, templates, and patterns</p>
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

*This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document.*

| Directive | Instruction |
| :--- | :--- |
| **Context** | This document is a mandatory checklist for all code construction tasks. |
| **Constraint** | Verify every generated file against the specific checklist for its type. |
| **Pattern** | Use the "Critical Rules" section to validate safety and security. |
| **Related** | `docs/process/workflow/DEVELOPMENT-RULES.md` |

---

## 1. Before Starting ANY Task

- [ ] Read ticket/issue completely
- [ ] Understand acceptance criteria
- [ ] Identify affected modules
- [ ] Review relevant documentation
- [ ] Estimate complexity (S/M/L/XL)
- [ ] Create feature branch: `<type>/<ticket-id>-<description>`

---

## 2. Module Structure Checklist

When creating a new module, ensure it has:

```
modules/feature-name/
├── [ ] feature-name.module.ts
├── [ ] feature-name.controller.ts
├── [ ] feature-name.service.ts
├── [ ] feature-name.repository.ts (if complex queries)
├── dto/
│   ├── [ ] create-feature.dto.ts
│   ├── [ ] update-feature.dto.ts
│   └── [ ] feature-response.dto.ts
├── entities/
│   └── [ ] feature.entity.ts
├── interfaces/
│   └── [ ] feature.interface.ts
├── exceptions/
│   └── [ ] feature.exception.ts (if custom exceptions)
├── events/
│   ├── [ ] feature.events.ts (if events)
│   └── [ ] feature.listener.ts (if listeners)
└── tests/
    ├── [ ] feature.service.spec.ts
    ├── [ ] feature.controller.spec.ts
    └── [ ] feature.e2e-spec.ts
```

---

## 3. Service Method Checklist

Every service method MUST have:

```typescript
/**
 * [ ] JSDoc comment with description
 * [ ] @param for each parameter
 * [ ] @returns description
 * [ ] @throws for exceptions
 * [ ] @example with usage
 */
async methodName(param1: string, param2: number): Promise<ReturnType> {
  // [ ] 1. VALIDATE INPUT
  // [ ] 2. CHECK PERMISSIONS (if applicable)
  // [ ] 3. BUSINESS LOGIC
  // [ ] 4. SIDE EFFECTS (after success)
  // [ ] 5. ERROR HANDLING with logging
}
```

**Checklist:**
- [ ] Method has JSDoc comment
- [ ] All parameters documented
- [ ] Return type documented
- [ ] Exceptions documented
- [ ] Example provided
- [ ] Input validation present
- [ ] Permission checks (if needed)
- [ ] Error handling with logging
- [ ] Side effects are async (events)

---

## 4. Controller Endpoint Checklist

Every controller endpoint MUST have:

```typescript
/**
 * [ ] JSDoc comment
 */
@Post()                                           // [ ] HTTP method decorator
@UseGuards(JwtAuthGuard)                          // [ ] Auth guard (if needed)
@ApiBearerAuth()                                  // [ ] Bearer auth (if needed)
@ApiOperation({ summary: '...' })                 // [ ] Operation summary
@ApiResponse({ status: 201, ... })                // [ ] Success response
@ApiResponse({ status: 400, ... })                // [ ] Error responses
async create(
  @Body() dto: CreateDto,                         // [ ] DTO validation
  @CurrentUser() user: User,                      // [ ] Current user (if needed)
): Promise<ResponseDto> {
  this.logger.log(`...`);                         // [ ] Logging
  const result = await this.service.create(...);  // [ ] Service call
  return new ResponseDto(result);                 // [ ] Response DTO
}
```

**Checklist:**
- [ ] HTTP method decorator
- [ ] Auth guard if protected
- [ ] Swagger decorators
- [ ] Success response documented
- [ ] Error responses documented
- [ ] DTO validation
- [ ] Logging statement
- [ ] Service call
- [ ] Response DTO returned

---

## 5. DTO Checklist

Every DTO MUST have:

```typescript
/**
 * [ ] JSDoc comment describing DTO purpose
 */
export class CreateResourceDto {
  /**
   * [ ] JSDoc for each field
   * [ ] @example with real value
   */
  @ApiProperty({
    description: '...',  // [ ] Description
    example: '...',      // [ ] Example
    minLength: 3,        // [ ] Constraints (if applicable)
  })
  @IsString()            // [ ] Type validator
  @Length(3, 100)        // [ ] Length/range validators
  name: string;
}
```

**Checklist:**
- [ ] Class JSDoc comment
- [ ] Each field has JSDoc
- [ ] Each field has @example
- [ ] ApiProperty decorator with description
- [ ] ApiProperty has example
- [ ] ApiProperty has constraints
- [ ] class-validator decorators
- [ ] Appropriate validators for type

---

## 6. Component Checklist (Angular)

Every component MUST have:

```typescript
/**
 * [ ] JSDoc comment with component purpose
 * [ ] @example showing usage
 */
@Component({
  selector: 'app-...',           // [ ] Selector with app- prefix
  standalone: true,              // [ ] Standalone
  imports: [...],                // [ ] Imports array
  templateUrl: '...',            // [ ] Template path
  styleUrl: '...',               // [ ] Style path (singular)
})
export class MyComponent {
  // [ ] SERVICES section (inject at top)
  private service = inject(...);

  // [ ] SIGNALS section
  loading = signal(false);
  error = signal<string | null>(null);
  
  // [ ] COMPUTED section
  canSubmit = computed(() => ...);

  // [ ] FORM section (if applicable)
  form = new FormGroup({...});

  // [ ] LIFECYCLE section
  ngOnInit(): void { }

  // [ ] PUBLIC METHODS section
  async onSubmit(): Promise<void> { }

  // [ ] PRIVATE METHODS section
  private helper(): void { }
}
```

**Checklist:**
- [ ] JSDoc comment
- [ ] Standalone component
- [ ] Proper selector (app- prefix)
- [ ] Services injected at top
- [ ] Signals for state
- [ ] Computed values for derived state
- [ ] Form with validators (if applicable)
- [ ] Lifecycle methods
- [ ] Public methods for events
- [ ] Private helpers at bottom

---

## 7. Test Checklist

Every test file MUST have:

```typescript
describe('FeatureName', () => {
  let service: ServiceType;
  let dependency: DependencyType;

  // [ ] Setup with beforeEach
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServiceType,
        { provide: DependencyType, useValue: mockDependency },
      ],
    }).compile();

    service = module.get(ServiceType);
    dependency = module.get(DependencyType);
  });

  // [ ] Cleanup with afterEach
  afterEach(() => {
    jest.clearAllMocks();
  });

  // [ ] Organized by method
  describe('methodName', () => {
    // [ ] Happy path test
    it('should do X successfully', async () => {
      // ARRANGE
      // ACT
      // ASSERT
    });

    // [ ] Error case test
    it('should throw when Y', async () => {
      // ARRANGE
      // ACT & ASSERT
      await expect(...).rejects.toThrow();
    });

    // [ ] Edge case test
    it('should handle edge case Z', async () => {
      // Test edge case
    });
  });
});
```

**Checklist:**
- [ ] describe block for feature/class
- [ ] beforeEach for setup
- [ ] afterEach for cleanup
- [ ] Tests organized by method
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases tested
- [ ] ARRANGE-ACT-ASSERT pattern
- [ ] Mocks for dependencies
- [ ] Coverage >= 80%

---

## 8. Git Workflow Checklist

### 8.1. Before Committing

- [ ] Run tests: `bun test`
- [ ] Run linter: `bun run lint`
- [ ] Check coverage: `bun run test:cov` (>= 80%)
- [ ] Remove console.log statements
- [ ] Remove debugger statements
- [ ] No commented-out code
- [ ] No secrets in code

### 8.2. Commit Message Format

```
<type>(<scope>): <subject>

Examples:
feat(payments): add QR code generation
fix(auth): correct JWT expiration
docs(api): update endpoint docs
```

**Checklist:**
- [ ] Type: feat|fix|docs|style|refactor|test|chore
- [ ] Scope: module name (payments, auth, etc)
- [ ] Subject: imperative mood ("add" not "added")
- [ ] Subject: lowercase
- [ ] Subject: no period at end
- [ ] Subject: <= 72 characters

### 8.3. Before Creating PR

- [ ] All tests pass locally
- [ ] Linter passes
- [ ] Coverage >= 80%
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Self-review completed
- [ ] Checked entire diff

---

## 9. Code Review Checklist

### 9.1. For Reviewer

**Functionality:**
- [ ] Code does what PR says
- [ ] Edge cases handled
- [ ] Error handling appropriate
- [ ] No obvious bugs

**Design:**
- [ ] Follows established patterns
- [ ] No code duplication
- [ ] Appropriate abstraction
- [ ] Single Responsibility Principle

**Testing:**
- [ ] Tests cover functionality
- [ ] Tests cover errors
- [ ] Coverage >= 80%
- [ ] Tests are readable

**Documentation:**
- [ ] JSDoc for public APIs
- [ ] Inline comments for complex logic
- [ ] README updated (if needed)
- [ ] API docs updated (if endpoints changed)

**Security:**
- [ ] No secrets in code
- [ ] Input validation present
- [ ] Authorization checks present
- [ ] SQL injection prevented
- [ ] XSS prevention

**Performance:**
- [ ] No N+1 queries
- [ ] Indexes used appropriately
- [ ] Large ops paginated
- [ ] No blocking ops in critical path

**Style:**
- [ ] Linter passes
- [ ] Consistent naming
- [ ] No commented code
- [ ] No console.log

---

## 10. Pattern Usage Checklist

### 10.1. When to Use Factory Pattern

- [ ] Need to create objects based on runtime condition
- [ ] Multiple implementations of same interface
- [ ] Example: Payment provider selection by country

### 10.2. When to Use Repository Pattern

- [ ] Complex database queries
- [ ] Reusable query logic
- [ ] Need to mock data layer
- [ ] Example: Analytics with aggregations

### 10.3. When to Use Adapter Pattern

- [ ] Wrapping external API
- [ ] Need consistent interface
- [ ] Want to swap providers
- [ ] Example: SMS provider (Twilio, SNS)

### 10.4. When to Use Strategy Pattern

- [ ] Interchangeable algorithms
- [ ] Behavior varies by type
- [ ] Example: Payment methods (QR, Link, Transfer)

### 10.5. When to Use Observer Pattern

- [ ] One-to-many notifications
- [ ] Side effects after event
- [ ] Non-blocking updates
- [ ] Example: Payment confirmed triggers

### 10.6. When to Use CQRS

- [ ] Separate read/write optimization
- [ ] Complex reporting queries
- [ ] Different scaling needs
- [ ] Example: Transaction writes vs reports

---

## 11. Critical Rules (NEVER BREAK)

### 11.1. Backend

- [ ] NEVER call payment gateway directly - use factory
- [ ] NEVER hardcode secrets - use environment variables
- [ ] NEVER skip error handling - log and rethrow
- [ ] NEVER use `any` type - use `unknown` or proper types
- [ ] NEVER skip input validation - use DTOs
- [ ] NEVER expose sensitive data in responses
- [ ] NEVER skip authentication checks
- [ ] NEVER commit secrets to git

### 11.2. Frontend

- [ ] NEVER use NgModules - use standalone
- [ ] NEVER mutate signals - use .set() or .update()
- [ ] NEVER skip form validation
- [ ] NEVER expose API keys in frontend
- [ ] NEVER skip error handling
- [ ] NEVER use Zone.js (zoneless mode)
- [ ] NEVER skip loading states

### 11.3. Database

- [ ] NEVER skip migrations - use Prisma migrate
- [ ] NEVER use raw SQL - use Prisma
- [ ] NEVER skip indexes on foreign keys
- [ ] NEVER skip unique constraints
- [ ] NEVER hard delete - use soft delete (deletedAt)
- [ ] NEVER expose database errors to user

### 11.4. Testing

- [ ] NEVER skip tests for new code
- [ ] NEVER skip error case tests
- [ ] NEVER skip edge case tests
- [ ] NEVER mock everything - test integration points
- [ ] NEVER commit failing tests

---

## 12. Daily Development Checklist

### 12.1. Morning

- [ ] Pull latest main: `git pull origin main`
- [ ] Install dependencies: `bun install`
- [ ] Start services: `docker-compose -f docker-compose.dev.yml up -d`
- [ ] Run migrations: `bun run db:migrate`
- [ ] Start dev servers: `bun run dev`
- [ ] Check tests pass: `bun test`

### 12.2. During Development

- [ ] Write failing test first
- [ ] Implement minimum code
- [ ] Make test pass
- [ ] Refactor if needed
- [ ] Commit with conventional message
- [ ] Push to feature branch

### 12.3. Before Leaving

- [ ] All tests passing
- [ ] No uncommitted changes (or commit WIP)
- [ ] Update ticket/issue status
- [ ] Document any blockers

---

## 13. Pre-Deployment Checklist

### 13.1. Staging Deployment

- [ ] All tests pass in CI
- [ ] No security vulnerabilities
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Smoke tests pass
- [ ] Rollback plan ready

### 13.2. Production Deployment

- [ ] Staging deployment successful
- [ ] Full test suite passes
- [ ] Performance testing done
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Backup verified
- [ ] Rollback plan tested
- [ ] Team notified
- [ ] Documentation updated

---

## 14. Quick Reference: Common Commands

```bash
# Development
bun run dev                    # Start all dev servers
bun run build                  # Build all packages
bun test                       # Run all tests
bun run lint                   # Run linter
bun run test:cov               # Check coverage

# Database
bun run db:migrate             # Run migrations
bun run db:seed                # Seed database
bun run db:studio              # Open Prisma Studio
bun run db:reset               # Reset database

# Docker
docker-compose -f docker-compose.dev.yml up -d     # Start services
docker-compose -f docker-compose.dev.yml down      # Stop services
docker-compose -f docker-compose.dev.yml logs -f   # View logs

# Git
git checkout -b feat/TICKET-description    # Create branch
git add .                                  # Stage changes
git commit -m "feat(scope): message"       # Commit
git push origin feat/TICKET-description    # Push
```