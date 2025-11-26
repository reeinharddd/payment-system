# UI Design System (Atomic Design)

This project follows the **Atomic Design** methodology for UI componentization. This ensures consistency, reusability, and scalability across the application.

## Methodology

We break down interfaces into five distinct levels:

1.  **Atoms:** Basic building blocks (Buttons, Inputs, Icons).
2.  **Molecules:** Groups of atoms functioning together (Search Bar, Form Field).
3.  **Organisms:** Complex UI sections (Header, Product Card, Sidebar).
4.  **Templates:** Page-level layout structure without content.
5.  **Pages:** Specific instances of templates with real content.

## Component Library Structure

All shared components reside in `libs/ui/src/lib/`.

### 1. Atoms (`libs/ui/src/lib/atoms/`)

- `ui-button`: Standard button with variants (primary, secondary, outline).
- `ui-icon`: SVG icon wrapper.
- `ui-input`: Base input field.
- `ui-badge`: Status indicators.

### 2. Molecules (`libs/ui/src/lib/molecules/`)

- `ui-form-field`: Label + Input + Error Message.
- `ui-search-bar`: Input + Search Icon + Button.
- `ui-user-avatar`: Image + Name + Role.

### 3. Organisms (`libs/ui/src/lib/organisms/`)

- `ui-navbar`: Logo + Navigation Links + User Menu.
- `ui-sidebar`: Collapsible side navigation.
- `ui-data-table`: Complex table with pagination and sorting.

## Multilanguage Support (i18n)

All text must be translatable.

- **Library:** `@angular/localize` or `ngx-translate`.
- **Pattern:** Use pipes `{{ 'KEY' | translate }}` or directives `translate="KEY"`.
- **Files:** `src/assets/i18n/en.json`, `src/assets/i18n/es.json`.

## Design Tokens (Tailwind CSS)

We use Tailwind CSS for styling, mapped to our design tokens.

- **Colors:** `brand-base`, `brand-primary`, `brand-secondary`.
- **Spacing:** Standard Tailwind scale.
- **Typography:** Inter font family.

## Workflow for New UI Features

1.  **Identify Atoms:** What basic elements are needed?
2.  **Compose Molecules:** How do they combine?
3.  **Build Organisms:** Create the functional section.
4.  **Assemble Page:** Place organisms in the layout.
