---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "general"
module: "architecture"
status: "approved"
version: "1.0.0"
last_updated: "2025-11-27"
author: "@Architect"

# Keywords for semantic search
keywords:
  - "design-patterns"
  - "best-practices"
  - "factory-pattern"
  - "strategy-pattern"
  - "repository-pattern"
  - "solid"
  - "clean-code"
  - "nestjs"
  - "angular"

# Related documentation
related_docs:
  database_schema: ""
  api_design: ""
  feature_design: ""
  ux_flow: ""

# Document-specific metadata
doc_metadata:
  audience: "developers"
  complexity: "high"
  estimated_read_time: "45 min"
---

<!--
  ~ DESIGN PATTERNS AND BEST PRACTICES
  ~ ============================================================================
  ~
  ~ This document defines the design patterns and best practices used throughout
  ~ the system, including creational, structural, behavioral, and architectural
  ~ patterns.
  ~
  ~ ----------------------------------------------------------------------------
  ~
  ~ GUIDELINES:
  ~ - Use this guide to ensure consistency in code design.
  ~ - Refer to specific patterns when implementing new features.
  ~ - Keep examples up to date with the latest framework versions.
  ~
  ~ ============================================================================
  -->

# Design Patterns and Best Practices

<div align="center">

![Design Patterns](https://img.shields.io/badge/Design-Patterns-blue?style=for-the-badge&logo=design-patterns)
![Status Active](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Last Updated](https://img.shields.io/badge/Last%20Updated-October%202025-lightgrey?style=for-the-badge)

</div>

Comprehensive guide to design patterns used throughout the system with concrete examples.

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                     |
| :------------- | :------------------------------------------------------------------------------ |
| **Context**    | This document defines the design patterns and best practices.                   |
| **Constraint** | Refer to specific patterns when implementing new features.                      |
| **Pattern**    | Use the Factory Pattern for payment providers and Strategy Pattern for methods. |

---

## Table of Contents

- [Creational Patterns](#creational-patterns)
- [Structural Patterns](#structural-patterns)
- [Behavioral Patterns](#behavioral-patterns)
- [Architectural Patterns](#architectural-patterns)
- [Frontend Patterns](#frontend-patterns)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Creational Patterns

### Factory Pattern (Payment Provider Selection)

**Purpose:** Create objects without specifying exact class to create

**Use Case:** Select payment provider based on country at runtime

**Implementation:**

```typescript
// 1. PRODUCT INTERFACE
export interface IPaymentProvider {
  readonly country: string;
  readonly currency: string;
  createPaymentIntent(dto: CreatePaymentDto): Promise<PaymentIntent>;
  generateQRCode(intentId: string): Promise<QRCodeData>;
}

// 2. CONCRETE PRODUCTS
@Injectable()
export class ConektaPaymentProvider implements IPaymentProvider {
  readonly country = "MX";
  readonly currency = "MXN";

  constructor(
    @Inject("CONEKTA_CONFIG") private config: ConektaConfig,
    private http: HttpService,
  ) {}

  async createPaymentIntent(dto: CreatePaymentDto): Promise<PaymentIntent> {
    // Conekta-specific API call
    const response = await this.http
      .post(
        "https://api.conekta.io/orders",
        {
          amount: dto.amount * 100, // Conekta uses cents
          currency: "MXN",
          customer_info: {
            phone: dto.customerPhone,
          },
          charges: [
            {
              payment_method: { type: "spei" },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        },
      )
      .toPromise();

    return {
      id: response.data.id,
      amount: dto.amount,
      currency: "MXN",
      qrCodeUrl: response.data.charges[0].payment_method.clabe,
      paymentLink: response.data.checkout_url,
      expiresAt: new Date(response.data.charges[0].payment_method.expires_at),
      providerData: response.data,
    };
  }

  async generateQRCode(intentId: string): Promise<QRCodeData> {
    // Implementation
  }
}

@Injectable()
export class PayUPaymentProvider implements IPaymentProvider {
  readonly country = "CO";
  readonly currency = "COP";

  // Similar implementation for Colombia
}

// 3. FACTORY
@Injectable()
export class PaymentProviderFactory {
  constructor(
    @Inject("PAYMENT_PROVIDERS")
    private providers: Map<string, IPaymentProvider>,
  ) {}

  getProvider(country: string): IPaymentProvider {
    const provider = this.providers.get(country);

    if (!provider) {
      throw new BadRequestException(
        `Payment provider not available for country: ${country}`,
      );
    }

    return provider;
  }

  getProviderByName(name: string): IPaymentProvider {
    for (const provider of this.providers.values()) {
      if (provider.constructor.name === name) {
        return provider;
      }
    }

    throw new NotFoundException(`Provider ${name} not found`);
  }
}

// 4. MODULE REGISTRATION
@Module({
  providers: [
    ConektaPaymentProvider,
    PayUPaymentProvider,
    MercadoPagoPaymentProvider,
    KhipuPaymentProvider,
    {
      provide: "PAYMENT_PROVIDERS",
      useFactory: (
        conekta: ConektaPaymentProvider,
        payu: PayUPaymentProvider,
        mercadopago: MercadoPagoPaymentProvider,
        khipu: KhipuPaymentProvider,
      ) => {
        const map = new Map<string, IPaymentProvider>();
        map.set("MX", conekta);
        map.set("CO", payu);
        map.set("AR", mercadopago);
        map.set("CL", khipu);
        return map;
      },
      inject: [
        ConektaPaymentProvider,
        PayUPaymentProvider,
        MercadoPagoPaymentProvider,
        KhipuPaymentProvider,
      ],
    },
    PaymentProviderFactory,
  ],
  exports: [PaymentProviderFactory],
})
export class PaymentsModule {}

// 5. USAGE IN SERVICE
@Injectable()
export class PaymentsService {
  constructor(
    private factory: PaymentProviderFactory,
    private prisma: PrismaService,
  ) {}

  async createPayment(
    dto: CreatePaymentDto,
    userId: string,
  ): Promise<PaymentIntent> {
    // Get business to determine country
    const business = await this.prisma.business.findFirst({
      where: { ownerId: userId },
    });

    if (!business) {
      throw new NotFoundException("Business not found");
    }

    // Get provider for business country
    const provider = this.factory.getProvider(business.country);

    // Create payment intent
    const intent = await provider.createPaymentIntent(dto);

    // Save to database
    await this.prisma.transaction.create({
      data: {
        businessId: business.id,
        amount: dto.amount,
        currency: provider.currency,
        status: "PENDING",
        paymentMethod: "QR",
        country: provider.country,
        providerAdapter: provider.constructor.name,
        providerData: intent.providerData,
        qrCodeUrl: intent.qrCodeUrl,
        paymentLink: intent.paymentLink,
      },
    });

    return intent;
  }
}
```

**Benefits:**

- Easy to add new country (just implement interface + register in map)
- Business logic doesn't know about specific providers
- Testable (mock factory in tests)
- Single Responsibility Principle (each provider handles one country)

---

### Dependency Injection (NestJS)

**Purpose:** Decouple object creation from object use

**Implementation:**

```typescript
// BAD - Tight coupling
export class PaymentsService {
  private prisma = new PrismaService(); // Hard dependency

  async createPayment() {
    await this.prisma.transaction.create({...});
  }
}

// GOOD - Dependency Injection
@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,        // Injected
    private factory: PaymentProviderFactory, // Injected
    private events: EventEmitter2,        // Injected
  ) {}

  async createPayment() {
    // Use injected dependencies
  }
}

// Testing becomes easy
describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: {
            transaction: {
              create: jest.fn(),
            },
          },
        },
        // ... other mocks
      ],
    }).compile();

    service = module.get(PaymentsService);
    prisma = module.get(PrismaService);
  });

  it('should create payment', async () => {
    // Test with mocked dependencies
  });
});
```

---

## Structural Patterns

### Repository Pattern (Complex Queries)

**Purpose:** Separate data access logic from business logic

**When to Use:**

- Complex queries with multiple conditions
- Reusable query logic
- Need to mock data layer in tests

**Implementation:**

```typescript
// 1. REPOSITORY (DATA ACCESS)
@Injectable()
export class TransactionRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Find transactions with complex filtering and aggregation
   */
  async findWithAnalytics(
    filters: TransactionFilters,
  ): Promise<TransactionAnalytics> {
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

    const [transactions, total, sum] = await Promise.all([
      // Main query with pagination
      this.prisma.transaction.findMany({
        where,
        include: {
          business: {
            select: { name: true, country: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      }),

      // Count for pagination
      this.prisma.transaction.count({ where }),

      // Aggregate for analytics
      this.prisma.transaction.aggregate({
        where,
        _sum: { amount: true },
        _avg: { amount: true },
        _count: true,
      }),
    ]);

    return {
      transactions,
      total,
      analytics: {
        totalAmount: sum._sum.amount || 0,
        averageAmount: sum._avg.amount || 0,
        count: sum._count,
      },
    };
  }

  /**
   * Find transactions by status with business info
   */
  async findByStatus(
    businessId: string,
    status: TransactionStatus,
  ): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { businessId, status },
      include: {
        business: true,
        sale: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

// 2. SERVICE (BUSINESS LOGIC)
@Injectable()
export class AnalyticsService {
  constructor(private transactionRepo: TransactionRepository) {}

  async getPaymentAnalytics(
    businessId: string,
    dateRange: DateRange,
  ): Promise<PaymentAnalyticsDto> {
    // Use repository for complex query
    const data = await this.transactionRepo.findWithAnalytics({
      businessId,
      status: "CONFIRMED",
      startDate: dateRange.start,
      endDate: dateRange.end,
      skip: 0,
      take: 1000,
    });

    // Apply business logic
    return {
      totalRevenue: data.analytics.totalAmount,
      averageTransaction: data.analytics.averageAmount,
      transactionCount: data.analytics.count,
      topDays: this.calculateTopDays(data.transactions),
      growth: this.calculateGrowth(data.transactions),
    };
  }

  private calculateTopDays(transactions: Transaction[]): DayAnalytics[] {
    // Business logic for analytics
  }
}
```

**Benefits:**

- Service layer stays clean (business logic only)
- Repository reusable across multiple services
- Easy to mock in tests
- Centralized query optimization

---

### Adapter Pattern (External APIs)

**Purpose:** Convert interface of external service to match our interface

**Use Case:** Wrap third-party SDK with custom interface

**Implementation:**

```typescript
// 1. OUR INTERFACE
export interface ISMSProvider {
  sendSMS(to: string, message: string): Promise<SMSResult>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}

// 2. ADAPTER FOR TWILIO
@Injectable()
export class TwilioSMSAdapter implements ISMSProvider {
  private client: Twilio;

  constructor(@Inject("TWILIO_CONFIG") config: TwilioConfig) {
    this.client = new Twilio(config.accountSid, config.authToken);
  }

  async sendSMS(to: string, message: string): Promise<SMSResult> {
    try {
      // Twilio-specific API call
      const result = await this.client.messages.create({
        to,
        from: this.config.fromNumber,
        body: message,
      });

      // Adapt Twilio response to our interface
      return {
        messageId: result.sid,
        status: this.mapStatus(result.status),
        sentAt: new Date(result.dateCreated),
      };
    } catch (error) {
      throw new SMSDeliveryException("Failed to send SMS via Twilio", error);
    }
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    const message = await this.client.messages(messageId).fetch();

    return {
      messageId: message.sid,
      status: this.mapStatus(message.status),
      deliveredAt: message.dateUpdated ? new Date(message.dateUpdated) : null,
    };
  }

  private mapStatus(twilioStatus: string): SMSStatus {
    const statusMap = {
      queued: "PENDING",
      sent: "SENT",
      delivered: "DELIVERED",
      failed: "FAILED",
    };

    return statusMap[twilioStatus] || "UNKNOWN";
  }
}

// 3. USAGE
@Injectable()
export class NotificationService {
  constructor(@Inject("SMS_PROVIDER") private sms: ISMSProvider) {}

  async notifyMerchant(phone: string, amount: number): Promise<void> {
    const message = `Pago confirmado por $${amount}. ¡Gracias!`;

    // Use our interface (doesn't care if Twilio, SNS, etc)
    await this.sms.sendSMS(phone, message);
  }
}
```

**Benefits:**

- Can swap SMS providers without changing business logic
- Testable (mock ISMSProvider)
- Consistent interface across different providers
- Isolates third-party API changes

---

## Behavioral Patterns

### Strategy Pattern (Payment Methods)

**Purpose:** Define family of algorithms, encapsulate each one, make them interchangeable

**Use Case:** Different payment method types (QR, Link, Transfer)

**Implementation:**

```typescript
// 1. STRATEGY INTERFACE
export interface IPaymentMethodStrategy {
  generatePaymentData(transaction: Transaction): Promise<PaymentData>;
  validatePayment(transaction: Transaction): Promise<boolean>;
}

// 2. CONCRETE STRATEGIES
@Injectable()
export class QRCodeStrategy implements IPaymentMethodStrategy {
  constructor(
    private qrGenerator: QRCodeService,
    private providerFactory: PaymentProviderFactory,
  ) {}

  async generatePaymentData(transaction: Transaction): Promise<PaymentData> {
    const provider = this.providerFactory.getProvider(transaction.country);

    // Generate QR code with SPEI/PSE/PIX format
    const qrData = await provider.generateQRCode(transaction.id);

    // Generate QR image
    const qrImage = await this.qrGenerator.generate(qrData.content);

    return {
      type: "QR_CODE",
      qrImageUrl: qrImage.url,
      instructions: `Scan this QR code with your bank app to pay`,
      expiresIn: 3600, // 1 hour
    };
  }

  async validatePayment(transaction: Transaction): Promise<boolean> {
    // QR-specific validation
    return transaction.qrCodeUrl !== null;
  }
}

@Injectable()
export class PaymentLinkStrategy implements IPaymentMethodStrategy {
  constructor(private urlService: URLShortenerService) {}

  async generatePaymentData(transaction: Transaction): Promise<PaymentData> {
    // Generate short payment link
    const longUrl = `${process.env.APP_URL}/pay/${transaction.id}`;
    const shortUrl = await this.urlService.shorten(longUrl);

    return {
      type: "PAYMENT_LINK",
      paymentLink: shortUrl,
      instructions: `Share this link via WhatsApp, SMS, or email`,
      expiresIn: 86400, // 24 hours
    };
  }

  async validatePayment(transaction: Transaction): Promise<boolean> {
    return transaction.paymentLink !== null;
  }
}

// 3. CONTEXT (USES STRATEGY)
@Injectable()
export class PaymentMethodService {
  private strategies: Map<string, IPaymentMethodStrategy>;

  constructor(
    qrStrategy: QRCodeStrategy,
    linkStrategy: PaymentLinkStrategy,
    transferStrategy: BankTransferStrategy,
  ) {
    this.strategies = new Map();
    this.strategies.set("QR", qrStrategy);
    this.strategies.set("LINK", linkStrategy);
    this.strategies.set("TRANSFER", transferStrategy);
  }

  async generatePaymentMethod(
    transaction: Transaction,
    methodType: string,
  ): Promise<PaymentData> {
    const strategy = this.strategies.get(methodType);

    if (!strategy) {
      throw new BadRequestException(
        `Payment method ${methodType} not supported`,
      );
    }

    return await strategy.generatePaymentData(transaction);
  }
}
```

**Benefits:**

- Easy to add new payment methods
- Each strategy isolated and testable
- Client code doesn't know implementation details

---

### Observer Pattern (Event-Driven Architecture)

**Purpose:** Define one-to-many dependency so when one object changes, dependents are notified

**Use Case:** Payment confirmed triggers multiple side effects (notifications, analytics, inventory)

**Implementation:**

```typescript
// 1. EVENT (SUBJECT)
export class PaymentConfirmedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly businessId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly confirmedAt: Date,
  ) {}
}

// 2. EVENT EMITTER (SERVICE)
@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2, // NestJS event emitter
  ) {}

  async confirmPayment(transactionId: string): Promise<void> {
    // Update transaction
    const transaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
      include: { business: true },
    });

    // Emit event (fire and forget - non-blocking)
    this.eventEmitter.emit(
      "payment.confirmed",
      new PaymentConfirmedEvent(
        transaction.id,
        transaction.businessId,
        transaction.amount.toNumber(),
        transaction.currency,
        transaction.confirmedAt!,
      ),
    );

    this.logger.log(`Payment ${transactionId} confirmed`);
  }
}

// 3. EVENT LISTENERS (OBSERVERS)
@Injectable()
export class NotificationListener {
  constructor(
    private sms: ISMSProvider,
    private email: IEmailProvider,
    private prisma: PrismaService,
  ) {}

  @OnEvent("payment.confirmed")
  async handlePaymentConfirmed(event: PaymentConfirmedEvent): Promise<void> {
    try {
      // Get business owner contact
      const business = await this.prisma.business.findUnique({
        where: { id: event.businessId },
        include: { owner: true },
      });

      // Send SMS
      await this.sms.sendSMS(
        business.owner.phone,
        `¡Pago confirmado! Recibiste ${event.currency} ${event.amount}`,
      );

      // Send email if available
      if (business.owner.email) {
        await this.email.send({
          to: business.owner.email,
          subject: "Pago confirmado",
          template: "payment-confirmed",
          data: {
            amount: event.amount,
            currency: event.currency,
            date: event.confirmedAt,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to send notifications: ${error.message}`);
      // Don't throw - notification failure shouldn't break payment flow
    }
  }
}

@Injectable()
export class AnalyticsListener {
  constructor(
    private analytics: AnalyticsService,
    private redis: RedisService,
  ) {}

  @OnEvent("payment.confirmed")
  async handlePaymentConfirmed(event: PaymentConfirmedEvent): Promise<void> {
    try {
      // Track payment in analytics
      await this.analytics.trackPayment({
        businessId: event.businessId,
        amount: event.amount,
        currency: event.currency,
        timestamp: event.confirmedAt,
      });

      // Increment daily counter in Redis
      const dateKey = format(event.confirmedAt, "yyyy-MM-dd");
      await this.redis.incr(`payments:${event.businessId}:${dateKey}`);

      // Update business metrics
      await this.redis.zincrby(
        `revenue:${event.businessId}`,
        event.amount,
        dateKey,
      );
    } catch (error) {
      this.logger.error(`Failed to track analytics: ${error.message}`);
    }
  }
}

@Injectable()
export class InventoryListener {
  constructor(private inventory: InventoryService) {}

  @OnEvent("payment.confirmed")
  async handlePaymentConfirmed(event: PaymentConfirmedEvent): Promise<void> {
    // Only process if transaction has associated sale
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: event.transactionId },
      include: {
        sale: {
          include: { items: true },
        },
      },
    });

    if (transaction?.sale) {
      // Update stock for sold items
      await this.inventory.decrementStock(transaction.sale.items);
    }
  }
}

// 4. MODULE REGISTRATION
@Module({
  providers: [
    PaymentsService,
    NotificationListener,
    AnalyticsListener,
    InventoryListener,
  ],
})
export class PaymentsModule {}
```

**Benefits:**

- Loose coupling (service doesn't know about listeners)
- Easy to add new side effects (just add listener)
- Non-blocking (events processed async)
- Single Responsibility (each listener does one thing)

---

## Architectural Patterns

### CQRS (Command Query Responsibility Segregation)

**Purpose:** Separate read and write operations for better scalability

**When to Use:** Complex reporting queries that don't fit write model

**Implementation:**

```typescript
// WRITE MODEL (Commands)
@Injectable()
export class TransactionCommands {
  constructor(
    private prisma: PrismaService,
    private events: EventEmitter2,
  ) {}

  async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: dto,
    });

    this.events.emit("transaction.created", transaction);

    return transaction;
  }

  async confirmTransaction(id: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });

    this.events.emit("transaction.confirmed", transaction);

    return transaction;
  }
}

// READ MODEL (Queries)
@Injectable()
export class TransactionQueries {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getTransactionById(id: string): Promise<TransactionDto> {
    // Try cache first
    const cached = await this.cache.get(`transaction:${id}`);
    if (cached) return cached;

    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        business: {
          select: { name: true, country: true },
        },
        sale: {
          include: { items: true },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    // Cache for 5 minutes
    await this.cache.set(`transaction:${id}`, transaction, 300);

    return transaction;
  }

  async getBusinessTransactions(
    businessId: string,
    filters: TransactionFilters,
  ): Promise<PaginatedResponse<TransactionDto>> {
    // Complex read query optimized for reporting
    const where: Prisma.TransactionWhereInput = {
      businessId,
      status: filters.status,
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    };

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        select: {
          // Only select needed fields for list view
          id: true,
          amount: true,
          currency: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page: Math.floor(filters.skip / filters.take) + 1,
        limit: filters.take,
        totalPages: Math.ceil(total / filters.take),
      },
    };
  }
}

// CONTROLLER USES BOTH
@Controller("transactions")
export class TransactionsController {
  constructor(
    private commands: TransactionCommands, // Writes
    private queries: TransactionQueries, // Reads
  ) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    return this.commands.createTransaction(dto);
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.queries.getTransactionById(id);
  }

  @Get()
  async getAll(@Query() filters: TransactionFilters) {
    return this.queries.getBusinessTransactions(filters.businessId, filters);
  }
}
```

**Benefits:**

- Optimize writes and reads independently
- Cache read model aggressively
- Scale read and write databases separately
- Complex reporting doesn't slow down writes

---

## Frontend Patterns

### Signal Store Pattern (State Management)

**Purpose:** Manage component state with reactive primitives

**Implementation:**

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
  filters: {
    status: TransactionStatus | "ALL";
    dateRange: DateRange;
    searchTerm: string;
  };
}

// 2. INITIAL STATE
const initialState: PaymentsState = {
  payments: [],
  loading: false,
  error: null,
  filters: {
    status: "ALL",
    dateRange: { start: startOfMonth(new Date()), end: new Date() },
    searchTerm: "",
  },
};

// 3. STORE DEFINITION
export const PaymentsStore = signalStore(
  { providedIn: "root" },

  // State
  withState(initialState),

  // Computed values (derived state)
  withComputed(({ payments, filters }) => ({
    // Filter payments based on filters
    filteredPayments: computed(() => {
      let filtered = payments();

      // Filter by status
      if (filters().status !== "ALL") {
        filtered = filtered.filter((p) => p.status === filters().status);
      }

      // Filter by search term
      if (filters().searchTerm) {
        const term = filters().searchTerm.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.id.toLowerCase().includes(term) ||
            p.business.name.toLowerCase().includes(term),
        );
      }

      return filtered;
    }),

    // Calculate total amount
    totalAmount: computed(() => {
      return payments().reduce((sum, p) => sum + p.amount, 0);
    }),

    // Count by status
    statusCounts: computed(() => {
      const payments = payments();
      return {
        pending: payments.filter((p) => p.status === "PENDING").length,
        confirmed: payments.filter((p) => p.status === "CONFIRMED").length,
        failed: payments.filter((p) => p.status === "FAILED").length,
      };
    }),

    // Check if empty
    isEmpty: computed(() => payments().length === 0),

    // Check if has errors
    hasError: computed(() => error() !== null),
  })),

  // Methods (actions)
  withMethods((store, api = inject(PaymentsService)) => ({
    // Load payments
    async loadPayments(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        const payments = await api.getAll(store.filters());
        patchState(store, { payments, loading: false });
      } catch (error) {
        patchState(store, {
          error: error.message,
          loading: false,
        });
      }
    },

    // Create payment
    async createPayment(dto: CreatePaymentDto): Promise<Payment> {
      patchState(store, { loading: true, error: null });

      try {
        const payment = await api.create(dto);

        // Add to existing payments
        patchState(store, {
          payments: [payment, ...store.payments()],
          loading: false,
        });

        return payment;
      } catch (error) {
        patchState(store, {
          error: error.message,
          loading: false,
        });
        throw error;
      }
    },

    // Update filters
    setFilters(filters: Partial<PaymentsState["filters"]>): void {
      patchState(store, {
        filters: { ...store.filters(), ...filters },
      });
    },

    // Clear error
    clearError(): void {
      patchState(store, { error: null });
    },

    // Refresh
    async refresh(): Promise<void> {
      await this.loadPayments();
    },
  })),
);

// 4. USAGE IN COMPONENT
@Component({
  selector: "app-payments-list",
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (store.loading()) {
      <app-spinner />
    } @else if (store.hasError()) {
      <app-error [message]="store.error()" />
    } @else if (store.isEmpty()) {
      <app-empty-state message="No payments found" />
    } @else {
      <div class="payments-list">
        @for (payment of store.filteredPayments(); track payment.id) {
          <app-payment-card [payment]="payment" />
        }
      </div>

      <div class="summary">
        <p>Total: {{ store.totalAmount() | currency }}</p>
        <p>Pending: {{ store.statusCounts().pending }}</p>
        <p>Confirmed: {{ store.statusCounts().confirmed }}</p>
      </div>
    }
  `,
})
export class PaymentsListComponent {
  protected store = inject(PaymentsStore);

  ngOnInit(): void {
    this.store.loadPayments();
  }

  onFilterChange(status: TransactionStatus | "ALL"): void {
    this.store.setFilters({ status });
  }

  onSearch(term: string): void {
    this.store.setFilters({ searchTerm: term });
  }
}
```

**Benefits:**

- Reactive state updates
- Computed values automatically recalculate
- Type-safe (TypeScript)
- Testable (inject mock store)
- No Zone.js dependency

---

## Anti-Patterns to Avoid

### 1. God Objects

**BAD:**

```typescript
@Injectable()
export class PaymentsService {
  // Handles EVERYTHING: payments, inventory, notifications, analytics
  async createPayment() {}
  async updateInventory() {}
  async sendNotification() {}
  async trackAnalytics() {}
  async generateInvoice() {}
  async processRefund() {}
  // ... 50 more methods
}
```

**GOOD:**

```typescript
@Injectable()
export class PaymentsService {
  constructor(
    private inventory: InventoryService,
    private notifications: NotificationService,
    private analytics: AnalyticsService,
  ) {}

  async createPayment() {
    // Only payment logic
    // Delegate to other services
  }
}
```

### 2. Hardcoded Values

**BAD:**

```typescript
async createPayment() {
  const response = await this.http.post(
    'https://api.conekta.io/orders',  // Hardcoded URL
    { amount: dto.amount * 100 },     // Magic number
    { headers: { Authorization: 'Bearer sk_test_abc123' } }  // Secret in code!
  );
}
```

**GOOD:**

```typescript
constructor(
  @Inject('CONEKTA_CONFIG') private config: ConektaConfig,
) {}

async createPayment() {
  const response = await this.http.post(
    this.config.apiUrl,
    { amount: dto.amount * this.config.centsFactor },
    { headers: { Authorization: `Bearer ${this.config.apiKey}` } }
  );
}
```

### 3. Callback Hell

**BAD:**

```typescript
createPayment(dto, (payment) => {
  saveToDatabase(payment, (saved) => {
    sendNotification(saved, (sent) => {
      trackAnalytics(sent, (tracked) => {
        generateInvoice(tracked, (invoice) => {
          // Nested 5 levels deep!
        });
      });
    });
  });
});
```

**GOOD:**

```typescript
async createPayment(dto: CreatePaymentDto): Promise<Payment> {
  const payment = await this.provider.create(dto);
  const saved = await this.prisma.transaction.create({ data: payment });

  // Side effects async
  this.events.emit('payment.created', saved);

  return saved;
}
```

### 4. Not Using Interfaces

**BAD:**

```typescript
// Directly using Conekta class everywhere
@Injectable()
export class PaymentsService {
  constructor(private conekta: ConektaPaymentProvider) {}

  async create() {
    return this.conekta.createOrder(); // Locked to Conekta
  }
}
```

**GOOD:**

```typescript
@Injectable()
export class PaymentsService {
  constructor(@Inject("PAYMENT_PROVIDER") private provider: IPaymentProvider) {}

  async create() {
    return this.provider.createPaymentIntent(); // Any provider
  }
}
```

### 5. Ignoring Errors

**BAD:**

```typescript
async createPayment() {
  try {
    return await this.provider.create(dto);
  } catch (error) {
    // Silent failure!
  }
}
```

**GOOD:**

```typescript
async createPayment() {
  try {
    return await this.provider.create(dto);
  } catch (error) {
    this.logger.error(`Payment creation failed: ${error.message}`, error.stack);

    if (error.code === 'PROVIDER_TIMEOUT') {
      throw new ServiceUnavailableException('Payment provider temporarily unavailable');
    }

    throw new InternalServerErrorException('Failed to create payment');
  }
}
```

---

**Version:** 1.0.0
**Last Updated:** 2025-11-01
**Status:** Active Reference
