---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "ux-flow" # REQUIRED: Type identifier for MCP/RAG
module: "[module-name]" # REQUIRED: e.g., "inventory-ui", "sales-ui"
status: "approved" # REQUIRED: draft | in-review | approved | deprecated
version: "1.0.0" # REQUIRED: Semantic versioning
last_updated: "YYYY-MM-DD" # REQUIRED: ISO date format
author: "@username" # REQUIRED: GitHub username or team

# Keywords for semantic search
keywords:
  - "ux"
  - "user-flow"
  - "screens"
  - "validation"
  - "[feature-name]" # e.g., "barcode-scanning", "product-creation"
  - "mobile"
  - "accessibility"
  - "user-experience"
  - "ui"

# Related documentation
related_docs:
  database_schema: "" # Path to DB schema
  api_design: "" # Path to API design
  feature_design: "" # Path to feature design
  sync_strategy: "" # Path to sync strategy (offline behavior)

# UX-specific metadata
ux_metadata:
  platform: "web" # "web" | "mobile" | "both"
  framework: "Angular 21+"
  total_screens: 0 # Update after completion
  accessibility_level: "WCAG AA" # "WCAG A" | "WCAG AA" | "WCAG AAA"
  user_roles: [] # e.g., ["merchant", "cashier", "admin"]
  key_interactions: [] # e.g., ["barcode-scan", "product-search", "form-validation"]
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document is a TEMPLATE for UX/UI Flow Documentation.

  PURPOSE: Document user interaction flows, validation screens, and UI behavior ONLY.

  CRITICAL RULES:
  1. NO database schema definitions (tables, columns)
  2. NO API endpoint implementations
  3. NO business logic algorithms (unless directly visible to user)
  4. FOCUS ON: User journeys, screen mockups, validation flows, error states

  WHERE TO DOCUMENT OTHER ASPECTS:
  - Database Structure > docs/technical/backend/database/
  - API Contracts > docs/technical/backend/api/
  - Business Logic > docs/technical/backend/features/
  - Architectural Decisions > docs/technical/architecture/adr/
-->
<!-- AI-INSTRUCTION: END -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="120" align="center" valign="middle">
      <img src="../../../libs/assets/src/images/logo.png" width="80" alt="Project Logo" />
    </td>
    <td align="left" valign="middle">
      <h1 style="margin: 0; border-bottom: none;">UX Flow: [Flow Name]</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">User Experience Flow Documentation</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Approved-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Platform-Web-blue?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/Last%20Updated-YYYY--MM--DD-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                 |
| :------------- | :-------------------------------------------------------------------------- |
| **Context**    | This document defines the user experience flow for [Flow Name].             |
| **Scope**      | ONLY user interactions, screen flows, validation messages, and UI behavior. |
| **Constraint** | NO database schema, NO API implementation, NO algorithmic details.          |
| **Related**    | [Feature Design Doc], [Database Schema Doc], [API Design Doc]               |
| **Pattern**    | Follow Material Design / Tailwind patterns. Mobile-first responsive design. |

---

## 1. Executive Summary

_High-level overview of this user flow._

**Flow Purpose:** [e.g. "Allow merchants to scan barcodes and add products to inventory with validation"]

**User Persona:** [e.g. "Small shop owner with limited technical knowledge"]

**Success Criteria:**

- [Criterion 1: e.g. "User can complete flow in <30 seconds"]
- [Criterion 2: e.g. "Zero ambiguity in product identification"]
- [Criterion 3: e.g. "Works offline with sync queue"]

**Entry Points:**

- [e.g. "Inventory Management > 'Receive Stock' button"]
- [e.g. "POS > Quick restock during sale"]

---

## 2. User Journey Map

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Entry     │────▶│  Identify   │────▶│  Validate   │────▶│  Confirm    │
│   Point     │     │   Product   │     │  & Adjust   │     │  & Save     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │                    │
      ▼                    ▼                    ▼                    ▼
 User Intent        Scan/Search          Review Info           Stock Updated
 "Add Stock"        Barcode/Name         Quantity/Price        Show Success
```

**Steps:**

1. **Entry:** User initiates flow from [screen/button]
2. **Identify:** User scans barcode or searches by name
3. **Validate:** System shows product details, user confirms/adjusts
4. **Confirm:** User saves, system updates stock and shows confirmation

---

## 3. Screen-by-Screen Flow

### 3.1. Entry Screen: [Screen Name]

**Trigger:** User taps "[Button/Action]"

**Screen Purpose:** [What this screen achieves]

**Mockup:**

```text
┌─────────────────────────────────────┐
│  < [Back]      [Screen Title]       │
├─────────────────────────────────────┤
│                                     │
│  [Primary Action Button]            │
│  [Secondary Action Button]          │
│                                     │
│  [Content Area]                     │
│                                     │
└─────────────────────────────────────┘
```

**Elements:**

- **Header:** [Title text]
- **Primary CTA:** "[Button Text]" > Goes to [Next Screen]
- **Secondary CTA:** "[Button Text]" > Goes to [Alt Screen]

**Validation:**

- [ ] All required data loaded
- [ ] User has permission to access
- [ ] Offline mode handled gracefully

---

### 3.2. Main Flow Screen: [Screen Name]

**Scenario A: Happy Path (Known Product)**

**User Action:** Scans barcode "7501234567890"

**System Response:**

```text
┌─────────────────────────────────────┐
│   Producto Identificado            │
├─────────────────────────────────────┤
│                                     │
│  [Product Image]                 │
│                                     │
│  Sabritas Adobadas 45g              │
│  SKU: SAB-ADO-45                    │
│                                     │
│  Cantidad a recibir:                │
│  ┌─────────┐  ┌─────────────────┐  │
│  │    5    │  │ v Piezas        │  │
│  └─────────┘  └─────────────────┘  │
│                                     │
│  Stock actual: 24 pcs               │
│  Nuevo stock: 29 pcs                │
│                                     │
│  [ Cancelar ]    [  Confirmar ]   │
└─────────────────────────────────────┘
```

**Validation Rules:**

- Product name and image displayed prominently
- Current stock shown for context
- Quantity field editable with unit selector
- New stock calculated and shown in real-time
- Fast path: Scan > Adjust > Confirm (3 taps)

**Edge Cases:**

- **Invalid quantity:** Show error "Cantidad debe ser mayor a 0"
- **No stock data:** Show warning "Stock no registrado, se iniciará en [quantity]"
- **Offline mode:** Show badge "Sin conexión - Se sincronizará"

---

**Scenario B: Ambiguous Product (Multiple Matches)**

**User Action:** Searches "Sabritas"

**System Response:**

```text
┌─────────────────────────────────────┐
│  [SEARCH] Resultados de Búsqueda          │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Sabritas Adobadas 45g    │   │
│  │    Stock: 24 pcs            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Sabritas Limón 45g       │   │
│  │    Stock: 18 pcs            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Sabritas Amarillas 170g  │   │
│  │    Stock: 0 pcs             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ + Crear Nuevo ]                  │
└─────────────────────────────────────┘
```

**Interaction:**

- User taps product card > Goes to Validation Screen (3.2 Scenario A)
- User taps "Crear Nuevo" > Goes to Product Creation Flow

---

**Scenario C: Unknown Product (Not Found)**

**User Action:** Scans unknown barcode "9876543210987"

**System Response:**

```text
┌─────────────────────────────────────┐
│  🆕 Producto No Encontrado          │
├─────────────────────────────────────┤
│                                     │
│  Código: 9876543210987              │
│                                     │
│  ¿Deseas buscarlo en línea?        │
│                                     │
│  [ [SEARCH] Buscar en Base de Datos ]    │
│                                     │
│  [ [EDIT] Crear Manualmente ]          │
│                                     │
│  [ [X] Cancelar ]                    │
└─────────────────────────────────────┘
```

**Branching:**

- **Buscar en Base de Datos:** Calls external API (OpenFoodFacts, UPC DB)
  - If found > Pre-fill creation form
  - If not found > Show "Sin resultados" > Go to manual creation
- **Crear Manualmente:** Go to Product Creation Wizard (Section 3.3)

---

### 3.3. Product Creation Wizard

**Step 1: Basic Information**

```text
┌─────────────────────────────────────┐
│  < [Atrás]   Nuevo Producto (1/3)   │
├─────────────────────────────────────┤
│                                     │
│   [Tomar Foto]  [Elegir Imagen]  │
│                                     │
│  Nombre *                           │
│  ┌─────────────────────────────┐   │
│  │ Sabritas Amarillas 45g      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Categoría *                        │
│  ┌─────────────────────────────┐   │
│  │ v Botanas                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Marca                              │
│  ┌─────────────────────────────┐   │
│  │ Sabritas                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Código de Barras                   │
│  ┌─────────────────────────────┐   │
│  │ 7501234567890               │   │
│  └─────────────────────────────┘   │
│   Este código es el principal     │
│                                     │
│  [ Cancelar ]    [ Siguiente > ]   │
└─────────────────────────────────────┘
```

**Validation:**

- Name: Required, 3-255 chars
- Category: Required, selected from dropdown
- Marca: Optional
- Barcode: Optional, but if provided must be unique

**Step 2: Pricing (Optional)**

```text
┌─────────────────────────────────────┐
│  < [Atrás]   Nuevo Producto (2/3)   │
├─────────────────────────────────────┤
│                                     │
│  Precio de Venta                    │
│  ┌─────────────────────────────┐   │
│  │ $  15.00                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Costo (Opcional - Restringido)     │
│  ┌─────────────────────────────┐   │
│  │ $  8.00                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  INFO: El costo no será visible para   │
│     vendedores sin permiso          │
│                                     │
│  [ < Atrás ]     [ Siguiente > ]   │
└─────────────────────────────────────┘
```

**Step 3: Initial Stock**

```text
┌─────────────────────────────────────┐
│  < [Atrás]   Nuevo Producto (3/3)   │
├─────────────────────────────────────┤
│                                     │
│  Cantidad Recibida *                │
│  ┌─────────┐  ┌─────────────────┐  │
│  │   12    │  │ v Piezas        │  │
│  └─────────┘  └─────────────────┘  │
│                                     │
│  Lote/Batch (Opcional)              │
│  ┌─────────────────────────────┐   │
│  │ LOTE-2025-001               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Fecha de Vencimiento (Opcional)    │
│  ┌─────────────────────────────┐   │
│  │  2026-12-31               │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ < Atrás ]     [  Guardar ]    │
└─────────────────────────────────────┘
```

**On Save:**

1. Create `Product` record
2. Create `Barcode` record (if provided)
3. Create `InventoryLevel` record
4. Create `StockMovement` (RESTOCK, +12 pcs)
5. Show success message
6. Return to inventory list

---

### 3.4. Confirmation Screen

**Success State:**

```text
┌─────────────────────────────────────┐
│            ¡Listo!               │
├─────────────────────────────────────┤
│                                     │
│  Stock actualizado correctamente    │
│                                     │
│  Sabritas Adobadas 45g           │
│  Cantidad agregada: +12 pcs         │
│  Nuevo stock: 36 pcs                │
│                                     │
│  [ Ver Inventario ]                 │
│  [ Agregar Otro Producto ]          │
│                                     │
└─────────────────────────────────────┘
```

**Auto-dismiss:** After 2 seconds, return to inventory list

---

## 4. Error States & Edge Cases

### 4.1. Validation Errors

| Error Condition              | User Message                               | Resolution                           |
| :--------------------------- | :----------------------------------------- | :----------------------------------- |
| Empty quantity               | "Cantidad debe ser mayor a 0"              | Show field error, disable Confirm    |
| Duplicate barcode            | "Este código ya existe en [Product Name]"  | Show conflict dialog, offer to merge |
| Network timeout (online API) | "No se pudo conectar. Inténtalo de nuevo"  | Retry button, fallback to manual     |
| Permission denied            | "No tienes permiso para agregar productos" | Show message, redirect to dashboard  |
| Invalid barcode format       | "Código de barras inválido"                | Show field error, allow to continue  |

### 4.2. Offline Behavior

**When Offline:**

- Show badge: "OFFLINE"
- Allow all operations (stored in local queue)
- Show warning: "Los cambios se sincronizarán cuando vuelvas a conectarte"

**When Back Online:**

- Auto-sync queued operations
- Show notification: "SYNCED: [X] cambios sincronizados"
- Handle conflicts (show conflict resolution UI if needed)

### 4.3. Conflict Resolution

**Scenario:** User edits product offline, another user edits same product online.

**Resolution UI:**

```text
┌─────────────────────────────────────┐
│  CONFLICTO DETECTADO             │
├─────────────────────────────────────┤
│                                     │
│  El producto fue modificado por     │
│  otro usuario mientras estabas      │
│  desconectado.                      │
│                                     │
│  Tus Cambios:                       │
│  • Cantidad: +10 pcs                │
│  • Precio: $15.00                   │
│                                     │
│  Cambios del Servidor:              │
│  • Cantidad: +5 pcs                 │
│  • Precio: $16.00                   │
│                                     │
│  [ Usar Mis Cambios ]               │
│  [ Usar Cambios del Servidor ]      │
│  [ Ver Detalles ]                   │
│                                     │
└─────────────────────────────────────┘
```

---

## 5. Accessibility Considerations

### 5.1. Keyboard Navigation

- All interactive elements accessible via Tab
- Enter key triggers primary action
- Escape key cancels/closes dialogs
- Arrow keys navigate lists

### 5.2. Screen Reader Support

```html
<button aria-label="Confirmar recepción de 12 piezas de Sabritas Adobadas">
  Confirmar
</button>

<input
  type="number"
  aria-label="Cantidad a recibir"
  aria-describedby="stock-help-text"
/>
<span id="stock-help-text">Stock actual: 24 piezas</span>
```

### 5.3. Color Contrast

- All text meets WCAG AA standards (4.5:1 contrast)
- Error states use both color AND icon (not just red)
- Focus indicators visible on all interactive elements

---

## 6. Performance Considerations

### 6.1. Load Times

- Initial screen: <200ms
- Barcode scan > Product display: <500ms
- Product creation: <1s (with optimistic UI)

### 6.2. Optimistic UI

When user confirms:

1. Immediately show success screen (don't wait for API)
2. Queue operation in background
3. If API fails, rollback and show error toast

### 6.3. Image Optimization

- Product images: max 500KB, WebP format
- Lazy load images in lists
- Show placeholder while loading

---

## 7. Analytics & Tracking

Track these events for UX optimization:

```typescript
// User initiates flow
analytics.track("inventory_receive_started", {
  entryPoint: "main_menu" | "pos_quick_action",
});

// Product identification method
analytics.track("product_identified", {
  method: "barcode_scan" | "manual_search" | "quick_select",
  timeToIdentify: milliseconds,
  productId: string,
});

// Validation adjustments
analytics.track("quantity_adjusted", {
  initialQuantity: number,
  finalQuantity: number,
  adjustmentCount: number,
});

// Flow completion
analytics.track("inventory_receive_completed", {
  totalTime: milliseconds,
  stepCount: number,
  hadErrors: boolean,
});

// Abandonment
analytics.track("inventory_receive_abandoned", {
  abandonedAt: "identification" | "validation" | "creation",
  timeSpent: milliseconds,
});
```

---

## 8. Mobile-Specific Considerations

### 8.1. Barcode Scanner

```typescript
// Use native camera API
if (navigator.mediaDevices?.getUserMedia) {
  // Use ZXing or QuaggaJS for barcode detection
  startBarcodeScanner();
} else {
  // Fallback: Manual entry
  showManualBarcodeInput();
}
```

### 8.2. Touch Gestures

- Swipe left: Cancel/Go back
- Swipe right: Confirm/Next step
- Long press on product: Show quick actions menu
- Pull to refresh: Sync inventory

### 8.3. Responsive Breakpoints

```css
/* Mobile first */
.product-grid {
  grid-template-columns: 1fr;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 9. Related Documentation

- [Inventory Database Schema](../../backend/database/04-INVENTORY-SCHEMA.md) - Data structure
- [Inventory API Design](../../backend/api/API-INVENTORY.md) - API contracts
- [Product Creation Feature](../../backend/features/PRODUCT-MANAGEMENT.md) - Business logic
- [Barcode Standards ADR](../../architecture/adr/ADR-XXX-barcode-standards.md) - GS1 decision

---

## Appendix A: Change Log

| Date       | Version | Author    | Changes                       |
| :--------- | :------ | :-------- | :---------------------------- |
| YYYY-MM-DD | 1.0.0   | @Frontend | Initial UX flow documentation |

---

## Appendix B: Design Assets

- Figma: [Link to design file]
- Icons: [Link to icon library]
- Style Guide: [Link to Tailwind config]
