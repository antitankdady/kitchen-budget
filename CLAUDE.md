# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication

- Always respond in Japanese
- Always require user confirmation before performing any git operations (commits, pushes, etc.)
- Do not use `**` (bold) emphasis in documents

## Development Process (SDD: Specification Driven Development)

1. Update spec: Before changing code, review and update `.agent/general.md` (specification document)
2. Implement: Write code based on the updated specification
3. Verify: Confirm implementation matches the specification

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Type-check + build (generates dist directory)
npm run preview  # Preview build output
```

## Coding Conventions

- TypeScript: Strict mode enabled, avoid `any`
- Vue: Use Composition API (`<script setup>`)
- Code comments: Japanese only (do not leave English comments)
- Styling: Manage CSS in `src/css/`, use CSS variables from `variables.css`, avoid hardcoded colors
- Build scripts: Use Node.js scripts instead of shell commands (`cp`, etc.) for cross-platform compatibility

## Architecture

- State: Pinia store (`src/stores/expenseStore.ts`) handles CRUD and filtering. localStorage key: `food_expense_app_v1`
- Routing: Home (`/`), Add (`/add`), Edit (`/edit/:id`), Settings (`/settings`)
- Types: `Expense` interface in `src/types.ts`, `CATEGORIES` constant in `src/constants.ts`
- Composables: Shared logic (tax calculation, etc.) in `src/composables/`

## Business Logic

- Tax calculation: +8%/+10% buttons compute tax-inclusive amount (floor). Mutually exclusive. Re-click toggles off. `taxRate` field prevents double-taxation on edit
- Split calculation: `amount * (ratio / 100)` with ceiling
- Filtering: By date range (default: current month) and category. Totals recalculate from filtered results
- Sorting: Date descending, then createdAt descending for same date

## Data Model (Expense)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| id | string | Yes | UUID |
| date | string | Yes | YYYY-MM-DD |
| amount | number | Yes | Amount (tax-inclusive) |
| category | Category | Yes | meat, fish, vegetable, eatingout, general |
| ratio | number | Yes | Cost share ratio (0-100) |
| taxRate | number | No | Applied tax rate (0.08 or 0.10) |
| memo | string | No | Memo |
| createdAt | string | Yes | ISO String |
| updatedAt | string | Yes | ISO String |

## Deploy

GitHub Pages: Auto-deploy via `deploy.yml` workflow on push to `main` branch
