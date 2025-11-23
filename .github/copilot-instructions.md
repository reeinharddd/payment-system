# AI Agent Guide - Payment System

## Project Vision

Local payment and business management system designed to modernize small businesses without expensive infrastructure. Single codebase supporting multiple countries (Mexico, Colombia, Argentina, Chile) by swapping only the payment processing layer.

**Philosophy:** "Not making them pay more, making them earn more"

---

## Technology Stack

### Backend
- **Framework:** NestJS 10+ con TypeScript 5.3+ (strict mode)
- **ORM:** Prisma 5+ (schema en `apps/backend/prisma/schema.prisma`)
- **Base de datos:** PostgreSQL 16+ (multi-schema, JSONB, full-text search)
- **Cache/Queue:** Redis 7+ con Bull MQ
- **Autenticación:** Passport.js + JWT (access + refresh tokens)
- **Validación:** class-validator + class-transformer
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** Angular 19+ standalone components (sin NgModules)
- **Características:** Signals, control flow (@if/@for), inject() function
- **Estado:** NgRx Signal Store
- **UI:** Angular Material 18+ o PrimeNG
- **HTTP:** HttpClient con interceptors
- **Testing:** Jasmine/Karma (unit), Playwright (e2e)

---

## Key Architecture

### 1. Interchangeable Payment Layer (Multi-Country)

**Pattern:** Strategy + Factory

Business logic is country-agnostic. Payments process through abstraction:

```typescript
// Interface común para todos los proveedores
interface IPaymentProvider {
  readonly country: string;
  readonly currency: string;
  createPaymentIntent(params: CreatePaymentDTO): Promise<PaymentIntent>;
  generateQRCode(intentId: string): Promise<QRCodeData>;
  confirmPayment(intentId: string): Promise<PaymentConfirmation>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

// Factory que inyecta el proveedor correcto según país
@Injectable()
export class PaymentProviderFactory {
  getProvider(country: string): IPaymentProvider {
    // Retorna: ConektaProvider (MX), PayUProvider (CO), MercadoPagoProvider (AR)
  }
}
```

**Ubicación:** `apps/backend/src/modules/payments/`

**Adaptadores por país:**
- `providers/mexico/conekta-provider.service.ts` (Conekta + SPEI)
- `providers/colombia/payu-provider.service.ts` (PayU + PSE)
- `providers/argentina/mercadopago-provider.service.ts` (Mercado Pago)

**Regla:** Al agregar funcionalidad de pagos, SIEMPRE usa la abstracción. NUNCA llames directamente a una pasarela.

### 2. Estructura Modular (NestJS)

Módulos principales:
- `auth/` - Autenticación, KYC, roles (RBAC)
- **`payments/`** - ⭐ Orquestación de pagos, webhooks, factory
- `business/` - Comercios, sucursales, empleados
- `inventory/` - Productos, stock, alertas
- `sales/` - Ventas, caja, cierres
- `billing/` - Facturas (SAT México, DIAN Colombia, AFIP Argentina)
- `notifications/` - SMS/Email/Push (Bull Queue)
- `analytics/` - Reportes, dashboards, métricas

**Convención:** Cada módulo tiene su carpeta con:
- `*.module.ts` (módulo NestJS)
- `*.controller.ts` (endpoints REST)
- `*.service.ts` (lógica de negocio)
- `dto/*.dto.ts` (validación con class-validator)
- `entities/*.entity.ts` (modelos Prisma)

### 3. Base de Datos (Prisma)

**Schema:** `apps/backend/prisma/schema.prisma`

**Entidades core:**
- `User` (multi-rol: ADMIN, MERCHANT, CUSTOMER)
- `Business` (comercios, con campo `country` para determinar adaptador)
- `Branch` (sucursales)
- `Product` (catálogo, inventario)
- `Transaction` (pagos, con `providerAdapter` y `providerData` JSONB)
- `Sale` (ventas registradas)
- `Invoice` (recibos/facturas con metadata fiscal por país)
- `CashRegister` (cajas, cierres de turno)
- `PaymentMethod` (QR estático, dinámico, enlaces)

**Reglas:**
- Usar UUIDs para `id` (no auto-increment)
- Campos obligatorios: `createdAt`, `updatedAt`
- Soft deletes: `deletedAt` opcional
- JSONB para datos específicos de país/proveedor

**Migraciones:**
```bash
bun run --filter backend db:migrate --name <descripcion>
bun run --filter backend db:generate  # Regenera Prisma Client
```

### 4. Frontend (Angular 19+)

**Estructura:**
- `core/` - Servicios singleton (auth, api, websocket, storage)
- `shared/` - Componentes/pipes/directives reutilizables
- `features/` - Módulos por feature (auth, dashboard, payments, sales, inventory)
- `layouts/` - Layouts (main, auth)

**Standalone Components Pattern:**
```typescript
@Component({
  selector: 'app-payment-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QRCodeComponent],
  templateUrl: './payment-create.component.html'
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

**Signal Store (Estado):**
```typescript
export const PaymentsStore = signalStore(
  withState({ payments: [], loading: false }),
  withComputed(({ payments }) => ({
    total: computed(() => payments().reduce((sum, p) => sum + p.amount, 0))
  })),
  withMethods((store, api = inject(PaymentsService)) => ({
    async load() {
      patchState(store, { loading: true });
      const data = await api.getPayments();
      patchState(store, { payments: data, loading: false });
    }
  }))
);
```

---

## 📋 Reglas de Codificación

### General

1. **TypeScript Strict Mode:** Siempre activo, no usar `any` (usar `unknown` si es necesario)
2. **Async/Await:** Preferir sobre `.then()` para promesas
3. **Error Handling:** 
   - Backend: `HttpException` de NestJS con status codes apropiados
   - Frontend: Interceptors globales + toast notifications
4. **Logging:** Winston (backend), console con niveles (frontend dev)
5. **Validation:** DTO con decoradores de `class-validator`

### Backend (NestJS)

```typescript
// ✅ CORRECTO: DTO con validación
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

// ✅ CORRECTO: Service con inyección
@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly factory: PaymentProviderFactory,
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  async createPayment(dto: CreatePaymentDto, userId: string): Promise<PaymentIntent> {
    // 1. Obtener business del usuario
    const business = await this.prisma.business.findFirst({ where: { ownerId: userId } });
    if (!business) throw new NotFoundException('Business not found');

    // 2. Obtener provider según país del business
    const provider = this.factory.getProvider(business.country);

    // 3. Crear intent en pasarela externa
    const intent = await provider.createPaymentIntent(dto);

    // 4. Guardar transacción en DB
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

// ❌ INCORRECTO: Llamar directamente a pasarela
async createPayment(dto: CreatePaymentDto) {
  // NO hacer esto - rompe abstracción multi-país
  const conekta = new Conekta(apiKey);
  return conekta.createOrder(...);
}
```

### Frontend (Angular)

```typescript
// ✅ CORRECTO: Standalone component con signals
@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    @if (loading()) {
      <app-spinner />
    } @else {
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <input formControlName="amount" />
        @if (form.controls.amount.errors?.['min']) {
          <span>Monto mínimo: $1</span>
        }
      </form>
    }
  `
})
export class PaymentFormComponent {
  private paymentsService = inject(PaymentsService);
  
  loading = signal(false);
  
  form = new FormGroup({
    amount: new FormControl(0, [Validators.required, Validators.min(1)])
  });
  
  async onSubmit() {
    if (this.form.invalid) return;
    
    this.loading.set(true);
    try {
      const intent = await this.paymentsService.createPayment(this.form.value);
      // Navegar a pantalla de QR
    } catch (error) {
      // Error interceptor lo maneja
    } finally {
      this.loading.set(false);
    }
  }
}

// ❌ INCORRECTO: No usar NgModules, no usar observables innecesarios
@NgModule({ /* ... */ })  // ❌ No usar NgModules en Angular 19
export class PaymentModule {}

// ❌ No convertir todo a observable si signal es suficiente
amount$ = new BehaviorSubject(0);  // Usar signal() en su lugar
```

### Prisma

```typescript
// ✅ CORRECTO: Soft delete con select explícito
async deleteProduct(id: string) {
  return this.prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}

// ✅ CORRECTO: Transacciones atómicas
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

// ❌ INCORRECTO: Queries N+1
const businesses = await prisma.business.findMany();
for (const b of businesses) {
  const branches = await prisma.branch.findMany({ where: { businessId: b.id } });
}
// Usar include o select con relaciones
```

---

## 🚀 Flujos Críticos

### Flujo 1: Cobro por QR Dinámico

1. Comerciante en app clic "Cobrar" → ingresa monto
2. Frontend → `POST /api/payments/create-intent`
3. Backend → `PaymentProviderFactory.getProvider(country)`
4. Backend → `provider.createPaymentIntent()` (llamada a Conekta/PayU/etc)
5. Backend → Guarda `Transaction` en DB con status `PENDING`
6. Backend → Retorna QR + link al frontend
7. Cliente escanea QR y paga en su banco
8. Pasarela → `POST /webhooks/{provider}` al backend
9. Backend → Valida signature, actualiza `Transaction` a `CONFIRMED`
10. Backend → Publica evento `payment.confirmed` en Redis
11. Frontend (WebSocket) → Recibe notificación en tiempo real
12. Backend (async) → Genera recibo PDF, envía SMS/email

**Archivos involucrados:**
- `apps/backend/src/modules/payments/payments.service.ts`
- `apps/backend/src/modules/payments/factories/payment-provider.factory.ts`
- `apps/backend/src/modules/payments/providers/{country}/*.service.ts`
- `apps/merchant-web/src/app/features/payments/payment-create/`

### Flujo 2: Onboarding Comercio Nuevo

1. Usuario → Registra teléfono + país
2. Backend → Envía OTP vía SMS (Twilio)
3. Usuario → Verifica OTP
4. Backend → Crea `User` (role=MERCHANT, kycLevel=0)
5. Frontend → Formulario datos negocio (nombre, RFC/NIT, giro)
6. Backend → Crea `Business` + `Branch` default
7. Backend → Genera QR estático vía `PaymentProviderFactory`
8. Frontend → Tutorial interactivo (cobro de prueba)
9. Usuario completa primer cobro simulado
10. Frontend → Redirige a dashboard

**KYC Progresivo:**
- Nivel 0: Solo teléfono → límite $500/día
- Nivel 1: + INE/ID → límite $5,000/día
- Nivel 2: + comprobante domicilio + datos fiscales → sin límites + facturación

---

## 🔍 Debugging y Testing

### Backend

```bash
# Unit tests
bun test payments.service.spec.ts

# E2E tests
bun run test:e2e -- payments.e2e-spec.ts

# Debug en VSCode
# Usar launch.json preset "Debug NestJS"
```

**Tests recomendados:**
- Mock `PaymentProviderFactory` en tests de `PaymentsService`
- Usar Prisma en memoria para tests de integración
- Mock webhooks externos con fixtures

### Frontend

```bash
# Unit tests
bun run --filter merchant-web test --include='**/payment-create.component.spec.ts'

# E2E tests
bun run --filter merchant-web test:e2e

# Debug en Chrome DevTools
bun run --filter merchant-web dev --open --configuration=development
```

**Tests recomendados:**
- TestBed para componentes con `provideHttpClientTesting()`
- Harness para componentes Material
- Mock `PaymentsService` con signals spy

---

## 📦 Agregar Nuevo País (Ejemplo: Chile)

1. **Crear adapter:**
   ```bash
   touch apps/backend/src/modules/payments/providers/chile/khipu-provider.service.ts
   ```

2. **Implementar `IPaymentProvider`:**
   ```typescript
   @Injectable()
   export class KhipuPaymentProvider implements IPaymentProvider {
     readonly country = 'CL';
     readonly currency = 'CLP';
     // ... implementar métodos
   }
   ```

3. **Registrar en factory:**
   ```typescript
   // payments.module.ts
   {
     provide: 'PAYMENT_PROVIDERS',
     useFactory: () => {
       const map = new Map<string, IPaymentProvider>();
       map.set('MX', new ConektaPaymentProvider());
       map.set('CO', new PayUPaymentProvider());
       map.set('AR', new MercadoPagoPaymentProvider());
       map.set('CL', new KhipuPaymentProvider());  // ← Nuevo
       return map;
     }
   }
   ```

4. **Agregar configuración:**
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
     country: 'CL',
     currency: 'CLP',
     apiUrl: 'https://api-cl.example.com'
   };
   ```

**Tiempo estimado:** ~3-5 días (adapter + tests + documentación)

---

## 🎨 Estilo de Código

### Commits (Conventional Commits)

```
feat(payments): agrega soporte para pagos en Chile
fix(auth): corrige validación de RFC en México
docs(api): actualiza swagger de endpoints de cobro
refactor(billing): extrae lógica SAT a provider separado
test(payments): agrega tests para KhipuProvider
chore(deps): actualiza Prisma a 5.8.0
```

### Code Review Checklist

- [ ] ¿Usa la abstracción `IPaymentProvider` en lugar de llamadas directas?
- [ ] ¿DTOs con validación `class-validator`?
- [ ] ¿Manejo de errores con `HttpException` apropiado?
- [ ] ¿Tests unitarios con coverage > 80%?
- [ ] ¿Documentación Swagger actualizada?
- [ ] ¿Migraciones Prisma si modifica DB?
- [ ] ¿Logs con nivel apropiado (no `console.log`)?
- [ ] ¿Variables sensibles en `.env` no hardcodeadas?

---

## 📚 Referencias Rápidas

- **Docs:** `/docs/VISION-Y-ARQUITECTURA.md`
- **Estructura:** `/docs/ESTRUCTURA-PROYECTO.md`
- **Diagramas:** `/docs/diagrams/*.puml`
- **API Spec:** `/docs/api/openapi.yaml` (TODO)
- **Prisma Schema:** `/apps/backend/prisma/schema.prisma`

---

## 🆘 Troubleshooting Común

### Error: "Cannot find module @prisma/client"
```bash
cd apps/backend && bun run db:generate
```

### Error: "Provider not found for country XX"
Verificar que el país esté registrado en `PaymentProviderFactory` y `payment.config.ts`

### Webhooks no llegan en desarrollo local
Usar ngrok o webhook.site para túnel:
```bash
ngrok http 3000
# Actualizar URL en dashboard de pasarela
```

### Angular: "NG0203: inject() must be called from an injection context"
Usar `inject()` solo en constructores o en inicializadores de campos de clase

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0
