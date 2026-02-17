# ATLVS Comprehensive Page Audit — V2

**Date:** 2025-01-27
**Scope:** Every `page.tsx` across all route groups (~330 pages)
**Method:** Systematic reading of all hub pages, custom pages, Layout D pages, CrudList wrappers, auth flows, and settings pages

---

## Summary

| Module | Pages | Hub | Custom | CrudList | Gaps Found |
|--------|-------|-----|--------|----------|------------|
| CORE | ~25 | 1 | 8 | 16 | 8 |
| PRODUCTIONS | 28 | 1 | 5 | 22 | 6 |
| OPERATIONS | 29 | 1 | 6 | 22 | 7 |
| PEOPLE | 42 | 1 | 6 | 35 | 5 |
| ASSETS | 29 | 1 | 0 | 28 | 4 |
| BUSINESS | 39 | 1 | 3 | 35 | 5 |
| FINANCE | 42 | 1 | 4 | 37 | 6 |
| ANALYTICS | 11 | 1 | 2 | 8 | 4 |
| NETWORK | 32 | 0 | 1 | 31 | 5 |
| ACCOUNT | 12 | 0 | 5 | 7 | 4 |
| AUTH | 9 | 0 | 9 | 0 | 3 |
| **TOTAL** | **~298** | **8** | **49** | **241** | **57** |

---

## Priority Legend

- **P0 — Critical**: Broken workflows, data loss risk, security gaps
- **P1 — High**: Missing core business logic, incomplete CRUD flows
- **P2 — Medium**: Missing UX polish, incomplete features, workflow gaps
- **P3 — Low**: Nice-to-have enhancements, cosmetic improvements

---

## CORE MODULE

### GAP C-1 (P1): Run Sheet — No Data Persistence
**File:** `productions/projects/[id]/run-sheet/page.tsx`
**Issue:** All cue data is hardcoded in `useState` with 14 sample cues. No API call to load/save cues. Edits, additions, and removals are lost on page refresh.
**Impact:** Users cannot create persistent run sheets. Live mode cue advancement is ephemeral.
**Fix:** Wire to `runsheet_items` table via API (similar to show-mode page which already reads from Supabase).

### GAP C-2 (P2): Dashboard — Period Selector Not Wired
**File:** `core/dashboard/page.tsx`
**Issue:** The dashboard snapshot hook (`useDashboardSnapshot`) does not accept a time period parameter. KPIs always show all-time data regardless of any period filter the user might expect.
**Impact:** Users cannot view dashboard KPIs for specific time ranges (this week, this month, this quarter).
**Fix:** Add `period` parameter to `useDashboardSnapshot` and filter queries by date range.

### GAP C-3 (P2): Messages — No Real-Time Updates
**File:** `core/messages/page.tsx`
**Issue:** Conversations and messages are fetched via `fetch()` on mount and tab change. No Supabase Realtime subscription or polling interval. New messages from other users won't appear until manual refresh.
**Impact:** Users must manually refresh to see new messages, breaking the expectation of a messaging system.
**Fix:** Add Supabase Realtime subscription on the `messages` table or implement polling with `setInterval`.

### GAP C-4 (P2): Tasks — No Bulk Actions on CrudList View
**File:** `core/tasks/page.tsx`
**Issue:** The main tasks page is a bare `CrudList` wrapper with no bulk actions, filters, or view toggles. The richer `my-tasks` page has these features but is a separate route.
**Impact:** The generic tasks list lacks the productivity features available in "My Tasks".
**Fix:** Consider redirecting `/core/tasks` to `/core/tasks/my-tasks` or adding bulk action support to the CrudList schema.

### GAP C-5 (P2): Workflows — No Visual Workflow Builder
**File:** `core/workflows/page.tsx`, `core/workflows/new/page.tsx`
**Issue:** Workflows are managed via generic CrudList/CrudForm. There is no visual workflow builder (node-based editor, step sequencer, or condition builder). Users must define workflow logic through form fields.
**Impact:** Complex multi-step workflows with conditions and branches are difficult to configure.
**Fix:** Build a visual workflow builder component (e.g., using ReactFlow) for the workflow create/edit pages.

### GAP C-6 (P3): Documents — No Preview/Viewer
**File:** `core/documents/page.tsx`
**Issue:** Documents page is a bare CrudList. No inline document preview, version history, or collaborative editing features.
**Impact:** Users must download documents to view them rather than previewing inline.
**Fix:** Add document preview component (PDF viewer, image viewer) to the document detail page.

### GAP C-7 (P3): Calendar — No Quick-Create from Calendar View
**File:** `core/calendar/page.tsx`
**Issue:** The master calendar is explicitly read-only. While `calendar/new` exists for creating events, there's no click-to-create from the calendar grid itself.
**Impact:** Users must navigate away from the calendar to create events, then return.
**Fix:** Add a click handler on empty calendar slots that opens a quick-create modal or navigates to `/core/calendar/new` with pre-filled date.

### GAP C-8 (P3): Inbox — "Log Incident" and "Update Status" Buttons Not Wired
**File:** `operations/incidents/page.tsx`
**Issue:** The "Log Incident" button has no `onClick` handler. The "Update Status" button on each incident card also has no handler. The "Filter" button is similarly unwired.
**Impact:** Users see action buttons that do nothing when clicked.
**Fix:** Wire "Log Incident" to navigate to a create form or open a modal. Wire "Update Status" to a status change dropdown/modal.

---

## PRODUCTIONS MODULE

### GAP P-1 (P1): Call Sheet — No Data Loading on Edit
**File:** `productions/projects/[id]/call-sheet/page.tsx`
**Issue:** The call sheet generator initializes with empty state and never loads existing data from the API. The `loading` state is hardcoded to `false`. The save handler POSTs to `/api/projects/${projectId}/call-sheet` but there's no GET to load previously saved data.
**Impact:** Previously saved call sheets cannot be retrieved or edited — only created fresh each time.
**Fix:** Add `useEffect` to fetch existing call sheet data from the API on mount.

### GAP P-2 (P2): Productions Hub — "Revenue (MTD)" Mislabeled
**File:** `productions/page.tsx` (line 77-79)
**Issue:** The "Revenue (MTD)" stat card actually shows the sum of all budget `total_amount` values, not actual revenue. Budget totals represent planned amounts, not earned revenue.
**Impact:** Misleading financial KPI on the productions hub.
**Fix:** Either rename to "Total Budget" or calculate actual revenue from invoices/payments.

### GAP P-3 (P2): Build & Strike — Uses Generic Work Order Schema
**File:** `productions/build-strike/page.tsx`
**Issue:** The build & strike page is a CrudList filtered by `work_order_type: 'install'`. It doesn't show the specialized build/strike timeline view (Gantt, phases, crew assignments) that production teams expect.
**Impact:** Build & strike management lacks the visual timeline and phase management needed for production workflows.
**Fix:** Create a dedicated build/strike timeline component with phase management.

### GAP P-4 (P2): Advancing Hub — Sub-Pages Are All CrudList Wrappers
**Files:** `advancing/riders/page.tsx`, `advancing/catering/page.tsx`, `advancing/hospitality/page.tsx`, etc.
**Issue:** All advancing sub-pages (riders, catering, hospitality, guest lists, tech specs, allotments, assignments, approvals) are bare CrudList wrappers. They lack the domain-specific UI that advancing workflows require (e.g., rider comparison view, catering count calculator, room block manager).
**Impact:** Advancing workflows are generic CRUD rather than purpose-built tools.
**Fix:** Prioritize custom components for the most-used advancing sub-pages (riders, hospitality, catering).

### GAP P-5 (P3): Active Projects — Broken Navigation URL
**File:** `productions/page.tsx` (line 274)
**Issue:** Project card click navigates to `/${project.slug || `productions/${project.id}`}`. If `project.slug` is set to something unexpected, this could navigate to a non-existent route.
**Impact:** Potential broken navigation for projects with custom slugs.
**Fix:** Always use `/productions/projects/${project.id}` as the canonical route.

### GAP P-6 (P3): Run Sheet — Emoji in Production Code
**File:** `productions/projects/[id]/run-sheet/page.tsx` (line 247)
**Issue:** Uses `📍` emoji for location display instead of a Lucide icon (`MapPin`).
**Impact:** Inconsistent with the design system's icon-only approach.
**Fix:** Replace `📍` with `<MapPin className="h-3 w-3" />`.

---

## OPERATIONS MODULE

### GAP O-1 (P1): Incidents — No Create/Edit Flow
**File:** `operations/incidents/page.tsx`
**Issue:** The "Log Incident" button has no handler. There's no incident creation form or modal. The incident detail page (`incidents/[id]/page.tsx`) exists but the list page doesn't link to it.
**Impact:** Users cannot create new incidents from the incidents page.
**Fix:** Wire "Log Incident" to a create modal or navigate to a CrudForm. Add click handler on incident cards to navigate to detail.

### GAP O-2 (P1): Runsheets — "Create Runsheet" Button Not Wired
**File:** `operations/runsheets/page.tsx`
**Issue:** The "Create Runsheet" button has no `onClick` handler.
**Impact:** Users cannot create new runsheets from the runsheets list page.
**Fix:** Wire to navigate to a create form or open a creation modal.

### GAP O-3 (P2): Show Mode — `startTime` Dependency in useEffect
**File:** `operations/runsheets/[id]/show-mode/page.tsx` (line 76)
**Issue:** The `useEffect` that fetches data includes `startTime` in its dependency array. Since `setStartTime` is called inside the effect, this creates a potential re-fetch loop on the first load.
**Impact:** Could cause unnecessary re-renders and duplicate API calls.
**Fix:** Remove `startTime` from the dependency array or use a ref for the initial start time.

### GAP O-4 (P2): Runsheets — Missing Cue Count and Duration
**File:** `operations/runsheets/page.tsx` (lines 66-76)
**Issue:** When mapping raw runsheets to the display model, `totalCues` is hardcoded to `0`, `startTime` and `duration` are empty strings, and `location` is empty. These fields are displayed in the UI but always show "0 cues" and empty values.
**Impact:** Runsheet list cards show incomplete information.
**Fix:** Fetch `runsheet_items` count and aggregate duration for each runsheet, or join this data in the query.

### GAP O-5 (P2): Venues — No Floor Plan Viewer
**Files:** `operations/venues/floor-plans/page.tsx`
**Issue:** Floor plans page is a CrudList wrapper. No interactive floor plan viewer, zone overlay, or capacity visualization.
**Impact:** Venue floor plan management is limited to file upload/download rather than interactive viewing.
**Fix:** Add an interactive floor plan viewer component (image annotation, zone overlays).

### GAP O-6 (P3): Daily Reports — Duplicate Route
**Files:** `operations/daily-reports/page.tsx` AND `operations/comms/daily-reports/page.tsx`
**Issue:** Daily reports exist at two different routes. Both are likely CrudList wrappers for the same schema.
**Impact:** Confusing navigation — users may not know which daily reports page to use.
**Fix:** Consolidate to a single route and redirect the other.

### GAP O-7 (P3): Crew Check-In Kiosk — No Auth Bypass
**File:** `operations/crew-checkins/kiosk/page.tsx`
**Issue:** The kiosk page is inside the `(app)` route group which requires authentication. A kiosk mode typically needs to run on a shared device without individual user login.
**Impact:** Cannot deploy as a standalone check-in station without a logged-in user session.
**Fix:** Create a public kiosk route with token-based access (similar to client portal pattern).

---

## PEOPLE MODULE

### GAP PE-1 (P2): Scheduling — No Conflict Detection UI
**File:** `people/scheduling/page.tsx`
**Issue:** The scheduling page delegates to `SmartRostering` component. While the component name implies smart scheduling, there's no visible conflict detection, availability checking, or overtime warning in the page-level code.
**Impact:** Scheduling conflicts may not be surfaced to users during shift assignment.
**Fix:** Verify `SmartRostering` component includes conflict detection; if not, add visual conflict indicators.

### GAP PE-2 (P2): Performance — Review Edit Route Missing
**File:** `people/performance/page.tsx` (line 113)
**Issue:** The `onStartReview` callback navigates to `/people/performance/${reviewId}/edit`, but there's no corresponding `people/performance/[id]/edit/page.tsx` in the file listing.
**Impact:** Clicking "Start Review" navigates to a 404 page.
**Fix:** Create the missing edit page or route to the CrudForm edit pattern.

### GAP PE-3 (P2): Organization — Only One Settings Tab
**File:** `account/organization/page.tsx`
**Issue:** The organization settings page has only a "Details" tab with basic fields (name, website, industry, size). Missing: team members management, roles & permissions, departments, billing/subscription, integrations, branding.
**Impact:** Organization admins cannot manage team members, roles, or advanced settings from this page.
**Fix:** Add tabs for Members, Roles & Permissions, Departments, and Integrations.

### GAP PE-4 (P3): People Hub — No Headcount Trend
**File:** `people/page.tsx`
**Issue:** The people hub shows 4 static KPI cards but no trend data, charts, or recent activity feed.
**Impact:** HR managers lack at-a-glance trend visibility (headcount growth, turnover rate, etc.).
**Fix:** Add a headcount trend chart and recent activity section similar to the business hub.

### GAP PE-5 (P3): Travel — All CrudList Wrappers
**Files:** `people/travel/bookings/page.tsx`, `people/travel/accommodations/page.tsx`
**Issue:** Travel management pages are bare CrudList wrappers. No itinerary builder, map view, or travel policy enforcement.
**Impact:** Travel management is generic CRUD rather than purpose-built travel tools.
**Fix:** Add itinerary view component and travel policy validation.

---

## ASSETS MODULE

### GAP A-1 (P2): Assets Hub — No Asset Utilization Chart
**File:** `assets/page.tsx`
**Issue:** The hub calculates utilization percentage but only shows it as text in the "Available" stat card description. No visual chart or trend.
**Impact:** Asset managers lack visual utilization analytics on the hub page.
**Fix:** Add a utilization donut chart or trend line to the hub.

### GAP A-2 (P2): Inventory Detail — Generic CrudDetail
**File:** `assets/inventory/[id]/page.tsx`
**Issue:** Asset detail is a generic CrudDetail page. No asset-specific features like QR code generation, maintenance history timeline, deployment history, or condition photos.
**Impact:** Asset detail lacks the specialized information asset managers need.
**Fix:** Create a custom asset detail page with maintenance timeline, QR code, and deployment history tabs.

### GAP A-3 (P3): Reservations — No Calendar View
**File:** `assets/reservations/page.tsx`
**Issue:** Reservations page is a CrudList. No calendar/timeline view showing equipment availability across dates.
**Impact:** Users cannot visually see equipment availability windows.
**Fix:** Add a timeline/calendar view component for reservation management.

### GAP A-4 (P3): Warehouse Page — Unclear Purpose
**File:** `assets/warehouse/page.tsx`
**Issue:** Separate `warehouse` page exists alongside `locations/warehouses`. Potential duplication.
**Impact:** Confusing navigation — two routes for warehouse management.
**Fix:** Consolidate or differentiate the two warehouse-related routes.

---

## BUSINESS MODULE

### GAP B-1 (P2): Pipeline — Table View Not Implemented
**File:** `business/pipeline/page.tsx` (line 11)
**Issue:** The view mode toggle between 'kanban' and 'table' exists, but only `PipelineBoard` is rendered regardless of `viewMode`. The table view is not implemented.
**Impact:** Users can toggle to table view but see the same kanban board.
**Fix:** Conditionally render a CrudList or DataTable when `viewMode === 'table'`.

### GAP B-2 (P2): Forecast — KPI Change Always 0
**File:** `business/pipeline/forecast/page.tsx` (lines 97-102)
**Issue:** All KPI `change` values are hardcoded to `0`. The "vs last period" comparison is never calculated.
**Impact:** Trend indicators always show 0% change, providing no period-over-period insight.
**Fix:** Calculate actual change by comparing current period values to previous period.

### GAP B-3 (P2): Companies — No Company Detail Hub
**File:** `business/companies/[id]/page.tsx`
**Issue:** Company detail is a generic CrudDetail. No company-specific hub showing related contacts, deals, contracts, invoices, activity timeline, and communication history.
**Impact:** Users must navigate to separate pages to see a company's full relationship picture.
**Fix:** Create a custom company detail page with relationship tabs.

### GAP B-4 (P3): Campaigns — No Campaign Performance Dashboard
**Files:** `business/campaigns/page.tsx` and sub-pages
**Issue:** Campaign management pages are all CrudList wrappers. No campaign performance dashboard showing open rates, click rates, conversion metrics.
**Impact:** Marketing teams lack campaign analytics.
**Fix:** Add a campaign analytics dashboard component.

### GAP B-5 (P3): Brand — No Asset Preview
**Files:** `business/brand/logos/page.tsx`, `business/brand/colors/page.tsx`, `business/brand/typography/page.tsx`
**Issue:** Brand management pages are CrudList wrappers. No visual preview of brand assets, color swatches, or typography specimens.
**Impact:** Brand management is text-based rather than visual.
**Fix:** Add visual preview components for brand assets.

---

## FINANCE MODULE

### GAP F-1 (P1): Finance Hub — Refresh Button Not Wired
**File:** `finance/page.tsx` (line 63)
**Issue:** The refresh button has no `onClick` handler. It renders a `RefreshCw` icon but does nothing when clicked.
**Impact:** Users expect the refresh button to reload financial data.
**Fix:** Wire to refetch financial health, action center, and cash flow data.

### GAP F-2 (P2): Financial Dashboard — Period Selector Not Wired
**File:** `finance/dashboard/page.tsx` (line 44)
**Issue:** The period selector (`useState('month')`) changes state but the `useFinanceDashboard` hook doesn't accept a period parameter. All charts show the same data regardless of selected period.
**Impact:** Period filter is cosmetic only.
**Fix:** Pass `period` to `useFinanceDashboard` and filter queries accordingly.

### GAP F-3 (P2): Invoice Builder — No Save/Send API
**File:** `finance/invoices/builder/page.tsx`
**Issue:** The invoice builder has full line item management and total calculation, but the save and send actions are not wired to any API endpoint.
**Impact:** Users can build invoices but cannot persist or send them.
**Fix:** Wire save to POST `/api/invoices` and send to a send endpoint.

### GAP F-4 (P2): Recurring Invoices — No Automation Engine
**Files:** `finance/recurring-invoices/page.tsx`, `finance/recurring-invoices/[id]/page.tsx`
**Issue:** Recurring invoices are CrudList/CrudDetail pages. No visible automation that generates invoices on schedule.
**Impact:** Recurring invoices must be manually created each period.
**Fix:** Add a cron/scheduled function that generates invoices from recurring templates.

### GAP F-5 (P3): Expense Approvals — Separate from Inbox
**File:** `finance/expense-approvals/page.tsx`
**Issue:** Expense approvals exist as a standalone CrudList page, separate from the unified inbox approval workflow.
**Impact:** Approvers must check two places for pending approvals.
**Fix:** Ensure expense approvals also appear in the unified inbox.

### GAP F-6 (P3): AR/AP Report — CrudList Only
**File:** `finance/reports/ar-ap/page.tsx`
**Issue:** The AR/AP aging report is a CrudList wrapper rather than a purpose-built aging report with buckets, totals, and drill-down.
**Impact:** AR/AP reporting lacks the visual aging analysis available in the finance dashboard.
**Fix:** Create a dedicated AR/AP aging report component.

---

## ANALYTICS MODULE

### GAP AN-1 (P2): Report Builder — No Query Execution
**File:** `analytics/reports/builder/page.tsx`
**Issue:** The report builder has field selection, chart type picker, and row/column/value configuration, but the "Run Report" button doesn't execute any query. The preview tab shows a static placeholder.
**Impact:** Reports cannot actually be generated — the builder is UI-only.
**Fix:** Wire "Run Report" to an API endpoint that executes the configured query and returns data for visualization.

### GAP AN-2 (P2): Dashboard Builder — CrudList Only
**File:** `analytics/dashboards/builder/page.tsx`
**Issue:** The dashboard builder is likely a CrudList wrapper (based on pattern). No drag-and-drop widget placement or visual dashboard composition.
**Impact:** Users cannot visually build custom dashboards.
**Fix:** Create a visual dashboard builder with widget palette and grid layout.

### GAP AN-3 (P3): Scheduled Reports — No Scheduling Engine
**File:** `analytics/scheduled/page.tsx`
**Issue:** Scheduled reports page is a CrudList. No backend scheduling engine to actually deliver reports on schedule.
**Impact:** Users can create schedule records but reports won't be delivered automatically.
**Fix:** Implement a cron/scheduled function for report delivery.

### GAP AN-4 (P3): AI Reports — Unknown Implementation
**File:** `analytics/reports/ai/page.tsx`
**Issue:** AI-powered report generation page exists but implementation details are unclear from the page file alone.
**Impact:** May be a placeholder or partially implemented feature.
**Fix:** Verify implementation and wire to AI service if not already connected.

---

## NETWORK MODULE

### GAP N-1 (P2): Feed — Generic CrudList
**File:** `network/feed/page.tsx`
**Issue:** The network feed is a CrudList wrapper for `activityFeedSchema`. No social-media-style feed UI with posts, likes, comments, shares.
**Impact:** The "feed" experience is a data table rather than a social feed.
**Fix:** Create a custom feed component with post cards, reactions, and commenting.

### GAP N-2 (P2): Discover — "Connect" Button Not Wired
**File:** `network/discover/page.tsx` (line 135)
**Issue:** The "Connect" button on each contact card has no `onClick` handler.
**Impact:** Users cannot actually send connection requests.
**Fix:** Wire to a connection request API endpoint.

### GAP N-3 (P2): Marketplace — Generic CrudList
**File:** `network/marketplace/page.tsx`
**Issue:** The marketplace is a CrudList wrapper. No marketplace-specific UI (listing cards, categories, search filters, pricing display).
**Impact:** Marketplace lacks the visual browsing experience users expect.
**Fix:** Create a custom marketplace browse component with card layout and category filters.

### GAP N-4 (P3): Network Module — No Hub Page
**Issue:** Unlike other modules (productions, operations, people, assets, business, finance), the network module has no hub/landing page with KPIs and quick access cards.
**Impact:** Users land directly on sub-pages without an overview of their network activity.
**Fix:** Create a network hub page with connection stats, recent activity, and quick access cards.

### GAP N-5 (P3): Messages — Separate from Core Messages
**File:** `network/messages/page.tsx`
**Issue:** Network messages exist as a separate CrudList page from `core/messages`. Two messaging systems may confuse users.
**Impact:** Users may not know which messaging page to use.
**Fix:** Clarify the distinction (internal vs. network messaging) or consolidate.

---

## ACCOUNT / SETTINGS MODULE

### GAP AC-1 (P2): Billing — No Payment Method Management
**File:** `account/billing/page.tsx`
**Issue:** Billing page only has a plan type selector (Free/Pro/Enterprise). No payment method management, invoice history, usage metrics, or upgrade/downgrade flow.
**Impact:** Users cannot manage payment methods or view billing history.
**Fix:** Add payment method, invoice history, and usage tabs.

### GAP AC-2 (P2): Profile — No Avatar Upload
**File:** `account/profile/page.tsx` (line 33)
**Issue:** The avatar field is a text input for pasting a URL. No file upload component for profile photos.
**Impact:** Users must host their avatar elsewhere and paste the URL.
**Fix:** Replace with a file upload component that uploads to Supabase Storage.

### GAP AC-3 (P2): Organization — No Team Member Management
**File:** `account/organization/page.tsx`
**Issue:** Organization settings only has basic details. No member list, invite flow, role assignment, or member removal.
**Impact:** Organization admins cannot manage team members from settings.
**Fix:** Add a Members tab with invite, role management, and removal capabilities.

### GAP AC-4 (P3): Profile — Notification Preferences Not Loaded
**File:** `account/profile/page.tsx`
**Issue:** The `handleSave` function saves some profile fields to `auth.updateUser` and `users` table, but notification preferences (12 switch fields) are not persisted anywhere in the save handler.
**Impact:** Notification preference changes are lost on page refresh.
**Fix:** Persist notification preferences to a `user_preferences` table or user metadata.

---

## AUTH + ONBOARDING

### GAP AU-1 (P2): Register — No Organization Creation Flow
**File:** `(auth)/register/page.tsx`
**Issue:** Registration creates a user account but doesn't create an organization or prompt for organization setup. New users land on the dashboard without an `organization_id`.
**Impact:** New users have no organization context, causing all org-scoped queries to return empty results.
**Fix:** Add a post-registration onboarding flow that creates an organization and sets `organization_id` in user metadata.

### GAP AU-2 (P2): MFA — No Error Toast
**File:** `(auth)/verify-mfa/page.tsx` (line 68-71)
**Issue:** MFA verification failure only logs to console and resets the code. No user-facing error message (toast or inline error).
**Impact:** Users don't know why verification failed — they just see the code reset.
**Fix:** Add a toast notification for verification failures.

### GAP AU-3 (P3): SSO — Provider Page Needs API Keys
**File:** `(auth)/sso/[provider]/page.tsx`
**Issue:** SSO callback page exists but requires external provider API keys to function. This is a known dependency.
**Impact:** SSO login is non-functional without provider configuration.
**Fix:** Document required environment variables and add provider setup instructions.

---

## CROSS-CUTTING CONCERNS

### GAP X-1 (P1): CrudList Pages — No Contextual Actions
**Scope:** ~241 CrudList wrapper pages across all modules
**Issue:** The majority of pages (241 out of ~298) are bare `CrudList` wrappers with no page-level customization. They rely entirely on the schema definition for columns, filters, and actions. While this provides consistency, it means:
- No page-level quick actions or shortcuts
- No contextual help or onboarding
- No module-specific empty states (though `EntityEmptyState` exists, it's not used in CrudList wrappers)
**Impact:** Generic experience across all entity types.
**Fix:** Prioritize custom pages for the top 10-15 most-used entities.

### GAP X-2 (P2): Export Buttons — Mostly Unwired
**Scope:** Multiple pages (finance dashboard, report builder, run sheet, call sheet)
**Issue:** "Export PDF", "Export", "Download" buttons exist on many pages but most have no `onClick` handler or only trigger `window.print()`.
**Impact:** Users expect export functionality but get no response.
**Fix:** Implement PDF generation (e.g., using `@react-pdf/renderer` or server-side PDF generation) for key documents.

### GAP X-3 (P2): Filter Buttons — Mostly Unwired
**Scope:** Incidents page, pipeline page, and others
**Issue:** "Filter" buttons exist on several custom pages but have no handler. CrudList pages have built-in filtering, but custom pages don't.
**Impact:** Users cannot filter data on custom pages.
**Fix:** Wire filter buttons to filter panels or dropdowns.

### GAP X-4 (P2): Send/Share Buttons — Mostly Unwired
**Scope:** Call sheet ("Send to Crew"), report builder ("Share Report"), invoice builder ("Send")
**Issue:** Communication action buttons exist but are not connected to email/notification services.
**Impact:** Users cannot distribute documents from within the application.
**Fix:** Wire to notification service or email API.

### GAP X-5 (P3): Hardcoded Sample Data
**Scope:** Run sheet page (14 hardcoded cues), call sheet (sample contacts/departments)
**Issue:** Some pages initialize with hardcoded sample data rather than empty state or fetched data.
**Impact:** Sample data may confuse users who think it's real data.
**Fix:** Initialize with empty state and provide a "Load Template" action instead.

---

## PRIORITIZED IMPLEMENTATION ORDER

### Phase 1 — P0/P1 Critical (5 items)
1. **C-1**: Run sheet data persistence
2. **P-1**: Call sheet data loading
3. **O-1**: Incident create/edit flow
4. **O-2**: Runsheet create button
5. **F-1**: Finance hub refresh button

### Phase 2 — P1 Structural (2 items)
6. **X-1**: Top 10 CrudList pages → custom pages
7. **AU-1**: Post-registration organization creation flow

### Phase 3 — P2 Business Logic (15 items)
8. **C-2**: Dashboard period selector
9. **C-3**: Messages real-time updates
10. **P-2**: Productions hub revenue label fix
11. **O-3**: Show mode useEffect dependency fix
12. **O-4**: Runsheet cue count/duration
13. **B-1**: Pipeline table view
14. **B-2**: Forecast KPI change calculation
15. **F-2**: Finance dashboard period selector
16. **F-3**: Invoice builder save/send
17. **AN-1**: Report builder query execution
18. **N-2**: Discover connect button
19. **AC-1**: Billing payment methods
20. **AC-2**: Profile avatar upload
21. **AC-3**: Organization team management
22. **AU-2**: MFA error toast

### Phase 4 — P2 UX Polish (10 items)
23. **C-4**: Tasks redirect or enhancement
24. **C-5**: Visual workflow builder
25. **P-3**: Build & strike timeline
26. **PE-1**: Scheduling conflict detection
27. **PE-2**: Performance review edit route
28. **O-5**: Floor plan viewer
29. **A-1**: Asset utilization chart
30. **B-3**: Company detail hub
31. **N-1**: Social feed component
32. **N-3**: Marketplace browse UI

### Phase 5 — P2/P3 Cross-Cutting (8 items)
33. **X-2**: Export PDF implementation
34. **X-3**: Filter button wiring
35. **X-4**: Send/share button wiring
36. **F-4**: Recurring invoice automation
37. **AN-3**: Scheduled report delivery
38. **AC-4**: Notification preference persistence
39. **PE-3**: Organization settings tabs
40. **O-7**: Kiosk auth bypass

### Phase 6 — P3 Nice-to-Have (17 items)
41-57: Remaining P3 items (document preview, calendar quick-create, campaign analytics, brand preview, AR/AP report, network hub, message consolidation, travel itinerary, asset calendar, warehouse consolidation, daily report consolidation, asset QR codes, SSO setup, hardcoded sample data, emoji replacement, AI reports verification, dashboard builder)

---

## TOTAL: 57 gaps identified across 11 modules
- **P0/P1 Critical:** 7
- **P2 Medium:** 30
- **P3 Low:** 20
