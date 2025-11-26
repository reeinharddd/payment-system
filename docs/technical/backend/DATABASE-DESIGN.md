<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the DATABASE DESIGN.
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
      <h1 style="margin: 0; border-bottom: none;">Database Design & ER Diagrams</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Entity-Relationship models and schema definitions</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-Backend-blue?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--25-lightgrey?style=flat-square" alt="Date" />

</div>

---

## 🤖 Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                  |
| :------------- | :----------------------------------------------------------- |
| **Context**    | This document defines the database schema and ER diagrams.   |
| **Constraint** | All schema changes MUST be modeled here first using Mermaid. |
| **Pattern**    | Use the 'Code-First' approach but document here first.       |
| **Related**    | `apps/backend/prisma/schema.prisma`                          |

---

## Core Data Model

```mermaid
erDiagram
    %% --- AUTH MODULE ---
    User ||--o{ UserIdentity : has
    User ||--o{ Employee : is_linked_to
    Business ||--o{ Employee : employs
    Branch ||--o{ Employee : assigned_to
    Role ||--o{ Employee : assigned_role
    Role ||--o{ RolePermission : has
    Permission ||--o{ RolePermission : grants
    Business ||--o{ ApiKey : owns
    Business ||--o{ Role : defines_custom

    %% --- BUSINESS CORE ---
    User ||--o{ Business : owns
    Business ||--|{ Branch : has
    Business ||--o{ PaymentMethod : has

    %% --- INVENTORY MODULE ---
    Business ||--o{ Category : manages
    Category ||--o{ Category : parent_of
    Category ||--o{ Product : contains
    Business ||--o{ Product : owns
    Product ||--o{ Variant : has
    Product ||--o{ ProductModifierGroup : has
    ProductModifierGroup ||--o{ ProductModifier : contains
    Product ||--o{ ProductComponent : "composed_of (Recipe/Pack)"
    Branch ||--o{ Stock : stores
    Product ||--o{ Stock : tracked_in
    Variant ||--o{ Stock : tracked_in
    Business ||--o{ InventoryAlert : receives

    %% --- SALES MODULE ---
    Branch ||--o{ CashRegister : has
    CashRegister ||--o{ Shift : records
    Employee ||--o{ Shift : opens
    Shift ||--o{ Sale : includes
    Sale ||--|{ SaleItem : contains
    Product ||--o{ SaleItem : sold_as
    Variant ||--o{ SaleItem : sold_as
    Sale ||--o| Transaction : paid_via

    %% --- BILLING MODULE ---
    Sale ||--o| Invoice : generates
    Transaction ||--o| Invoice : related_to

    %% --- NOTIFICATIONS MODULE ---
    Business ||--o{ NotificationLog : receives
    User ||--o{ NotificationLog : receives

    %% --- ENTITY DEFINITIONS ---

    User {
        uuid id PK
        string email UK
        string phone UK
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    UserIdentity {
        uuid id PK
        uuid userId FK
        enum provider "LOCAL, GOOGLE, PHONE"
        string providerId "email, google_sub, phone_number"
        string credential "password_hash, null"
        jsonb metadata
        timestamp lastLogin
    }

    Employee {
        uuid id PK
        uuid userId FK "Nullable (if invite pending)"
        uuid businessId FK
        uuid branchId FK "Nullable (if multi-branch)"
        uuid roleId FK
        string alias "e.g. Juan - Waiter"
        string pinCode "Hashed 4-6 digit PIN"
        string inviteToken
        enum status "ACTIVE, INVITED, SUSPENDED"
        timestamp joinedAt
    }

    Role {
        uuid id PK
        uuid businessId FK "Nullable (System roles)"
        string name
        string description
        enum type "SYSTEM, CUSTOM"
    }

    Permission {
        uuid id PK
        string action
        string resource
        string description
    }

    RolePermission {
        uuid roleId FK
        uuid permissionId FK
    }

    ApiKey {
        uuid id PK
        uuid businessId FK
        string keyHash
        string name
        jsonb scopes
        timestamp expiresAt
        timestamp lastUsedAt
    }

    Business {
        uuid id PK
        uuid ownerId FK
        string legalName
        string taxId UK
        string country
        string industry
        jsonb settings
        jsonb fiscalData "Tax Data"
        boolean isActive
        timestamp createdAt
    }

    PaymentMethod {
        uuid id PK
        uuid businessId FK
        string name
        enum type "CASH, CARD, QR, TRANSFER"
        jsonb config
        boolean isActive
    }

    Branch {
        uuid id PK
        uuid businessId FK
        string name
        string address
        string phone
        string timezone
        boolean isActive
    }

    Category {
        uuid id PK
        uuid businessId FK
        uuid parentId FK
        string name
        string description
    }

    Product {
        uuid id PK
        uuid businessId FK
        uuid categoryId FK
        string name
        string description
        string sku
        string barcode "Unique per Business"
        decimal price
        decimal cost
        decimal taxRate
        enum type "ITEM, SERVICE, COMPOSITE"
        boolean trackInventory "If false, stock is not checked"
        boolean isActive
    }

    ProductComponent {
        uuid id PK
        uuid parentProductId FK "The Pack or Recipe"
        uuid childProductId FK "The Item inside"
        decimal quantity "How many items per pack/recipe"
        enum type "RECIPE, PACK"
    }

    ProductModifierGroup {
        uuid id PK
        uuid productId FK
        string name "e.g. Salsa, Termino"
        int minSelection
        int maxSelection
        boolean isRequired
    }

    ProductModifier {
        uuid id PK
        uuid groupId FK
        string name "e.g. Verde, Roja, 3/4"
        decimal priceAdjustment
        decimal costAdjustment
    }

    Variant {
        uuid id PK
        uuid productId FK
        string name
        string sku
        string barcode
        decimal price
        decimal cost
    }

    Stock {
        uuid id PK
        uuid branchId FK
        uuid productId FK
        uuid variantId FK
        decimal quantity
        decimal minStock
        string location
    }

    InventoryAlert {
        uuid id PK
        uuid businessId FK
        uuid branchId FK
        uuid productId FK
        enum type "OVERSELLING, LOW_STOCK"
        decimal expectedStock
        decimal actualStock
        enum status "PENDING, RESOLVED"
        timestamp createdAt
    }

    CashRegister {
        uuid id PK
        uuid branchId FK
        string name
        enum status "OPEN, CLOSED"
    }

    Shift {
        uuid id PK
        uuid cashRegisterId FK
        uuid employeeId FK
        timestamp startTime
        timestamp endTime
        decimal startAmount
        decimal endAmount
        decimal expectedAmount
        decimal difference
        string notes
    }

    Sale {
        uuid id PK
        uuid shiftId FK
        uuid customerId FK
        string label "Table 5, Tab Name"
        decimal total
        decimal subtotal
        decimal tax
        decimal discount
        enum status "OPEN, COMPLETED, CANCELLED"
        enum channel "POS, DELIVERY"
        enum paymentMethod
        timestamp createdAt
        timestamp updatedAt
    }

    SaleItem {
        uuid id PK
        uuid saleId FK
        uuid productId FK
        uuid variantId FK
        decimal quantity
        decimal unitPrice
        decimal total
        decimal tax
        decimal discount
        jsonb modifiers "Selected modifiers snapshot"
        string notes "Kitchen notes"
        enum status "PENDING, PREPARING, READY, DELIVERED"
        timestamp deliveredAt
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
        uuid saleId FK
        uuid transactionId FK
        string invoiceNumber UK
        enum type
        string uuid "Fiscal UUID"
        string country
        jsonb fiscalData
        string pdfUrl
        enum status
        timestamp issuedAt
    }

    NotificationTemplate {
        uuid id PK
        string name
        enum channel "SMS, EMAIL, PUSH, WHATSAPP"
        string subject
        string content
        jsonb variables
        boolean isActive
    }

    NotificationLog {
        uuid id PK
        uuid businessId FK
        uuid userId FK
        enum channel
        string recipient
        enum status "SENT, FAILED, PENDING"
        string error
        timestamp sentAt
    }
```

## Proposed Changes

> (Add new diagrams here for proposed features before implementing them)
