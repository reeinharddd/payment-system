---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "general"
module: "workflow"
status: "approved"
version: "1.0.0"
last_updated: "2025-11-27"
author: "@Architect"

# Keywords for semantic search
keywords:
  - "ai-development"
  - "workflow"
  - "ai-assisted"
  - "development-standard"
  - "copilot"
  - "methodology"

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
  estimated_read_time: "15 min"
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the AI-NATIVE DEVELOPMENT STANDARD (ADS).
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
      <h1 style="margin: 0; border-bottom: none;">AI-Native Development Standard</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Methodology for AI-assisted software development</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Active-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-Developers%20%26%20Agents-blue?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--22-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                                          |
| :------------- | :--------------------------------------------------------------------------------------------------- |
| **Context**    | This document defines how Humans and AI Agents collaborate.                                          |
| **Constraint** | Agents must adopt the "Personas" defined in Section 4.                                               |
| **Pattern**    | Follow the "Prompting Standard" (Section 3) for interpreting user requests.                          |
| **Related**    | `docs/process/workflow/DEVELOPMENT-RULES.md`, `docs/process/standards/SCALABILITY-AND-GOVERNANCE.md` |

---

## 1. Philosophy

This document establishes the methodology for AI-assisted software development within the organization. The goal is to treat AI not just as a code generator, but as a specialized workforce that requires structured input to produce high-quality, architectural-grade output.

**Core Principle:** "Atomic Inputs, Structured Outputs."

## 2. The Human Protocol (Developer Rules)

To ensure the AI operates effectively, the human developer must adhere to the following constraints:

### 2.1. Architectural Workflow (Code-First)

**Rule:** We build from the Back to the Front.
**Why:** AI cannot "see" or "draw" UI effectively. It excels at structure.
**Flow:**

1. **Documentation & Design (Step 0):**
   - **Diagrams:** Create PlantUML diagrams for all new flows.
   - **Database:** Define Entity-Relationship (ER) models.
   - **UI:** Plan using Atomic Design (Atoms, Molecules, Organisms).
2. **Data Modeling:** Define `schema.prisma` first.
3. **Contracts:** Define Interfaces/DTOs.
4. **State:** Define Stores/Services.
5. **UI:** Implement Components last.

### 2.2. Atomic Scope

- **Rule:** Never request changes for the entire application in a single prompt.
- **Practice:** Break down features into:
  1. Database/Entity changes.
  2. Backend Logic (Service/Controller).
  3. Frontend State/Logic.
  4. UI/View implementation.
- **Why:** Reduces hallucination and context window overflow.

### 2.2. Context Provision

- **Rule:** Do not assume the AI knows the current file state unless it is open or explicitly referenced.
- **Practice:** Always reference the specific files involved in the task (e.g., "In `auth.service.ts`...").

### 2.3. Review First

- **Rule:** Never blindly apply code.
- **Practice:** Read the explanation _before_ the code. If the explanation implies a misunderstanding of the architecture, stop the generation.

### 2.4. Documentation First (Templates)

- **Rule:** All new documentation MUST follow the strict templates defined in `docs/templates/`.
- **Requirement:** Every document must include the **"Agent Directives"** table at the top. This allows future AI agents to understand the context, constraints, and patterns of the file immediately.
- **Templates:**
  - General: `docs/templates/00-GENERAL-DOC-TEMPLATE.md`
  - Features: `docs/templates/01-FEATURE-DESIGN-TEMPLATE.md`
  - ADRs: `docs/templates/02-ADR-TEMPLATE.md`

## 3. The Prompting Standard

All requests to the AI agents must follow this mental structure. This ensures the AI has enough context to generate code AND the commit message.

### 3.1. The Standard Prompt Template

```text
[ROLE]: @{AgentName} (e.g., @Backend, @Architect, @Frontend)
[ACTION]: {Create | Refactor | Fix | Test | Document}
[SCOPE]: {Specific File, Module, or Component Name}
[CONTEXT]: {Why are we doing this? What is the business value or technical reason?}
[SPECS]:
- {Requirement 1}
- {Requirement 2}
- {Constraint: e.g., "Use Signals", "Strict Mode"}
```

### 3.2. Example Usage

> **User:** "@Frontend, Create a new `TransactionHistory` component. Context: Users need to see their past payments. Specs: Use a standalone component, implement a table with pagination, and fetch data from `PaymentsStore`."

## 4. Knowledge Acquisition & Context Strategy

To ensure the AI always has the correct context, we follow a strict "Knowledge Hierarchy".

### 4.1. The Knowledge Hierarchy

1. **Internal Context (Primary):**
   - **Source:** `docs/` folder via MCP Tools (`query_docs_by_module`, `search_full_text`).
   - **Authority:** Highest. Internal rules override external patterns.
   - **Mechanism:** YAML Frontmatter acts as the "Router" for the AI, defining relationships and types deterministically.

2. **External Context (Secondary):**
   - **Source:** Web Search (`webSearch`) or External Documentation Tools.
   - **Authority:** Medium. Use for generic framework patterns (Angular, NestJS) or industry standards (PCI-DSS, ISO).
   - **Trigger:** When internal search yields 0 results or when explicitly asked for "Industry Best Practices".

### 4.2. The "Scribe Loop" (Codification Protocol)

If the AI finds critical external information that is missing from the internal system, it MUST be codified immediately.

**The Loop:**

1. **Search Internal:** Agent looks for "How to handle 3DSecure". Result: `null`.
2. **Search External:** Agent searches web. Result: "Use 3DS 2.0 flow...".
3. **Execute:** Agent implements the code.
4. **Codify (CRITICAL):** Agent invokes `@Scribe` to create a new doc (e.g., `docs/technical/backend/features/3D-SECURE.md`) using the `01-FEATURE-DESIGN-TEMPLATE.md`.

**Why?** This turns "Tribal Knowledge" or "External Knowledge" into "System Knowledge" for the next agent.

## 5. Agent Personas (Roles)

The AI will assume specific roles based on the task. Each role has a specific "Knowledge Base" (RAG context) it prioritizes.

| Agent          | Responsibility                          | Key Documents                                  | Output Style                        |
| :------------- | :-------------------------------------- | :--------------------------------------------- | :---------------------------------- |
| **@Architect** | System design, patterns, data modeling. | `SYSTEM-ARCHITECTURE.md`, `DESIGN-PATTERNS.md` | Diagrams, Interfaces, Schema.prisma |
| **@Backend**   | API, Business Logic, DB interactions.   | `TYPESCRIPT-STRICT.md`, `NestJS Docs`          | Services, Controllers, DTOs         |
| **@Frontend**  | UI/UX, State Management, Client Logic.  | `ANGULAR-ZONELESS.md`, `STANDARDS.md`          | Components, Signals, HTML/CSS       |
| **@QA**        | Testing, Mock Data, Validation.         | `CONSTRUCTION-CHECKLIST.md`                    | Spec files, E2E scripts             |
| **@Scribe**    | Documentation, Commits, Changelogs.     | `MONOREPO-GUIDE.md`                            | Markdown, Git messages              |

## 6. Automated Commit Protocol

After every code generation task, the AI must suggest a commit message following the **Conventional Commits** standard, derived directly from the Prompt Template.

**Formula:**
`{type}({scope}): {short description based on ACTION + SCOPE}`

`{Long description based on CONTEXT and SPECS}`

**Example:**

```text
feat(payments): create TransactionHistory standalone component

- Implements paginated table for transaction history
- Connects to PaymentsStore for data fetching
- Uses Angular Signals for state management
```

## 7. Technical Standards (Global)

- **Language:** English (Code, Comments, Commits, Documentation).
- **Code Style:** Strict TypeScript, Functional patterns where possible.
- **Communication Style:**
  - **NO EMOJIS** in any output.
  - **Minimal Comments:** Code must be self-explanatory. Avoid redundant comments.
- **Testing:** All new features must include unit tests.
- **Documentation:** All public methods must have JSDoc/TSDoc.
