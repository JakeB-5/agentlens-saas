# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AgentLens is a Multi-Agent Observability & Control Plane SaaS built with Next.js 16 (App Router), TypeScript, Prisma 6 + SQLite, and Tailwind CSS 4. It provides real-time monitoring, trace exploration, agent topology visualization, and alerting for multi-agent AI systems.

## Commands

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint

# Database
npx prisma generate      # Generate Prisma client after schema changes
npx prisma db push       # Push schema to SQLite
npx prisma studio        # Visual DB browser

# Full setup from scratch
npm install && npx prisma generate && npx prisma db push
# Then start dev server and POST /api/seed to populate demo data
```

## Architecture

- **App Router pattern**: Pages in `src/app/(dashboard)/` use a shared layout with sidebar navigation. API routes in `src/app/api/`.
- **Client components**: All dashboard pages are `"use client"` and fetch data from API routes via `fetch()`. The API routes use Prisma for database access.
- **Database**: Prisma with SQLite (`prisma/dev.db`). The schema has self-referential relations on `Span` (parent-child hierarchy) — avoid creating spans with `parentSpanId` in the same `prisma.span.create()` call due to TypeScript circular inference. Create first, then update `parentSpanId` separately.
- **Styling**: Tailwind CSS 4 with CSS custom properties in `globals.css` for the dark theme. Uses `cn()` utility from `src/lib/utils.ts` for conditional classes.
- **Real-time topology**: Agent graph visualization uses React Flow (`reactflow` package) with custom `AgentNode` components.

## Key Data Flow

1. External agents send traces/spans via REST API (`POST /api/traces`)
2. Dashboard page polls `GET /api/dashboard` every 10 seconds
3. Trace explorer fetches list + detail on demand
4. Topology page fetches agents + connections and renders as React Flow graph

## Database Schema Gotcha

The `Span` model has a self-referential relation (`parentSpan`/`childSpans`). When seeding or creating spans with `parentSpanId`, create the span first without it, then update separately to avoid TypeScript's circular type inference error with Prisma.
