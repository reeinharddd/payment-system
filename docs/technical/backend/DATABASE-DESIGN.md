# Database Design & ER Diagrams

This document serves as the central repository for the project's Entity-Relationship (ER) diagrams. Before modifying `schema.prisma`, changes must be modeled here using Mermaid.js.

## Core Data Model

```mermaid
erDiagram
    %% --- AUTH MODULE ---
    User ||--o{ UserIdentity : has
    User ||--o{ UserRole : has
    Role ||--o{ UserRole : assigned_to
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
    Branch ||--o{ Stock : stores
    Product ||--o{ Stock : tracked_in
    Variant ||--o{ Stock : tracked_in
    Business ||--o{ InventoryAlert : receives

    %% --- SALES MODULE ---
    Branch ||--o{ CashRegister : has
    CashRegister ||--o{ Shift : records
    User ||--o{ Shift : opens
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

    UserRole {
        uuid userId FK
        uuid roleId FK
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
        decimal price
        decimal cost
        decimal taxRate
        enum type "ITEM, SERVICE"
        boolean isActive
    }

    Variant {
        uuid id PK
        uuid productId FK
        string name
        string sku
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
        decimal total
        decimal subtotal
        decimal tax
        decimal discount
        enum status "COMPLETED, CANCELLED, PENDING"
        enum paymentMethod
        timestamp createdAt
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
