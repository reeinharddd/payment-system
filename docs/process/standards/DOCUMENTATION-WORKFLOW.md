<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the DOCUMENTATION WORKFLOW and TEMPLATE USAGE RULES.

  PURPOSE: Establish mandatory processes for creating, updating, and maintaining documentation.

  CRITICAL RULES FOR AI AGENTS:
  1. ALWAYS check which template to use before creating new documentation
  2. ALWAYS update the Change Log when modifying existing documents
  3. ALWAYS follow the separation of concerns (DB structure vs UI vs Business Logic)
  4. NEVER mix concerns across document types
-->
<!-- AI-INSTRUCTION: END -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="120" align="center" valign="middle">
      <img src="../../../libs/assets/src/images/logo.png" width="80" alt="Project Logo" />
    </td>
    <td align="left" valign="middle">
      <h1 style="margin: 0; border-bottom: none;">Documentation Workflow & Template Guide</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Mandatory processes for documentation creation and maintenance</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Approved-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Mandatory-Yes-red?style=flat-square" alt="Mandatory" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--27-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with documentation._

| Directive      | Instruction                                                                                    |
| :------------- | :--------------------------------------------------------------------------------------------- |
| **Context**    | This document defines the workflow for ALL documentation tasks in the payment system project.  |
| **Constraint** | MUST use appropriate template. MUST NOT mix concerns across document types.                    |
| **Pattern**    | Before creating docs: 1) Identify type, 2) Select template, 3) Apply structure, 4) Add to log. |
| **Related**    | `docs/templates/`, `STANDARDS.md`                                                              |

---

## 1. Executive Summary

This document establishes **mandatory workflows** for creating, updating, and maintaining documentation in the payment system project. It defines:

- **Which template to use** for each type of documentation
- **Separation of concerns** rules (DB vs UI vs Business Logic)
- **Change log requirements** for tracking document evolution
- **Review and approval processes** for documentation quality

**Key Principle:** One document type = One concern. Never mix database schema with UI flows or business logic.

---

## 2. Template Selection Decision Tree

Use this decision tree to select the correct template:

```text
What are you documenting?

├─ General Information (Overview, Guide, Tutorial)
│  └─ Use: 00-GENERAL-DOC-TEMPLATE.md
│
├─ Feature/Module Implementation (Backend + Frontend + DB)
│  └─ Use: 01-FEATURE-DESIGN-TEMPLATE.md
│
├─ Architectural Decision (Why we chose X over Y)
│  └─ Use: 02-ADR-TEMPLATE.md
│
├─ Database Schema (Tables, Columns, Indexes, Constraints)
│  └─ Use: 03-DATABASE-SCHEMA-TEMPLATE.md
│
├─ API Design (Endpoints, DTOs, Contracts)
│  └─ Use: 04-API-DESIGN-TEMPLATE.md
│
├─ Synchronization Strategy (Offline, Conflict Resolution)
│  └─ Use: 05-SYNC-STRATEGY-TEMPLATE.md
│
├─ UI/UX Flow (User Journeys, Validation Flows)
│  └─ Use: 06-UX-FLOW-TEMPLATE.md
│
├─ Testing Strategy (Test Types, Coverage, QA Approach)
│  └─ Use: 07-TESTING-STRATEGY-TEMPLATE.md
│
├─ Deployment Runbook (Deployment Procedures, Rollback)
│  └─ Use: 08-DEPLOYMENT-RUNBOOK-TEMPLATE.md
│
└─ Security Audit (Vulnerabilities, Compliance, Remediation)
   └─ Use: 09-SECURITY-AUDIT-TEMPLATE.md
```

---

## 3. Separation of Concerns Matrix

This matrix defines **what goes where**. Violating this creates confusion and makes documents unmaintainable.

| Concern                          | Database Schema Doc | Feature Design Doc | ADR            | UX Flow Doc    | API Design Doc  |
| :------------------------------- | :------------------ | :----------------- | :------------- | :------------- | :-------------- |
| **Table definitions**            | YES PRIMARY         | REF Reference      | NO             | NO             | NO              |
| **Column types & constraints**   | YES PRIMARY         | NO                 | NO             | NO             | NO              |
| **Indexes & performance**        | YES PRIMARY         | REF Considerations | NO             | NO             | NO              |
| **Foreign keys & relationships** | YES PRIMARY         | REF Reference      | NO             | NO             | NO              |
| **Triggers & DB-level logic**    | YES PRIMARY         | NO                 | NO             | NO             | NO              |
| **User interaction flows**       | NO                  | REF Overview       | NO             | YES PRIMARY    | NO              |
| **Validation screens**           | NO                  | REF Overview       | NO             | YES PRIMARY    | NO              |
| **UI mockups/wireframes**        | NO                  | REF Overview       | NO             | YES PRIMARY    | NO              |
| **Business logic algorithms**    | NO                  | YES PRIMARY        | REF Rationale  | NO             | NO              |
| **Service layer implementation** | NO                  | YES PRIMARY        | NO             | NO             | NO              |
| **API endpoints & DTOs**         | NO                  | REF Reference      | NO             | NO             | YES PRIMARY     |
| **Request/response contracts**   | NO                  | REF Reference      | NO             | NO             | YES PRIMARY     |
| **Error handling strategies**    | NO                  | YES PRIMARY        | REF Rationale  | NO             | YES PRIMARY     |
| **Offline sync strategy**        | NO                  | REF Overview       | YES PRIMARY    | NO             | REF Impact      |
| **Conflict resolution rules**    | NO                  | REF Overview       | YES PRIMARY    | NO             | NO              |
| **Technology choice rationale**  | NO                  | NO                 | YES PRIMARY    | NO             | NO              |
| **Security considerations**      | REF RLS & Access    | YES Implementation | REF Decisions  | REF Auth Flows | YES Contracts   |
| **Performance benchmarks**       | REF Query patterns  | YES Optimization   | REF Trade-offs | NO             | REF Rate limits |

**Legend:**

- YES PRIMARY: This is the authoritative source
- REF Reference/Overview: Brief mention with link to primary source
- NO Does NOT belong here

---

## 4. Template-Specific Rules

### 4.1. Database Schema Documents (`03-DATABASE-SCHEMA-TEMPLATE.md`)

**Location:** `docs/technical/backend/database/[XX]-[NAME]-SCHEMA.md`

**Mandatory Sections:**

1. Executive Summary (purpose, entity count, dependencies)
2. ER Diagram (PlantUML)
3. Entity Definitions (one subsection per table)
   - Schema: `schema_name.TableName`
   - All columns with types, nullability, defaults
   - Indexes (with SQL)
   - Foreign Keys (with SQL)
   - Example records (SQL INSERT)
4. Data Integrity Constraints
   - Unique constraints
   - Check constraints
   - Triggers
5. Performance & Indexing Strategy
   - Index coverage table
   - Common query patterns (with SQL)
6. Migration Strategy
7. Security Considerations (RLS if applicable)
8. Change Log

**Strictly FORBIDDEN:**

- NO UI/UX flows or mockups > Move to `docs/technical/frontend/ux-flows/`
- NO Business logic algorithms > Move to Feature Design docs
- NO API endpoint definitions > Move to API Design docs
- NO Sync strategies > Move to ADRs or Sync Strategy docs
- NO User stories > Move to Feature Design docs

**Example Violation:**

```markdown
## 5. Product Identification & Validation Flows

### 5.1. Barcode Scanning - The 3 Scenarios

When a user scans a barcode, the system must handle 3 possible outcomes:
[... detailed UI flow ...]
```

**NO WRONG:** This is UX flow, not database structure.

**YES CORRECT:** Move to `docs/technical/frontend/ux-flows/INVENTORY-BARCODE-SCANNING.md`

---

### 4.2. Feature Design Documents (`01-FEATURE-DESIGN-TEMPLATE.md`)

**Location:** `docs/technical/backend/features/[FEATURE-NAME].md` or `docs/technical/frontend/features/[FEATURE-NAME].md`

**Mandatory Sections:**

1. Overview (what/why)
2. User Stories / Requirements
3. Technical Architecture
   - Database Changes (Prisma snippet + link to schema doc)
   - API Endpoints (table + link to API doc)
   - UI Components (list + link to UX flow doc)
4. Implementation Plan (checklist)
5. Open Questions / Risks

**Cross-References:**

- Database changes > Link to `[XX]-[NAME]-SCHEMA.md#entity-name`
- API contracts > Link to `API-[FEATURE].md`
- UX flows > Link to `UX-[FLOW-NAME].md`

---

### 4.3. ADR Documents (`02-ADR-TEMPLATE.md`)

**Location:** `docs/technical/architecture/adr/ADR-[NNN]-[title].md`

**Mandatory Sections:**

1. Status (Proposed, Accepted, Deprecated, Superseded)
2. Context (problem statement)
3. Decision (what we chose)
4. Consequences (trade-offs)
5. Alternatives Considered (with pros/cons)

**Use When:**

- Choosing between technologies (NestJS vs Express)
- Architectural patterns (Monolith vs Microservices)
- Data modeling strategies (SQL vs NoSQL)
- Sync mechanisms (WebSocket vs Polling)

---

## 5. Change Log Requirements

Every document MUST have an **Appendix: Change Log** section.

**Format:**

```markdown
## Appendix A: Change Log

| Date       | Version | Author     | Changes                                     |
| :--------- | :------ | :--------- | :------------------------------------------ |
| 2025-11-27 | 1.2.0   | @Architect | Added PriceRule and ProductPromotion tables |
| 2025-11-22 | 1.1.0   | @Backend   | Updated indexes for performance             |
| 2025-11-15 | 1.0.0   | @Architect | Initial schema design                       |
```

**Rules:**

- Date format: `YYYY-MM-DD`
- Version: Semantic versioning (Major.Minor.Patch)
  - **Major**: Breaking changes (schema rename, column removal)
  - **Minor**: Additive changes (new table, new column)
  - **Patch**: Documentation fixes, clarifications
- Author: GitHub username or agent persona (`@Architect`, `@Backend`, etc.)
- Changes: Brief description (1-2 sentences)

**When to Update:**

- YES Adding/removing tables or columns
- YES Changing data types or constraints
- YES Adding/modifying indexes
- YES Updating business logic or algorithms
- YES Adding examples or clarifications
- NO Fixing typos (unless significant)
- NO Formatting changes (unless affecting structure)

---

## 6. Documentation Creation Workflow

### Step 1: Identify Document Type

Ask yourself: **What am I documenting?**

- Database structure? > Database Schema Template
- Complete feature? > Feature Design Template
- Architectural decision? > ADR Template
- User interaction? > UX Flow Template
- API contracts? > API Design Template
- Sync strategy? > Sync Strategy Template

### Step 2: Check if Document Exists

```bash
# Search for existing docs
find docs/ -name "*[keyword]*"

# Or use grep
grep -r "ProductPromotion" docs/
```

**If exists:** Update existing document + add to change log
**If new:** Create from template

### Step 3: Copy Template

```bash
# Example: Creating new database schema
cp docs/templates/03-DATABASE-SCHEMA-TEMPLATE.md \
   docs/technical/backend/database/07-BILLING-SCHEMA.md
```

### Step 4: Fill YAML Frontmatter (MANDATORY)

**CRITICAL:** Every document MUST have YAML frontmatter at the very beginning for semantic search, RAG, and MCP tool discovery.

**Required Fields:**

```yaml
---
document_type: "database-schema" # REQUIRED: Exact type identifier
module: "billing" # REQUIRED: Module/feature name
status: "draft" # REQUIRED: draft | in-review | approved | deprecated
version: "1.0.0" # REQUIRED: Semantic versioning
last_updated: "2025-11-27" # REQUIRED: ISO date (YYYY-MM-DD)
author: "@username" # REQUIRED: GitHub username or team

# Keywords for semantic search (5-10 keywords)
keywords:
  - "billing"
  - "invoices"
  - "subscriptions"
  - "payment-history"
  # Add specific entities, technologies, or domains

# Related documentation (cross-references)
related_docs:
  database_schema: "path/to/schema.md"
  api_design: "path/to/api.md"
  ux_flow: "path/to/ux.md"
  feature_design: "path/to/feature.md"

# Document-specific metadata (varies by template)
# See template for exact structure
---
```

**Why This Matters:**

- **MCP Tools:** Can find documents by `document_type`, `module`, or `keywords`
- **RAG Systems:** Better retrieval based on semantic keywords
- **Automation:** Scripts can parse metadata for validation
- **Cross-Referencing:** Automated linking between related docs
- **Search:** Fast filtering by status, author, or date

**Example Document Types:**

| Template        | `document_type` Value |
| :-------------- | :-------------------- |
| Database Schema | `"database-schema"`   |
| API Design      | `"api-design"`        |
| UX Flow         | `"ux-flow"`           |
| Feature Design  | `"feature-design"`    |
| ADR             | `"adr"`               |
| Sync Strategy   | `"sync-strategy"`     |
| General         | `"general"`           |

### Step 5: Fill Template Sections

1. Update header (title, subtitle)
2. Update badges (Status, Date)
3. Fill Agent Directives table
4. Complete all mandatory sections
5. Add initial change log entry

### Step 5: Cross-Reference

Link to related documents:

```markdown
**Related Documents:**

- [Database Schema](../database/04-INVENTORY-SCHEMA.md#product-table)
- [API Design](./API-INVENTORY.md)
- [UX Flow](../frontend/ux-flows/BARCODE-SCANNING.md)
```

### Step 6: Commit with Conventional Commit

```bash
# For new document
git commit -m "docs(inventory): add barcode scanning UX flow documentation"

# For update
git commit -m "docs(database): update inventory schema with PriceRule table"

# For breaking change
git commit -m "docs(database)!: rename Product.costPrice to averageCostPrice

BREAKING CHANGE: Column renamed, requires migration"
```

---

## 7. Documentation Review Checklist

Before marking a document as "Ready" or "Approved", verify:

### Metadata (YAML Frontmatter)

- [ ] YAML frontmatter exists at top of file (before any comments or content)
- [ ] `document_type` matches template type (e.g., `"database-schema"`)
- [ ] `module` is specified and meaningful (e.g., `"inventory"`, not `"module-name"`)
- [ ] `status` is valid: `"draft"` | `"in-review"` | `"approved"` | `"deprecated"`
- [ ] `version` follows semantic versioning (e.g., `"1.2.3"`)
- [ ] `last_updated` is ISO date format (`YYYY-MM-DD`) and current
- [ ] `author` is specified (GitHub username or team)
- [ ] `keywords` array has 5-10 relevant search terms
- [ ] `related_docs` paths are valid (or empty if not applicable)
- [ ] Document-specific metadata is complete (e.g., `schema_stats`, `api_metadata`)

### Structure

- [ ] Uses correct template (matches `document_type` in frontmatter)
- [ ] All mandatory sections are complete
- [ ] Change log is updated with current changes
- [ ] Badges reflect current status and date

### Content Quality

- [ ] Executive Summary is clear and concise (2-3 paragraphs max)
- [ ] Technical details are accurate and complete
- [ ] Examples are provided where applicable
- [ ] SQL queries are tested and correct
- [ ] PlantUML diagrams render correctly

### Separation of Concerns

- [ ] No UI/UX flows in database schema docs
- [ ] No database structure details in UX flow docs
- [ ] No business logic algorithms in database docs
- [ ] Appropriate cross-references to other documents

### AI Compatibility

- [ ] Agent Directives section is filled correctly
- [ ] AI-INSTRUCTION comments are preserved
- [ ] Document uses semantic structure (H2 for sections, H3 for subsections)
- [ ] Code blocks have language tags

### Maintenance

- [ ] Links to related documents work
- [ ] Version number follows semantic versioning
- [ ] Author is identified
- [ ] No "TODO" or placeholder sections remain

---

## 8. Migration Guide: Fixing Existing Documents

If you find a document that violates separation of concerns:

### Step 1: Identify Violations

Read through the document and note sections that don't belong:

```markdown
# Example: 04-INVENTORY-SCHEMA.md

## 5. Product Identification & Validation Flows NO VIOLATION

### 5.1. Barcode Scanning - The 3 Scenarios NO UX Flow in DB doc
```

### Step 2: Extract Content

Copy the violating sections to a new document with the correct template:

```bash
# Create UX flow document
cp docs/templates/06-UX-FLOW-TEMPLATE.md \
   docs/technical/frontend/ux-flows/INVENTORY-BARCODE-SCANNING.md
```

### Step 3: Update Original Document

Replace the violating section with a cross-reference:

```markdown
## 5. Data Integrity Constraints

[... constraints ...]

---

## 6. Performance & Indexing Strategy

[... indexes ...]

---

**Related User Experience Flows:**

- [Barcode Scanning Flow](../../frontend/ux-flows/INVENTORY-BARCODE-SCANNING.md)
- [Product Creation Flow](../../frontend/ux-flows/INVENTORY-PRODUCT-CREATION.md)
```

### Step 4: Update Both Change Logs

**Original Document (04-INVENTORY-SCHEMA.md):**

```markdown
| 2025-11-27 | 2.0.0 | @Scribe | Refactor: moved UX flows to separate docs |
```

**New Document (INVENTORY-BARCODE-SCANNING.md):**

```markdown
| 2025-11-27 | 1.0.0 | @Scribe | Extracted from 04-INVENTORY-SCHEMA.md |
```

### Step 5: Commit Refactor

```bash
git add docs/technical/backend/database/04-INVENTORY-SCHEMA.md
git add docs/technical/frontend/ux-flows/INVENTORY-BARCODE-SCANNING.md

git commit -m "docs(inventory): refactor UX flows to separate document

Moved barcode scanning validation flows from database schema doc
to dedicated UX flow document for proper separation of concerns.

- Database schema now contains only table structure
- UX flows moved to docs/technical/frontend/ux-flows/"
```

---

## 9. Template Maintenance

### Adding New Templates

When creating a new template:

1. **Identify Need:** Is there a document type not covered?
2. **Create Template:** Follow the structure of existing templates
3. **Add to Decision Tree:** Update Section 2 of this document
4. **Update Matrix:** Add column to Section 3 matrix
5. **Document in STANDARDS.md:** Add template to the list

**Template Numbering:**

```text
00-GENERAL-DOC-TEMPLATE.md       (General purpose)
01-FEATURE-DESIGN-TEMPLATE.md    (Feature implementation)
02-ADR-TEMPLATE.md               (Architectural decisions)
03-DATABASE-SCHEMA-TEMPLATE.md   (Database structure)
04-API-DESIGN-TEMPLATE.md        (API contracts)
05-SYNC-STRATEGY-TEMPLATE.md     (Offline sync)
06-UX-FLOW-TEMPLATE.md           (User experience flows)
07-[NEXT-TEMPLATE].md            (Future templates)
```

### Template Versioning

Templates themselves should have version numbers in their change logs:

```markdown
## Appendix A: Template Change Log

| Date       | Version | Author     | Changes                               |
| :--------- | :------ | :--------- | :------------------------------------ |
| 2025-11-27 | 1.1.0   | @Scribe    | Added security considerations section |
| 2025-11-22 | 1.0.0   | @Architect | Initial template creation             |
```

### Violation 3: Missing or Invalid Metadata

**NO Wrong:**

```markdown
<!-- AI-INSTRUCTION comments -->

<table width="100%">
...
</table>

## 1. Executive Summary
```

**YES Correct:**

```markdown
---
document_type: "database-schema"
module: "inventory"
status: "approved"
version: "2.1.0"
last_updated: "2025-11-27"
author: "@Architect"

keywords:
  - "inventory"
  - "products"
  - "stock"
  - "barcode"

related_docs:
  api_design: "docs/technical/backend/api/INVENTORY-API.md"
  ux_flow: "docs/technical/frontend/ux-flows/INVENTORY-BARCODE-SCANNING.md"

schema_stats:
  total_tables: 12
  total_indexes: 24
  total_constraints: 18
  estimated_rows: "10K-100K"
---

<!-- AI-INSTRUCTION comments -->

<table width="100%">
...
</table>
```

---

---

## 10. Common Violations & Fixes

### Violation 1: UI Flow in Database Doc

**NO Wrong:**

```markdown
## 5. Product Scanning Flow

When user scans barcode:

1. Check if product exists
2. Show confirmation dialog
3. User adjusts quantity
   [... detailed UI flow ...]
```

**YES Correct:**

```markdown
## 5. Data Integrity Constraints

[... constraints only ...]

---

**Related Documentation:**

- [Barcode Scanning UX Flow](../../frontend/ux-flows/INVENTORY-BARCODE-SCANNING.md)
```

---

### Violation 2: Database Schema in Feature Doc

**NO Wrong:**

```markdown
## 3. Implementation

### 3.1. Database Schema

Table: Product

- id: UUID PRIMARY KEY
- name: VARCHAR(255) NOT NULL
  [... full table definition ...]
```

**YES Correct:**

```markdown
## 3. Implementation

### 3.1. Database Changes

**Schema:** [Inventory Schema - Product Table](../database/04-INVENTORY-SCHEMA.md#31-product)

**Changes Required:**

- Add `averageCostPrice` column (DECIMAL(19,4))
- Add index on `(businessId, status)`

See full schema definition in the linked document.
```

---

### Violation 3: Missing Change Log

**NO Wrong:**

```markdown
[... document content ...]

## References

- Link 1
- Link 2

<!-- No change log -->
```

**YES Correct:**

```markdown
[... document content ...]

## References

- Link 1
- Link 2

---

## Appendix A: Change Log

| Date       | Version | Author  | Changes                   |
| :--------- | :------ | :------ | :------------------------ |
| 2025-11-27 | 1.0.0   | @Author | Initial document creation |
```

---

## 11. Automation & Validation

### Linting Documentation

Use markdownlint to enforce style:

```bash
# Install markdownlint
npm install -g markdownlint-cli

# Lint all docs
markdownlint docs/**/*.md

# Fix auto-fixable issues
markdownlint --fix docs/**/*.md
```

**Common Rules:**

- MD001: Heading levels (H1 > H2 > H3, no skipping)
- MD040: Fenced code must have language tag
- MD032: Lists must have blank lines before/after

### Pre-Commit Hook

```bash
#!/bin/bash
# .husky/pre-commit

# Lint changed documentation files
DOCS=$(git diff --cached --name-only --diff-filter=ACM | grep '\.md$')

if [ -n "$DOCS" ]; then
  markdownlint $DOCS
  if [ $? -ne 0 ]; then
    echo "NO Markdown linting failed. Fix issues and try again."
    exit 1
  fi
fi

exit 0
```

---

## 12. Quick Reference Card

```text
╔══════════════════════════════════════════════════════════════════╗
║  DOCUMENTATION WORKFLOW - QUICK REFERENCE                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  1. IDENTIFY TYPE                                                ║
║     > DB Structure?    Use: 03-DATABASE-SCHEMA-TEMPLATE.md       ║
║     > Feature/Module?  Use: 01-FEATURE-DESIGN-TEMPLATE.md        ║
║     > Why Decision?    Use: 02-ADR-TEMPLATE.md                   ║
║     > UX Flow?         Use: 06-UX-FLOW-TEMPLATE.md (TBD)         ║
║                                                                  ║
║  2. CHECK SEPARATION OF CONCERNS                                 ║
║     YES DB Docs:  Tables, columns, indexes, constraints ONLY      ║
║     YES UX Docs:  User flows, screens, validation ONLY            ║
║     YES API Docs: Endpoints, DTOs, contracts ONLY                 ║
║     NO NO MIXING: Keep concerns separated!                       ║
║                                                                  ║
║  3. MANDATORY SECTIONS                                           ║
║     YES Executive Summary                                         ║
║     YES Agent Directives                                          ║
║     YES Change Log (Appendix A)                                   ║
║     YES Cross-references to related docs                          ║
║                                                                  ║
║  4. BEFORE COMMITTING                                            ║
║     > Run: markdownlint docs/**/*.md                             ║
║     > Update: Change Log with version bump                       ║
║     > Update: Last Updated badge                                 ║
║     > Verify: All links work                                     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Appendix A: Change Log

| Date       | Version | Author  | Changes                                                                                          |
| :--------- | :------ | :------ | :----------------------------------------------------------------------------------------------- |
| 2025-11-27 | 1.2.0   | @Scribe | Added 3 new templates: Testing Strategy, Deployment Runbook, Security Audit (total 10 templates) |
| 2025-11-27 | 1.1.0   | @Scribe | Added YAML frontmatter requirements for semantic search, MCP, and RAG integration                |
| 2025-11-27 | 1.0.0   | @Scribe | Initial documentation workflow guide with template rules                                         |

---

## Appendix B: Related Documents

- [STANDARDS.md](./STANDARDS.md) - General documentation standards
- [Templates Directory](../../templates/) - All available templates
- [DATABASE-DESIGN.md](../technical/backend/DATABASE-DESIGN.md) - Master database design doc
- [AI-DEVELOPMENT-STANDARD.md](../workflow/AI-DEVELOPMENT-STANDARD.md) - AI agent workflows
