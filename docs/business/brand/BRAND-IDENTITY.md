---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "general"
module: "brand"
status: "draft"
version: "1.0.0"
last_updated: "2025-11-27"
author: "@ProductOwner"

# Keywords for semantic search
keywords:
  - "brand"
  - "identity"
  - "vision"
  - "mission"
  - "visual-standards"
  - "design"
  - "marketing"
  - "impulsa"

# Related documentation
related_docs:
  database_schema: ""
  api_design: ""
  feature_design: ""
  ux_flow: "docs/technical/frontend/UI-DESIGN-SYSTEM.md"

# Document-specific metadata
doc_metadata:
  audience: "all"
  complexity: "low"
  estimated_read_time: "10 min"
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document defines the BRAND IDENTITY.
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
      <h1 style="margin: 0; border-bottom: none;">Brand Identity</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Vision, Mission, and Visual Standards</p>
    </td>
  </tr>
</table>

<div align="center">

  <img src="https://img.shields.io/badge/Status-Draft-yellow?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Audience-Designers%20%26%20Product-purple?style=flat-square" alt="Audience" />
  <img src="https://img.shields.io/badge/Last%20Updated-2025--11--22-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                             |
| :------------- | :-------------------------------------------------------------------------------------- |
| **Context**    | This document defines the visual and strategic identity of the project.                 |
| **Constraint** | All UI components and marketing materials MUST adhere to these guidelines.              |
| **Pattern**    | Use the defined color palette and typography in all frontend code.                      |
| **Related**    | `apps/merchant-web/src/styles.css`, `docs/business/strategy/BUSINESS-MODEL-ANALYSIS.md` |

---

## 1. Executive Summary

**Impulsa** is the brand name for our payment and business management ecosystem. The brand represents **growth, simplicity, and partnership**. It is not just a tool for payments; it is a catalyst for the local economy, designed to turn informal merchants into thriving entrepreneurs without the barrier of complex technology or high costs.

## 2. Brand Architecture

### 2.1. Corporate vs. Product Identity

- **Corporate Brand (The Creator):** Represented by the logo in `libs/assets/src/images/logo.png`. This entity owns the intellectual property and provides the backing/stability. It appears in legal footers, documentation headers, and official communications.
- **Product Brand (The Tool):** **Impulsa**. This is the face the user sees every day. It has its own distinct logo, voice, and visual style, designed specifically to resonate with the merchant.

## 3. Brand Core

### 3.1. Name: Impulsa

- **Meaning:** To push forward, to boost, to drive.
- **Rationale:** Aligns with the core value proposition: "Not making them pay more, making them earn more." We are the force that pushes their business forward.

### 3.2. Vision & Ideals (The "Why")

#### "To ignite the potential of the overlooked economy."

We see a world where the size of your shop does not dictate the size of your opportunity. We are fighting against the financial exclusion that keeps millions of hard-working merchants in the shadows.

- **Dignity:** We build tools that respect the merchant's intelligence and effort. We don't "dumb down" finance; we make it accessible.
- **Community:** We are not just a service provider; we are the digital infrastructure of the neighborhood market. When one merchant grows, the community thrives.
- **Freedom:** The ultimate goal is not just better payments, but the freedom that comes with financial control—freedom to plan, to expand, and to dream.

### 3.3. Tagline

- **Primary:** "Tu negocio, sin límites." (Your business, without limits.)
- **Secondary:** "Crece con cada venta." (Grow with every sale.)

## 4. Visual Identity

### 4.1. Product Logo Concept (Impulsa)

The product logo must be distinct from the corporate logo. It should represent **connectivity** and **modern payments**.

- **Symbol:** A central antenna with expanding signal waves (NFC style), contained within a soft squircle.
- **Style:** Minimalist, geometric, high-contrast (Deep Violet on Soft Lavender).
- **Meaning:** Connectivity, contactless payments, and the transmission of value.
- **Usage:** App icon, splash screen, QR stand, marketing materials.

### 3.2. Color Palette

The palette revolves around **Soft Lavender** (`#CBC3E3`), creating a calm, approachable, and stress-free environment. To ensure accessibility (WCAG AA), we pair this light brand color with a deep violet for text and interactive elements.

| Role            | Color Name        | Hex       | Tailwind Class | Meaning                           |
| :-------------- | :---------------- | :-------- | :------------- | :-------------------------------- |
| **Brand Base**  | **Soft Lavender** | `#CBC3E3` | `custom`       | Approachability, Calm, The Brand. |
| **Interaction** | **Deep Violet**   | `#4C1D95` | `violet-900`   | Readability, Action, Contrast.    |
| **Secondary**   | **Growth Green**  | `#10B981` | `emerald-500`  | Money, Success, Growth.           |
| **Accent**      | **Alert Orange**  | `#F97316` | `orange-500`   | Action, Attention, Energy.        |
| **Background**  | **Clean White**   | `#FFFFFF` | `white`        | Clarity, Simplicity.              |
| **Surface**     | **Lavender Mist** | `#F3F0FF` | `violet-50`    | Subtle tint for cards/sections.   |

### 3.3. Typography

We use **Inter** for its readability. We prioritize **large base font sizes** (16px minimum) to ensure legibility for older adults.

- **Headings:** Inter Bold (700) - Strong, confident.
- **Body:** Inter Regular (400) - Clean, legible.
- **Numbers:** Inter tabular-nums - Essential for financial data alignment.

## 4. Accessibility & Inclusivity (Core Mandate)

**Goal:** WCAG 2.1 AA Certification (aiming for AAA where possible).

Our users range from digital natives to older adults with zero technology experience. The interface must be:

1. **Perceivable:**
   - **High Contrast:** Text must always meet 4.5:1 contrast ratio.
   - **No Color Dependency:** Never use color alone to convey meaning (e.g., error states must have icons/text).
   - **Dynamic Type:** The UI must respect the user's system font size settings.

2. **Operable:**
   - **The "Grandmother Test":** If a user with shaky hands or poor vision cannot use it, it is a design failure.
   - **Large Touch Targets:** All interactive elements must be at least **48x48px**.
   - **Simple Navigation:** No hidden menus, no complex gestures (swipes). Everything must be visible and labeled.

3. **Understandable:**
   - **Plain Language:** No tech jargon ("Syncing", "Buffering"). Use "Guardando" (Saving), "Listo" (Ready).
   - **Consistent Feedback:** Every action has an immediate, clear reaction.

## 5. Voice & Tone

Our voice is **The Knowledgeable Partner**.

- **Simple but not childish:** We explain complex financial concepts in plain language.
- **Encouraging:** We celebrate their wins (sales).
- **Direct:** We don't waste time. Merchants are busy.

| Do This                  | Don't Do This                                |
| :----------------------- | :------------------------------------------- |
| "Cobrar" (Charge)        | "Iniciar Transacción" (Initiate Transaction) |
| "Tu dinero llega mañana" | "Liquidación de fondos en T+1"               |
| "¡Venta exitosa!"        | "Procesamiento completado"                   |

## 6. Application in UI

### 6.1. Design Principles

1. **Mobile First:** All designs start at 360px width.
2. **High Contrast:** Outdoor usage (markets, street stalls) requires high contrast visibility.
3. **Touch Friendly:** Large buttons (min 44px height) for quick operation.

### 6.2. Mockup Guidelines

When creating mockups:

- Use **Soft Lavender** (`#CBC3E3`) for large headers, active states, and decorative backgrounds.
- Use **Deep Violet** (`#4C1D95`) for primary text, icons, and high-priority buttons to ensure contrast.
- Keep the interface **white and clean** to let the data (sales) stand out.
