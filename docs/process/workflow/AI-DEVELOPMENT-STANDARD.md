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

## 🤖 Agent Directives (System Prompt)

*This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document.*

| Directive | Instruction |
| :--- | :--- |
| **Context** | This document defines how Humans and AI Agents collaborate. |
| **Constraint** | Agents must adopt the "Personas" defined in Section 4. |
| **Pattern** | Follow the "Prompting Standard" (Section 3) for interpreting user requests. |
| **Related** | `docs/process/workflow/DEVELOPMENT-RULES.md` |

---

## 1. Philosophy

This document establishes the methodology for AI-assisted software development within the organization. The goal is to treat AI not just as a code generator, but as a specialized workforce that requires structured input to produce high-quality, architectural-grade output.

**Core Principle:** "Atomic Inputs, Structured Outputs."

## 2. The Human Protocol (Developer Rules)

To ensure the AI operates effectively, the human developer must adhere to the following constraints:

### 2.1. Atomic Scope

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
- **Practice:** Read the explanation *before* the code. If the explanation implies a misunderstanding of the architecture, stop the generation.

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

## 4. Agent Personas (Roles)

The AI will assume specific roles based on the task. Each role has a specific "Knowledge Base" (RAG context) it prioritizes.

| Agent | Responsibility | Key Documents | Output Style |
| :--- | :--- | :--- | :--- |
| **@Architect** | System design, patterns, data modeling. | `SYSTEM-ARCHITECTURE.md`, `DESIGN-PATTERNS.md` | Diagrams, Interfaces, Schema.prisma |
| **@Backend** | API, Business Logic, DB interactions. | `TYPESCRIPT-STRICT.md`, `NestJS Docs` | Services, Controllers, DTOs |
| **@Frontend** | UI/UX, State Management, Client Logic. | `ANGULAR-ZONELESS.md`, `STANDARDS.md` | Components, Signals, HTML/CSS |
| **@QA** | Testing, Mock Data, Validation. | `CONSTRUCTION-CHECKLIST.md` | Spec files, E2E scripts |
| **@Scribe** | Documentation, Commits, Changelogs. | `MONOREPO-GUIDE.md` | Markdown, Git messages |

## 5. Automated Commit Protocol

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

## 6. Technical Standards (Global)

- **Language:** English (Code, Comments, Commits, Documentation).
- **Code Style:** Strict TypeScript, Functional patterns where possible.
- **Testing:** All new features must include unit tests.
- **Documentation:** All public methods must have JSDoc/TSDoc.
