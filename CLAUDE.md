# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Standing Instructions

- **Always make responsive**: Every UI change must work across mobile, tablet, and desktop. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) on all layout, spacing, and typography. Test all breakpoints.
- **Always use the ui-ux-pro-max skill**: For any UI/UX work, invoke the `ui-ux-pro-max` skill before implementing.
- **Push code without screenshots**: When pushing or committing code, do not take or attach screenshots. Just commit and push directly.

## Commands

```bash
npm run dev      # Start development server (Next.js, port 3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

No test runner is configured.

## Architecture

This is a **Next.js 16 App Router** interactive lesson prototype for **Trading Academy** — a gamified financial literacy platform for youth (ages 8–17). There is no backend; all content is client-side.

### Key architectural decisions

- **Single lesson route**: The entire app lives at `/lesson` (`src/app/lesson/page.tsx`). The home page (`src/app/page.tsx`) is unused boilerplate.
- **Client component**: The lesson page is a `"use client"` component with local React state — no server state, no external data fetching.
- **Dynamic import for chart**: `AaplChart` is loaded via `next/dynamic` with `{ ssr: false }` to avoid hydration mismatches from `lightweight-charts`.
- **Age-adaptive content**: All lesson text lives in a `LESSON_CONTENT` object keyed by `AgeGroup` (`"8-10" | "11-13" | "14-17"`). Quiz questions and summary points are hardcoded arrays.
- **5-step lesson flow**: `step` state (1–5) controls rendering: Hook → Concept → Chart → Quiz → Badge. Each step is its own sub-component defined in the same file.
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`). Brand tokens are CSS custom properties defined in `globals.css` (`--color-brand-dark`, `--color-brand-mid`, `--color-brand-light`). Fonts are set as CSS variables in the root layout (`--font-heading`, `--font-sans`).
- **Animations**: Framer Motion for step transitions and UI interactions; `canvas-confetti` for the badge reveal; custom `@keyframes` (`fade-up`, `pulse-ring`) in `globals.css`.
- **UI components**: shadcn/ui (base-nova style, `@base-ui/react` primitives). Config in `components.json`. The `cn()` utility (`src/lib/utils.ts`) merges Tailwind classes via `clsx` + `tailwind-merge`.

### Notable Next.js 16 specifics

- Tailwind v4 is configured through PostCSS (`postcss.config.mjs`), not `tailwind.config.ts`.
- CSS `@utility` directives are used for custom utilities (`animate-pulse-ring`, `animate-fade-up`) — this is a v4 pattern.
- Check `node_modules/next/dist/docs/` for any API you're uncertain about; Next.js 16 has breaking changes from earlier versions.
