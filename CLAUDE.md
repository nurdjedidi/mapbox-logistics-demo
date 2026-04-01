# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Maritime-road/logistics dashboard demo for a customs broker (commissionnaire en douane). The goal is a "FlightRadar for maritime" showing 40 shipments (containers, trucks, air cargo) on an interactive 3D map with customs document tracking and supplier follow-up. See `context.md` for full product vision and client requirements.

## Commands

```bash
npm run dev          # Dev server with HMR → http://localhost:5173
npm run build        # Production build → /build/
npm run typecheck    # react-router typegen + tsc
npm start            # Serve production build
```

No test runner or linter is configured yet.

## Architecture

**Stack:** React 19 + React Router v7 (SSR) + TypeScript + Vite + Tailwind v4

**Framework:** React Router v7 with file-based routing. Routes are defined in [app/routes.ts](app/routes.ts) and rendered under [app/root.tsx](app/root.tsx). The `~/` alias maps to `./app/`.

**Routing pattern:**
- Add routes to `app/routes.ts` using the `route()` / `index()` helpers
- Route components go in `app/routes/`
- Shared components go in `app/` subdirectories (e.g., `app/components/`)

**Planned UI layout** (from `context.md`):
- Full-screen Mapbox GL JS 3D map (center, navigation-night style, 45-60° pitch)
- Left panel: scrollable dossier list with transport-type filters
- Right panel: selected dossier details (container info, customs checklist, supplier follow-up)
- Header: logo, active count, alerts count

**Key data types** (defined in `context.md`):
- `Dossier` — shipment with origin/destination coords, ETA, status, documents, alerts
- `Document` — customs doc with status: `recu` | `en_attente` | `manquant`
- `Alerte` — severity-based alerts for demurrage, geofencing, delays, missing docs

**Mock data** (no real backend): 40 dossiers — 30 maritime, 8 trucks, 2 air. Ports: Tanger Med, Algésiras, Marseille, Gênes, Barcelona (real coords in `context.md`).

**Dependencies to install when building:**
- `mapbox-gl` — 3D map (style: `mapbox://styles/mapbox/navigation-night-v1`)
- `framer-motion` — panel transitions and animated container routes
- `shadcn/ui` — UI components

**Visual style:** Dark mode (`#0f172a`), glassmorphism side panels (`backdrop-blur`), no emojis in UI, monospace for shipment refs (REF-2024-001), maritime blue / green / red accent colors.

## Working Guidelines

### Plan Mode
- Enter plan mode for any non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, stop and re-plan — don't keep pushing

### Subagents
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents

### Self-Improvement Loop
- After any correction from the user: update `tasks/lessons.md` with the pattern
- Review lessons at session start for relevant context

### Verification Before Done
- Never mark a task complete without proving it works
- Ask yourself: "Would a staff engineer approve this?"

### Elegance
- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple, obvious fixes

### Bug Fixing
- When given a bug report: just fix it without asking for hand-holding

## Task Management

1. Write plan to `tasks/todo.md` with checkable items
2. Check in before starting implementation
3. Mark items complete as you go
4. Update `tasks/lessons.md` after corrections

## Code Principles

- **Simplicity First**: Make every change as simple as possible. Minimal code impact.
- **No Laziness**: Find root causes. No temporary fixes.
- **No comments**: Write self-documenting code.
