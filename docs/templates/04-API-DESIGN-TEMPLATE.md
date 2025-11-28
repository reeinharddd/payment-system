---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "api-design" # REQUIRED: Type identifier for MCP/RAG
module: "[module-name]" # REQUIRED: e.g., "inventory", "sales", "payments"
status: "approved" # REQUIRED: draft | in-review | approved | deprecated
version: "1.0.0" # REQUIRED: Semantic versioning (Major.Minor.Patch)
last_updated: "YYYY-MM-DD" # REQUIRED: ISO date format
author: "@username" # REQUIRED: GitHub username or team

# Keywords for semantic search (optimize for MCP tool discovery)
keywords:
  - "api"
  - "rest"
  - "endpoints"
  - "dto"
  - "[resource-name]" # e.g., "product-api", "inventory-api"
  - "[http-methods]" # e.g., "get", "post", "patch", "delete"
  - "openapi"
  - "swagger"

# Related documentation for cross-referencing
related_docs:
  database_schema: "" # Path to related DB schema doc
  ux_flow: "" # Path to related UX flow doc
  feature_design: "" # Path to related feature design doc
  sync_strategy: "" # Path to related sync strategy doc

# API-specific metadata
api_metadata:
  base_path: "/api/v1/[resource]" # e.g., "/api/v1/products"
  authentication: "JWT Bearer Token"
  rate_limit: "100 req/min"
  total_endpoints: 0 # Update after completion
  openapi_spec: "" # Path to OpenAPI/Swagger JSON file
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document is a TEMPLATE for API Design Documentation.

  PURPOSE: Define REST API contracts (endpoints, DTOs, requests, responses) ONLY.

  CRITICAL RULES:
  1. NO database schema definitions (use Database Schema docs)
  2. NO UI/UX flows (use UX Flow docs)
  3. NO business logic implementation details (use Feature Design docs)
  4. FOCUS ON: Endpoints, HTTP methods, request/response DTOs, status codes, authentication

  WHERE TO DOCUMENT OTHER ASPECTS:
  - Database Structure > docs/technical/backend/database/
  - Business Logic > docs/technical/backend/features/
  - UI Flows > docs/technical/frontend/ux-flows/
  - Architecture Decisions > docs/technical/architecture/adr/
-->
<!-- AI-INSTRUCTION: END -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="120" align="center" valign="middle">
      <img src="../../../libs/assets/src/images/logo.png" width="80" alt="Project Logo" />
    </td>
    <td align="left" valign="middle">
      <h1 style="margin: 0; border-bottom: none;">API: [Module Name]</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">REST API Contract Documentation</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Approved-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Version-v1-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/Last%20Updated-YYYY--MM--DD-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                   |
| :------------- | :---------------------------------------------------------------------------- |
| **Context**    | This document defines the REST API contract for the [Module Name] module.     |
| **Scope**      | ONLY HTTP endpoints, request/response DTOs, authentication, and status codes. |
| **Constraint** | NO database queries, NO UI flows, NO algorithmic implementations.             |
| **Related**    | [Database Schema], [Feature Design], [UX Flow]                                |
| **Pattern**    | RESTful principles, OpenAPI 3.0 specification, NestJS conventions.            |

---

## 1. Executive Summary

_High-level overview of this API module._

**Module Purpose:** [e.g. "Manage inventory operations: product creation, stock movements, and catalog queries"]

**Base URL:** `/api/v1/[module]`

**Authentication:** `Bearer Token` (JWT)

**Key Capabilities:**

- [Capability 1: e.g. "CRUD operations on products"]
- [Capability 2: e.g. "Stock level updates with optimistic locking"]
- [Capability 3: e.g. "Barcode scanning and product identification"]

**Dependencies:**

- **Authentication Service:** Validates JWT tokens
- **Database:** [Schema name] (see [link to DB schema doc])
- **External APIs:** [If any, e.g. "OpenFoodFacts for barcode lookup"]

---

## 2. API Overview

### 2.1. Endpoint Summary

| Method | Endpoint                       | Description                    | Auth Required |
| :----- | :----------------------------- | :----------------------------- | :------------ |
| GET    | `/api/v1/[module]`             | List all resources (paginated) | Yes           |
| GET    | `/api/v1/[module]/:id`         | Get single resource by ID      | Yes           |
| POST   | `/api/v1/[module]`             | Create new resource            | Yes           |
| PATCH  | `/api/v1/[module]/:id`         | Partial update of resource     | Yes           |
| DELETE | `/api/v1/[module]/:id`         | Soft delete resource           | Yes           |
| POST   | `/api/v1/[module]/search`      | Advanced search with filters   | Yes           |
| GET    | `/api/v1/[module]/:id/related` | Get related resources          | Yes           |

### 2.2. Common Response Codes

| Code | Status                | When                                             |
| :--- | :-------------------- | :----------------------------------------------- |
| 200  | OK                    | Successful GET/PATCH request                     |
| 201  | Created               | Successful POST request                          |
| 204  | No Content            | Successful DELETE request                        |
| 400  | Bad Request           | Validation error in request body                 |
| 401  | Unauthorized          | Missing or invalid authentication token          |
| 403  | Forbidden             | User lacks permission for this operation         |
| 404  | Not Found             | Resource does not exist                          |
| 409  | Conflict              | Optimistic locking version mismatch or duplicate |
| 422  | Unprocessable Entity  | Business rule violation                          |
| 429  | Too Many Requests     | Rate limit exceeded                              |
| 500  | Internal Server Error | Unexpected server error                          |

### 2.3. Common Headers

**Request Headers:**

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
X-Business-ID: <uuid>           # Multi-tenant identifier
X-Branch-ID: <uuid>             # Branch context (optional)
X-Idempotency-Key: <uuid>       # For idempotent operations
```

**Response Headers:**

```http
Content-Type: application/json
X-Request-ID: <uuid>            # For tracing and debugging
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701100800
```

---

## 3. Detailed Endpoint Specifications

### 3.1. List Resources

**Endpoint:** `GET /api/v1/[module]`

**Description:** Retrieve a paginated list of resources with optional filtering and sorting.

**Query Parameters:**

| Parameter   | Type     | Required | Default     | Description                                   |
| :---------- | :------- | :------- | :---------- | :-------------------------------------------- |
| `page`      | `number` | No       | `1`         | Page number (1-indexed)                       |
| `limit`     | `number` | No       | `20`        | Items per page (max 100)                      |
| `sortBy`    | `string` | No       | `createdAt` | Field to sort by                              |
| `sortOrder` | `string` | No       | `desc`      | Sort direction (`asc` or `desc`)              |
| `status`    | `string` | No       | -           | Filter by status (`ACTIVE`, `INACTIVE`, etc.) |
| `search`    | `string` | No       | -           | Full-text search across name and description  |

**Request Example:**

```http
GET /api/v1/products?page=1&limit=20&status=ACTIVE&search=sabritas HTTP/1.1
Host: api.payment-system.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Business-ID: 123e4567-e89b-12d3-a456-426614174000
```

**Response: 200 OK**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "businessId": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Sabritas Adobadas 45g",
      "sku": "SAB-ADO-45",
      "status": "ACTIVE",
      "basePrice": 15.0,
      "currentStock": 24,
      "createdAt": "2025-11-20T10:30:00Z",
      "updatedAt": "2025-11-27T14:22:00Z",
      "version": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 145,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Response DTOs:**

```typescript
// Response DTO (safe for public consumption)
export class ProductListItemDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440001" })
  id: string;

  @ApiProperty({ example: "Sabritas Adobadas 45g" })
  name: string;

  @ApiProperty({ example: "SAB-ADO-45" })
  sku: string;

  @ApiProperty({ enum: ["ACTIVE", "INACTIVE", "ARCHIVED"] })
  status: ProductStatus;

  @ApiProperty({ example: 15.0 })
  basePrice: number;

  @ApiProperty({ example: 24 })
  currentStock: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ example: 3 })
  version: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: [Object] })
  data: T[];

  @ApiProperty()
  pagination: PaginationMetaDto;
}

export class PaginationMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}
```

---

### 3.2. Get Single Resource

**Endpoint:** `GET /api/v1/[module]/:id`

**Description:** Retrieve detailed information about a single resource.

**Path Parameters:**

| Parameter | Type     | Required | Description   |
| :-------- | :------- | :------- | :------------ |
| `id`      | `string` | Yes      | Resource UUID |

**Request Example:**

```http
GET /api/v1/products/550e8400-e29b-41d4-a716-446655440001 HTTP/1.1
Host: api.payment-system.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Business-ID: 123e4567-e89b-12d3-a456-426614174000
```

**Response: 200 OK**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "businessId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Sabritas Adobadas 45g",
  "sku": "SAB-ADO-45",
  "description": "Papas fritas sabor adobadas",
  "status": "ACTIVE",
  "categoryId": "abc-123",
  "category": {
    "id": "abc-123",
    "name": "Botanas"
  },
  "basePrice": 15.0,
  "currentStock": 24,
  "reorderPoint": 10,
  "barcodes": [
    {
      "id": "barcode-1",
      "barcodeValue": "7501234567890",
      "barcodeType": "EAN13",
      "packageQuantity": 1,
      "packageUnit": "PIECE"
    }
  ],
  "metadata": {
    "brand": "Sabritas",
    "weight": "45g"
  },
  "createdAt": "2025-11-20T10:30:00Z",
  "updatedAt": "2025-11-27T14:22:00Z",
  "version": 3
}
```

**Response: 404 Not Found**

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found",
  "timestamp": "2025-11-27T14:22:00Z",
  "path": "/api/v1/products/550e8400-e29b-41d4-a716-446655440001"
}
```

**Response DTO:**

```typescript
export class ProductDetailDto extends ProductListItemDto {
  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  category: CategoryDto;

  @ApiProperty()
  reorderPoint: number;

  @ApiProperty({ type: [BarcodeDto] })
  barcodes: BarcodeDto[];

  @ApiProperty({ type: "object" })
  metadata: Record<string, any>;
}

export class CategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class BarcodeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  barcodeValue: string;

  @ApiProperty({ enum: ["EAN13", "UPC", "CODE128", "GS1"] })
  barcodeType: BarcodeType;

  @ApiProperty()
  packageQuantity: number;

  @ApiProperty()
  packageUnit: string;
}
```

---

### 3.3. Create Resource

**Endpoint:** `POST /api/v1/[module]`

**Description:** Create a new resource.

**Request Body:**

```json
{
  "name": "Sabritas Amarillas 45g",
  "sku": "SAB-AMA-45",
  "description": "Papas fritas amarillas",
  "categoryId": "abc-123",
  "basePrice": 15.0,
  "reorderPoint": 10,
  "barcodes": [
    {
      "barcodeValue": "7501234567891",
      "barcodeType": "EAN13",
      "packageQuantity": 1,
      "packageUnit": "PIECE"
    }
  ],
  "initialStock": {
    "quantity": 12,
    "branchId": "branch-123"
  },
  "metadata": {
    "brand": "Sabritas",
    "weight": "45g"
  }
}
```

**Request DTO:**

```typescript
export class CreateProductDto {
  @ApiProperty({ example: "Sabritas Amarillas 45g" })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: "SAB-AMA-45" })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  sku: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 15.0 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderPoint?: number;

  @ApiProperty({ type: [CreateBarcodeDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBarcodeDto)
  barcodes?: CreateBarcodeDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => InitialStockDto)
  initialStock?: InitialStockDto;

  @ApiProperty({ type: "object", required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateBarcodeDto {
  @IsString()
  barcodeValue: string;

  @IsEnum(BarcodeType)
  barcodeType: BarcodeType;

  @IsNumber()
  @Min(1)
  packageQuantity: number;

  @IsString()
  packageUnit: string;
}

export class InitialStockDto {
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsUUID()
  branchId: string;
}
```

**Response: 201 Created**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "businessId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Sabritas Amarillas 45g",
  "sku": "SAB-AMA-45",
  "status": "ACTIVE",
  "basePrice": 15.0,
  "currentStock": 12,
  "createdAt": "2025-11-27T14:30:00Z",
  "updatedAt": "2025-11-27T14:30:00Z",
  "version": 1
}
```

**Response: 400 Bad Request (Validation Error)**

```json
{
  "statusCode": 400,
  "message": [
    "name must be at least 3 characters",
    "basePrice must not be less than 0"
  ],
  "error": "Bad Request",
  "timestamp": "2025-11-27T14:30:00Z",
  "path": "/api/v1/products"
}
```

**Response: 409 Conflict (Duplicate SKU)**

```json
{
  "statusCode": 409,
  "message": "Product with SKU 'SAB-AMA-45' already exists",
  "error": "Conflict",
  "timestamp": "2025-11-27T14:30:00Z",
  "path": "/api/v1/products"
}
```

---

### 3.4. Update Resource

**Endpoint:** `PATCH /api/v1/[module]/:id`

**Description:** Partially update a resource. Includes optimistic locking via `version` field.

**Request Body:**

```json
{
  "name": "Sabritas Adobadas 45g (Nueva Fórmula)",
  "basePrice": 16.0,
  "version": 3
}
```

**Request DTO:**

```typescript
export class UpdateProductDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ description: "Current version for optimistic locking" })
  @IsNumber()
  version: number;

  // ... other optional fields
}
```

**Response: 200 OK**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Sabritas Adobadas 45g (Nueva Fórmula)",
  "basePrice": 16.0,
  "version": 4,
  "updatedAt": "2025-11-27T14:35:00Z"
}
```

**Response: 409 Conflict (Version Mismatch)**

```json
{
  "statusCode": 409,
  "message": "Resource was modified by another user. Current version: 5, provided version: 3",
  "error": "Conflict",
  "errorCode": "VERSION_MISMATCH",
  "timestamp": "2025-11-27T14:35:00Z",
  "path": "/api/v1/products/550e8400-e29b-41d4-a716-446655440001"
}
```

---

### 3.5. Delete Resource

**Endpoint:** `DELETE /api/v1/[module]/:id`

**Description:** Soft delete a resource (sets `deletedAt` timestamp).

**Request Example:**

```http
DELETE /api/v1/products/550e8400-e29b-41d4-a716-446655440001 HTTP/1.1
Host: api.payment-system.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Business-ID: 123e4567-e89b-12d3-a456-426614174000
```

**Response: 204 No Content**

_(Empty body)_

**Response: 404 Not Found**

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

---

### 3.6. Advanced Search

**Endpoint:** `POST /api/v1/[module]/search`

**Description:** Complex search with multiple filters and aggregations.

**Request Body:**

```json
{
  "filters": {
    "status": ["ACTIVE", "INACTIVE"],
    "categoryId": "abc-123",
    "priceRange": {
      "min": 10.0,
      "max": 50.0
    },
    "stockLevel": "LOW"
  },
  "search": "sabritas",
  "sortBy": "name",
  "sortOrder": "asc",
  "page": 1,
  "limit": 20
}
```

**Request DTO:**

```typescript
export class SearchProductDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductFiltersDto)
  filters?: ProductFiltersDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  sortOrder?: "asc" | "desc";

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class ProductFiltersDto {
  @IsOptional()
  @IsArray()
  @IsEnum(ProductStatus, { each: true })
  status?: ProductStatus[];

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PriceRangeDto)
  priceRange?: PriceRangeDto;

  @IsOptional()
  @IsEnum(["LOW", "NORMAL", "HIGH"])
  stockLevel?: StockLevel;
}

export class PriceRangeDto {
  @IsNumber()
  @Min(0)
  min: number;

  @IsNumber()
  @Min(0)
  max: number;
}
```

**Response: 200 OK**

_(Same structure as List Resources with filtered results)_

---

## 4. Error Handling

### 4.1. Standard Error Response Format

All errors follow this structure:

```typescript
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: "Validation failed" })
  message: string | string[];

  @ApiProperty({ example: "Bad Request" })
  error: string;

  @ApiProperty({ example: "VALIDATION_ERROR", required: false })
  errorCode?: string;

  @ApiProperty({ example: "2025-11-27T14:30:00Z" })
  timestamp: string;

  @ApiProperty({ example: "/api/v1/products" })
  path: string;

  @ApiProperty({ type: "object", required: false })
  details?: Record<string, any>;
}
```

### 4.2. Error Codes

| Error Code                | HTTP Status | Description                                    |
| :------------------------ | :---------- | :--------------------------------------------- |
| `VALIDATION_ERROR`        | 400         | Request body validation failed                 |
| `UNAUTHORIZED`            | 401         | Missing or invalid authentication token        |
| `FORBIDDEN`               | 403         | User lacks required permission                 |
| `NOT_FOUND`               | 404         | Resource does not exist                        |
| `DUPLICATE_RESOURCE`      | 409         | Resource with same unique field already exists |
| `VERSION_MISMATCH`        | 409         | Optimistic locking conflict                    |
| `BUSINESS_RULE_VIOLATION` | 422         | Operation violates business rule               |
| `RATE_LIMIT_EXCEEDED`     | 429         | Too many requests                              |
| `INTERNAL_ERROR`          | 500         | Unexpected server error                        |

---

## 5. Authentication & Authorization

### 5.1. JWT Token Structure

```json
{
  "sub": "user-uuid",
  "businessId": "business-uuid",
  "branchId": "branch-uuid",
  "roles": ["ADMIN", "CASHIER"],
  "permissions": ["product:read", "product:write", "stock:adjust"],
  "iat": 1701100800,
  "exp": 1701187200
}
```

### 5.2. Permission Requirements

| Endpoint                      | Required Permission |
| :---------------------------- | :------------------ |
| `GET /api/v1/products`        | `product:read`      |
| `GET /api/v1/products/:id`    | `product:read`      |
| `POST /api/v1/products`       | `product:write`     |
| `PATCH /api/v1/products/:id`  | `product:write`     |
| `DELETE /api/v1/products/:id` | `product:delete`    |

---

## 6. Rate Limiting

**Strategy:** Token bucket per user per endpoint category.

**Limits:**

| Endpoint Category | Requests per Minute | Burst Limit |
| :---------------- | :------------------ | :---------- |
| Read Operations   | 100                 | 120         |
| Write Operations  | 20                  | 30          |
| Search Operations | 30                  | 40          |

**Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701100860
```

---

## 7. Idempotency

**Idempotent Operations:** POST, PATCH, DELETE

**Header:** `X-Idempotency-Key: <uuid>`

**Behavior:**

- If key is provided, server stores result for 24 hours
- Subsequent requests with same key return cached result
- Prevents duplicate operations (e.g., double product creation)

**Example:**

```http
POST /api/v1/products HTTP/1.1
X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440099
Content-Type: application/json

{ "name": "Product A", ... }
```

**Response (First Request): 201 Created**

**Response (Duplicate Request): 200 OK** _(Returns same result, no new product created)_

---

## 8. Versioning Strategy

**Current Version:** v1

**URL Structure:** `/api/v1/[module]`

**Breaking Changes Policy:**

- Major version bump creates new URL path (`/api/v2/`)
- Old version supported for 6 months after new version release
- Deprecation warnings sent via `X-API-Version-Deprecated` header

---

## 9. OpenAPI Specification

Full OpenAPI 3.0 spec available at: `/api/docs`

**Swagger UI:** `https://api.payment-system.com/api/docs`

**JSON Spec:** `https://api.payment-system.com/api/docs-json`

**Example (partial):**

```yaml
openapi: 3.0.0
info:
  title: Payment System API
  version: 1.0.0
  description: REST API for payment system operations

paths:
  /api/v1/products:
    get:
      summary: List products
      tags: [Products]
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        "200":
          description: Successful response
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaginatedProductResponse"
```

---

## 10. Testing Considerations

### 10.1. Example cURL Commands

```bash
# List products
curl -X GET "https://api.payment-system.com/api/v1/products?page=1&limit=20" \
  -H "Authorization: Bearer <token>" \
  -H "X-Business-ID: <uuid>"

# Create product
curl -X POST "https://api.payment-system.com/api/v1/products" \
  -H "Authorization: Bearer <token>" \
  -H "X-Business-ID: <uuid>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product A","sku":"PRD-A","basePrice":10.00,"categoryId":"<uuid>"}'
```

### 10.2. Postman Collection

Available at: `/api/postman-collection.json`

---

## 11. Related Documentation

- [Database Schema](../../backend/database/04-INVENTORY-SCHEMA.md) - Data structure
- [Feature Design](../../backend/features/PRODUCT-MANAGEMENT.md) - Business logic
- [UX Flow](../../frontend/ux-flows/INVENTORY-PRODUCT-CREATION.md) - User interface
- [ADR: API Versioning](../../architecture/adr/ADR-XXX-api-versioning.md) - Architecture decision

---

## Appendix A: Change Log

| Date       | Version | Author   | Changes                         |
| :--------- | :------ | :------- | :------------------------------ |
| YYYY-MM-DD | 1.0.0   | @Backend | Initial API contract definition |

---

## Appendix B: DTO Reference

Full TypeScript DTOs available in:

- `apps/backend/src/modules/[module]/dto/`

NestJS decorators used:

- `@ApiProperty()` - OpenAPI documentation
- `@IsString()`, `@IsNumber()`, etc. - `class-validator`
- `@Transform()` - `class-transformer`
