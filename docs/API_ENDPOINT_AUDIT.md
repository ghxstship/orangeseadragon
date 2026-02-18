# API Endpoint Audit Report

> Generated: 2026-02-17
> Last Updated: 2026-02-17 (Post-Remediation)
> Scope: All `fetch()` calls from UI → API route mapping, schema action handler endpoint coverage, orphan route analysis

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Total API route files | 207 | ~250 |
| Total unique UI `fetch()` paths | 118 | 118 |
| UI fetch calls with **no matching API route** | 13 | **0** ✅ |
| Schema action handler endpoints with **no route** | 37 | **0** ✅ |
| Schema action handler dispatch gap | ALL handlers | **0** ✅ |
| Schema endpoints missing `{id}` interpolation | ~30 | **0** ✅ |
| Orphan routes wired to schema actions | 0 | **20+** ✅ |
| API routes with stubs/TODOs | 0 | 0 |
| TypeScript errors | 15 | **0** ✅ |
| Build status | ✅ | ✅ |

---

## Category 1: UI `fetch()` Calls With No Matching API Route (P0 — Broken at Runtime)

These are direct `fetch()` calls in UI components/hooks that will **404 at runtime** because no route file exists.

### 1.1 Missing Dedicated Routes

| # | UI Fetch Path | Caller | Fix Required |
|---|--------------|--------|--------------|
| 1 | `/api/certification-alerts/{id}/acknowledge` | `CertificationDashboard.tsx:120` | Create `src/app/api/certification-alerts/[id]/acknowledge/route.ts` |
| 2 | `/api/contacts/{id}/score` | `LeadScoreCard.tsx:202` | Create `src/app/api/contacts/[id]/score/route.ts` |
| 3 | `/api/duplicates` | `DuplicateDetectionPanel.tsx:219` | Create `src/app/api/duplicates/route.ts` |
| 4 | `/api/duplicates/{id}/merge` | `DuplicateDetectionPanel.tsx:230` | Create `src/app/api/duplicates/[id]/merge/route.ts` |
| 5 | `/api/duplicates/{id}/dismiss` | `DuplicateDetectionPanel.tsx:246` | Create `src/app/api/duplicates/[id]/dismiss/route.ts` |
| 6 | `/api/events/{id}/alerts` | `EmergencyAlert.tsx:269,287` | Create `src/app/api/events/[id]/alerts/route.ts` |
| 7 | `/api/invitations/{id}` | `invite/[token]/page.tsx:34` | Create `src/app/api/invitations/[id]/route.ts` |
| 8 | `/api/invitations/{id}/accept` | `invite/[token]/page.tsx:54` | Create `src/app/api/invitations/[id]/accept/route.ts` |
| 9 | `/api/notifications/email` | `lib/notifications/service.ts:390` | Create `src/app/api/notifications/email/route.ts` |
| 10 | `/api/push/subscribe` | `lib/notifications/notificationService.ts:344` | Create `src/app/api/push/subscribe/route.ts` |
| 11 | `/api/workflows/test` | `workflows/builder/page.tsx:105` | Create `src/app/api/workflows/test/route.ts` |

### 1.2 Path Mismatches (UI calls wrong path)

| # | UI Fetch Path | Actual Route | Caller | Fix Required |
|---|--------------|-------------|--------|--------------|
| 12 | `/api/forecast?...` | `/api/analytics/forecast` | `ForecastDashboard.tsx:266` | Fix UI to call `/api/analytics/forecast` |
| 13 | `/api/proposals/export-pdf` | `/api/proposals/[id]/export` | `proposal-builder.tsx:180` | Fix UI to call `/api/proposals/{id}/export` |

### 1.3 Dynamic Entity Enrichment (No Route Exists)

| # | UI Fetch Path | Caller | Fix Required |
|---|--------------|--------|--------------|
| 14 | `/api/{entity}s/{id}/enrichment` | `EnrichmentPanel.tsx:96` | Create `src/app/api/enrichment/route.ts` (single route, accept entity_type + entity_id as query params) |
| 15 | `/api/{entity}s/{id}/enrich` | `EnrichmentPanel.tsx:110` | Create `src/app/api/enrichment/enrich/route.ts` or combine with above |

---

## Category 2: Schema Action Handler Dispatch Gap (P1 — Actions Declared But Never Executed)

**Root cause**: `CrudList.handleAction()` only handles `'create'` — it does **not** look up the schema's `ActionDefinition.handler` to dispatch `type: 'api'` calls. All schema action handlers with `{ type: 'api', endpoint: '...' }` are **dead declarations**.

### Affected Schemas (partial list — all schemas with `actions.row` or `actions.bulk` using `type: 'api'`):

- **invoice.ts** — Send, Mark Paid, Download PDF, Bulk Send
- **purchaseOrder.ts** — Submit, Approve, Send to Vendor
- **budget.ts** — Approve, Bulk Approve (if declared)
- **leaveRequest** — Approve, Bulk Approve, Cancel
- **clockEntry** — Approve, Bulk Approve, Flag
- **timeEntry** — Approve, Bulk Approve, Export
- **timePunch** — Approve, Bulk Approve, Reject
- **receiptScan** — Retry, Bulk Create Expenses
- **campaign** — Send, Duplicate
- **connection** — Accept, Decline, Bulk Accept
- **registration** — Bulk Check-In
- **shiftSwapRequest** — Approve, Reject
- **supportTicket** — Close, Resolve
- **serviceTicket** — Resolve
- **issuedCredential** — Print, Bulk Print
- **trainingAssignment** — Complete, Remind
- **trainingProgram** — Bulk Activate, Bulk Deactivate
- **onboardingTemplate** — Duplicate
- **openShift** — Claim
- **journalEntry** — Post
- **subscriber** — Export
- **currency** — Set Base
- **exchangeRate** — Fetch
- **leadScore** — Duplicate
- **dealConvert** — Convert

### Fix Required

Implement action dispatch in `CrudList.handleAction()` and `CrudDetail` (via `onAction`) to:
1. Look up the `ActionDefinition` from `schema.actions.row` / `schema.actions.bulk` by `actionId`
2. If `handler.type === 'api'`, call `fetch(handler.endpoint, { method: handler.method, body: { id, ids } })`
3. Show confirmation dialog if `action.confirm` is defined
4. Show success/error toast using `action.successMessage` / `action.errorMessage`

### Missing Route Files for Schema Action Handlers

Even after dispatch is implemented, these routes do not exist:

| Endpoint | Schema |
|----------|--------|
| `/api/bank-connections` | bankConnection |
| `/api/bank-connections/sync` | bankConnection |
| `/api/budgets/approve` | budget |
| `/api/budgets/bulk-approve` | budget |
| `/api/campaigns/duplicate` | campaign |
| `/api/campaigns/send` | campaign |
| `/api/clock-entries/approve` | clockEntry |
| `/api/clock-entries/bulk-approve` | clockEntry |
| `/api/clock-entries/flag` | clockEntry |
| `/api/connections/bulk-accept` | connection |
| `/api/currencies/set-base` | currency |
| `/api/deals/convert` | deal |
| `/api/exchange-rates/fetch` | exchangeRate |
| `/api/invoices/bulk-send` | invoice |
| `/api/invoices/mark-paid` | invoice |
| `/api/invoices/pdf` | invoice |
| `/api/issued-credentials/bulk-print` | issuedCredential |
| `/api/issued-credentials/print` | issuedCredential |
| `/api/journal-entries/post` | journalEntry |
| `/api/lead-scores/duplicate` | leadScore |
| `/api/leave-requests/approve` | leaveRequest (exists as `[id]/approve`) |
| `/api/leave-requests/bulk-approve` | leaveRequest |
| `/api/leave-requests/cancel` | leaveRequest |
| `/api/onboarding-templates/duplicate` | onboardingTemplate |
| `/api/open-shifts/claim` | openShift |
| `/api/purchase-orders/send` | purchaseOrder |
| `/api/quotes/convert` | quote |
| `/api/receipt-scans/bulk-create-expenses` | receiptScan |
| `/api/receipt-scans/retry` | receiptScan |
| `/api/registrations/bulk-check-in` | registration |
| `/api/shift-swap-requests/approve` | shiftSwapRequest |
| `/api/shift-swap-requests/reject` | shiftSwapRequest |
| `/api/subscribers/export` | subscriber |
| `/api/support-tickets/close` | supportTicket |
| `/api/time-entries/export` | timeEntry |
| `/api/time-punches/approve` | timePunch |
| `/api/time-punches/bulk-approve` | timePunch |
| `/api/time-punches/reject` | timePunch |
| `/api/training_assignments/complete` | trainingAssignment |
| `/api/training_assignments/remind` | trainingAssignment |
| `/api/training_programs/bulk-activate` | trainingProgram |
| `/api/training_programs/bulk-deactivate` | trainingProgram |

**Note**: Some of these have `[id]` variant routes (e.g., `/api/invoices/[id]/send` exists but `/api/invoices/send` does not). The schema endpoint paths need to be corrected to include `{id}` interpolation, or the dispatch logic needs to append the record ID.

---

## Category 3: API Routes With No UI Consumer (Informational)

These routes exist but have no direct `fetch()` call from UI code. They may be:
- Backend-only (cron jobs, webhooks, internal services)
- Called indirectly via the generic `[entity]` route
- Future-use routes awaiting UI wiring

### Backend/Infrastructure (Expected — No UI Consumer Needed)

| Route | Purpose |
|-------|---------|
| `/api/health` | Health check endpoint |
| `/api/webhooks/stripe` | Stripe webhook receiver |
| `/api/webhooks/test` | Webhook testing |
| `/api/security/csp-report` | CSP violation reporting |
| `/api/auth/session-invalidation` | Session management |
| `/api/budget-alerts/check` | Cron-triggered budget alert checker |
| `/api/invoices/check-overdue` | Cron-triggered overdue invoice checker |
| `/api/contracts/check-expiry` | Cron-triggered contract expiry checker |
| `/api/automations/retry-queue` | Automation retry processor |
| `/api/kpis/track` | KPI tracking endpoint |
| `/api/status/tracker` | Status tracking |
| `/api/p/submit-lead` | Public profile lead capture |
| `/api/p/track-click` | Public profile click tracking |
| `/api/p/track-view` | Public profile view tracking |

### Potentially Orphaned (May Need UI Wiring)

| Route | Notes |
|-------|-------|
| `/api/advancing/categories` | No UI consumer found |
| `/api/advancing/crew/availability` | No UI consumer found |
| `/api/advancing/fulfillment` | No UI consumer found |
| `/api/advancing/items` | No UI consumer found |
| `/api/advancing/vendors` | No UI consumer found |
| `/api/advancing/vendors/ratings` | No UI consumer found |
| `/api/advancing/workflows` | No UI consumer found |
| `/api/advancing/workflows/execute` | No UI consumer found |
| `/api/advancing/workflows/templates` | No UI consumer found |
| `/api/assignments` | No UI consumer found |
| `/api/audit` | Duplicate of `/api/v1/audit` |
| `/api/bookings/splits` | No UI consumer found |
| `/api/check-in/scan` | No UI consumer found |
| `/api/client-portal/invite` | No UI consumer found |
| `/api/crew-assignments/[id]/checkout` | No UI consumer found |
| `/api/crew/[id]/travel-estimate` | No UI consumer found |
| `/api/crew/offers` | No UI consumer found |
| `/api/crew/offers/[id]/respond` | No UI consumer found |
| `/api/crew/per-diem` | No UI consumer found |
| `/api/dashboards/[id]/widgets` | No UI consumer found |
| `/api/deals/analytics/win-loss` | No UI consumer found |
| `/api/discussion-replies` | No UI consumer found |
| `/api/documents/registry` | No UI consumer found |
| `/api/events/[id]/phase` | No UI consumer found |
| `/api/events/[id]/roster` | No UI consumer found |
| `/api/exhibitors/[id]/confirm` | No UI consumer found |
| `/api/finance/fiscal-periods/[id]/close` | No UI consumer found |
| `/api/financial/ledger` | No UI consumer found |
| `/api/integrations/accounting/sync` | No UI consumer found |
| `/api/inventory/registry` | No UI consumer found |
| `/api/invoices/[id]/mark-overdue` | No UI consumer found |
| `/api/invoices/[id]/reminders` | No UI consumer found |
| `/api/locations/registry` | No UI consumer found |
| `/api/members/[id]/status` | No UI consumer found |
| `/api/oauth/connect` | No UI consumer found |
| `/api/operations/stats` | No UI consumer found |
| `/api/payments/create-checkout` | No UI consumer found |
| `/api/payments/create-intent` | No UI consumer found |
| `/api/payments/refund` | No UI consumer found |
| `/api/payroll-runs/[id]/approve` | No UI consumer found |
| `/api/payroll-runs/[id]/process` | No UI consumer found |
| `/api/people/directory` | No UI consumer found |
| `/api/performance-reviews/[id]/complete` | No UI consumer found |
| `/api/performance-reviews/[id]/submit` | No UI consumer found |
| `/api/privacy/consent` | No UI consumer found |
| `/api/projects/[id]/duplicate` | No UI consumer found |
| `/api/projects/[id]/forecast` | No UI consumer found |
| `/api/projects/[id]/status` | No UI consumer found |
| `/api/promo-codes/validate` | No UI consumer found |
| `/api/purchase-orders/[id]/receive` | No UI consumer found |
| `/api/purchase-orders/auto-match` | No UI consumer found |
| `/api/purchase-requisitions/[id]/convert` | No UI consumer found |
| `/api/quotes/[id]/convert-to-invoice` | No UI consumer found |
| `/api/registrations/[id]/cancel` | No UI consumer found |
| `/api/registrations/[id]/check-in` | No UI consumer found |
| `/api/reports/export` | No UI consumer found |
| `/api/reports/generate` | No UI consumer found |
| `/api/reports/utilization` | No UI consumer found |
| `/api/sequences/[id]/activate` | No UI consumer found |
| `/api/sequences/[id]/pause` | No UI consumer found |
| `/api/service-tickets/[id]/assign` | No UI consumer found |
| `/api/service-tickets/[id]/resolve` | No UI consumer found |
| `/api/settlements/[id]/generate-invoice` | No UI consumer found |
| `/api/support-tickets/[id]/assign` | No UI consumer found |
| `/api/support-tickets/[id]/resolve` | No UI consumer found |
| `/api/tasks/[id]/status` | No UI consumer found |
| `/api/time-punches/clock-in` | No UI consumer found |
| `/api/time-punches/clock-out` | No UI consumer found |
| `/api/timesheets/[id]/approve` | No UI consumer found |
| `/api/timesheets/[id]/submit` | No UI consumer found |
| `/api/venues/[id]/check-availability` | No UI consumer found |
| `/api/venues/[id]/holds` | No UI consumer found |
| `/api/venues/[id]/populate-crew` | No UI consumer found |
| `/api/weather/contingency` | No UI consumer found |

---

## Category 4: Implementation Quality

| Check | Result |
|-------|--------|
| Routes with `TODO`/`FIXME`/`not implemented` | **0** |
| Routes with `throw new Error("not implemented")` | **0** |
| Routes with `console.error`/`console.warn` | **0** (all use `captureError`/`logWarn`) |
| Routes using `requirePolicy` guard | **All** (except health/webhooks) |
| Routes using envelope response helpers | **All** (except health/webhooks) |
| Routes with Zod validation on mutations | **All POST/PATCH** |

---

## Remediation Status

### P0 — Runtime Failures (13 items) ✅ COMPLETE
- Created 11 missing API route files for UI `fetch()` calls
- Fixed 2 UI path mismatches (forecast → `/api/analytics/forecast`, proposals export → `/api/proposals/{id}/export`)
- Created enrichment routes + fixed EnrichmentPanel paths

### P1 — Dead Action Declarations (1 systemic issue + 37 missing routes) ✅ COMPLETE
- Implemented action dispatch in `CrudList.handleAction()` and `CrudDetail` for `type: 'api'` handlers
- Fixed ~30 schema endpoint paths to use `{id}` interpolation for row actions
- Created ~35 missing schema action handler route files
- Fixed 15 TypeScript errors (duplicates/route.ts, invitations routes)

### P2 — Orphan Routes ✅ COMPLETE
- Identified all orphan API routes via cross-reference analysis
- Wired 20+ orphan routes to schema row actions across 12 schemas:
  - **timesheet.ts** — submit, approve
  - **expense.ts** — submit, approve
  - **payrollRun.ts** — approve (with `{id}`), process
  - **performanceReview.ts** — submit, complete
  - **invoice.ts** — mark-overdue, reminders, receipt, export
  - **leaveRequest.ts** — reject (changed from modal to API)
  - **purchaseOrder.ts** — receive
  - **offboardingTemplate.ts** — duplicate (fixed `{id}` interpolation)
  - **settlement.ts** — generate-invoice
  - **supportTicket.ts** — assign (changed from modal to API)
  - **project.ts** — duplicate, update-status
  - **exhibitor.ts** — confirm
- Classified remaining orphans as infrastructure/backend-only (health, webhooks, CSP, cron jobs)

### Remaining Orphan Routes (Intentionally Unwired)
The following routes are intentionally not wired to UI consumers:
- **Infrastructure**: health, webhooks, CSP reports, session invalidation, push/subscribe
- **Cron/Background**: budget-alerts/check, invoices/check-overdue, contracts/check-expiry, automations/retry-queue
- **Public endpoints**: p/submit-lead, p/track-click, p/track-view
- **Generic CRUD**: [entity], [entity]/[id], [entity]/batch (catch-all routes)
- **Backend services**: calendar/sync, oauth/connect, integrations/accounting/sync, payments/webhook
- **Future use**: Various advancing, crew, venue, and operations routes awaiting UI feature development
