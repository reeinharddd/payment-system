<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the Security Architecture for the Payment System.
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
      <h1 style="margin: 0; border-bottom: none;">Security Architecture</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Banking-Grade Security Standards & Implementation</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Draft-yellow?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Security-High-red?style=flat-square" alt="Security Level" />
  <img src="https://img.shields.io/badge/Compliance-PCI--DSS-blue?style=flat-square" alt="Compliance" />

</div>

---

## 🤖 Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                               |
| :------------- | :------------------------------------------------------------------------ |
| **Context**    | This document defines the security standards for handling financial data. |
| **Constraint** | NEVER store raw credit card numbers. ALWAYS use encryption for PII.       |
| **Pattern**    | Follow 'Defense in Depth' strategy.                                       |
| **Related**    | `docs/technical/backend/features/FEAT-001-AUTH-MODULE.md`                 |

---

## 1. Executive Summary

This document outlines the "Defense in Depth" strategy for the Impulsa Payment System. Since we handle financial transactions and sensitive user data, we must adhere to banking-grade security standards, even if we offload card processing to gateways.

## 2. Security Layers

### 2.1. Network Layer (The Moat)

- **TLS 1.3 Only:** All communications must be encrypted. No HTTP allowed.
- **Rate Limiting:** Use `@nestjs/throttler` to prevent Brute Force and DDoS.
  - _Policy:_ 100 req/min for general API, 5 req/min for Auth endpoints.
- **CORS:** Strict whitelist of allowed origins (Merchant Web, Admin Panel).
- **VPN/Private Subnets:** Database and Redis must NOT be accessible from the public internet.

### 2.2. Application Layer (The Walls)

- **Helmet:** Use `helmet` middleware to set secure HTTP headers (HSTS, X-Frame-Options, CSP).
- **Input Validation:** Strict DTO validation using `class-validator`. Whitelist properties to prevent Mass Assignment.
- **Output Sanitization:** Use `class-transformer` with `@Exclude()` to prevent leaking sensitive fields (passwords, internal IDs) in responses.
- **CSRF Protection:** Double Submit Cookie pattern for web clients.

### 2.3. Data Layer (The Vault)

- **Encryption at Rest:** Database volumes must be encrypted (e.g., AWS EBS Encryption).
- **Field-Level Encryption:** Sensitive PII (Tax IDs, Phone Numbers) should be encrypted in the database using AES-256-GCM if required by local regulations.
- **Hashing:** Passwords must be hashed using **Argon2id** (memory-hard), not Bcrypt.
- **Tokenization:** We never touch raw card data. We use the "Tokenization" pattern provided by gateways (Conekta/PayU).

### 2.4. Authentication & Authorization (The Keys)

- **MFA (Multi-Factor Authentication):** Mandatory for Admin accounts. Optional for Merchants.
- **Session Management:**
  - Short-lived Access Tokens (15 min).
  - Rotatable Refresh Tokens (7 days) stored in HttpOnly, Secure cookies.
  - Redis blacklist for immediate revocation.
- **RBAC (Role-Based Access Control):** Strict separation of duties. A 'Merchant' cannot access 'Admin' routes.

### 2.5. Offline & Local Data Security (The Satchel)

- **Local Storage Risks:** Data stored in `IndexedDB` or `LocalStorage` is accessible to any script running on the same origin.
  - _Mitigation:_ Strict **Content Security Policy (CSP)** to prevent XSS.
- **Sensitive Data:** NEVER store unencrypted PII or Auth Tokens in `LocalStorage`.
  - _Auth:_ Use `HttpOnly` cookies for the Refresh Token (browser handles storage). For offline access, we may cache a short-lived "Offline Session Key" in IndexedDB, valid only for non-critical actions (POS), not for Admin settings.
- **Data Minimization:** Sync only the necessary data for the merchant's daily operation (e.g., active inventory), not the entire historical database.

## 3. Audit & Monitoring (The Watchtower)

- **Immutable Audit Logs:** Every critical action (Login, Payment, Refund, Settings Change) must be logged to a write-only collection/table.
  - _Format:_ `[TIMESTAMP] [USER_ID] [ACTION] [RESOURCE_ID] [IP_ADDRESS] [USER_AGENT]`
- **Alerting:** Real-time alerts for suspicious patterns (e.g., 5 failed logins in 1 minute, sudden spike in transaction volume).

## 4. Compliance (PCI-DSS & GDPR/LGPD)

- **Scope Reduction:** By using redirects or iFrames for payments, we reduce our PCI scope to SAQ-A.
- **Data Sovereignty:** Ensure user data resides in the appropriate jurisdiction if required (e.g., GDPR for EU citizens, though we focus on LATAM).
- **Right to be Forgotten:** Implement "Soft Delete" with a process for permanent anonymization upon request.

## 5. Implementation Checklist

1. [ ] Configure `helmet` and `cors` in `main.ts`.
2. [ ] Implement global `ValidationPipe` with `whitelist: true`.
3. [ ] Set up `@nestjs/throttler` with Redis storage.
4. [ ] Create `AuditLogService` interceptor.
5. [ ] Verify Argon2 configuration for password hashing.
