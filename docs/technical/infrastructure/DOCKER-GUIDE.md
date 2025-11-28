---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "general"
module: "infrastructure"
status: "approved"
version: "1.0.0"
last_updated: "2025-11-27"
author: "@Backend"

# Keywords for semantic search
keywords:
  - "docker"
  - "containers"
  - "bun"
  - "deployment"
  - "infrastructure"
  - "compose"
  - "multi-stage-builds"

# Related documentation
related_docs:
  database_schema: ""
  api_design: ""
  feature_design: ""
  ux_flow: ""

# Document-specific metadata
doc_metadata:
  audience: "developers"
  complexity: "medium"
  estimated_read_time: "30 min"
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the DOCKER CONFIGURATION GUIDE.
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
      <h1 style="margin: 0; border-bottom: none;">Docker Configuration Guide</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Complete guide to Docker setup with Bun</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-DevOps-blue?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--22-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                     |
| :------------- | :-------------------------------------------------------------- |
| **Context**    | This project uses Docker with **Bun** as the runtime.           |
| **Constraint** | Always use `oven/bun:1` as the base image for backend services. |
| **Pattern**    | Use multi-stage builds to minimize image size.                  |
| **Related**    | `docs/technical/foundations/TECHNICAL-FOUNDATIONS.md`           |

---

## 1. Overview

This project uses Docker and Docker Compose to provide consistent development and production environments. All services are containerized for portability and reproducibility, utilizing **Bun** for superior performance.

---

## 2. File Structure

```
/
├── docker-compose.dev.yml           # Development orchestration
├── .dockerignore                    # Files to exclude from build context
├── apps/
│   ├── backend/
│   │   ├── Dockerfile              # Production backend image
│   │   └── Dockerfile.dev          # Development backend image
│   └── merchant-web/
│       ├── Dockerfile              # Production frontend image
│       ├── Dockerfile.dev          # Development frontend image
│       └── nginx.conf              # Nginx configuration
└── services/
    └── mcp-server/
        └── Dockerfile              # MCP server image
```

---

## 3. docker-compose.dev.yml

### 3.1. Purpose

Orchestrates all services for local development with hot reload and debugging capabilities.

### 3.2. Services

**postgres:**

- PostgreSQL 16 database
- Exposed on port 5432
- Persistent volume for data
- Health checks ensure service readiness
- Default credentials: dev/dev123

**redis:**

- Redis 7 for caching and queuing
- Exposed on port 6379
- Append-only file persistence
- Health checks with ping command

**backend:**

- NestJS API server (running on Bun)
- Hot reload via volume mounts
- Debug port 9229 exposed
- Depends on postgres and redis
- Environment variables injected

**ollama:**

- Local LLM service
- Exposed on port 11434
- Persistent model storage
- Optional GPU support (commented)

**mcp-server:**

- Model Context Protocol server
- Exposed on port 8080
- Connects to ollama and postgres
- Hot reload enabled

### 3.3. Networks

Single bridge network `payment-network` connects all services.

### 3.4. Volumes

- `postgres_data`: Database persistence
- `redis_data`: Redis persistence
- `ollama_data`: LLM models storage

### 3.5. Usage

**MANDATORY:** Always use the `bun run` scripts defined in `package.json`. Do not start services independently.

```bash
# Start all services (Hot Reload enabled) - PRIMARY COMMAND
bun run docker:dev

# Run in background (detached mode)
bun run docker:dev:detached

# Stop all services
bun run docker:dev:down

# View logs
bun run docker:dev:logs
```

**Note:** While standard Docker Compose commands work, the `bun run docker:dev` scripts ensure all environment variables and contexts are set correctly for the project.

```bash
# Start all services
docker compose -f docker-compose.dev.yml up

# Start specific service
docker compose -f docker-compose.dev.yml up postgres redis

# Run in background
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f backend

# Stop all services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker compose -f docker-compose.dev.yml down -v
```

---

## 4. Backend Dockerfiles

### 4.1. apps/backend/Dockerfile (Production)

**Purpose:** Multi-stage build for optimized production image using Bun.

**Stage 1: Builder**

- Base: `oven/bun:1`
- Installs all dependencies including devDependencies
- Copies source code and libraries
- Generates Prisma client
- Compiles TypeScript to JavaScript (or runs directly with Bun)

**Stage 2: Production**

- Fresh `oven/bun:1` base
- Installs only production dependencies
- Copies compiled code from builder
- Creates non-root user `bun`
- Sets proper file permissions
- Exposes port 3000
- Health check endpoint at `/health`

**Security Features:**

- Non-root user execution
- Minimal attack surface
- No source code in final image
- Health checks for container orchestration

**Size Optimization:**

- Multi-stage build removes dev dependencies
- Bun image is relatively small
- Only production artifacts included

### 4.2. apps/backend/Dockerfile.dev (Development)

**Purpose:** Development image with hot reload and debugging.

**Features:**

- Base: `oven/bun:1`
- All dependencies installed (including dev)
- Source code mounted as volume (not copied)
- Debug port 9229 exposed
- Hot reload via `bun --watch`

**Usage:**

```bash
# Used automatically by docker-compose.dev.yml
docker-compose up backend

# Or build and run manually
docker build -f apps/backend/Dockerfile.dev -t payment-backend-dev .
docker run -p 3000:3000 -p 9229:9229 payment-backend-dev
```

---

## 5. Frontend Dockerfiles

### 5.1. apps/merchant-web/Dockerfile (Production)

**Purpose:** Multi-stage build serving static Angular app with nginx.

**Stage 1: Builder**

- Base: `oven/bun:1` (for faster builds)
- Installs Angular dependencies
- Runs production build with optimizations
- Output: `dist/browser/` directory

**Stage 2: Nginx Server**

- Base: `nginx:alpine` (minimal web server)
- Copies built static files
- Configures nginx for SPA routing
- Adds security headers
- Sets proper file permissions
- Health check on `/health` endpoint

**Security Headers:**

- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - MIME type sniffing protection
- `X-XSS-Protection: 1; mode=block` - XSS filter
- `Referrer-Policy: strict-origin-when-cross-origin` - Referrer control

**Nginx Features:**

- Gzip compression for assets
- Long cache for static files (1 year)
- No cache for index.html
- SPA routing (serves index.html for all routes)
- API proxy to backend (optional)

### 5.2. apps/merchant-web/Dockerfile.dev (Development)

**Purpose:** Development server with hot reload.

**Features:**

- Full Angular CLI installation
- Source code mounted as volume
- Exposed on port 4200
- Live reload on file changes
- Development optimizations enabled

### 5.3. apps/merchant-web/nginx.conf

**Purpose:** Nginx configuration for production Angular app.

**Key Configurations:**

```nginx
# SPA Routing - catch-all route
location / {
    try_files $uri $uri/ /index.html;
}

# API Proxy - forward /api requests to backend
location /api {
    proxy_pass http://backend:3000;
    # Proxy headers preserved
}

# Static Assets - long cache
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Health Check - for load balancers
location /health {
    return 200 "healthy\n";
}
```

---

## 6. MCP Server Dockerfile

### 6.1. services/mcp-server/Dockerfile

**Purpose:** Containerize Model Context Protocol server for AI agents.

**Build Process:**

1. Base: `oven/bun:1`
2. Copy package files
3. Install dependencies (`bun install`)
4. Copy source code
5. Expose port 8080
6. Run server (`bun run start`)

**Integration:**

- Connects to Ollama for LLM capabilities
- Accesses PostgreSQL for data queries
- Provides tools for AI agents to interact with payment system

**Usage in Development:**

```bash
docker-compose up mcp-server
```

**Environment Variables:**

- `OLLAMA_URL`: Connection to LLM service
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Runtime environment

---

## 7. .dockerignore

### 7.1. Purpose

Excludes unnecessary files from Docker build context to:

- Reduce build time
- Decrease image size
- Prevent sensitive data inclusion

### 7.2. Excluded Categories

**Dependencies:**

- `node_modules/` - Reinstalled in container
- Package manager logs

**Build Outputs:**

- `dist/`, `build/` - Generated during build
- `.angular/` - Angular cache

**Environment:**

- `.env` files - Injected at runtime
- Local configurations

**Development:**

- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Git directory

**Documentation:**

- `docs/`, `*.md` - Not needed in runtime

**Testing:**

- `coverage/`, test results

---

## 8. Usage

### 8.1. Development Workflow

**1. Initial Setup:**

```bash
# Copy environment variables
cp .env.example .env

# Start all services
bun run docker:dev:detached

# Check service health
docker compose ps

# View logs
bun run docker:dev:logs
```

**2. Database Setup:**

```bash
# Run migrations
bun run db:migrate

# Seed database
bun run db:seed

# Open Prisma Studio
bun run db:studio
```

**3. Development:**

- Backend: Edit files in `apps/backend/src/` - auto-reload enabled
- Frontend: Edit files in `apps/merchant-web/src/` - auto-reload enabled
- MCP: Edit files in `services/mcp-server/src/` - auto-reload enabled

**4. Debugging:**

```bash
# Attach to backend debugger on port 9229
# In VSCode: Launch configuration or attach to process

# View service logs
docker logs -f payment-backend

# Execute commands in container
docker exec -it payment-backend bun test
```

**5. Cleanup:**

```bash
# Stop services
bun run docker:dev:down

# Remove volumes (data loss)
docker compose -f docker-compose.dev.yml down -v

# Remove images
docker compose -f docker-compose.dev.yml down --rmi all
```

### 8.2. Production Build

**Backend:**

```bash
docker build -f apps/backend/Dockerfile -t payment-backend:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e REDIS_URL="..." \
  payment-backend:latest
```

**Frontend:**

```bash
docker build -f apps/merchant-web/Dockerfile -t payment-frontend:latest .
docker run -p 80:80 payment-frontend:latest
```

### 8.3. Docker Compose Production

Create `docker-compose.prod.yml`:

```yaml
version: "3.9"
services:
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: always

  frontend:
    build:
      context: .
      dockerfile: apps/merchant-web/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

---

## 9. Troubleshooting

### 9.1. Port Already in Use

**Problem:** `Error: bind: address already in use`

**Solution:**

```bash
# Find process using port
lsof -i :3000
# or
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"
```

### 9.2. Database Connection Refused

**Problem:** Backend cannot connect to PostgreSQL

**Solution:**

```bash
# Check postgres health
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Ensure DATABASE_URL uses service name
DATABASE_URL=postgresql://dev:dev123@postgres:5432/paymentdb
# NOT localhost - use service name
```

### 9.3. Hot Reload Not Working

**Problem:** Changes not reflected in running container

**Solution:**

```bash
# Ensure volume mounts are correct
volumes:
  - ./apps/backend:/app/apps/backend  # Check paths
  - /app/node_modules  # Exclude node_modules

# On Windows/Mac, check Docker Desktop file sharing settings

# Restart service
docker-compose restart backend
```

### 9.4. Build Fails with Permission Denied

**Problem:** Cannot write to mounted volumes

**Solution:**

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run Docker as current user
docker-compose run --user $(id -u):$(id -g) backend bun install
```

### 9.5. Out of Disk Space

**Problem:** Docker consuming too much space

**Solution:**

```bash
# View disk usage
docker system df

# Remove unused containers/images
docker system prune

# Remove unused volumes
docker volume prune

# Deep clean (careful)
docker system prune -a --volumes
```

### 9.6. Health Check Failing

**Problem:** Container marked as unhealthy

**Solution:**

```bash
# Check health check logs
docker inspect <container_id> | jq '.[0].State.Health'

# Test health check manually
docker exec backend curl http://localhost:3000/health

# Adjust health check timing
healthcheck:
  interval: 30s  # Increase if service slow to start
  timeout: 10s
  retries: 5
  start_period: 60s  # Grace period
```

### 9.7. Cannot Access Service from Host

**Problem:** Service running but cannot connect from localhost

**Solution:**

```bash
# Ensure ports are published
ports:
  - "3000:3000"  # host:container

# Check port mapping
docker-compose ps

# Verify firewall not blocking
sudo ufw status

# Try 0.0.0.0 instead of localhost
curl http://0.0.0.0:3000/health
```

### 9.8. Slow Build Times

**Problem:** Docker builds taking too long

**Solution:**

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Use cache mounts
RUN --mount=type=cache,target=/root/.bun bun install

# Build in parallel
docker-compose build --parallel

# Ensure .dockerignore excludes unnecessary files
```

---

## 10. Best Practices

### 10.1. Development

1. **Use volume mounts** for hot reload
2. **Expose debug ports** for debugging
3. **Keep dev images separate** from production
4. **Use health checks** to ensure readiness
5. **Name containers** for easy identification

### 10.2. Production

1. **Use multi-stage builds** to minimize size
2. **Run as non-root user** for security
3. **Use specific image tags** not `:latest`
4. **Implement health checks** for orchestration
5. **Set resource limits** to prevent resource exhaustion
6. **Use secrets management** not environment variables for sensitive data
7. **Enable read-only filesystem** where possible
8. **Scan images** for vulnerabilities regularly

### 10.3. General

1. **Keep images small** - use Alpine/Distroless when possible
2. **Layer caching** - order commands by frequency of change
3. **Single responsibility** - one process per container
4. **Immutable infrastructure** - rebuild, don't patch
5. **Log to stdout/stderr** for container orchestration
6. **Use .dockerignore** to reduce context size
7. **Document** environment variables and ports
