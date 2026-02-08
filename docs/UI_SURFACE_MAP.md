# ATLVS UI Surface Map

> Generated: 2026-02-07 | Pass 3 Complete

## Overview

| Module | IA Pages | Filesystem Pages | Subpages | Coverage |
|--------|----------|-----------------|----------|----------|
| Core | 6 | 37 | 31 | ✅ FULL |
| Productions | 7 | 18 | 11 | ✅ FULL |
| Advancing | 5 | 7 | 2 | ✅ FULL |
| Operations | 7 | 23 | 16 | ✅ FULL |
| People | 11 | 42 | 31 | ✅ FULL |
| Assets | 8 | 28 | 20 | ✅ FULL |
| Business | 8 | 32 | 24 | ✅ FULL |
| Finance | 8 | 37 | 29 | ✅ FULL |
| Network | 6 | 32 | 26 | ✅ FULL |
| Settings | 1 | 7 | 6 | ✅ FULL |
| **TOTAL** | **67** | **263** | **196** | **100%** |

All 67 IA-defined pages have corresponding filesystem routes. The 263 total pages include detail views, edit pages, subpages, and CRUD routes.

---

## Module: CORE (6 IA pages → 37 routes)

| IA Page | Path | Route Exists | Detail/Edit | Subpages |
|---------|------|:---:|:---:|----------|
| Dashboard | `/core/dashboard` | ✅ | — | customize |
| Calendar | `/core/calendar` | ✅ | ✅ [id], edit, new | — |
| Tasks | `/core/tasks` | ✅ | ✅ [id], edit, new | lists, sprints, timeline, workload, checklists |
| Inbox | `/core/inbox` | ✅ | — | approvals, notifications |
| Documents | `/core/documents` | ✅ | ✅ [id], edit | folders, templates, upload |
| Workflows | `/core/workflows` | ✅ | ✅ [id], edit, new | automations, triggers, runs |

---

## Module: PRODUCTIONS (7 IA pages → 18 routes)

| IA Page | Path | Route Exists | Subpages |
|---------|------|:---:|----------|
| Productions | `/productions` | ✅ | stages |
| Events | `/productions/events` | ✅ | — |
| Activations | `/productions/activations` | ✅ | — |
| Build & Strike | `/productions/build-strike` | ✅ | — |
| Compliance | `/productions/compliance` | ✅ | permits, licenses, certificates, insurance |
| Inspections | `/productions/inspections` | ✅ | — |
| Punch Lists | `/productions/punch-lists` | ✅ | — |

**Note**: `productions/advancing/` exists with 5 subpages (catering, guest-lists, hospitality, riders, tech-specs) — these are legacy routes from before the Advancing module was separated. They should be redirected to `/advancing/`.

---

## Module: ADVANCING (5 IA pages → 7 routes)

| IA Page | Path | Route Exists | Subpages |
|---------|------|:---:|----------|
| Dashboard | `/advancing` | ✅ | — |
| Advances | `/advancing/advances` | ✅ | — |
| Items | `/advancing/items` | ✅ | — |
| Fulfillment | `/advancing/fulfillment` | ✅ | — |
| Vendors | `/advancing/vendors` | ✅ | — |

**Extra routes**: `advancing/catalog/` (with [id] detail) and `advancing/crew/` exist as additional advancing-specific pages.

---

## Module: OPERATIONS (7 IA pages → 23 routes)

| IA Page | Path | Route Exists | Subpages |
|---------|------|:---:|----------|
| Shows | `/operations/shows` | ✅ | — |
| Runsheets | `/operations/runsheets` | ✅ | [id]/show-mode |
| Venues | `/operations/venues` | ✅ | floor-plans, zones, checkpoints, stages |
| Incidents | `/operations/incidents` | ✅ | control-room, punch-lists |
| Work Orders | `/operations/work-orders` | ✅ | — |
| Daily Reports | `/operations/daily-reports` | ✅ | — |
| Comms | `/operations/comms` | ✅ | radio, weather, daily-reports |

**Extra routes**: `operations/events/` (crew-calls, runsheets, talent-bookings), `operations/crew-checkins/kiosk`.

---

## Module: PEOPLE (11 IA pages → 42 routes)

| IA Page | Path | Route Exists | Subpages |
|---------|------|:---:|----------|
| Rosters | `/people/rosters` | ✅ | departments, positions, teams |
| Availability | `/people/availability` | ✅ | — |
| Travel | `/people/travel` | ✅ | accommodations, bookings, flights |
| Recruitment | `/people/recruitment` | ✅ | applications, candidates, onboarding |
| Onboarding | `/people/onboarding` | ✅ | — |
| Training | `/people/training` | ✅ | courses, materials, certifications, compliance, enrollments |
| Scheduling | `/people/scheduling` | ✅ | shifts, availability, clock, crew-calls, open-shifts, shift-swaps, timekeeping |
| Timekeeping | `/people/timekeeping` | ✅ | — |
| Performance | `/people/performance` | ✅ | reviews, goals, feedback |
| Certifications | `/people/certifications` | ✅ | — |
| Positions | `/people/positions` | ✅ | — |

**Extra routes**: `people/analytics`, `people/compliance`, `people/documents`, `people/leave`, `people/org`, `people/portal`.

---

## Module: ASSETS (8 IA pages → 28 routes)

| IA Page | Path | Route Exists | Subpages |
|---------|------|:---:|----------|
| Catalog | `/assets/catalog` | ✅ | categories, consumables, inventory |
| Inventory | `/assets/inventory` | ✅ | — |
| Locations | `/assets/locations` | ✅ | warehouses, staging, bins |
| Reservations | `/assets/reservations` | ✅ | check, transfers |
| Deployment | `/assets/deployment` | ✅ | — |
| Logistics | `/assets/logistics` | ✅ | shipments, vehicles, advances, deployment |
| Asset Status | `/assets/status` | ✅ | check, service |
| Maintenance | `/assets/maintenance` | ✅ | scheduled, repairs, history |

---

## Module: BUSINESS (8 IA pages → 32 routes)

| IA Page | Path | Route Exists | Subpages |
|---------|------|:---:|----------|
| Pipeline | `/business/pipeline` | ✅ | leads, opportunities, activities, proposals |
| Companies | `/business/companies` | ✅ | contacts, contracts, sponsors, vendors, [id] detail |
| Proposals | `/business/proposals` | ✅ | — |
| Contracts | `/business/contracts` | ✅ | — |
| Products | `/business/products` | ✅ | list, services, packages, pricing |
| Campaigns | `/business/campaigns` | ✅ | email, content, forms, subscribers, templates |
| Subscribers | `/business/subscribers` | ✅ | — |
| Brand Kit | `/business/brand` | ✅ | logos, colors, typography, assets |

**Extra routes**: `business/contacts/`, `business/page.tsx` (module index).

---

## Module: FINANCE (8 IA pages → 37 routes)

| IA Page | Path | Route Exists | Subpages |
|---------|------|:---:|----------|
| Budgets | `/finance/budgets` | ✅ | line-items, procurement, purchase-orders |
| Procurement | `/finance/procurement` | ✅ | — |
| Expenses | `/finance/expenses` | ✅ | receipts, reimbursements |
| Invoices | `/finance/invoices` | ✅ | line-items, payments, credit-notes |
| Payments | `/finance/payments` | ✅ | incoming, outgoing |
| Payroll | `/finance/payroll` | ✅ | stubs, rates, deductions |
| Accounts | `/finance/accounts` | ✅ | gl, bank, reconciliation, transactions |
| Reports | `/finance/reports` | ✅ | pnl, cash-flow, ar-ap |

**Extra routes**: `finance/banking`, `finance/expense-approvals`, `finance/quotes` (with [id] detail), `finance/receipts`, `finance/recurring-invoices` (with [id] detail), `finance/settings/reminders`.

---

## Module: NETWORK (6 IA pages → 32 routes)

| IA Page | Path | Route Exists | Detail/Edit | Subpages |
|---------|------|:---:|:---:|----------|
| Connections | `/network/connections` | ✅ | ✅ [id], edit, new | — |
| Discussions | `/network/discussions` | ✅ | ✅ [id], edit, new | — |
| Marketplace | `/network/marketplace` | ✅ | ✅ [id], edit, new | — |
| Opportunities | `/network/opportunities` | ✅ | ✅ [id], edit, new | — |
| Showcase | `/network/showcase` | ✅ | ✅ [id], edit, new | — |
| Challenges | `/network/challenges` | ✅ | ✅ [id], edit, new | — |

**Extra routes**: `network/feed`, `network/messages` (with [id]), `network/profiles` (with [id]), `network/discover`, `network/leaderboard`, `network/badges`.

---

## Findings

### ✅ No Missing Pages
All 67 IA-defined pages have corresponding filesystem routes. Every module has full coverage.

### ⚠️ Observations

1. **Legacy `productions/advancing/` routes** — 5 subpages exist under the old location before the Advancing module was separated. These should redirect to `/advancing/` to prevent dead-end navigation.

2. **Extra routes beyond IA** — 196 subpages and detail routes exist beyond the 67 IA-defined pages. These are legitimate CRUD routes (create, detail, edit) and data subset views — not violations.

3. **Network module** has full CRUD routes (list, [id], edit, new) for all 6 entities — the most complete module in terms of route structure.

4. **Finance module** has the most subpages (29) reflecting the depth of financial operations.

---

## Design System Compliance (Post-Remediation)

| Check | Status |
|-------|--------|
| All status colors use `--status-*` tokens | ✅ |
| All priority colors use `--priority-*` tokens | ✅ |
| No hardcoded hex values in Gantt views | ✅ |
| No hardcoded Tailwind color classes in WorkflowBuilder | ✅ |
| Dynamic data colors use CSS custom property pattern | ✅ |
| Canonical API response envelope available | ✅ |
| Generic CRUD routes use canonical envelope | ✅ |
| Soft deletes on all Phase 2-6 tables | ✅ |
| Audit history on financial mutation tables | ✅ |
| Monetary precision NUMERIC(19,4) | ✅ |
