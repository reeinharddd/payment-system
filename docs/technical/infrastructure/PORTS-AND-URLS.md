<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the PORTS AND URLS for the project.
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
      <h1 style="margin: 0; border-bottom: none;">Ports and URLs</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Reference guide for accessing local services</p>
    </td>
  </tr>
</table>

<div align="center">
  
  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-Developers-blue?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--23-lightgrey?style=flat-square" alt="Date" />

</div>

---

## 🤖 Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                            |
| :------------- | :------------------------------------------------------------------------------------- |
| **Context**    | This document lists all accessible endpoints in the local development environment.     |
| **Constraint** | Always use `localhost` or `127.0.0.1` when accessing from the host machine.            |
| **Pattern**    | Use service names (e.g., `postgres`, `redis`) when communicating _between_ containers. |
| **Related**    | `docs/technical/infrastructure/DOCKER-GUIDE.md`                                        |

---

## 1. Overview

This document provides a comprehensive list of all services running in the local Docker environment, their exposed ports, and how to access them.

**Important:** Ensure you have started the environment using `bun run docker:dev`.

---

## 2. Service Directory

| Service           | Container Name       | Host Port | Internal Port | URL / Connection String                            | Description                        |
| :---------------- | :------------------- | :-------- | :------------ | :------------------------------------------------- | :--------------------------------- |
| **Frontend**      | `payment-frontend`   | **4200**  | 4200          | [http://localhost:4200](http://localhost:4200)     | Merchant Web Application (Angular) |
| **Backend**       | `payment-backend`    | **3000**  | 3000          | [http://localhost:3000](http://localhost:3000)     | NestJS API Server                  |
| **Backend Debug** | `payment-backend`    | **9229**  | 9229          | `localhost:9229`                                   | Node.js Debugger Port              |
| **PostgreSQL**    | `payment-postgres`   | **5432**  | 5432          | `postgresql://dev:dev123@localhost:5432/paymentdb` | Main Database                      |
| **Redis**         | `payment-redis`      | **6379**  | 6379          | `redis://localhost:6379`                           | Cache & Queue                      |
| **Ollama**        | `payment-ollama`     | **11434** | 11434         | [http://localhost:11434](http://localhost:11434)   | Local LLM Service                  |
| **MCP Server**    | `payment-mcp-server` | **8080**  | 8080          | [http://localhost:8080](http://localhost:8080)     | Model Context Protocol Server      |

---

## 3. Access Details

### 3.1. Frontend (Merchant Web)

- **URL:** [http://localhost:4200](http://localhost:4200)
- **Hot Reload:** Enabled. Changes in `apps/merchant-web/src` are reflected instantly.
- **Assets:**
  - Logo: [http://localhost:4200/assets/images/logo.svg](http://localhost:4200/assets/images/logo.svg)
  - Icon: [http://localhost:4200/assets/images/icon.svg](http://localhost:4200/assets/images/icon.svg)

### 3.2. Backend (API)

- **Base URL:** [http://localhost:3000](http://localhost:3000)
- **Health Check:** [http://localhost:3000/health](http://localhost:3000/health) (if implemented)
- **Swagger/OpenAPI:** [http://localhost:3000/api](http://localhost:3000/api) (if enabled)
- **Hot Reload:** Enabled. Changes in `apps/backend/src` trigger a restart.

### 3.3. Database (PostgreSQL)

- **Host:** `localhost`
- **Port:** `5432`
- **User:** `dev`
- **Password:** `dev123`
- **Database:** `paymentdb`
- **Connection String:** `postgresql://dev:dev123@localhost:5432/paymentdb`
- **Tools:** You can connect using DBeaver, TablePlus, or `psql`.

### 3.4. Redis

- **Host:** `localhost`
- **Port:** `6379`
- **Connection String:** `redis://localhost:6379`
- **Tools:** You can connect using Redis Insight or `redis-cli`.

---

## 4. Internal Networking (Container-to-Container)

When services communicate with each other **inside** the Docker network, they MUST use the **Service Name** defined in `docker-compose.dev.yml`, NOT `localhost`.

| From Service   | To Service     | Use Hostname  | Port  | Example URL                                       |
| :------------- | :------------- | :------------ | :---- | :------------------------------------------------ |
| **Backend**    | **PostgreSQL** | `postgres`    | 5432  | `postgresql://dev:dev123@postgres:5432/paymentdb` |
| **Backend**    | **Redis**      | `redis`       | 6379  | `redis://redis:6379`                              |
| **Frontend**   | **Backend**    | `localhost`\* | 3000  | `http://localhost:3000`                           |
| **MCP Server** | **Ollama**     | `ollama`      | 11434 | `http://ollama:11434`                             |
| **MCP Server** | **PostgreSQL** | `postgres`    | 5432  | `postgresql://dev:dev123@postgres:5432/paymentdb` |

_\*Note: The Frontend runs in the browser (client-side), so it accesses the Backend via the host's `localhost:3000` unless using Server-Side Rendering (SSR) or a proxy._

---

## 5. Troubleshooting Access

### 5.1. "Connection Refused"

- Ensure the container is running: `docker compose ps`
- Check if the port is actually listening: `netstat -tulpn | grep <PORT>`
- Verify you are using `localhost` from the host machine.

### 5.2. "Host Not Found" (Internal)

- Ensure you are using the **Service Name** (e.g., `postgres`), not `localhost`, when configuring backend environment variables.
- Check if services are on the same network (`payment-network`).

### 5.3. Assets 404 (Frontend)

- Ensure `libs/` is mounted in the frontend container if assets are shared.
- Verify `angular.json` asset configuration matches the mounted paths.
