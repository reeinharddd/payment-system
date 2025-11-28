---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "testing-strategy"  # REQUIRED: Type identifier for MCP/RAG
module: "[module-name]"  # REQUIRED: e.g., "inventory", "sales", "payments", "e2e"
status: "approved"  # REQUIRED: draft | in-review | approved | deprecated
version: "1.0.0"  # REQUIRED: Semantic versioning (Major.Minor.Patch)
last_updated: "YYYY-MM-DD"  # REQUIRED: ISO date format
author: "@username"  # REQUIRED: GitHub username or team

# Keywords for semantic search (5-10 keywords)
keywords:
  - "testing"
  - "qa"
  - "quality-assurance"
  - "test-strategy"
  - "[test-type]"  # e.g., "unit", "integration", "e2e", "performance"
  - "[tool]"  # e.g., "jest", "playwright", "k6"
  - "automation"
  - "ci-cd"

# Related documentation
related_docs:
  database_schema: ""  # Path to DB schema (for integration tests)
  api_design: ""  # Path to API design (for API tests)
  feature_design: ""  # Path to feature design
  ux_flow: ""  # Path to UX flow (for E2E tests)

# Testing-specific metadata
testing_metadata:
  coverage_target: 80  # Percentage (e.g., 80 for 80%)
  test_types: []  # e.g., ["unit", "integration", "e2e", "performance", "security"]
  tools: []  # e.g., ["jest", "playwright", "k6", "supertest"]
  automation_level: "full"  # "none" | "partial" | "full"
  ci_integration: true  # Whether tests run in CI/CD pipeline
  test_environments: []  # e.g., ["local", "staging", "production"]
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document is a TEMPLATE for Testing Strategy Documentation.

  PURPOSE: Define testing approach, coverage targets, and quality standards ONLY.

  CRITICAL RULES:
  1. NO test implementation code (actual test files)
  2. NO feature implementation details (use Feature Design docs)
  3. NO infrastructure setup (use Deployment Runbook)
  4. FOCUS ON: Test strategy, coverage targets, test types, tools, automation approach

  WHERE TO DOCUMENT OTHER ASPECTS:
  - Test Code → apps/*/test/ directories with .spec.ts files
  - Feature Logic → docs/technical/backend/features/ or docs/technical/frontend/features/
  - CI/CD Setup → docs/technical/infrastructure/ or Deployment Runbook
  - Bug Reports → GitHub Issues

  Keep this document as the Single Source of Truth for TESTING STRATEGY only.
-->
<!-- AI-INSTRUCTION: END -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="120" align="center" valign="middle">
      <img src="../../libs/assets/src/images/logo.png" width="80" alt="Project Logo" />
    </td>
    <td align="left" valign="middle">
      <h1 style="margin: 0; border-bottom: none;">Testing Strategy: [Module/Feature Name]</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Quality Assurance & Test Coverage Strategy</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Approved-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Coverage%20Target-80%25-green?style=flat-square" alt="Coverage" />
  <img src="https://img.shields.io/badge/Last%20Updated-YYYY--MM--DD-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                      |
| :------------- | :------------------------------------------------------------------------------- |
| **Context**    | This document defines the testing strategy for [Module/Feature Name].            |
| **Scope**      | ONLY test strategy, coverage targets, test types, tools, and automation approach. |
| **Constraint** | NO test implementation code, NO feature logic, NO CI/CD infrastructure details.   |
| **Related**    | [Feature Design], [API Design], [Database Schema]                                |
| **Pattern**    | Test Pyramid (70% Unit, 20% Integration, 10% E2E), CI/CD integration.            |

---

## 1. Executive Summary

_High-level overview of testing strategy._

**Module/Feature:** [e.g. "Inventory Management System"]

**Testing Approach:** [e.g. "Automated testing with CI/CD integration, TDD for critical paths"]

**Key Objectives:**

- [Objective 1: e.g. "Maintain 80% code coverage across backend services"]
- [Objective 2: e.g. "Automated E2E tests for all critical user journeys"]
- [Objective 3: e.g. "Performance testing to ensure <200ms API response times"]

**Coverage Targets:**

| Test Type    | Coverage Target | Current Coverage | Status     |
| :----------- | :-------------- | :--------------- | :--------- |
| Unit         | 80%             | TBD              | PENDING    |
| Integration  | 70%             | TBD              | PENDING    |
| E2E          | 100% (critical) | TBD              | PENDING    |
| Performance  | N/A             | TBD              | PENDING    |

---

## 2. Test Pyramid Strategy

### 2.1. Overview

We follow the **Test Pyramid** approach to balance speed, cost, and confidence:

```text
           /\
          /  \    E2E Tests (10%)
         /----\   ← Slow, expensive, high confidence
        /      \
       /--------\ Integration Tests (20%)
      /          \ ← Moderate speed, moderate cost
     /------------\
    /______________\ Unit Tests (70%)
                    ← Fast, cheap, focused
```

**Rationale:**

- **Unit Tests (70%):** Fast feedback, isolated testing, easy to maintain
- **Integration Tests (20%):** Verify module interactions, database queries, API contracts
- **E2E Tests (10%):** Critical user journeys, cross-system validation

---

## 3. Test Types & Coverage

### 3.1. Unit Tests

**Purpose:** Test individual functions, methods, and components in isolation.

**Scope:**

- Business logic in services
- Utility functions and helpers
- Component logic (Angular)
- DTOs and validators

**Tools:**

- **Backend:** Jest + ts-jest
- **Frontend:** Jasmine + Karma

**Coverage Target:** 80% minimum

**Example Test Cases:**

```typescript
describe('ProductService', () => {
  describe('calculateAverageCost', () => {
    it('should calculate weighted average cost correctly', () => {
      // Test implementation
    });

    it('should throw error when quantity is zero', () => {
      // Test implementation
    });
  });
});
```

**Conventions:**

- Test files named `*.spec.ts` next to source files
- Use `describe` blocks for organization
- Mock all external dependencies (DB, HTTP, etc.)
- AAA pattern: Arrange → Act → Assert

---

### 3.2. Integration Tests

**Purpose:** Test interactions between modules, database queries, and API endpoints.

**Scope:**

- API endpoint responses (controller + service + database)
- Database queries and transactions
- External API integrations (mocked)
- Multi-module workflows

**Tools:**

- **Backend:** Jest + Supertest + In-memory PostgreSQL (pg-mem)
- **Database:** Prisma with test database

**Coverage Target:** 70% of integration points

**Example Test Cases:**

```typescript
describe('POST /api/v1/products', () => {
  it('should create product with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/products')
      .send({ name: 'Test Product', price: 100 })
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });

  it('should return 400 for invalid data', async () => {
    // Test implementation
  });
});
```

**Conventions:**

- Test files in `test/integration/` directory
- Use real database (test environment)
- Clean database between tests
- Test happy path + error scenarios

---

### 3.3. End-to-End (E2E) Tests

**Purpose:** Test complete user journeys from UI to database.

**Scope:**

- Critical user flows (checkout, inventory update, sales)
- Cross-browser compatibility
- Mobile responsive behavior
- Offline/online sync scenarios

**Tools:**

- **Frontend:** Playwright
- **Environment:** Staging environment (isolated)

**Coverage Target:** 100% of critical user journeys

**Critical Flows:**

1. **Inventory Management:**
   - Scan barcode → Identify product → Update stock → Sync to server
2. **Sales:**
   - Add products to cart → Apply discount → Process payment → Generate receipt
3. **Authentication:**
   - Login → Verify JWT → Access protected resources → Logout

**Example Test:**

```typescript
test('User can add product via barcode scanning', async ({ page }) => {
  await page.goto('/inventory');
  await page.click('[data-testid="scan-barcode"]');
  await page.fill('[data-testid="barcode-input"]', '7501234567890');
  await page.click('[data-testid="confirm-button"]');

  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

**Conventions:**

- Test files in `apps/merchant-web/e2e/`
- Use `data-testid` attributes for stable selectors
- Run on staging environment (not production)
- Parallel execution for speed

---

### 3.4. Performance Tests

**Purpose:** Ensure system meets performance requirements under load.

**Scope:**

- API response times (<200ms for 95th percentile)
- Database query performance
- Concurrent user handling (100+ simultaneous users)
- Memory and CPU usage

**Tools:**

- **Load Testing:** k6
- **Profiling:** Node.js Profiler, Chrome DevTools

**Performance Targets:**

| Metric                  | Target       | Measurement Method |
| :---------------------- | :----------- | :----------------- |
| API Response Time (p95) | <200ms       | k6 load test       |
| API Response Time (p99) | <500ms       | k6 load test       |
| Database Query Time     | <50ms        | Prisma logging     |
| Frontend Load Time      | <2s          | Lighthouse         |
| Memory Usage (Node)     | <512MB       | Node.js profiler   |

**Example Load Test:**

```javascript
// k6 script
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200'], // 95% requests under 200ms
  },
};

export default function () {
  const res = http.get('http://api.example.com/products');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

---

### 3.5. Security Tests

**Purpose:** Identify vulnerabilities and ensure compliance with security standards.

**Scope:**

- Authentication/Authorization bypass attempts
- SQL injection protection
- XSS prevention
- CSRF protection
- Dependency vulnerability scanning

**Tools:**

- **SAST:** ESLint security plugins, Semgrep
- **DAST:** OWASP ZAP (manual)
- **Dependency Scan:** npm audit, Snyk

**Security Checklist:**

- [ ] SQL injection: All queries use parameterized statements (Prisma)
- [ ] XSS: Angular sanitizes all user inputs automatically
- [ ] CSRF: CSRF tokens on state-changing operations
- [ ] Auth: JWT tokens expire after 24 hours
- [ ] Secrets: No hardcoded credentials (use .env)
- [ ] Dependencies: No critical vulnerabilities in npm audit

---

## 4. Test Data Management

### 4.1. Test Database Strategy

**Approach:** Isolated test database per test suite

**Setup:**

- Use Docker container for PostgreSQL test instance
- Prisma migrations run before tests
- Seed data loaded from `prisma/seed.test.ts`

**Cleanup:**

- Truncate tables after each test suite
- Reset sequences and auto-increment IDs
- Clear Redis cache (if used)

**Example Seed Data:**

```typescript
// prisma/seed.test.ts
export async function seedTestData(prisma: PrismaClient) {
  await prisma.business.create({
    data: {
      id: 'test-business-001',
      name: 'Test Store',
      // ...
    },
  });

  await prisma.product.createMany({
    data: [
      { id: 'prod-001', name: 'Test Product 1', price: 100 },
      { id: 'prod-002', name: 'Test Product 2', price: 200 },
    ],
  });
}
```

---

### 4.2. Test Fixtures & Mocks

**Fixtures:** Predefined test data in JSON/TypeScript files

**Location:** `test/fixtures/`

**Example:**

```typescript
// test/fixtures/products.fixture.ts
export const mockProducts = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Sabritas Adobadas 45g',
    barcode: '7501234567890',
    price: 15.50,
  },
  // ...
];
```

**Mocking Strategy:**

- **External APIs:** Mock with MSW (Mock Service Worker)
- **Database:** Use in-memory database (pg-mem) for unit tests
- **Time:** Mock with `jest.useFakeTimers()`

---

## 5. CI/CD Integration

### 5.1. GitHub Actions Pipeline

**Trigger:** On every push and pull request

**Pipeline Stages:**

```yaml
name: Test Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: bun install

      - name: Run linters
        run: bun run lint

      - name: Run unit tests
        run: bun run test:unit --coverage

      - name: Run integration tests
        run: bun run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

**Quality Gates:**

- All tests must pass
- Coverage must be ≥80%
- No linting errors
- No critical security vulnerabilities

---

### 5.2. Pre-Commit Hooks

**Tool:** Husky + lint-staged

**Configuration:**

```json
// package.json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

**Hooks:**

- `pre-commit`: Run linter and related tests
- `pre-push`: Run full test suite (optional)

---

## 6. Test Maintenance

### 6.1. Flaky Test Management

**Strategy:**

- Identify flaky tests with retry logic
- Fix root cause (timing issues, race conditions)
- Quarantine if unfixable (mark with `.skip`)

**Detection:**

```typescript
// Run tests 10 times to detect flakiness
test.only.concurrent.each(Array(10).fill(null))('stability test', async () => {
  // Test logic
});
```

---

### 6.2. Test Review Checklist

Before merging:

- [ ] All new features have tests
- [ ] Tests follow naming conventions
- [ ] No commented-out tests
- [ ] No `.only` or `.skip` (unless documented)
- [ ] Test coverage meets target (80%)
- [ ] Tests run in CI/CD successfully

---

## 7. Testing Best Practices

### 7.1. Dos and Don'ts

**DO:**

- Write tests before code (TDD for critical features)
- Test behavior, not implementation
- Use descriptive test names
- Keep tests fast (<1s per unit test)
- Mock external dependencies

**DON'T:**

- Test framework code (e.g., Angular internals)
- Depend on test execution order
- Share state between tests
- Test private methods directly
- Use sleep/wait (use proper async/await)

---

### 7.2. Code Examples

**Good Test:**

```typescript
describe('ProductService.createProduct', () => {
  it('should create product and return ID when data is valid', async () => {
    const productData = { name: 'Test', price: 100 };
    const result = await service.createProduct(productData);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test');
  });
});
```

**Bad Test:**

```typescript
it('should work', async () => {
  const result = await service.doSomething();
  expect(result).toBeTruthy(); // Too vague
});
```

---

## 8. Performance Benchmarks

| Operation                   | Target   | Current | Status |
| :-------------------------- | :------- | :------ | :----- |
| Unit Test Suite             | <10s     | TBD     | PENDING |
| Integration Test Suite      | <30s     | TBD     | PENDING |
| E2E Test Suite              | <5min    | TBD     | PENDING |
| API Response (GET /products) | <100ms   | TBD     | PENDING |
| Database Query (complex)    | <50ms    | TBD     | PENDING |

---

## 9. Related Documentation

- [Feature Design: Inventory Management](../backend/features/INVENTORY-FEATURE.md)
- [API Design: Products API](../backend/api/PRODUCTS-API.md)
- [Deployment Runbook](./08-DEPLOYMENT-RUNBOOK.md)
- [Security Audit](./09-SECURITY-AUDIT.md)

---

## Appendix A: Change Log

| Date       | Version | Author | Changes                    |
| :--------- | :------ | :----- | :------------------------- |
| YYYY-MM-DD | 1.0.0   | @QA    | Initial testing strategy   |

---

## Appendix B: Tool References

- **Jest:** https://jestjs.io/
- **Playwright:** https://playwright.dev/
- **k6:** https://k6.io/
- **Supertest:** https://github.com/visionmedia/supertest
- **MSW:** https://mswjs.io/
