<!-- AI-INSTRUCTION: START -->
<!--
  This document is the PROJECT ROOT. When creating new docs:
  1. Preserve the Header Table and Metadata block.
  2. Fill in the "Agent Directives" to guide future AI interactions.
  3. Keep the structure strict for RAG (Retrieval Augmented Generation) efficiency.
-->
<!-- AI-INSTRUCTION: END -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="120" align="center" valign="middle">
      <img src="libs/assets/src/images/logo.png" width="80" alt="Project Logo" />
    </td>
    <td align="left" valign="middle">
      <h1 style="margin: 0; border-bottom: none;">Payment System</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Local payment and business management platform for small merchants</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Active_Development-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-Developers-blue?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--22-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                             |
| :------------- | :-------------------------------------------------------------------------------------- |
| **Context**    | This is the ROOT document. It defines the project structure and entry points.           |
| **Constraint** | Always check `docs/process/workflow/AI-DEVELOPMENT-STANDARD.md` before generating code. |
| **Pattern**    | Follow the Monorepo structure defined in `docs/process/standards/PROJECT-STRUCTURE.md`. |
| **Related**    | `docs/`, `apps/`, `libs/`                                                               |

---

## 1. Executive Summary

**Payment System** is a local payment and business management platform designed to modernize small businesses without expensive infrastructure. It features a single codebase supporting multiple countries (Mexico, Colombia, Argentina, Chile) by swapping only the payment processing layer.

**Core Value:** "Not making them pay more, making them earn more."

## 2. Context & Motivation

Traditional small businesses lack access to professional financial tools and digital payment methods due to high costs and technical barriers. This project aims to democratize these tools through a low-friction, mobile-first platform that requires no app download for customers.

## 3. Core Content

### 3.1. Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/payment-system.git
cd payment-system

# Install dependencies
bun install

# Setup database
docker-compose -f docker-compose.dev.yml up -d
bun run db:migrate

# Start development servers (Hot Reload enabled)
# ALWAYS use this command. DO NOT start servers independently.
bun run docker:dev
```

### 3.2. Project Structure

```
/
├── apps/
│   ├── backend/          # NestJS API
│   ├── merchant-web/     # Angular merchant app
│   └── customer-web/     # Angular customer app
├── libs/                 # Shared libraries
├── docs/                 # Documentation
├── docker/               # Docker configurations
└── scripts/              # Utility scripts
```

### 3.3. Documentation Index

#### Getting Started

- **[Getting Started with Development](docs/process/onboarding/GETTING-STARTED-DEVELOPMENT.md)** - START HERE - Complete development guide

#### Business & Strategy

- [Business Model Analysis](docs/business/strategy/BUSINESS-MODEL-ANALYSIS.md) - Viability, unit economics, and scalability
- [No Customer App Advantage](docs/business/strategy/NO-CUSTOMER-APP-ADVANTAGE.md) - Why one-sided adoption wins

#### Development Process

- [AI Development Standard](docs/process/workflow/AI-DEVELOPMENT-STANDARD.md) - **MANDATORY** for AI interactions
- [Development Rules](docs/process/workflow/DEVELOPMENT-RULES.md) - Mandatory development workflow and standards
- [Construction Checklist](docs/process/workflow/CONSTRUCTION-CHECKLIST.md) - Quick reference for coding
- [Project Structure](docs/process/standards/PROJECT-STRUCTURE.md) - Monorepo layout and conventions
- [Standards](docs/process/standards/STANDARDS.md) - Documentation and code standards
- [Monorepo Guide](docs/process/standards/MONOREPO-GUIDE.md) - Bun workspaces and Turborepo

#### Technical Architecture

- [System Architecture](docs/technical/architecture/SYSTEM-ARCHITECTURE.md) - System design and architecture patterns
- [Preliminary Design](docs/technical/architecture/PRELIMINARY-DESIGN.md) - Base architecture and module design
- [Design Patterns](docs/technical/architecture/DESIGN-PATTERNS.md) - Patterns with concrete examples

#### Technical Guides

- [Docker Guide](docs/technical/infrastructure/DOCKER-GUIDE.md) - Container configuration and deployment
- [Angular Zoneless](docs/technical/frontend/ANGULAR-ZONELESS.md) - Angular 21+ zoneless patterns
- [TypeScript Strict](docs/technical/backend/TYPESCRIPT-STRICT.md) - Type safety patterns
- [Technical Foundations](docs/technical/foundations/TECHNICAL-FOUNDATIONS.md) - Deep dive into core technologies

### 3.4. Technology Stack

- **Runtime:** Bun 1.3+ (Replaces Node.js/npm/Jest)
- **Frontend:** Angular 21+ (Bleeding Edge)
- **Backend:** NestJS 10+
- **Database:** PostgreSQL 16+
- **ORM:** Prisma 5+
- **Language:** TypeScript 5.3+ (Strict)
- **Cache/Queue:** Redis 7+ + Bull MQ
- **Cloud:** AWS S3/SQS + GCP Cloud Run + Azure Storage (optional)
- **AI/Agents:** Ollama + Model Context Protocol (MCP)
- **DevOps:** Docker + Kubernetes + GitHub Actions
- **Monorepo:** Bun workspaces + Turborepo

## 4. References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Angular Documentation](https://angular.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
