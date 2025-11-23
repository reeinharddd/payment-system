<!-- AI-INSTRUCTION: START -->
<!-- 
  This document defines the ANGULAR ZONELESS ARCHITECTURE GUIDE.
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
      <h1 style="margin: 0; border-bottom: none;">Angular Zoneless Architecture Guide</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Performance optimization with Signals and Zoneless</p>
    </td>
  </tr>
</table>

<div align="center">
  
  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-Frontend-blue?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--22-lightgrey?style=flat-square" alt="Date" />

</div>

---

## 🤖 Agent Directives (System Prompt)

*This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document.*

| Directive | Instruction |
| :--- | :--- |
| **Context** | This project uses Angular 19+ in **Zoneless Mode**. |
| **Constraint** | Do NOT import `zone.js`. Use `Signals` for all state management. |
| **Pattern** | Use `ChangeDetectionStrategy.OnPush` for all components. |
| **Related** | `docs/technical/foundations/TECHNICAL-FOUNDATIONS.md` |

---

## 1. Overview

Zone.js has been the default change detection mechanism since Angular 2. However, with Signals and the new reactivity model, Angular 19+ can operate without it.

### 1.1. Benefits of Zoneless

- Smaller bundle size (reduces by ~40KB gzipped)
- Better performance (no zone patching overhead)
- More predictable change detection
- Easier debugging
- Better integration with non-Angular code
- Reduced memory footprint

### 1.2. Trade-offs

- Must handle change detection manually for some operations
- Need to use Signals for reactive state
- Some third-party libraries may require Zone.js
- More explicit code (less "magic")

---

## 2. Migration Strategy

### 2.1. Step 1: Enable Zoneless Mode

**main.ts:**

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
}).catch(err => console.error(err));
```

### 2.2. Step 2: Remove Zone.js Import

**polyfills.ts or angular.json:**

Remove or comment out:

```typescript
// import 'zone.js';  // Remove this line
```

### 2.3. Step 3: Convert to Signals

Replace RxJS BehaviorSubject and manual change detection with Signals:

**Before (with Zone.js):**

```typescript
export class PaymentComponent {
  loading$ = new BehaviorSubject<boolean>(false);
  payments$ = new BehaviorSubject<Payment[]>([]);
  
  async loadPayments() {
    this.loading$.next(true);
    const data = await this.api.getPayments();
    this.payments$.next(data);
    this.loading$.next(false);
  }
}
```

**After (zoneless with Signals):**

```typescript
export class PaymentComponent {
  loading = signal(false);
  payments = signal<Payment[]>([]);
  
  // Computed values
  total = computed(() => 
    this.payments().reduce((sum, p) => sum + p.amount, 0)
  );
  
  async loadPayments() {
    this.loading.set(true);
    const data = await this.api.getPayments();
    this.payments.set(data);
    this.loading.set(false);
  }
}
```

---

## 3. Signal Patterns

### 3.1. Basic Signal Usage

```typescript
import { signal, computed, effect } from '@angular/core';

export class CounterComponent {
  // Writable signal
  count = signal(0);
  
  // Computed (read-only, auto-updates)
  doubled = computed(() => this.count() * 2);
  
  increment() {
    this.count.update(n => n + 1);
  }
  
  constructor() {
    // Effect runs when dependencies change
    effect(() => {
      console.log('Count changed:', this.count());
    });
  }
}
```

### 3.2. Signal with Objects

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

export class UserComponent {
  user = signal<User | null>(null);
  
  // Computed from nested properties
  displayName = computed(() => {
    const u = this.user();
    return u ? `${u.name} (${u.email})` : 'Guest';
  });
  
  updateUser(updates: Partial<User>) {
    this.user.update(current => 
      current ? { ...current, ...updates } : null
    );
  }
}
```

### 3.3. Signal Arrays

```typescript
export class TodoListComponent {
  todos = signal<Todo[]>([]);
  
  // Computed filtering
  completedTodos = computed(() => 
    this.todos().filter(t => t.completed)
  );
  
  incompleteTodos = computed(() =>
    this.todos().filter(t => !t.completed)
  );
  
  addTodo(todo: Todo) {
    this.todos.update(list => [...list, todo]);
  }
  
  removeTodo(id: string) {
    this.todos.update(list => list.filter(t => t.id !== id));
  }
  
  toggleTodo(id: string) {
    this.todos.update(list =>
      list.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }
}
```

---

## 4. Observable to Signal Conversion

Use `toSignal()` to convert Observables:

```typescript
import { toSignal } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';

export class MessagesComponent {
  private websocket = inject(WebSocketService);
  
  // Convert observable to signal
  messages = toSignal(this.websocket.messages$, { 
    initialValue: [] as Message[]
  });
  
  // Use in computed
  unreadCount = computed(() => 
    this.messages().filter(m => !m.read).length
  );
}
```

### 4.1. Http Client Pattern

```typescript
export class DataService {
  private http = inject(HttpClient);
  
  // Signal for state
  data = signal<Data[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  async fetchData() {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const result = await firstValueFrom(
        this.http.get<Data[]>('/api/data')
      );
      this.data.set(result);
    } catch (err) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }
  
  // Or use toSignal for reactive queries
  dataStream = toSignal(
    this.http.get<Data[]>('/api/data'),
    { initialValue: [] }
  );
}
```

---

## 5. Template Control Flow

Use new `@if`, `@for`, `@switch` syntax (Angular 17+):

```typescript
@Component({
  template: `
    @if (loading()) {
      <app-spinner />
    } @else if (error()) {
      <app-error [message]="error()" />
    } @else {
      <div class="payment-list">
        @for (payment of payments(); track payment.id) {
          <app-payment-card 
            [payment]="payment"
            (click)="selectPayment(payment)" />
        } @empty {
          <p>No payments found</p>
        }
      </div>
    }
    
    @switch (status()) {
      @case ('pending') {
        <app-pending-badge />
      }
      @case ('confirmed') {
        <app-success-badge />
      }
      @case ('failed') {
        <app-error-badge />
      }
      @default {
        <app-unknown-badge />
      }
    }
  `
})
export class PaymentListComponent {
  loading = signal(false);
  error = signal<string | null>(null);
  payments = signal<Payment[]>([]);
  status = signal<PaymentStatus>('pending');
}
```

---

## 6. Change Detection Without Zone.js

### 6.1. Automatic Change Detection

These operations automatically trigger change detection in zoneless mode:

- Signal updates (`signal.set()`, `signal.update()`)
- Events from templates (`(click)`, `(input)`, etc.)
- Async pipe updates
- `toSignal()` updates

### 6.2. Manual Change Detection

For operations outside Angular's control:

```typescript
import { ChangeDetectorRef, inject } from '@angular/core';

export class ManualComponent {
  private cdr = inject(ChangeDetectorRef);
  
  onExternalLibraryCallback(data: any) {
    this.processData(data);
    
    // Manually trigger change detection
    this.cdr.markForCheck();
  }
  
  setupExternalListener() {
    externalLibrary.on('event', (data) => {
      this.handleEvent(data);
      this.cdr.markForCheck();
    });
  }
}
```

### 6.3. Using OnPush Strategy

Always use `OnPush` for better performance:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-payment-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3>{{ payment().customer }}</h3>
      <p>{{ payment().amount | currency }}</p>
    </div>
  `
})
export class PaymentCardComponent {
  payment = input.required<Payment>();
}
```

---

## 7. Forms in Zoneless Mode

### 7.1. Reactive Forms with Signals

```typescript
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="amount" type="number" />
      @if (form.controls.amount.errors?.['required']) {
        <span class="error">Amount is required</span>
      }
      @if (form.controls.amount.errors?.['min']) {
        <span class="error">Minimum amount is $1</span>
      }
      
      <select formControlName="currency">
        @for (curr of currencies(); track curr) {
          <option [value]="curr">{{ curr }}</option>
        }
      </select>
      
      <button type="submit" [disabled]="form.invalid || submitting()">
        Submit
      </button>
    </form>
  `
})
export class PaymentFormComponent {
  currencies = signal(['MXN', 'COP', 'ARS', 'CLP']);
  submitting = signal(false);
  
  form = new FormGroup({
    amount: new FormControl(0, [Validators.required, Validators.min(1)]),
    currency: new FormControl('MXN', [Validators.required])
  });
  
  async onSubmit() {
    if (this.form.invalid) return;
    
    this.submitting.set(true);
    try {
      await this.paymentService.create(this.form.value);
      this.form.reset();
    } finally {
      this.submitting.set(false);
    }
  }
}
```

### 7.2. Form Value as Signal

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

export class FormComponent {
  form = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });
  
  // Convert form value stream to signal
  formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value
  });
  
  // Computed validation
  isValid = computed(() => {
    const value = this.formValue();
    return value.email && value.password && value.password.length >= 8;
  });
}
```

---

## 8. Third-Party Library Integration

### 8.1. Handling Non-Angular Code

```typescript
import { NgZone, inject } from '@angular/core';

export class MapComponent {
  private zone = inject(NgZone);
  
  initializeMap() {
    // Run outside Angular for better performance
    this.zone.runOutsideAngular(() => {
      const map = new ExternalMapLibrary('#map');
      
      map.on('click', (event) => {
        // Re-enter Angular zone for state updates
        this.zone.run(() => {
          this.handleMapClick(event);
        });
      });
    });
  }
}
```

### 8.2. Wrapper for External Libraries

```typescript
export class ChartComponent {
  chartData = signal<ChartData>({ labels: [], values: [] });
  private chartInstance: Chart;
  
  ngAfterViewInit() {
    this.chartInstance = new Chart(this.canvas.nativeElement, {
      type: 'bar',
      data: this.chartData()
    });
    
    // Update chart when signal changes
    effect(() => {
      this.chartInstance.data = this.chartData();
      this.chartInstance.update();
    });
  }
}
```

---

## 9. Testing Zoneless Components

### 9.1. Unit Tests

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: PaymentService, useValue: mockPaymentService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
  });
  
  it('should update total when payment added', () => {
    component.payments.set([
      { id: '1', amount: 100 },
      { id: '2', amount: 200 }
    ]);
    
    expect(component.total()).toBe(300);
  });
  
  it('should handle async loading', async () => {
    const payments = [{ id: '1', amount: 100 }];
    mockPaymentService.getPayments.mockResolvedValue(payments);
    
    await component.loadPayments();
    
    expect(component.loading()).toBe(false);
    expect(component.payments()).toEqual(payments);
  });
});
```

---

## 10. Performance Optimization

### 10.1. Avoid Unnecessary Computations

```typescript
// Bad: Creates new array on every check
get filteredPayments() {
  return this.payments.filter(p => p.amount > 100);
}

// Good: Computed signal (memoized)
filteredPayments = computed(() => 
  this.payments().filter(p => p.amount > 100)
);
```

### 10.2. Use TrackBy with @for

```typescript
@Component({
  template: `
    @for (item of items(); track item.id) {
      <app-item [data]="item" />
    }
  `
})
export class ListComponent {
  items = signal<Item[]>([]);
}
```

### 10.3. Lazy Load Computed Values

```typescript
export class ReportComponent {
  rawData = signal<Data[]>([]);
  
  // Only computed when accessed
  expensiveCalculation = computed(() => {
    console.log('Computing...');
    return complexAnalysis(this.rawData());
  });
  
  // Won't compute until used in template
  displayReport() {
    return this.expensiveCalculation();
  }
}
```

---

## 11. Migration Checklist

- [ ] Add `provideExperimentalZonelessChangeDetection()` to bootstrap
- [ ] Remove Zone.js import from polyfills
- [ ] Convert BehaviorSubject to Signals
- [ ] Replace `async` pipe with `toSignal()` where appropriate
- [ ] Use new control flow syntax (`@if`, `@for`, `@switch`)
- [ ] Add `ChangeDetectionStrategy.OnPush` to all components
- [ ] Test async operations and event handlers
- [ ] Check third-party libraries for Zone.js dependency
- [ ] Update tests to use zoneless providers
- [ ] Monitor for change detection issues in production

---

## 12. Common Issues and Solutions

### 12.1. Issue: Changes Not Reflected in UI

**Problem:**

```typescript
async fetchData() {
  const data = await this.api.getData();
  this.data = data; // UI doesn't update
}
```

**Solution:**

```typescript
async fetchData() {
  const data = await this.api.getData();
  this.dataSignal.set(data); // UI updates automatically
}
```

### 12.2. Issue: Third-Party Library Events

**Problem:**

```typescript
externalLib.on('event', (data) => {
  this.state = data; // Doesn't trigger change detection
});
```

**Solution:**

```typescript
externalLib.on('event', (data) => {
  this.stateSignal.set(data); // Triggers change detection
});
```

### 12.3. Issue: setTimeout/setInterval

**Problem:**

```typescript
setTimeout(() => {
  this.counter++; // Doesn't update UI
}, 1000);
```

**Solution:**

```typescript
setTimeout(() => {
  this.counterSignal.update(n => n + 1); // Updates UI
}, 1000);
```

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-22  
**Author:** Frontend Team  
**Status:** Active
