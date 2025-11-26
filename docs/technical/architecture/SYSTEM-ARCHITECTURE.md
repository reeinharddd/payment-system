<!--
  ~ SYSTEM ARCHITECTURE
  ~ ============================================================================
  ~
  ~ This document defines the high-level architecture of the system, including
  ~ the technology stack, core modules, data model, and critical flows.
  ~
  ~ ----------------------------------------------------------------------------
  ~
  ~ GUIDELINES:
  ~ - Keep the architecture diagrams up to date.
  ~ - Document any major architectural changes.
  ~ - Ensure the technology stack reflects the current implementation.
  ~
  ~ ============================================================================
  -->

# System Architecture

<div align="center">

![System Architecture](https://img.shields.io/badge/System-Architecture-blue?style=for-the-badge&logo=architecture)
![Status Active](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Last Updated](https://img.shields.io/badge/Last%20Updated-October%202025-lightgrey?style=for-the-badge)

</div>

Local payment system designed to modernize small businesses without expensive infrastructure. Single codebase supporting multiple countries by swapping only the payment processing layer.

**Philosophy:** "Not making them pay more, making them earn more"

---

## 🤖 Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                      |
| :------------- | :------------------------------------------------------------------------------- |
| **Context**    | This document defines the high-level architecture, tech stack, and core modules. |
| **Constraint** | All architectural changes MUST be reflected here first.                          |
| **Pattern**    | Follow the 'Modular Monolith' pattern defined in the text.                       |
| **Related**    | `docs/technical/backend/DATABASE-DESIGN.md`                                      |

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Multi-Country Design](#multi-country-design)
- [Core Modules](#core-modules)
- [Data Model](#data-model)
- [Critical Flows](#critical-flows)
- [Security](#security)

---

## Overview

### Core Value Proposition

**For Merchants:**

- Immediate payment collection (QR, NFC, links)
- Simplified management (inventory, sales, reports, invoices)
- Business insights (analytics, predictions, cash control)
- Transparent pricing (low, clear commissions)

**For Customers:**

- Fast payments with any bank account
- Automatic receipts and invoices
- Financial control (categorized expense history)
- Rewards (discounts, points, cashback)

### Strategic Objectives

- Digitize traditional businesses while preserving their essence
- Democratize professional financial tools
- Create mutual value network between merchants and customers
- Reduce technological and economic entry barriers
- **Support Offline-First operations for business continuity**

---

## Technology Stack

### Backend

- **Runtime:** Bun 1.0+
- **Framework:** NestJS 10+
- **Language:** TypeScript 5.3+ (strict mode)
- **ORM:** Prisma 5+
- **Database:** PostgreSQL 16+
- **Cache/Queue:** Redis 7+ with Bull MQ
- **Authentication:** Passport.js + JWT
- **Validation:** class-validator + class-transformer
- **Testing:** Jest + Supertest
- **Documentation:** Swagger/OpenAPI (auto-generated)

### Frontend (PWA)

- **Framework:** Angular 19+
- **Architecture:** Progressive Web App (PWA)
- **Offline Storage:** IndexedDB (via Dexie.js)
- **Sync Strategy:** Background Sync with Conflict Resolution
- **Components:** Standalone (no NgModules)
- **Features:** Signals, control flow syntax, inject()
- **State:** NgRx Signal Store
- **UI:** Angular Material 18+ or PrimeNG
- **Forms:** Reactive Forms with typed validators
- **HTTP:** HttpClient with interceptors
- **Testing:** Jasmine/Karma + Playwright

### Infrastructure

- **Containerization:** Docker + Docker Compose (Base image: `oven/bun:1`)
- **Orchestration:** Kubernetes (production)
- **CI/CD:** GitHub Actions
- **Monitoring:** Grafana + Prometheus + Loki
- **APM:** OpenTelemetry + Jaeger

### Quality Tools

- **Linting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged
- **Commits:** Conventional Commits
- **Coverage:** 80% minimum

---

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph Presentation Layer
        WebApp[Web Application<br/>Angular 19]
        MobileApp[Mobile Application<br/>Ionic + Angular]
        Dashboard[Admin Dashboard]
    end

    subgraph API Layer
        Gateway[API Gateway<br/>JWT Auth, Rate Limiting]
    end

    subgraph Business Logic Layer
        Auth[Auth Module<br/>Login, KYC, Roles]
        Payment[Payment Module<br/>Multi-Country Abstraction]
        Business[Business Module<br/>Merchants, Branches]
        Sales[Sales Module<br/>Transactions, Cash Register]
        Billing[Billing Module<br/>Invoices, Receipts]
        Inventory[Inventory Module<br/>Products, Stock, Recipes]
        Notifications[Notifications Module<br/>SMS, Email, Push]
        Analytics[Analytics Module<br/>Reports, Metrics]
    end

    subgraph Data Layer
        DB[(PostgreSQL<br/>Primary Data)]
        Cache[(Redis<br/>Cache + Queue)]
    end

    subgraph External Integrations
        PaymentGateways[Payment Gateways<br/>Conekta, PayU, MercadoPago]
        FiscalServices[Fiscal Services<br/>SAT, DIAN, AFIP]
        CommsProviders[Communications<br/>Twilio, SendGrid, Firebase]
    end

    WebApp --> Gateway
    MobileApp --> Gateway
    Dashboard --> Gateway

    Gateway --> Auth
    Gateway --> Payment
    Gateway --> Business
    Gateway --> Sales
    Gateway --> Billing

    Payment --> PaymentGateways
    Billing --> FiscalServices
    Notifications --> CommsProviders

    Auth --> DB
    Payment --> DB
    Business --> DB
    Sales --> DB
    Billing --> DB

    Payment --> Cache
    Notifications --> Cache
    Auth --> Cache
```

### Module Communication

```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Payment
    participant Billing
    participant Notification
    participant Queue

    Client->>Gateway: POST /payments/create
    Gateway->>Payment: createPaymentIntent()
    Payment->>Payment: Save to DB
    Payment-->>Gateway: Payment ID + QR
    Gateway-->>Client: 201 Created

    Note over Payment,Queue: Async processing

    Payment->>Queue: Publish payment.confirmed
    Queue->>Billing: Generate invoice
    Queue->>Notification: Send SMS/Email

    Billing->>Client: WebSocket: invoice_ready
    Notification->>Client: SMS: Receipt link
```

---

## Multi-Country Design

### Payment Abstraction Pattern

Strategy + Factory pattern enables same application to operate in multiple countries by swapping only the payment provider layer.

```mermaid
graph TB
    subgraph Business Logic - Country Agnostic
        Service[Payment Service<br/>Orchestration Logic]
        Factory[Payment Provider Factory<br/>Country-based Injection]
    end

    subgraph Payment Provider Interface
        Interface[IPaymentProvider<br/>Common Contract]
    end

    subgraph Country Adapters
        MX[Mexico Adapter<br/>Conekta + SPEI]
        CO[Colombia Adapter<br/>PayU + PSE]
        AR[Argentina Adapter<br/>MercadoPago]
        CL[Chile Adapter<br/>Khipu]
    end

    subgraph External Gateways
        Conekta[Conekta API]
        PayU[PayU API]
        MP[MercadoPago API]
        Khipu[Khipu API]
    end

    Service --> Factory
    Factory --> Interface
    Interface --> MX
    Interface --> CO
    Interface --> AR
    Interface --> CL

    MX --> Conekta
    CO --> PayU
    AR --> MP
    CL --> Khipu
```

### Provider Interface

All payment providers implement this interface:

```typescript
interface IPaymentProvider {
  readonly country: string;
  readonly currency: string;
  readonly supportedMethods: PaymentMethod[];

  createPaymentIntent(params: CreatePaymentDTO): Promise<PaymentIntent>;
  generateQRCode(intentId: string): Promise<QRCodeData>;
  generatePaymentLink(intentId: string): Promise<string>;
  confirmPayment(intentId: string): Promise<PaymentConfirmation>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;
}
```

### Factory Implementation

```typescript
@Injectable()
export class PaymentProviderFactory {
  constructor(
    @Inject("PAYMENT_PROVIDERS")
    private providers: Map<string, IPaymentProvider>,
  ) {}

  getProvider(country: string): IPaymentProvider {
    const provider = this.providers.get(country.toUpperCase());
    if (!provider) {
      throw new UnsupportedCountryException(country);
    }
    return provider;
  }
}
```

### Country-Specific Configuration

```typescript
// config/payment.config.ts
export default {
  MX: {
    adapter: "ConektaPaymentProvider",
    apiKey: process.env.CONEKTA_API_KEY,
    webhookSecret: process.env.CONEKTA_WEBHOOK_SECRET,
    features: ["qr", "spei", "oxxo"],
  },
  CO: {
    adapter: "PayUPaymentProvider",
    apiKey: process.env.PAYU_API_KEY,
    merchantId: process.env.PAYU_MERCHANT_ID,
    features: ["qr", "pse", "card"],
  },
  // ... other countries
};
```

---

## Core Modules

### Authentication Module

**Responsibilities:**

- User registration and login
- JWT token management (access + refresh)
- Role-based access control (RBAC)
- Progressive KYC verification
- Session management

**KYC Levels:**

- Level 0: Phone only - $500/day limit
- Level 1: + ID document - $5,000/day limit
- Level 2: + Address proof + tax data - Unlimited + invoicing

### Payment Module

**Responsibilities:**

- Payment intent creation
- QR code generation (static/dynamic)
- Payment link generation
- Webhook processing
- Transaction state management
- Provider coordination

**Structure:**

```
src/modules/payments/
├── payments.module.ts
├── payments.controller.ts
├── payments.service.ts
├── interfaces/
│   └── payment-provider.interface.ts
├── factories/
│   └── payment-provider.factory.ts
├── providers/
│   ├── mexico/conekta-provider.service.ts
│   ├── colombia/payu-provider.service.ts
│   └── argentina/mercadopago-provider.service.ts
├── dto/
│   ├── create-payment.dto.ts
│   └── payment-intent.dto.ts
└── entities/
    └── transaction.entity.ts
```

### Business Module

**Responsibilities:**

- Merchant registration and management
- Branch management
- Employee/cashier management
- Business configuration

### Sales Module

**Responsibilities:**

- Sale registration
- Cash register operations
- Shift closures
- Cash reconciliation

### Billing Module

**Responsibilities:**

- Receipt generation (PDF)
- Electronic invoicing (CFDI for Mexico, equivalents for other countries)
- Fiscal compliance per country
- Invoice storage and retrieval

### Inventory Module

**Responsibilities:**

- Product catalog management (Items, Services, Composite)
- Stock tracking (Multi-branch)
- Recipe & Pack management (Product Components)
- Low stock alerts & Overselling detection
- Product categories & Modifiers

### Notifications Module

**Responsibilities:**

- Multi-channel messaging (SMS, Email, Push, WhatsApp)
- Template management
- Async delivery via Bull Queue
- Retry logic

### Analytics Module

**Responsibilities:**

- Real-time dashboards
- Sales reports
- Export functionality (CSV, PDF, Excel)
- Basic ML predictions

---

## Data Model

### Core Entities

```mermaid
erDiagram
    User ||--o{ Business : owns
    Business ||--|{ Branch : has
    Business ||--o{ Product : manages
    Business ||--o{ PaymentMethod : has
    Branch ||--o{ CashRegister : operates
    Branch ||--o{ Transaction : processes
    Transaction ||--o| Invoice : generates
    Sale ||--|{ SaleItem : contains
    Sale ||--o| Transaction : paid_via
    Product ||--o{ SaleItem : sold_in

    User {
        uuid id PK
        string email UK
        string phone UK
        string passwordHash
        enum role
        int kycLevel
        jsonb kycData
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    Business {
        uuid id PK
        uuid ownerId FK
        string legalName
        string taxId UK
        string country
        string industry
        jsonb settings
        boolean isActive
        timestamp createdAt
    }

    Transaction {
        uuid id PK
        uuid businessId FK
        uuid branchId FK
        decimal amount
        string currency
        enum status
        enum paymentMethod
        string country
        string providerAdapter
        jsonb providerData
        timestamp createdAt
        timestamp confirmedAt
    }

    Invoice {
        uuid id PK
        uuid transactionId FK
        string invoiceNumber UK
        enum type
        string uuid
        string country
        jsonb fiscalData
        string pdfUrl
        enum status
        timestamp issuedAt
    }
```

### Key Design Decisions

**UUIDs for Primary Keys:**

- Better for distributed systems
- No sequential disclosure
- Merge-friendly across environments

**JSONB Fields:**

- `providerData`: Store country-specific payment data
- `fiscalData`: Store country-specific fiscal information
- `kycData`: Store progressive verification documents
- `settings`: Store business-specific configurations

**Soft Deletes:**

- All entities include optional `deletedAt` timestamp
- Preserve data for auditing and compliance

**Timestamps:**

- Mandatory `createdAt` and `updatedAt` on all entities
- Specific timestamps for state changes (`confirmedAt`, `issuedAt`, etc.)

---

## Critical Flows

### Flow 1: Payment by Dynamic QR (No Customer App Required)

**Critical Design: Customer uses their existing banking app (BBVA, Santander, Banorte, etc.). No customer onboarding needed.**

```mermaid
sequenceDiagram
    actor Merchant
    participant MerchantApp as Merchant App<br/>(Our App)
    participant API as Our Backend
    participant PaymentService
    participant Factory
    participant Adapter as Country Adapter<br/>(Conekta/PayU/etc)
    participant Gateway as Payment Gateway
    participant DB
    participant WebSocket
    actor Customer
    participant CustomerBank as Customer's Bank App<br/>(Already Installed)

    Merchant->>MerchantApp: Click "Charge"
    MerchantApp->>Merchant: Show amount form
    Merchant->>MerchantApp: Enter $500

    MerchantApp->>API: POST /payments/create-intent
    API->>PaymentService: createPaymentIntent(dto)
    PaymentService->>Factory: getProvider('MX')
    Factory-->>PaymentService: ConektaProvider

    PaymentService->>Adapter: createPaymentIntent()
    Adapter->>Gateway: POST /orders (bank_transfer type)
    Note over Gateway: Generate SPEI QR<br/>(standard format)
    Gateway-->>Adapter: Order + QR data + SPEI reference

    Adapter-->>PaymentService: PaymentIntent
    PaymentService->>DB: INSERT transaction (PENDING)
    PaymentService-->>API: Intent + QR + Link
    API-->>MerchantApp: 201 Created
    MerchantApp->>Merchant: Display QR code

    Note over Merchant,Customer: Merchant shows QR to customer<br/>Customer uses THEIR OWN bank app

    Customer->>CustomerBank: Open bank app<br/>(BBVA, Santander, etc.)
    Customer->>CustomerBank: Scan QR
    Note over CustomerBank: Parse SPEI reference,<br/>amount, merchant info
    CustomerBank->>Customer: Show payment confirmation
    Customer->>CustomerBank: Confirm (biometric/PIN)

    CustomerBank->>Gateway: Execute SPEI transfer
    Gateway->>Gateway: Process payment

    Gateway->>API: POST /webhooks/conekta<br/>(payment.confirmed)
    API->>PaymentService: handleWebhook(event)
    PaymentService->>Adapter: validateSignature()
    PaymentService->>DB: UPDATE transaction (CONFIRMED)
    PaymentService->>DB: UPDATE inventory (if linked)
    PaymentService->>WebSocket: Emit payment.confirmed
    WebSocket->>MerchantApp: Real-time notification
    MerchantApp->>Merchant: Show success + receipt

    Gateway->>CustomerBank: Confirmation
    CustomerBank->>Customer: Show success in bank app

    Note over Customer: Customer never downloaded our app<br/>Used trusted banking app they already have
    Note over Merchant: Merchant got payment + inventory update<br/>+ analytics + customer data (if shared)
```

**Why This Works:**

1. **Open Standards:** QR uses SPEI (Mexico), PSE (Colombia), PIX (Brazil), etc. - all banks support these.
2. **Zero Customer Friction:** Customer already trusts and uses their bank app daily.
3. **Immediate Activation:** Merchant can accept payments from 100% of customers day 1.
4. **No Two-Sided Network:** Don't need to convince customers to download anything.
5. **Lower CAC:** Only acquire merchants ($85), not customers ($0).

**Target Time:** < 30 seconds end-to-end

### Flow 2: Merchant Onboarding

```mermaid
stateDiagram-v2
    [*] --> PhoneRegistration
    PhoneRegistration --> OTPVerification: Send OTP
    OTPVerification --> PhoneRegistration: Invalid code
    OTPVerification --> BusinessInfo: Valid code

    BusinessInfo --> PaymentMethodSetup: Submit data
    PaymentMethodSetup --> Tutorial: QR generated
    Tutorial --> FirstTestPayment: Start tutorial
    FirstTestPayment --> Dashboard: Payment confirmed
    Dashboard --> [*]

    note right of BusinessInfo
        KYC Level 0
        Limit: $500/day
    end note
```

**Steps:**

1. User provides phone number + country
2. System sends OTP via SMS
3. User verifies OTP
4. System creates User (role=MERCHANT, kycLevel=0)
5. User provides business data (name, tax ID, industry)
6. System creates Business + default Branch
7. System generates static QR via PaymentProviderFactory
8. User completes interactive tutorial (test payment)
9. User redirected to dashboard

### Flow 3: Cash Register Closure

```mermaid
flowchart TD
    Start([Open Closure]) --> Select[Select Period/Shift]
    Select --> Calculate[Calculate Totals]
    Calculate --> Display[Display Summary]

    Display --> Decision{Adjustment Needed?}
    Decision -->|Yes| Manual[Manual Adjustment with Note]
    Decision -->|No| Generate[Generate PDF Report]
    Manual --> Generate

    Generate --> Send[Send to Email/Cloud]
    Send --> Close[Mark Register as CLOSED]
    Close --> End([End])

    style Calculate fill:#e1f5fe
    style Generate fill:#e1f5fe
```

**Calculation includes:**

- Total sales
- Cash vs digital payments
- Refunds
- Platform commissions
- Expected vs actual cash
- Discrepancies with notes

---

## Security

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AuthService
    participant DB
    participant Redis

    Client->>API: POST /auth/login
    API->>AuthService: validateCredentials()
    AuthService->>DB: Find user
    DB-->>AuthService: User data
    AuthService->>AuthService: Verify password hash

    AuthService->>AuthService: Generate JWT + Refresh
    AuthService->>Redis: Store refresh token
    AuthService-->>API: Tokens + User
    API-->>Client: 200 OK

    Note over Client: Store tokens securely

    Client->>API: GET /protected (with JWT)
    API->>AuthService: Validate JWT
    AuthService-->>API: Valid + User context
    API-->>Client: Protected resource
```

### Security Requirements

**Transport Security:**

- TLS 1.3 for all communications
- Certificate pinning for mobile apps
- HSTS headers enabled

**Data Security:**

- AES-256 encryption for sensitive data at rest
- No credit card data stored (tokenization only)
- PII encrypted in database

**Authentication:**

- JWT access tokens (15min expiry)
- Refresh tokens (7 day expiry with rotation)
- Multi-device session management
- Account lockout after 5 failed attempts

**Authorization:**

- Role-based access control (RBAC)
- Permission-based guards on endpoints
- Row-level security for multi-tenant data

**Rate Limiting:**

- 100 requests/minute per user
- 1000 requests/minute per IP
- Exponential backoff for retries

**Input Validation:**

- DTO validation with class-validator
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (sanitization + CSP headers)

**Audit Trail:**

- Immutable transaction logs
- User action tracking
- Webhook payload archival

### Compliance

**PCI DSS:**

- No card data storage
- Use payment gateway tokenization
- Secure transmission only

**KYC/AML:**

- Progressive verification levels
- Document storage with encryption
- Compliance with local regulations

**Data Privacy:**

- GDPR/LFPDPPP compliance
- Right to data export
- Right to be forgotten (with transaction preservation)
- Explicit consent management

**Fiscal Compliance:**

- Country-specific electronic invoicing
- Tax calculation per jurisdiction
- Audit-ready reports

---

## MVP Scope

### Phase 1 (1-3 months)

**Included:**

- Merchant registration and login (mobile app)
- Static QR generation
- Payment link creation
- Single payment gateway integration (Stripe or Conekta)
- Webhook payment confirmation
- Simple PDF receipt generation
- Basic sales history
- Simple web dashboard (daily reports)

**Excluded:**

- Advanced inventory management
- Electronic invoicing (SAT/DIAN/AFIP)
- Multi-branch support
- NFC payments
- Complex roles and permissions
- Customer loyalty programs

### Success Metrics

- 3 pilot merchants
- 50+ transactions per merchant in first month
- 95%+ payment success rate
- < 60 seconds average payment time
- NPS > 30

---

## Adding New Country

To add support for a new country (e.g., Chile):

**1. Create Provider:**

```typescript
// src/modules/payments/providers/chile/khipu-provider.service.ts
@Injectable()
export class KhipuPaymentProvider implements IPaymentProvider {
  readonly country = "CL";
  readonly currency = "CLP";
  readonly supportedMethods = ["qr", "bank_transfer"];

  async createPaymentIntent(params: CreatePaymentDTO): Promise<PaymentIntent> {
    // Khipu-specific implementation
  }

  // ... implement other methods
}
```

**2. Register in Module:**

```typescript
// payments.module.ts
{
  provide: 'PAYMENT_PROVIDERS',
  useFactory: () => {
    const map = new Map();
    map.set('MX', new ConektaPaymentProvider());
    map.set('CO', new PayUPaymentProvider());
    map.set('AR', new MercadoPagoPaymentProvider());
    map.set('CL', new KhipuPaymentProvider()); // New
    return map;
  }
}
```

**3. Add Configuration:**

```typescript
// config/payment.config.ts
CL: {
  adapter: 'KhipuPaymentProvider',
  apiKey: process.env.KHIPU_API_KEY,
  features: ['qr', 'bank_transfer']
}
```

**4. Frontend Environment:**

```typescript
// environments/environment.cl.ts
export const environment = {
  country: "CL",
  currency: "CLP",
  apiUrl: "https://api-cl.example.com",
};
```

**Estimated effort:** 3-5 days (adapter + tests + docs)

---

## Reference Documentation

- [Project Structure](../../process/standards/PROJECT-STRUCTURE.md)
- [Documentation Standards](STANDARDS.md)
- [API Specification](api/openapi.yaml)
- [Prisma Schema](../apps/backend/prisma/schema.prisma)
- [Architecture Decision Records](adr/)

---

**Version:** 2.0.0
**Last Updated:** 2025-10-22
**Author:** Architecture Team
**Status:** Active
