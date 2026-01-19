# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## Communication

**Always respond in Japanese.** All explanations, questions, and commit messages should be in Japanese unless explicitly asked otherwise.

**Do not perform git operations.** Commits, pushes, and other git commands should be done manually by the user.

## Development Commands

```bash
npm run dev      # Start Vite development server
npm run build    # Type-check with vue-tsc and build for production
npm run preview  # Preview production build locally
```

## Project Overview

Kitchen Budget is a Vue 3 food expense tracking app with split-bill calculation. Data persists in localStorage (no backend required). Deployed to GitHub Pages via GitHub Actions on push to main.

## Architecture

**State Management**: Single Pinia store (`src/stores/expenseStore.ts`) handles all expense CRUD operations and filtering. Persists to localStorage under key `food_expense_app_v1`.

**Routing**: Four routes - Home (`/`), Add (`/add`), Edit (`/edit/:id`), Settings (`/settings`)

**Type System**: `Expense` interface defined in `src/types.ts`, categories defined in `src/constants.ts` with `CATEGORIES` const object.

**Styling**: CSS files in `src/css/` directory structure:
- `variables.css` - CSS custom properties (use these, don't hardcode colors)
- `base.css` - Global styles
- `views/` and `components/` - Per-component styles

## Development Rules (from .agent/rules.md)

**Specification Driven Development**: Update `.agent/general.md` (specification) before changing code.

**Language**: Documentation, commits, code comments, and AI responses in Japanese. No `**` emphasis in docs.

**Code Style**:
- TypeScript strict mode, avoid `any`
- Vue Composition API with `<script setup>`
- Cross-platform build scripts (use Node.js, not shell commands like `cp`)

## Key Business Logic

**Tax Calculation**: Buttons apply 8% or 10% tax (floor rounding). One tax rate at a time. Re-pressing same rate removes tax. `taxRate` field prevents double-taxation on edit.

**Split Calculation**: `amount * (ratio / 100)` with ceiling rounding.

**Filtering**: By date range (default: current month) and category. Summary recalculates based on filtered results.
