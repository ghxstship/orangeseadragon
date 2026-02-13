# Mock & Hardcoded Data Audit — Go-Live Readiness

> Generated: 2026-02-13
> Scope: All `.tsx` / `.ts` files under `src/`

---

## Executive Summary

The codebase has **~50+ Supabase data hooks** already wired and working (tasks, projects, events, budgets, invoices, deals, contacts, companies, assets, people, etc.). The **CrudList → ListLayout → DataView pipeline** (175+ pages) is fully live — it fetches from Supabase via hooks.

However, **~35 files** still contain hardcoded/mock data arrays, stub handlers, or placeholder services. These fall into 6 categories below.

---

## Category 1: Dashboard Widgets with Inline Mock Arrays

These widgets render hardcoded arrays instead of fetching from Supabase.

| File | Mock Variable | What It Should Fetch |
|------|--------------|---------------------|
| `src/components/widgets/ActiveEventsWidget.tsx` | `mockEvents` (line 18) | `useEvents()` hook — already exists |
| `src/components/widgets/CrewStatusWidget.tsx` | `mockCrew` (line 13) | `useCrewCalls()` or crew assignments table |
| `src/components/widgets/TodayScheduleWidget.tsx` | `mockSchedule` (line 12) | `useCalendarEvents()` hook — already exists |

**Work required:** Replace each `const mock*` with the corresponding Supabase hook. ~30 min each.

---

## Category 2: Full-Page Components with Hardcoded Data

These are standalone pages/components that render entirely from `const MOCK_*` arrays.

| File | Mock Variable(s) | Supabase Table(s) Needed |
|------|-----------------|-------------------------|
| `src/components/assets/AssetUtilizationDashboard.tsx` | `MOCK_ASSETS`, `MOCK_HEATMAP` (lines 54, 62) | `assets`, `asset_reservations` — aggregate query |
| `src/components/operations/CrewCheckinKiosk.tsx` | `mockConfig`, `mockRecentCheckins`, `mockResult` (lines 54, 65, 148) | `events`, `crew_assignments`, `crew_checkins` |
| `src/components/operations/IncidentControlRoom.tsx` | `mockIncidents`, `mockStats` (lines 54, 106) | `incidents` table — already has migration |
| `src/components/people/WorkforceAnalytics.tsx` | `MOCK_METRICS`, `MOCK_INSIGHTS`, `MOCK_DEPARTMENTS` (lines 81, 90, 133) | Aggregate queries on `people`, `time_entries`, `leave_requests` |
| `src/components/people/PerformanceReviewDashboard.tsx` | `MOCK_CYCLE`, `MOCK_REVIEWS` (lines 85, 94) | `performance_reviews`, `review_cycles` tables |
| `src/components/people/DocumentManager.tsx` | `MOCK_DOCUMENTS` (line 82) | `documents` table — already has migration |
| `src/components/people/LeaveCalendar.tsx` | `MOCK_REQUESTS` (line 68) | `leave_requests` table — already has migration |
| `src/components/people/LifeStreamProfile.tsx` | `SKILL_DATA` (line 14) | `user_skills` table — already has migration |
| `src/components/people/HolographicDirectory.tsx` | Inline mock interface (line 8) | `people` table via `usePeople()` hook |
| `src/components/scheduling/SmartRostering.tsx` | `MOCK_SHIFTS` (line 13) | `shifts` table via `useShifts()` hook — already exists |

**Work required:** Wire each component to the appropriate Supabase hook or create a new aggregate query hook. ~1-2 hrs each.

---

## Category 3: Page-Level Hardcoded Data (App Routes)

These are route pages (`page.tsx`) with inline static data arrays.

| File | Mock Variable(s) | What It Should Fetch |
|------|-----------------|---------------------|
| `src/app/(app)/finance/dashboard/page.tsx` | `kpis`, `revenueVsExpenses`, `profitByClient`, `budgetHealth`, `cashFlow`, `arAging` (lines 47-101) | Aggregate queries: `invoices`, `budgets`, `payments`, `expenses` |
| `src/app/(app)/finance/accounts/components/TransactionFeed.tsx` | `MOCK_TRANSACTIONS` (line 17) | `financial_ledger` or bank transaction table |
| `src/app/(app)/finance/accounts/components/CashFlowChart.tsx` | `data` (line 8) | Aggregate on `payments` + `expenses` by month |
| `src/app/(app)/business/pipeline/forecast/page.tsx` | `kpis`, `monthlyWeighted`, `revenueByClient`, `funnel` (lines 39-77) | Aggregate on `deals` table — pipeline stages |
| `src/app/(app)/analytics/reports/page.tsx` | `reports` (line 32) | `saved_reports` or `report_definitions` table |
| `src/app/(app)/analytics/dashboards/page.tsx` | `dashboards` (line 21) | `dashboard_layouts` table — already has API |
| `src/app/(app)/analytics/dashboards/builder/page.tsx` | `widgetPalette` (line 31) | Static config (OK to keep — this is a UI palette, not data) |
| `src/app/(app)/analytics/reports/builder/page.tsx` | `availableFields` (line 39) | Can derive from schema definitions (OK as static config) |
| `src/app/(app)/operations/incidents/page.tsx` | `mockIncidents` (line 20) | `incidents` table via `useIncidents()` hook — already exists |
| `src/app/(app)/operations/shows/page.tsx` | `mockShows` (line 20) | `events` table via `useEvents()` hook — already exists |
| `src/app/(app)/operations/runsheets/page.tsx` | `mockRunsheets` (line 23) | `runsheets` table via `useRunsheets()` hook — already exists |
| `src/app/(app)/account/history/page.tsx` | `activities` (line 38) | `audit_log` table — already has migration |
| `src/app/(app)/account/audit-log/page.tsx` | `mockEntries` (line 33) | `audit_log` table — already has migration |
| `src/app/(app)/people/travel/page.tsx` | `STAFF_LOCATIONS` (line 6) | `people` table + location data (needs GPS/mapping API) |
| `src/app/(app)/assets/warehouse/page.tsx` | `zones` (line 26) | `warehouse_locations` table — already has migration |
| `src/app/(app)/core/messages/page.tsx` | `threads` (line 34) | Needs messaging table or integration (not yet in DB) |

**Work required:** Replace each with Supabase hook or aggregate API route. ~1-3 hrs each depending on query complexity.

---

## Category 4: Stub Handlers (setTimeout Simulations)

These handlers simulate async operations with `setTimeout` instead of calling real APIs.

| File | Line(s) | What It Should Do |
|------|---------|------------------|
| `src/app/(app)/productions/projects/[id]/call-sheet/page.tsx` | 135 | `POST /api/projects/{id}/call-sheet` — API route exists, needs wiring |
| `src/app/(app)/account/billing/page.tsx` | 28 | Stripe billing API integration |
| `src/app/(app)/account/profile/page.tsx` | 122 | `PATCH /api/users/me` — update user profile |
| `src/app/(app)/account/organization/page.tsx` | 39 | `PATCH /api/organizations/{id}` — update org settings |
| `src/app/(app)/account/sandbox/page.tsx` | 66 | Sandbox/dev environment settings API |
| `src/app/(app)/analytics/scheduled/page.tsx` | 55 | `POST /api/reports/schedules` — already has migration |
| `src/app/(app)/finance/rate-cards/page.tsx` | 90 | `POST /api/rate-cards` — already has migration |
| `src/app/(app)/finance/components/ReceiptUploader.tsx` | 60-74 | OCR API integration (external service) |
| `src/app/(app)/core/dashboard/customize/page.tsx` | 38 | `PATCH /api/dashboard-layouts/{id}` — API exists |
| `src/app/(auth)/invite/[token]/page.tsx` | 32, 49 | `GET/POST /api/invitations/{token}` — validate & accept |
| `src/app/(auth)/reset-password/page.tsx` | 13 | Supabase `auth.resetPasswordForEmail()` |
| `src/app/(onboarding)/profile/page.tsx` | 29 | `PATCH /api/users/me` |
| `src/app/(onboarding)/organization/page.tsx` | 47 | `POST /api/organizations` |
| `src/app/(onboarding)/team/page.tsx` | 52 | `POST /api/invitations` |
| `src/app/(onboarding)/preferences/page.tsx` | 53 | `PATCH /api/users/me/preferences` |
| `src/app/(onboarding)/integrations/page.tsx` | 64, 75 | OAuth flow for calendar/Slack/Teams |
| `src/lib/notifications/service.ts` | 394-451 | Email (SendGrid/Resend), Push (FCM), SMS (Twilio), Slack (webhook), In-app (Supabase insert) |

**Work required:** Replace each `await new Promise(setTimeout)` with the real API call. Most backend routes already exist. ~30 min - 2 hrs each.

---

## Category 5: Mock Hooks & Permission Stubs

| File | What's Mocked | What It Should Be |
|------|--------------|------------------|
| `src/lib/navigation/components/Sidebar.tsx` (line 10) | `usePermissions` → always returns `true` | Real RBAC hook checking `user_roles` / `role_permissions` tables |
| `src/lib/navigation/components/Sidebar.tsx` (line 11) | `useSWR` → returns `null` | Real SWR/hook for badge counts (unread inbox, pending approvals) |
| `src/lib/navigation/components/SubpageNav.tsx` (lines 6-25) | `useSWR`, `buildQueryString` stubs | Real data fetching for subpage counts/badges |
| `src/lib/crud/components/fields/RelationField.tsx` (line 24) | `// TODO: Implement API call to load options` | Fetch relation options from Supabase entity table |

**Work required:** These are **critical for go-live** — especially permissions. The RBAC tables exist in the DB (migrations 00075+). Need a real `usePermissions()` hook. ~4-8 hrs total.

---

## Category 6: External Service Stubs

| File | Service | Status |
|------|---------|--------|
| `src/lib/services/weatherService.ts` (line 169) | Weather API (OpenWeatherMap etc.) | Needs API key + real fetch |
| `src/lib/notifications/service.ts` | Email, Push, SMS, Slack, Webhook delivery | All channels are `console.log` + `setTimeout` |
| `src/app/(app)/finance/components/ReceiptUploader.tsx` | OCR service | Needs external OCR API (e.g., Google Vision, AWS Textract) |
| `src/app/(onboarding)/integrations/page.tsx` | OAuth flows (Google Calendar, Slack, Teams) | Needs OAuth client setup |

**Work required:** Each needs an external API key/service account configured. ~2-4 hrs each for integration.

---

## What's Already Live (No Changes Needed)

These systems are **fully wired to Supabase** and working:

- **CrudList pipeline** (175+ pages) — all entity list views fetch via hooks
- **CrudDetail pipeline** — all `[id]/page.tsx` detail views fetch via hooks
- **Core Dashboard** (`core/dashboard/page.tsx`) — fetches from `/api/dashboard-layouts`
- **Inbox** (`core/inbox/page.tsx`) — fetches from `/api/inbox`
- **My Tasks** (`core/tasks/my-tasks/page.tsx`) — uses `useMyTasks()` hook
- **My Timesheet** (`core/tasks/my-timesheet/page.tsx`) — uses `useMyTimeEntries()` hook
- **Productions hub** (`productions/page.tsx`) — uses `useEvents()`, `useProjects()`, `useBudgets()`
- **Invoice Overview** (`finance/invoices/overview/page.tsx`) — uses `useInvoiceOverview()` hook
- **Pipeline Board** (`business/pipeline/page.tsx`) — uses `useDeals()` hook
- **All 50+ Supabase hooks** in `src/hooks/` — fully functional
- **All API routes** in `src/app/api/` — functional with Supabase service client
- **Auth flow** (login, register, logout, session refresh) — Supabase Auth
- **Realtime** (presence, comments, runsheet sync) — Supabase Realtime channels

---

## Go-Live Priority Roadmap

### P0 — Must Fix Before Launch
1. **Permissions hook** — Replace `usePermissions` stub with real RBAC (`Sidebar.tsx`, `SubpageNav.tsx`)
2. **RelationField options** — Wire `RelationField.tsx` to fetch options from Supabase
3. **Auth flows** — Wire invite acceptance, password reset to Supabase Auth APIs
4. **Onboarding flows** — Wire profile/org/team/preferences saves to real API routes
5. **Notification delivery** — At minimum, wire in-app + email channels (SendGrid/Resend)

### P1 — Required for Full Functionality
6. **Dashboard widgets** — Wire ActiveEvents, CrewStatus, TodaySchedule to hooks (~3 widgets)
7. **Finance dashboard** — Replace 6 hardcoded chart datasets with aggregate queries
8. **Forecast page** — Replace 4 hardcoded datasets with deal pipeline aggregates
9. **Operations pages** — Wire incidents, shows, runsheets list pages to existing hooks
10. **Account pages** — Wire audit-log, history to `audit_log` table
11. **Settings saves** — Wire billing, profile, org settings to real PATCH endpoints

### P2 — Important but Deferrable
12. **People module components** — Wire WorkforceAnalytics, PerformanceReview, DocumentManager, LeaveCalendar, SmartRostering (~5 components)
13. **Asset utilization** — Wire to aggregate asset reservation queries
14. **Crew check-in kiosk** — Wire to real QR scan + crew_checkins table
15. **Warehouse page** — Wire to warehouse_locations table
16. **Messages page** — Requires messaging table design (not yet in DB schema)
17. **Receipt OCR** — Requires external OCR service integration

### P3 — Nice to Have / External Dependencies
18. **Weather service** — Needs API key
19. **OAuth integrations** — Google Calendar, Slack, Teams
20. **GPS/mapping** — Staff travel page needs mapping API
21. **Sidebar badge counts** — Wire `useSWR` stub to real count queries

---

## Estimated Effort

| Priority | Item Count | Estimated Hours |
|----------|-----------|----------------|
| **P0** | 5 items | 16-24 hrs |
| **P1** | 6 items | 20-30 hrs |
| **P2** | 6 items | 16-24 hrs |
| **P3** | 4 items | 8-16 hrs |
| **Total** | **21 items** | **60-94 hrs** |

---

## Files That Are NOT Mock Data (False Positives)

These contain the word "mock" or "placeholder" but are **not** mock data issues:

- `src/test/setup.ts` — Test mocks (correct usage for Vitest)
- `src/lib/schemas/resourceBooking.ts` — "Placeholder" is a field name for temp crew bookings (legitimate domain concept)
- `src/app/(app)/analytics/dashboards/builder/page.tsx` — `widgetPalette` is a static UI config, not data
- `src/app/(app)/analytics/reports/builder/page.tsx` — `availableFields` is derivable from schemas (static config OK)
- `src/app/(app)/account/billing/page.tsx` — `billingTabs` is UI structure, not data
- All `SettingsTemplate` tab definitions — UI structure, not data
- `src/components/views/inline-edit-cell.tsx` — `setTimeout` for error flash (UX, not mock)
- `src/app/p/[slug]/_components/qr-code-display.tsx` — `setTimeout` for copy feedback (UX, not mock)
