# ATLVS — Unified Operations Platform

Enterprise operations management for live events, production companies, and creative agencies.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 19, TypeScript 5 |
| Styling | Tailwind CSS 3.4, shadcn/ui, Radix UI |
| State | Zustand, TanStack Query |
| Backend | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Payments | Stripe |
| Email | Resend |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Testing | Vitest, Playwright |

## Modules

| Module | Route Group | Description |
|--------|------------|-------------|
| Core | `/core` | Dashboard, tasks, inbox, calendar, documents, workflows |
| Productions | `/productions` | Events, projects, advancing, compliance, build/strike |
| Operations | `/operations` | Venues, comms, incidents, crew check-in, resource bookings |
| People | `/people` | Rosters, scheduling, timekeeping, leave, training, travel |
| Assets | `/assets` | Inventory, maintenance, logistics, locations, catalog |
| Finance | `/finance` | Invoices, budgets, expenses, payroll, accounts, reports |
| Business | `/business` | Pipeline, companies, contacts, campaigns, products, brand |
| Analytics | `/analytics` | Dashboards, reports, scenarios, predictive, utilization |
| Network | `/network` | Feed, profiles, discussions, marketplace, showcase |
| Account | `/account` | Settings, profile, privacy, audit log, integrations |

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (or local via `supabase start`)

### Installation

```bash
npm install
cp .env.local.example .env.local
# Add Supabase URL + keys to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes (334+ pages across 10 modules)
│   ├── (auth)/             # Login, register, forgot-password, reset-password
│   ├── (onboarding)/       # Onboarding wizard
│   ├── api/                # 299 API route handlers
│   ├── p/                  # Public profile pages
│   └── client-portal/      # Client portal access
├── components/
│   ├── ui/                 # 57 shadcn/ui primitives
│   ├── views/              # 17 view components (DataTable, Kanban, Calendar, Gantt, etc.)
│   ├── layout/             # App shell, sidebar, top bar
│   ├── forms/              # Dynamic form fields (20 field types)
│   ├── common/             # Shared components (command palette, notifications, etc.)
│   ├── templates/          # Page layout templates
│   └── [module]/           # Module-specific components
├── lib/
│   ├── schemas/            # 193 entity schema definitions (SSOT)
│   ├── crud/               # CrudList + CrudDetail pipeline
│   ├── layouts/            # ListLayout, DetailLayout, SplitLayout, etc.
│   ├── api/                # Guard, policy, RBAC enforcement
│   ├── rbac/               # Role taxonomy (16 roles, 18 permissions)
│   ├── workflow-engine/    # Workflow automation (22+ templates)
│   ├── i18n/               # Translations (en, es, fr, de, pt, ar, ja, ko, zh)
│   ├── integrations/       # 90+ connector definitions
│   ├── notifications/      # Multi-channel notification service
│   ├── theming/            # White-label token system
│   └── supabase/           # Client setup (browser, server, service)
├── hooks/                  # 70 React hooks
├── stores/                 # Zustand stores (UI, auth, consent)
├── config/                 # IA registry, navigation
└── types/                  # Database types, global types
supabase/
├── config.toml
└── migrations/             # 120+ database migrations (490+ tables)
e2e/                        # Playwright E2E tests (216+ specs)
scripts/                    # Audit scripts (UI compliance, component refs, wire audit)
docs/                       # Architecture docs, API spec, deployment guide
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run verify:ci` | Full CI gate (lint + audits + typecheck + tests + build) |
| `npm run audit:ui:strict` | UI compliance audit (zero-tolerance) |
| `npm run audit:components:strict` | Component reference audit |
| `npm run audit:wire` | Full DB→Schema→API→UI wire audit |
| `npm run gen:types` | Regenerate Supabase types |

## Database

490+ tables across all domains. Migrations managed via Supabase CLI:

```bash
npx supabase db push          # Apply migrations
npx supabase gen types typescript --local > src/types/database.ts
```

## License

Proprietary — All rights reserved.
