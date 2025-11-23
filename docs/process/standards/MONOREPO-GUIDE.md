<!-- AI-INSTRUCTION: START -->
<!-- 
  This document defines the MONOREPO GUIDE. When creating new files:
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
      <h1 style="margin: 0; border-bottom: none;">Monorepo Guide</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Complete guide to Bun workspaces and Turborepo setup</p>
    </td>
  </tr>
</table>

<div align="center">
  
  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Approved-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-Developers-blue?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--22-lightgrey?style=flat-square" alt="Date" />

</div>

---

## 🤖 Agent Directives (System Prompt)

*This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document.*

| Directive | Instruction |
| :--- | :--- |
| **Context** | This document explains the build system, package management, and workspace structure. |
| **Constraint** | Always use `bun add --filter <name>` for adding dependencies. |
| **Pattern** | Use `bun run <task>` or `turbo run <task>` for executing build/test/lint commands. |
| **Related** | `docs/process/standards/PROJECT-STRUCTURE.md` |

---

## 1. Executive Summary

This project uses Bun workspaces with Turborepo for efficient monorepo management. All applications and services share dependencies and build configurations while maintaining independence. This guide covers architecture, configuration, and daily workflows.

## 2. Context & Motivation

Monorepos allow us to share code (types, utilities) easily between the backend and frontend while keeping a unified versioning and tooling strategy. Turborepo ensures that this scale doesn't come at the cost of slow build times by providing intelligent caching and parallel execution.

## 3. Core Content

### 3.1. Architecture

#### Monorepo Benefits

**Shared Code:**
- Single source of truth for shared types and utilities
- Consistent versioning across packages
- Easier refactoring across boundaries

**Unified Tooling:**
- Single ESLint, Prettier, TypeScript configuration
- Shared dev dependencies
- Consistent build and test commands

**Efficient CI/CD:**
- Cache builds across workspaces
- Run only affected tests
- Parallel execution with Turborepo

**Developer Experience:**
- Single `bun install` for all packages
- Easier onboarding
- Unified IDE experience

#### Turborepo Role

Turborepo optimizes build times through:
- **Caching:** Never build the same thing twice
- **Parallel Execution:** Run tasks concurrently
- **Task Pipelining:** Define dependencies between tasks
- **Remote Caching:** Share cache across team/CI

### 3.2. Workspace Structure

```
/
├── package.json              # Root config, workspaces definition
├── turbo.json                # Turborepo pipeline configuration
├── tsconfig.json             # Base TypeScript config
├── .eslintrc.json            # Base ESLint config
├── .prettierrc               # Prettier config
├── apps/
│   ├── backend/              # NestJS API
│   │   ├── package.json      # Backend dependencies
│   │   ├── tsconfig.json     # Extends root config
│   │   └── src/
│   └── merchant-web/         # Angular frontend
│       ├── package.json      # Frontend dependencies
│       ├── tsconfig.json     # Extends root config
│       └── src/
├── libs/                     # Shared libraries
│   └── shared-types/         # Common TypeScript types
│       ├── package.json
│       └── src/
└── services/
    └── mcp-server/           # Model Context Protocol server
        ├── package.json
        └── src/
```

#### Workspace Configuration

Root `package.json` defines workspaces:

```json
{
  "workspaces": [
    "apps/*",
    "libs/*",
    "services/*"
  ]
}
```

This tells Bun to:
1. Hoist shared dependencies to root `node_modules`
2. Symlink workspace packages for imports
3. Allow workspace-specific scripts

### 3.3. Package Management

#### Installing Dependencies

**Root Dependencies (dev tools):**
```bash
bun add -d eslint prettier typescript
```

**Workspace-Specific:**
```bash
# For backend
bun add @nestjs/common --filter backend

# For frontend
bun add @angular/core --filter merchant-web

# For MCP server
bun add zod --filter mcp-server
```

**All Workspaces:**
```bash
bun install
```

#### Dependency Resolution

Bun workspaces use:
1. **Hoisting:** Common dependencies installed once in root
2. **Deduplication:** Same version shared across workspaces
3. **Workspace Protocol:** Reference local packages

Example workspace reference:
```json
{
  "dependencies": {
    "shared-types": "workspace:*"
  }
}
```

#### Updating Dependencies

**Update All:**
```bash
bun update
```

**Update Specific Workspace:**
```bash
bun update --filter backend
```

**Update Specific Package:**
```bash
bun update @nestjs/common --filter backend
```

#### Viewing Dependency Tree

```bash
# All workspaces
bun pm ls

# Specific workspace
bun pm ls --filter backend
```

### 3.4. Build System (Turborepo)

#### Pipeline Configuration

`turbo.json` defines task relationships:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Key Concepts:**

- `dependsOn`: Tasks that must run first
- `^build`: Run `build` in dependencies before this package
- `outputs`: Files to cache
- `cache: false`: Disable caching for task

#### Task Execution

**Run Across All Workspaces:**
```bash
# Build all packages
turbo run build

# Test all packages
turbo run test

# Lint all packages
turbo run lint --parallel
```

**Workspace-Specific:**
```bash
# Build specific workspace
turbo run build --filter=backend

# Multiple workspaces
turbo run build --filter=backend --filter=frontend
```

**With Options:**
```bash
# Force rebuild (bypass cache)
turbo run build --force

# Dry run (show what would run)
turbo run build --dry-run

# Include dependencies
turbo run build --filter=backend...

# Only changed packages (git)
turbo run test --filter=[HEAD^1]
```

#### Caching

Turborepo caches based on:
- Task inputs (source files)
- Task outputs (build artifacts)
- Environment variables
- Global dependencies (.env files)

**View Cache:**
```bash
# Show what's cached
turbo run build --dry-run=json

# Clear cache
rm -rf .turbo
```

**Cache Location:**
- Local: `.turbo/cache`
- Remote: Configured via Vercel or custom

#### Remote Caching

Enable team cache sharing:

```bash
# Link to Vercel
npx turbo login
npx turbo link

# Or configure custom remote cache in turbo.json
{
  "remoteCache": {
    "signature": true
  }
}
```

### 3.5. Development Workflow

#### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd payment-system

# Install all dependencies
bun install

# Setup environment
cp .env.example .env

# Generate Prisma client
bun run --filter backend db:generate

# Run database migrations
bun run db:migrate

# Start all services
bun run dev
```

#### Daily Development

**Start Development Servers:**
```bash
# All services with hot reload
bun run dev

# Specific service
bun run --filter backend dev
bun run --filter merchant-web dev
bun run --filter mcp-server dev
```

**Run Tests:**
```bash
# All tests
bun test

# Watch mode
bun run test:watch

# Coverage
bun run test:cov

# E2E tests
bun run test:e2e
```

**Linting and Formatting:**
```bash
# Lint all
bun run lint

# Fix lint errors
bun run lint:fix

# Format code
bun run format

# Type check
bun run typecheck
```

#### Building

```bash
# Build all packages
bun run build

# Build specific package
bun run --filter backend build
bun run --filter merchant-web build

# Production build
NODE_ENV=production bun run build
```

#### Database Operations

```bash
# Create migration
bun run db:migrate

# Apply migrations
bun run --filter backend db:migrate:deploy

# Seed database
bun run db:seed

# Reset database (careful!)
bun run db:reset

# Open Prisma Studio
bun run db:studio
```

### 3.6. Scripts Reference

#### Root Scripts

Located in root `package.json`:

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all services in development mode |
| `bun run build` | Build all packages |
| `bun test` | Run all tests |
| `bun run lint` | Lint all packages |
| `bun run lint:fix` | Fix linting errors |
| `bun run format` | Format code with Prettier |
| `bun run typecheck` | Type check all TypeScript |
| `bun run clean` | Remove all build artifacts |

#### Backend Scripts

Run with `--filter backend` or `cd apps/backend`:

| Script | Description |
|--------|-------------|
| `bun run dev` | Start NestJS with hot reload |
| `bun run build` | Build production bundle |
| `bun test` | Run Jest unit tests |
| `bun run test:e2e` | Run integration tests |
| `bun run db:migrate` | Create and apply migration |
| `bun run db:seed` | Seed database with test data |
| `bun run db:studio` | Open Prisma Studio GUI |

#### Frontend Scripts

Run with `--filter merchant-web` or `cd apps/merchant-web`:

| Script | Description |
|--------|-------------|
| `bun run dev` | Start Angular dev server |
| `bun run build` | Build production bundle |
| `bun test` | Run Jasmine/Karma tests |
| `bun run test:e2e` | Run Playwright E2E tests |
| `bun run lint` | Lint with Angular ESLint |

#### MCP Server Scripts

Run with `--filter mcp-server` or `cd services/mcp-server`:

| Script | Description |
|--------|-------------|
| `bun run dev` | Start with tsx watch mode |
| `bun run build` | Compile TypeScript |
| `bun test` | Run Vitest tests |
| `bun run typecheck` | Check types without emit |

### 3.7. Adding New Packages

#### Create New Workspace

**1. Create Directory:**
```bash
mkdir -p apps/new-app
cd apps/new-app
```

**2. Initialize Package:**
```bash
bun init -y
```

**3. Configure Package.json:**
```json
{
  "name": "new-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "...",
    "build": "...",
    "test": "..."
  }
}
```

**4. Install from Root:**
```bash
cd ../..
bun install
```

**5. Add to Turbo Pipeline:**

Edit `turbo.json`:
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

#### Create Shared Library

**1. Create Library:**
```bash
mkdir -p libs/shared-utils
cd libs/shared-utils
bun init -y
```

**2. Configure for Import:**
```json
{
  "name": "shared-utils",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

**3. Use in Other Packages:**
```bash
bun add shared-utils --filter backend
```

Package.json:
```json
{
  "dependencies": {
    "shared-utils": "workspace:*"
  }
}
```

### 3.8. Troubleshooting

#### Dependency Resolution Issues

**Problem:** Conflicting versions across workspaces

**Solution:**
```bash
# Remove all node_modules
rm -rf node_modules apps/*/node_modules services/*/node_modules

# Clear bun cache
bun pm cache rm

# Reinstall
bun install
```

#### Turborepo Cache Issues

**Problem:** Stale cache causing incorrect builds

**Solution:**
```bash
# Clear turbo cache
rm -rf .turbo

# Force rebuild
turbo run build --force
```

#### Workspace Not Found

**Problem:** `error: Workspace not found`

**Solution:**
1. Check workspace paths in root `package.json`
2. Ensure `package.json` exists in workspace
3. Verify workspace name matches

#### Build Failures

**Problem:** Build fails but no clear error

**Solution:**
```bash
# Build with verbose output
turbo run build --verbose

# Build specific workspace
bun run --filter backend build

# Check for TypeScript errors
bun run typecheck
```

#### Hoisting Issues

**Problem:** Package not found in workspace

**Solution:**

Add to `package.json` (Bun handles hoisting differently, but if needed):
```json
{
  "trustedDependencies": ["package-name"]
}
```

Or install directly in workspace:
```bash
bun add <package> --filter <name>
```

#### Performance Issues

**Problem:** Slow installs or builds

**Solution:**

Bun is already fast. Ensure you are using the latest version:
```bash
bun upgrade
```

## 4. Best Practices

### Dependency Management

1. **Hoist Common Dependencies:** Install shared tools at root
2. **Use Workspace Protocol:** Reference local packages with `workspace:*`
3. **Lock Versions:** Commit `bun.lockb`
4. **Regular Updates:** Keep dependencies up-to-date
5. **Audit Security:** Run `bun pm trust` (or check for advisories)

### Code Organization

1. **Separate Concerns:** Keep apps independent
2. **Share Common Code:** Extract to `libs/`
3. **Type Safety:** Share types across workspaces
4. **Avoid Circular Dependencies:** Keep dependency graph acyclic
5. **Document APIs:** Use JSDoc for shared libraries

### Build Optimization

1. **Incremental Builds:** Configure TypeScript for incremental compilation
2. **Parallel Execution:** Use Turborepo for parallel tasks
3. **Cache Aggressively:** Define proper outputs in turbo.json
4. **Remote Cache:** Enable for team collaboration
5. **Optimize Imports:** Use barrel exports carefully

### Testing Strategy

1. **Unit Tests:** Test each workspace independently
2. **Integration Tests:** Test workspace interactions
3. **E2E Tests:** Test full application flow
4. **Coverage Goals:** Maintain 80% minimum
5. **Fast Feedback:** Run affected tests only
