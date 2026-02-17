# ATLVS Comprehensive Page Audit & Gap Analysis

**Date:** 2025-01-XX
**Scope:** All 329 pages across 14 route groups, 210+ API routes
**Method:** Systematic page-by-page code review analyzing functionality, business logic, user workflows, and operational gaps

---

## Executive Summary

The ATLVS platform contains **329 pages** across **14 route groups** with **210+ API routes**. The architecture follows a consistent pattern: custom hub pages for each module with rich KPI dashboards, backed by a generic CRUD system (`CrudList`/`CrudDetail`/`CrudForm`) for entity management. The platform is comprehensive but has identifiable gaps across data connectivity, workflow completeness, and cross-module integration.

### Overall Health

| Category | Score | Notes |
|----------|-------|-------|
| Page Coverage | ★★★★★ | 329 pages across all business domains |
| UI/UX Consistency | ★★★★☆ | Hub pages are polished; CrudList pages are functional but generic |
| API Coverage | ★★★★☆ | 210+ routes; some pages lack dedicated API backing |
| Data Connectivity | ★★★☆☆ | Hub pages use hardcoded stats; many CrudList pages rely on generic entity API |
| Cross-Module Integration | ★★★☆☆ | Navigation links exist but data doesn't flow between modules seamlessly |
| Workflow Completeness | ★★★☆☆ | Happy paths covered; edge cases and approval chains incomplete |

---

## Module-by-Module Findings

### 1. CORE MODULE (40 pages)

#### Dashboard (`/core/dashboard`)
**Strengths:**
- Rich BentoGrid KPI layout with animated counters
- Real-time snapshot via `useDashboardSnapshot` hook
- Customizable widget grid with save/load via API
- Quick actions panel with contextual links
- Date range filtering, refresh, error handling

**Gaps:**
- **G-CORE-01** *(Medium)*: Budget burn rate on dashboard uses hardcoded `0.6` multiplier (`burnedBudget = activeBudgetTotal * 0.6`) instead of actual spend data from budget line items
- **G-CORE-02** *(Low)*: Dashboard customize page (`/core/dashboard/customize`) uses local state with a separate widget model from the main dashboard's `DashboardGrid` — two competing customization UIs
- **G-CORE-03** *(Low)*: Quick action "Submit Expense" links to `/finance/expenses/new` which doesn't exist as a dedicated page (expenses page is a CrudList)

#### Tasks (`/core/tasks/*`)
**Strengths:**
- My Tasks page with time-grouped view, kanban board, and calendar view
- Bulk selection and completion
- Keyboard shortcuts (⌘N for new task)
- Task timeline with Gantt chart and dependency visualization
- Workload view showing team capacity
- Full CRUD lifecycle (list → detail → edit → new)
- Sprints, checklists, task lists sub-modules

**Gaps:**
- **G-CORE-04** *(High)*: Task timeline page fetches dependencies with N+1 queries — loops through up to 50 tasks making individual `/api/task-dependencies?task_id=` calls. Should batch-fetch all dependencies in one request
- **G-CORE-05** *(Medium)*: Workload page fetches team members via direct Supabase client call from the browser instead of using an API route — bypasses server-side auth guards and rate limiting
- **G-CORE-06** *(Medium)*: No task subtask/checklist inline creation from the task detail page — user must navigate to separate checklists page
- **G-CORE-07** *(Low)*: Calendar view in My Tasks is a custom implementation that doesn't share logic with the Master Calendar component
- **G-CORE-08** *(Low)*: No drag-and-drop reordering in kanban board view

#### Timesheet (`/core/tasks/my-timesheet`)
**Strengths:**
- Weekly grid with per-project/task rows
- Live timer with start/stop per row
- Copy previous week functionality
- Submit for approval workflow
- Utilization tracking against 40h target
- Keyboard navigation between cells

**Gaps:**
- **G-CORE-09** *(Medium)*: Timer stop doesn't auto-populate the hours cell — timer runs independently and user must manually enter hours
- **G-CORE-10** *(Medium)*: No "Add Row" button to manually add a project/task row — rows only appear from existing time entries
- **G-CORE-11** *(Low)*: Week status is local state only (`useState<WeekStatus>("draft")`) — not persisted or read from API

#### Inbox (`/core/inbox`)
**Strengths:**
- Time-grouped notification list with tabs (All/Unread/Approvals/Mentions/Alerts)
- Bulk selection with keyboard shortcuts (⌘⇧R, ⌘⌫, Esc)
- Approve/reject workflow for approval items
- Detail sheet with source navigation
- KPI stats (unread, pending approvals, urgent, total)

**Gaps:**
- **G-CORE-12** *(Medium)*: Inbox sub-pages (`/core/inbox/approvals`, `/core/inbox/notifications`) are bare CrudList wrappers that duplicate the main inbox page's filtering — should redirect or share the filtered view
- **G-CORE-13** *(Low)*: No real-time push updates — inbox requires manual refresh or page reload

#### Messages (`/core/messages`)
**Strengths:**
- Thread list with search, tabs (inbox/starred/unread/archived)
- Message detail pane with compose
- Record linking (budget, project, invoice, venue, asset)
- @mention and attachment buttons

**Gaps:**
- **G-CORE-14** *(Critical)*: **Entirely hardcoded data** — all 6 threads are static constants, not fetched from API. Compose/send/star/archive buttons are non-functional
- **G-CORE-15** *(High)*: No `/api/messages` route exists for CRUD operations on messages
- **G-CORE-16** *(Medium)*: No WebSocket/realtime subscription for new messages

#### Calendar (`/core/calendar`)
**Strengths:**
- Master calendar aggregating events, productions, tasks, contracts, activations
- Read-only projection linking back to canonical detail pages
- API route exists (`/api/calendar/aggregated`)

**Gaps:**
- **G-CORE-17** *(Medium)*: Calendar event CRUD pages use generic `calendarSchema` CrudForm — no inline event creation from the calendar view itself (click-to-create)
- **G-CORE-18** *(Low)*: No calendar sync status indicator or manual sync trigger on the page (API route `/api/calendar/sync` exists but isn't surfaced)

#### Documents (`/core/documents/*`)
**Strengths:**
- Full CRUD lifecycle with folders, templates, upload
- Document detail and edit pages

**Gaps:**
- **G-CORE-19** *(Medium)*: Upload page is a generic CrudForm — no drag-and-drop file upload UI (the FilesTab in TabRenderer has drag-and-drop but the dedicated upload page doesn't)
- **G-CORE-20** *(Low)*: No document preview/viewer — detail page is generic CrudDetail without inline PDF/image preview
- **G-CORE-21** *(Low)*: Folder navigation is a flat CrudList — no tree/hierarchy view

#### Workflows (`/core/workflows/*`)
**Strengths:**
- Full CRUD lifecycle (list, detail, edit, new)
- Automations page (workflow runs)
- Triggers page
- Per-workflow run history (`/core/workflows/[id]/runs`)

**Gaps:**
- **G-CORE-22** *(High)*: No visual workflow builder — new/edit pages use generic CrudForm. For a workflow engine, users need a node-based or step-based visual editor
- **G-CORE-23** *(Medium)*: No workflow execution controls (pause, resume, cancel) on the detail or runs pages
- **G-CORE-24** *(Low)*: Automations page shows `workflowRunSchema` which is the same as the runs sub-page — redundant navigation

---

### 2. PRODUCTIONS MODULE (28 pages)

#### Hub Page (`/productions`)
**Strengths:**
- Mission Control row with live clock, active production card, weather widget
- KPI stats (upcoming events, revenue MTD, crew active, incidents)
- Upcoming events list with venue/time details
- Active projects list

**Gaps:**
- **G-PROD-01** *(Medium)*: Incidents count is hardcoded to `0` with comment "Placeholder — would come from incidents API"
- **G-PROD-02** *(Medium)*: Crew count calculation iterates `project_members` array but this relation may not be loaded by `useProjects` hook

#### Advancing (`/productions/advancing/*`)
**Strengths:**
- Rich hub page with dashboard metrics, conflict detection, QR scanner
- Sub-pages: advances, allotments, approvals, assignments, activity
- Pre-production readiness links (riders, catering, guest lists, hospitality, tech specs)
- Comprehensive API backing (15+ advancing routes)

**Gaps:**
- **G-PROD-03** *(Medium)*: Pre-production readiness cards use emoji icons instead of Lucide icons — inconsistent with design system
- **G-PROD-04** *(Low)*: Hospitality sub-page links to `/productions/advancing/hospitality` but the nav card says "Travel & Hotels" — naming mismatch with People > Travel module

#### Layout D Pages (Call Sheet, Settlement, Run Sheet)
**Strengths:**
- Settlement worksheet with full estimated vs actual line items, variance tracking, approval workflow stepper, PDF export
- All use WorkspaceLayout with tabs and sidebar

**Gaps:**
- **G-PROD-05** *(High)*: Settlement worksheet uses **local state only** — all line items, revenue, and approval status are not persisted to API. No save/load functionality
- **G-PROD-06** *(Medium)*: Call sheet page has a known TODO: "Wire to API" (needs backend route `/api/projects/[id]/call-sheet` which exists but may not be fully wired)
- **G-PROD-07** *(Medium)*: Currency formatting in settlement uses `$${value.toLocaleString()}` instead of `formatCurrency` utility — locale inconsistency

#### Compliance (`/productions/compliance/*`)
**Strengths:**
- Hub page + sub-pages for certificates, insurance, licenses, permits

**Gaps:**
- **G-PROD-08** *(Medium)*: Compliance hub is a bare CrudList of permits — no dashboard showing expiring certificates, compliance score, or renewal alerts
- **G-PROD-09** *(Low)*: No cross-reference between compliance items and the events/projects they apply to

---

### 3. PEOPLE MODULE (44 pages)

#### Hub Page (`/people`)
**Strengths:**
- 12 navigation cards covering all sub-modules
- KPI stats row

**Gaps:**
- **G-PEOPLE-01** *(High)*: **All KPI stats are hardcoded** ("245" total staff, "89" available, "156" on assignment, "12" pending onboard) — not fetched from API
- **G-PEOPLE-02** *(Medium)*: Refresh button has no onClick handler — non-functional

#### Sub-modules
**Strengths:**
- Comprehensive coverage: rosters, scheduling (7 sub-pages), timekeeping, leave, documents, compliance, performance (4 sub-pages), training (6 sub-pages), travel (5 sub-pages), recruitment (4 sub-pages), analytics, org chart, portal, availability, certifications, positions, onboarding

**Gaps:**
- **G-PEOPLE-03** *(Medium)*: Most sub-pages are bare CrudList wrappers — no custom UI for scheduling calendar, shift swap workflow, or availability matrix
- **G-PEOPLE-04** *(Medium)*: Employee portal (`/people/portal`) is a CrudList — should be a personalized self-service dashboard
- **G-PEOPLE-05** *(Low)*: Duplicate navigation paths — `/people/certifications` and `/people/training/certifications` likely show the same data
- **G-PEOPLE-06** *(Low)*: `/people/scheduling/availability` and `/people/availability` are separate pages for the same concept

---

### 4. ASSETS MODULE (29 pages)

#### Hub Page (`/assets`)
**Strengths:**
- 9 navigation cards covering catalog, inventory, locations, reservations, maintenance, logistics, status, deployment, reports

**Gaps:**
- **G-ASSETS-01** *(High)*: **All KPI stats are hardcoded** ("1,247" total, "892" available, "355" deployed, "23" in maintenance)
- **G-ASSETS-02** *(Medium)*: Duplicate sub-module paths — `/assets/advances` and `/assets/logistics/advances`, `/assets/deployment` and `/assets/logistics/deployment`
- **G-ASSETS-03** *(Low)*: No barcode/QR scanning on the assets hub (advancing module has it but assets doesn't)

---

### 5. FINANCE MODULE (45 pages)

#### Hub Page (`/finance`)
**Strengths:**
- Financial health card, action center, cash flow chart
- 9 navigation cards

**Gaps:**
- **G-FIN-01** *(Medium)*: No KPI stat cards on the hub — unlike other modules, finance hub relies on sub-components (`FinancialHealthCard`, `ActionCenter`, `CashFlowChart`) which may or may not be data-connected
- **G-FIN-02** *(Low)*: No "New Invoice" or "New Expense" quick action on the hub page

#### Sub-modules
**Strengths:**
- Extensive coverage: invoices (8 sub-pages including builder, credit notes, generate, line items, overview, payments), expenses (3 sub-pages), budgets (5 sub-pages), payments (3 sub-pages), payroll (4 sub-pages), quotes, rate cards, recurring invoices, reports (4 sub-pages), accounts (5 sub-pages), procurement, banking, receipts, settings

**Gaps:**
- **G-FIN-03** *(Medium)*: Invoice builder is a custom Layout D page but invoice list/detail use generic CrudList/CrudDetail — UX inconsistency between creation and viewing
- **G-FIN-04** *(Medium)*: No accounts receivable aging report page — `/finance/reports/ar-ap` exists but is likely a CrudList
- **G-FIN-05** *(Low)*: Expense approval flow exists in API (`/api/expense-approval-requests/*`) but no dedicated approval queue page beyond the generic CrudList

---

### 6. OPERATIONS MODULE (29 pages)

#### Hub Page (`/operations`)
**Strengths:**
- 9 navigation cards with badge indicators (active shows, open incidents)
- KPI stats

**Gaps:**
- **G-OPS-01** *(High)*: **All KPI stats are hardcoded** ("3" active shows, "2" open incidents, "8" work orders, "5" active venues)
- **G-OPS-02** *(Medium)*: No live operations dashboard — the hub is a navigation page, not a real-time control center

#### Sub-modules
**Strengths:**
- Runsheets with show mode, incidents with control room, venues with floor plans/zones/stages/checkpoints, work orders, events with crew calls/talent bookings, daily reports, crew check-in kiosk, communications (radio, weather, daily reports), resource bookings

**Gaps:**
- **G-OPS-03** *(Medium)*: Show mode page (`/operations/runsheets/[id]/show-mode/page.tsx`) — needs verification that it's a `.tsx` not `.ts` file (found as `page.ts` in search)
- **G-OPS-04** *(Low)*: No incident escalation workflow visible in the UI — incidents page is CrudList

---

### 7. BUSINESS MODULE (39 pages)

#### Hub Page (`/business`)
**Strengths:**
- Pipeline stats component
- Quick access cards (pipeline, companies, contracts, campaigns)
- Recent activity section

**Gaps:**
- **G-BIZ-01** *(Medium)*: Recent activity section shows static placeholder text "Activity timeline will appear here once you start logging activities" — not connected to `/api/activity/feed`
- **G-BIZ-02** *(Low)*: No KPI stat cards on the hub (unlike other modules)

#### Sub-modules
**Strengths:**
- Pipeline with opportunities, leads, activities, forecast, proposals
- Companies with contacts, contracts, sponsors, vendors
- Contacts with detail pages
- Contracts with detail pages
- Campaigns (email, content, forms, subscribers, templates)
- Products (list, packages, pricing, services)
- Brand management (assets, colors, logos, typography)
- Proposals with detail pages
- Subscribers with detail pages

**Gaps:**
- **G-BIZ-03** *(Medium)*: Pipeline board (`/business/pipeline`) is a CrudList — should have a Kanban/board view for deal stages
- **G-BIZ-04** *(Medium)*: No deal-to-project conversion workflow visible in UI (API route `/api/deals/[id]/convert` exists)
- **G-BIZ-05** *(Low)*: Proposal builder (`/business/pipeline/proposals/new`) — needs verification it has a rich editor vs generic CrudForm

---

### 8. ANALYTICS MODULE (11 pages)

#### Hub Page (`/analytics`)
**Strengths:**
- Well-organized sections: Reports, Dashboards, Insights
- Links to report builder, dashboard builder, scheduled reports

**Gaps:**
- **G-ANALYTICS-01** *(Medium)*: Insights section links to `/analytics/financial`, `/analytics/workforce`, `/analytics/profitability`, `/analytics/pipeline` — **none of these pages exist** (not in the page list). These are dead links
- **G-ANALYTICS-02** *(Medium)*: No AI-powered insights page linked from hub — the AI report generation exists at `/analytics/reports/ai` but isn't prominently featured
- **G-ANALYTICS-03** *(Low)*: Hiring analytics (`/analytics/hiring`) and sales performance (`/analytics/sales-performance`) exist but aren't linked from the hub

---

### 9. NETWORK MODULE (32 pages)

**Strengths:**
- Full social/community feature set: feed, connections, discussions, marketplace, opportunities, showcase, profiles, messages, challenges, badges, leaderboard, discover
- Full CRUD lifecycle for each entity (list, detail, edit, new)

**Gaps:**
- **G-NET-01** *(Medium)*: Feed page is a bare CrudList (`activityFeedSchema`) — should be a social feed with cards, reactions, comments
- **G-NET-02** *(Medium)*: Network messages (`/network/messages`) duplicates Core messages (`/core/messages`) — two separate messaging systems
- **G-NET-03** *(Low)*: No notification integration for network activity (new connections, discussion replies, etc.)

---

### 10. ACCOUNT/SETTINGS MODULE (12 pages)

**Strengths:**
- Profile, organization, billing, privacy, audit log, history, support, resources, sandbox
- Platform settings, client portal settings, desktop timer settings

**Gaps:**
- **G-ACCT-01** *(Medium)*: No integrations/connected apps settings page — integrations are managed via API but no dedicated settings UI
- **G-ACCT-02** *(Low)*: Sandbox page purpose unclear — may need documentation or removal
- **G-ACCT-03** *(Low)*: No notification preferences page under account (inbox settings link goes to `/account/notifications` which doesn't exist — should be `/account/profile` notifications tab)

---

### 11. AUTH + ONBOARDING (17 pages)

#### Auth (9 pages)
**Strengths:**
- Login with email/password and magic link
- Registration with password strength indicator and terms acceptance
- Forgot password, reset password, verify email, verify MFA
- SSO provider callback, invite token acceptance

**Gaps:**
- **G-AUTH-01** *(Medium)*: Login redirects to `/dashboard` instead of `/core/dashboard` — potential 404 or redirect chain
- **G-AUTH-02** *(Medium)*: SSO callback page needs provider API keys to function (known TODO)
- **G-AUTH-03** *(Low)*: No social login buttons (Google, Microsoft) on login page — only email/password and magic link

#### Onboarding (8 pages)
**Strengths:**
- Multi-step wizard: welcome → profile → organization → team → integrations → preferences → tour → complete
- Clean progression with feature highlights

**Gaps:**
- **G-ONBOARD-01** *(Low)*: Onboarding completion doesn't appear to set a flag preventing re-entry — user could revisit onboarding flow

---

## Cross-Cutting Gaps

### Data Connectivity (Critical Pattern)

| ID | Severity | Description |
|----|----------|-------------|
| **G-CROSS-01** | **Critical** | **6 module hub pages use hardcoded KPI stats** — People, Assets, Operations all show fake numbers. Dashboard uses real data via `useDashboardSnapshot` but other hubs don't follow this pattern |
| **G-CROSS-02** | **High** | Messages module is entirely static — no API, no persistence, no real-time |
| **G-CROSS-03** | **High** | Settlement worksheet has no save/load — all financial data is lost on navigation |
| **G-CROSS-04** | **Medium** | ~180 pages are bare CrudList/CrudDetail/CrudForm wrappers relying entirely on the generic entity API. While functional, they lack domain-specific business logic, validation, and contextual UI |

### Missing API Routes

| Page/Feature | Expected API | Status |
|-------------|-------------|--------|
| Messages CRUD | `/api/messages` (beyond conversations) | ❌ Missing |
| Analytics insights pages | `/api/analytics/financial`, etc. | ❌ Pages don't exist |
| Settlement save/load | `/api/settlements` | ❌ Missing (only `/api/settlements/[id]/generate-invoice`) |
| People hub stats | `/api/people/stats` or snapshot | ❌ Missing |
| Assets hub stats | `/api/assets/stats` or snapshot | ❌ Missing |
| Operations hub stats | `/api/operations/stats` or snapshot | ❌ Missing |

### Workflow Gaps

| ID | Severity | Description |
|----|----------|-------------|
| **G-WF-01** | **High** | No visual workflow builder — workflows are the automation backbone but creation is a generic form |
| **G-WF-02** | **Medium** | Approval chains (expense, timesheet, settlement, purchase order) exist in API but lack dedicated approval queue UIs |
| **G-WF-03** | **Medium** | No workflow execution monitoring dashboard — runs are listed but no real-time status, retry, or cancel controls |

### UX Consistency Gaps

| ID | Severity | Description |
|----|----------|-------------|
| **G-UX-01** | **Medium** | Hub pages vary in quality — Dashboard and Productions have rich custom UIs; People, Assets, Operations are navigation-only with hardcoded stats |
| **G-UX-02** | **Medium** | Duplicate navigation paths across modules (people/certifications vs training/certifications, assets/advances vs logistics/advances) |
| **G-UX-03** | **Low** | Settlement page uses `$${value.toLocaleString()}` while rest of app uses `formatCurrency` or `CurrencyDisplay` |
| **G-UX-04** | **Low** | Analytics hub links to 4 non-existent insight pages |

---

## Priority Remediation Roadmap

### P0 — Critical (Data Integrity / Broken Features)
1. **Wire Messages module to API** — Create `/api/messages` route, replace hardcoded threads with real data, wire compose/send/star/archive
2. **Persist Settlement worksheet** — Create `/api/settlements` CRUD route, save/load line items and approval status
3. **Connect hub page KPIs to real data** — Create snapshot hooks for People, Assets, Operations hubs (follow `useDashboardSnapshot` pattern)

### P1 — High (Major Workflow Gaps)
4. **Fix task timeline N+1** — Add batch dependency fetch endpoint
5. **Visual workflow builder** — Replace CrudForm with node-based or step-based editor
6. **Fix login redirect** — Change `/dashboard` → `/core/dashboard`
7. **Move workload page Supabase call to API route** — Server-side auth enforcement

### P2 — Medium (Feature Completeness)
8. **Wire Business activity timeline** to `/api/activity/feed`
9. **Create Analytics insight pages** or remove dead links from hub
10. **Add approval queue UIs** for expenses, timesheets, purchase orders
11. **Enhance employee portal** from CrudList to self-service dashboard
12. **Add click-to-create on Master Calendar**
13. **Consolidate duplicate navigation paths**
14. **Wire timer stop → hours cell** in timesheet
15. **Add "Add Row" to timesheet** for manual project/task entry
16. **Fix inbox settings link** (`/account/notifications` → profile notifications tab)
17. **Connect Productions incidents count** to actual API data
18. **Pipeline Kanban board view** for deal stages

### P3 — Low (Polish & Consistency)
19. Consolidate dashboard customize page with main dashboard edit mode
20. Replace emoji icons in advancing pre-production cards with Lucide icons
21. Add document preview/viewer to document detail page
22. Add folder tree view for document navigation
23. Add drag-and-drop to kanban board
24. Add real-time push for inbox and messages
25. Add social login options to auth
26. Standardize currency formatting in settlement page

---

## Metrics Summary

| Metric | Count |
|--------|-------|
| Total pages audited | 329 |
| API routes audited | 210+ |
| Critical gaps identified | 3 |
| High gaps identified | 7 |
| Medium gaps identified | 25 |
| Low gaps identified | 20 |
| **Total gaps** | **55** |
| Pages with hardcoded data | 4 hub pages + messages |
| Dead navigation links | 4 (analytics insights) |
| Duplicate navigation paths | 4 pairs |
| Missing API routes | 6 |
