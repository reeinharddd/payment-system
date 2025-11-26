<!-- AI-INSTRUCTION: START -->
<!--
  This document is a TEMPLATE for Feature Designs.
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
      <h1 style="margin: 0; border-bottom: none;">FEAT-001: Authentication Module</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Feature Design Document</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Draft-yellow?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Priority-Critical-red?style=flat-square" alt="Priority" />
  <img src="https://img.shields.io/badge/Owner-@Backend-blue?style=flat-square" alt="Owner" />

</div>

---

## 🤖 Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                           |
| :------------- | :------------------------------------------------------------------------------------ |
| **Context**    | This document defines the technical specification for the Authentication Module.      |
| **Constraint** | Must use `UserIdentity` table for multi-provider support. No external Auth providers. |
| **Pattern**    | Use NestJS Guards and Decorators for RBAC.                                            |
| **Related**    | `docs/technical/architecture/adr/001-AUTH-STRATEGY.md`                                |

---

## 1. Overview

Implementation of the internal authentication system using NestJS, Passport.js, and Prisma. This module provides a secure, cost-effective, and flexible way to manage user identities across multiple channels (Email, Phone, Google) while maintaining strict data sovereignty.

It includes:

- Multi-provider login (Identity-based model).
- JWT Token management (Access + Refresh with rotation).
- Role-Based Access Control (RBAC).
- OTP generation and validation for phone authentication.

## 2. User Stories / Requirements

- **US-01:** As a **Merchant**, I want to register with my phone number so I can start selling immediately without an email.
- **US-02:** As a **User**, I want to link my Google account so I can login with one click.
- **US-03:** As a **System**, I want to refresh tokens securely so the user stays logged in without re-entering credentials.
- **US-04:** As an **Admin**, I want to revoke sessions/tokens if suspicious activity is detected.
- **US-05:** As a **Developer**, I want to protect endpoints using Decorators like `@Roles('ADMIN')`.

## 3. Technical Architecture

### 3.1. Database Changes (Prisma)

```prisma
model User {
  id           String         @id @default(uuid())
  email        String?        @unique
  phone        String?        @unique
  isActive     Boolean        @default(true)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  identities   UserIdentity[]
  roles        UserRole[]
  // ... other relations
}

model UserIdentity {
  id           String    @id @default(uuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id])
  provider     Provider  // ENUM: LOCAL, GOOGLE, PHONE
  providerId   String    // email, google_sub, phone_number
  credential   String?   // password_hash, null
  metadata     Json?
  lastLogin    DateTime?

  @@unique([provider, providerId])
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  type        RoleType // ENUM: SYSTEM, CUSTOM

  users       UserRole[]
  permissions RolePermission[]
}

// ... UserRole, Permission, RolePermission tables
```

### 3.2. API Endpoints (Backend)

| Method | Endpoint                | Description                                             |
| :----- | :---------------------- | :------------------------------------------------------ |
| POST   | `/auth/register/phone`  | Initiates registration by sending an OTP to the phone.  |
| POST   | `/auth/verify/phone`    | Verifies OTP and creates/logs in the user.              |
| POST   | `/auth/login/local`     | Login with Email and Password.                          |
| GET    | `/auth/google`          | Redirects to Google OAuth consent screen.               |
| GET    | `/auth/google/callback` | Handles Google callback and issues tokens.              |
| POST   | `/auth/refresh`         | Exchanges a valid Refresh Token for a new Access Token. |
| POST   | `/auth/logout`          | Invalidates the Refresh Token.                          |
| GET    | `/auth/me`              | Returns the current user's profile and roles.           |

### 3.3. Dependencies

We will use the standard NestJS ecosystem packages:

- **Core:**
  - `@nestjs/passport`: Integration with Passport.js.
  - `@nestjs/jwt`: JWT utilities.
  - `passport`: Authentication middleware.
- **Strategies:**
  - `passport-local`: For Email/Password login.
  - `passport-jwt`: For verifying Access Tokens.
  - `passport-google-oauth20`: For Google Login.
- **Security:**
  - `argon2`: For secure password hashing (better than bcrypt).
  - `ioredis`: For storing OTPs with TTL (Time-To-Live).
- **Validation:**
  - `class-validator`: For DTO validation.
  - `class-transformer`: For object transformation.

## 4. Implementation Plan

1. [ ] **Setup:** Install dependencies (`npm install @nestjs/passport passport @nestjs/jwt argon2 ...`).
2. [ ] **Database:** Update `schema.prisma` with `User`, `UserIdentity`, `Role` models and run migration.
3. [ ] **Module:** Generate `AuthModule`, `AuthService`, `AuthController`.
4. [ ] **Strategies:**
   - Implement `LocalStrategy` (validate email/pass).
   - Implement `JwtStrategy` (validate token).
   - Implement `GoogleStrategy` (validate OAuth).
5. [ ] **OTP Service:** Create `OtpService` using Redis to set/get codes.
6. [ ] **Guards:** Create `JwtAuthGuard` and `RolesGuard`.
7. [ ] **Decorators:** Create `@CurrentUser()` and `@Roles()` decorators.
8. [ ] **Testing:** Write E2E tests for the login flows.

## 5. Open Questions / Risks

- **SMS Costs:** We need to monitor SMS usage. For development, we will use a fixed OTP (e.g., `123456`) for specific test numbers.
- **Google Mobile:** On mobile apps, Google Login might use a native SDK. The backend should support receiving an `idToken` instead of the redirect flow.
