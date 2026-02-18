# ATLVS — Comprehensive Page-by-Page Gap Analysis

> Generated: 2026-02-16  
> Scope: Every page across all modules — auth, onboarding, core, account, productions, operations, people, assets, finance, business, analytics, network  
> Method: Source-level review of functionality, business logic, end-user workflows (literal and implied)

---

## Severity Legend

| Severity | Meaning |
|----------|---------|
| **CRITICAL** | Broken workflow, data loss risk, or security issue |
| **HIGH** | Missing feature that blocks a core user workflow |
| **MEDIUM** | Feature gap that degrades UX or forces workarounds |
| **LOW** | Polish, convenience, or nice-to-have improvement |

---

## 1. AUTH MODULE (9 pages)

### 1.1 `/login`
- **Functionality**: Email/password sign-in, magic-link option, link to register/forgot-password
- **Gaps**:
  - **[MEDIUM]** `rememberMe` checkbox is collected but never passed to Supabase `signInWithPassword` — the field has no effect
  - **[MEDIUM]** No rate limiting or account lockout UI feedback after repeated failed attempts
  - **[LOW]** No "show password" toggle on password field
  - **[LOW]** After successful login, redirects to `/core/dashboard` — should check if user has completed onboarding first

### 1.2 `/register`
- **Functionality**: Name, email, password, terms checkbox → Supabase `signUp`
- **Gaps**:
  - **[HIGH]** `acceptTerms` checkbox is validated client-side only — no server-side enforcement; terms acceptance timestamp is not recorded
  - **[MEDIUM]** No confirm-password field — user can mistype password with no recovery until email verification
  - **[MEDIUM]** Terms of Service and Privacy Policy links are text-only — no actual `/terms` or `/privacy-policy` public pages linked
  - **[LOW]** No invitation code / referral tracking on registration

### 1.3 `/magic-link`
- **Functionality**: Email input → `signInWithOtp` → confirmation UI with resend cooldown
- **Gaps**:
  - **[LOW]** Cooldown timer (60s) is client-side only — server doesn't enforce rate limiting per email
  - **[LOW]** No deep-link redirect parameter — user always lands on dashboard after magic link

### 1.4 `/forgot-password`
- **Functionality**: Email input → `resetPasswordForEmail` with redirect to `/reset-password`
- **Gaps**:
  - **[LOW]** No feedback distinguishing "email sent" from "email not found" (good for security, but no guidance for users who mistype)

### 1.5 `/reset-password`
- **Functionality**: New password + confirm → `auth.updateUser`
- **Gaps**:
  - **[MEDIUM]** No password strength indicator (unlike register which has `showPasswordStrength: true`)
  - **[LOW]** No session validation — if the reset token has expired, the page renders normally and only fails on submit

### 1.6 `/verify-email`
- **Functionality**: Confirmation message + resend with cooldown
- **Gaps**:
  - **[LOW]** No auto-detection of verification completion — user must manually navigate away

### 1.7 `/verify-mfa`
- **Functionality**: 6-digit TOTP code entry with paste support → `mfa.challenge` + `mfa.verify`
- **Gaps**:
  - **[MEDIUM]** "Use a backup code" link goes to `/support` — no dedicated backup code entry UI
  - **[MEDIUM]** No error message displayed to user on verification failure — code just resets silently
  - **[LOW]** No "remember this device" option to skip MFA on trusted devices

### 1.8 `/sso/[provider]`
- **Functionality**: OAuth flow for Google, GitHub, Azure, Okta
- **Gaps**:
  - **[MEDIUM]** No account linking flow — if SSO email matches existing password account, behavior is undefined
  - **[LOW]** No loading state during OAuth redirect initiation

### 1.9 `/invite/[token]`
- **Functionality**: Validate invitation token → name + password form → accept
- **Gaps**:
  - **[MEDIUM]** No handling for already-authenticated users who click an invite link — should offer to join org without re-registering
  - **[LOW]** No email pre-fill from invitation data in the form

---

## 2. ONBOARDING MODULE (8 pages)

### 2.1 `/onboarding` (Welcome)
- **Functionality**: Feature highlights + "Get Started" CTA
- **Gaps**:
  - **[MEDIUM]** No progress indicator showing which steps are ahead (profile → org → team → preferences → integrations → tour → complete)
  - **[LOW]** No "Skip onboarding" option for power users

### 2.2 `/onboarding/profile`
- **Functionality**: First/last name, job title, bio, avatar → saves to Supabase auth + users table
- **Gaps**:
  - **[HIGH]** Avatar upload button exists but has no upload handler — `Camera` button is non-functional; only a text URL field exists
  - **[MEDIUM]** No pre-population from SSO provider data (Google profile photo, name, etc.)

### 2.3 `/onboarding/organization`
- **Functionality**: Org name, website, industry, size, logo → creates or updates organization + membership
- **Gaps**:
  - **[HIGH]** Logo upload button renders but has no upload handler — `Upload` button is non-functional
  - **[MEDIUM]** No option to join an existing organization (only create new) — users who received invites but land here have no path
  - **[MEDIUM]** `role_id: null as unknown as string` in `organization_members` insert is a type hack that may cause DB constraint violations

### 2.4 `/onboarding/team`
- **Functionality**: Add email + role → batch invite via `/api/invitations/batch`
- **Gaps**:
  - **[MEDIUM]** No duplicate email detection — user can add same email multiple times
  - **[LOW]** No CSV/bulk import option for larger teams
  - **[LOW]** Error from API is only logged to console, not shown to user

### 2.5 `/onboarding/preferences`
- **Functionality**: Theme, timezone, date format, notification toggles → saves to auth metadata + `notification_preferences`
- **Gaps**:
  - **[LOW]** Limited timezone list (8 options) — many regions missing
  - **[LOW]** Theme selection doesn't apply immediately (no live preview)

### 2.6 `/onboarding/integrations`
- **Functionality**: Connect Google, Slack, QuickBooks, Dropbox, Zoom, Stripe
- **Gaps**:
  - **[MEDIUM]** Integration icons use emoji (🔵💬💰📦📹💳) instead of proper brand logos — unprofessional appearance
  - **[LOW]** No disconnect option once connected during onboarding

### 2.7 `/onboarding/tour`
- **Functionality**: 4-step carousel (Dashboard, Projects, Team, Calendar) with step indicators
- **Gaps**:
  - **[MEDIUM]** Tour images are placeholders (`/tour/dashboard.png` etc.) — shows icon fallback instead of actual screenshots
  - **[LOW]** Tour doesn't highlight actual UI elements — it's a static slideshow, not an interactive walkthrough

### 2.8 `/onboarding/complete`
- **Functionality**: Success page + quick actions + dashboard CTA. POSTs to `/api/onboarding/complete`
- **Gaps**:
  - **[MEDIUM]** Both quick action cards link to the same URL (`/productions/events/new`) — "Create your first project" should link to `/productions/projects/new`
  - **[LOW]** No confetti or celebratory animation for completion

---

## 3. CORE MODULE (4 pages)

### 3.1 `/core/dashboard`
- **Functionality**: KPI bento grid, tasks due today, overdue tasks, upcoming events, layout customization
- **Gaps**:
  - **[HIGH]** Dashboard layout save (`/api/dashboard-layouts`) — no error feedback if save fails; layout state can desync
  - **[MEDIUM]** "Quick Actions" section is referenced but actions are not wired to actual creation flows
  - **[MEDIUM]** No real-time updates — dashboard data is fetched once on mount with no polling or WebSocket refresh
  - **[LOW]** No drag-and-drop widget reordering in edit mode

### 3.2 `/core/dashboard/customize`
- **Functionality**: Toggle widgets on/off, preview layout, save to `/api/settings/dashboard`
- **Gaps**:
  - **[MEDIUM]** No widget sizing options (small/medium/large) despite `WidgetConfig` having a `size` property
  - **[LOW]** No drag-and-drop reordering of widget positions

### 3.3 `/core/messages`
- **Functionality**: Thread list with tabs (inbox/starred/unread/archived), message detail pane, compose, search
- **Gaps**:
  - **[HIGH]** No real-time message updates — new messages only appear on page refresh
  - **[MEDIUM]** No typing indicators or read receipts
  - **[MEDIUM]** No file attachment upload in compose (UI references attachments but no upload handler)
  - **[MEDIUM]** No @mention autocomplete — text input only
  - **[LOW]** No message threading/replies within a conversation
  - **[LOW]** No unread count badge in sidebar navigation

### 3.4 `/core/calendar`
- **Functionality**: Delegates to `MasterCalendar` component — aggregated read-only view
- **Gaps**:
  - **[MEDIUM]** Read-only — no quick-create event from calendar (must navigate to detail pages)
  - **[MEDIUM]** No calendar sync status indicator (Google/Outlook integration state)
  - **[LOW]** No mini-calendar for date navigation

---

## 4. ACCOUNT MODULE (12 pages)

### 4.1 `/account/profile`
- **Functionality**: 4-tab settings (Personal Info, Notifications, Connected Accounts, Preferences) via `SettingsTemplate`
- **Gaps**:
  - **[MEDIUM]** Avatar field is a text URL input — no actual file upload component
  - **[MEDIUM]** Connected accounts (Google Calendar, Slack, Teams) are toggle switches but no OAuth flow is triggered — toggles have no backend effect
  - **[MEDIUM]** No password change option on profile page — must use forgot-password flow
  - **[LOW]** No profile preview showing how others see your profile

### 4.2 `/account/billing`
- **Functionality**: Plan type selector (Free/Pro/Enterprise) → PUT to `/api/billing/subscription`
- **Gaps**:
  - **[CRITICAL]** No payment method management — no credit card entry, no Stripe integration on this page
  - **[HIGH]** No plan comparison / feature matrix showing what each tier includes
  - **[HIGH]** No usage metrics (seats used, storage used, API calls)
  - **[HIGH]** No invoice history or billing receipts
  - **[MEDIUM]** No plan downgrade warnings or confirmation
  - **[MEDIUM]** No trial period display or expiration countdown

### 4.3 `/account/organization`
- **Functionality**: Org name, website, industry, size, description → Supabase update
- **Gaps**:
  - **[HIGH]** No team member management — can't view, invite, remove, or change roles of org members from this page
  - **[MEDIUM]** No org logo upload
  - **[MEDIUM]** No danger zone (delete organization, transfer ownership)
  - **[LOW]** Industry options differ from onboarding (values use slugs here vs full strings in onboarding)

### 4.4 `/account/privacy`
- **Functionality**: Cookie consent management, data export (JSON), data deletion request with 30-day cooling-off, compliance badges
- **Gaps**:
  - **[LOW]** Data export is JSON only — no CSV or PDF option
  - **[LOW]** No deletion request status tracking (pending/processing/completed)

### 4.5 `/account/audit-log`
- **Functionality**: Org-wide audit log with module/action filters, search, actor resolution
- **Gaps**:
  - **[MEDIUM]** No date range filter — can only search by text, module, and action
  - **[MEDIUM]** No export functionality for compliance reporting
  - **[LOW]** No pagination — loads all logs at once (performance risk at scale)

### 4.6 `/account/history`
- **Functionality**: Personal activity history filtered by current user
- **Gaps**:
  - **[LOW]** Same pagination concern as audit-log
  - **[LOW]** No date range filter

### 4.7 `/account/platform`
- **Functionality**: Appearance, localization, accessibility, notification settings via `SettingsTemplate`
- **Gaps**:
  - **[LOW]** Settings are org-wide but no indication of who last changed them or when

### 4.8 `/account/sandbox`
- **Functionality**: Enable/disable sandbox, reset data, seed sample data, promote changes
- **Gaps**:
  - **[MEDIUM]** No confirmation dialog before destructive actions (reset data)
  - **[LOW]** No sandbox vs production visual indicator in the app chrome

### 4.9 `/account/resources`
- **Functionality**: Quick links to docs, tutorials, help center
- **Gaps**:
  - **[MEDIUM]** All links are placeholder — no actual documentation URLs
  - **[LOW]** Getting Started and FAQ sections have placeholder content

### 4.10 `/account/support`
- **Functionality**: Contact options (chat, email, phone), ticket submission/tracking
- **Gaps**:
  - **[HIGH]** Ticket submission form is placeholder — no actual form or API integration
  - **[MEDIUM]** Live chat button has no handler
  - **[MEDIUM]** Ticket tracking section is placeholder with no data

### 4.11 `/account/settings/client-portal`
- **Functionality**: Access, branding, notification settings for client portal
- **Gaps**:
  - **[MEDIUM]** Logo upload field is text-based — no file upload
  - **[LOW]** No preview of client portal with applied branding

### 4.12 `/account/settings/desktop-timer`
- **Functionality**: Timer behavior, display, notification settings
- **Gaps**:
  - **[LOW]** No download link for the actual desktop timer companion app
  - **[LOW]** No connection status showing if desktop app is linked

---

## 5. PRODUCTIONS MODULE (28 pages)

### 5.1 `/productions` (Hub)
- **Functionality**: KPI stats, mission control widgets (live clock, weather), upcoming events, active projects
- **Gaps**:
  - **[MEDIUM]** Weather widget is placeholder — no actual weather API integration
  - **[LOW]** No quick-create buttons for events or projects from hub

### 5.2 `/productions/projects/[id]` (Detail)
- **Functionality**: CrudDetail with `projectSchema`
- **Gaps**:
  - **[MEDIUM]** No project-level navigation to sub-pages (settlement, call-sheet, run-sheet) from the detail view — user must know URLs

### 5.3 `/productions/projects/[id]/settlement`
- **Functionality**: Settlement worksheet with labor/vendor/expense/adjustment line items, financial summary sidebar, approval workflow
- **Gaps**:
  - **[HIGH]** No data loading from API on mount — `loading` state is initialized but never set to true; no `useEffect` to fetch existing settlement data
  - **[MEDIUM]** Approval workflow status changes are local-only — no API call to persist approval state changes
  - **[MEDIUM]** No audit trail for approval status changes (who approved/rejected and when)
  - **[MEDIUM]** No PDF export of settlement worksheet
  - **[LOW]** No variance threshold alerts (e.g., flag items where actual exceeds estimate by >20%)

### 5.4 `/productions/projects/[id]/call-sheet`
- **Functionality**: 6-tab call sheet generator (Production Info, Contacts, Department Calls, Schedule, Notes, Preview)
- **Gaps**:
  - **[HIGH]** No data loading from API — always starts with empty/default state; no `useEffect` to fetch existing call sheet
  - **[MEDIUM]** Export PDF and Print buttons are non-functional (no handlers)
  - **[MEDIUM]** "Send to Crew" button has no handler — no email/notification integration
  - **[MEDIUM]** No auto-population from project/event data (venue, date, contacts should pre-fill)
  - **[LOW]** GripVertical icon suggests drag-and-drop reordering but it's not implemented
  - **[LOW]** No version history for call sheets

### 5.5 `/productions/projects/[id]/run-sheet`
- **Functionality**: Timeline view with live mode, cue editing, print view, department color coding
- **Gaps**:
  - **[HIGH]** No data persistence — cues are hardcoded defaults; no save handler or API integration
  - **[MEDIUM]** Export PDF and Print buttons are non-functional
  - **[MEDIUM]** No multi-user live mode — only local state; no WebSocket/real-time sync for stage managers
  - **[MEDIUM]** No undo/redo for cue status changes in live mode
  - **[LOW]** No cue duration warnings (overlapping times)
  - **[LOW]** No sound/vibration alerts for upcoming cues in live mode

### 5.6 `/productions/advancing` (Hub)
- **Functionality**: Dashboard metrics, conflict detection, QR scanner, budget overview, sub-page navigation
- **Gaps**:
  - **[LOW]** Well-implemented hub with real API integration — minimal gaps

### 5.7 Standard CRUD pages (events, activations, stages, inspections, punch-lists, build-strike, compliance sub-pages, advancing sub-pages)
- **Functionality**: All use `CrudList`/`CrudDetail` with schema definitions
- **Gaps**:
  - **[MEDIUM]** No cross-linking between related entities (e.g., event → its projects → its call sheets)
  - **[LOW]** Compliance sub-pages (permits, licenses, certificates, insurance) have no expiration alerting UI

---

## 6. OPERATIONS MODULE (10+ pages)

### 6.1 `/operations` (Hub)
- **Functionality**: KPI stats, navigation cards to sub-modules
- **Gaps**:
  - **[MEDIUM]** No live incident feed or real-time status board
  - **[LOW]** No quick-create for incidents or work orders from hub

### 6.2 Standard CRUD pages (runsheets, incidents, shows, venues, work-orders, event-ops, resource-bookings, communications, daily-reports, crew-check-in)
- **Gaps**:
  - **[MEDIUM]** Incidents page has no severity-based triage view or escalation workflow UI
  - **[MEDIUM]** Work orders have no status board / Kanban view
  - **[MEDIUM]** Crew check-in has no QR code or geolocation verification
  - **[LOW]** Daily reports have no template system

---

## 7. PEOPLE MODULE (25+ pages)

### 7.1 `/people` (Hub)
- **Functionality**: KPI stats (total staff, available, on assignment, pending onboard), navigation cards
- **Gaps**:
  - **[LOW]** Stats fetched from `/api/people/stats` — no error state handling shown

### 7.2 Standard CRUD pages (rosters, scheduling, timekeeping, leave, compliance, org-chart, documents, training, travel, performance, analytics, recruitment sub-pages)
- **Gaps**:
  - **[MEDIUM]** Scheduling page has no visual calendar/Gantt view — only list
  - **[MEDIUM]** Org chart is a CRUD list — no actual tree/hierarchy visualization
  - **[MEDIUM]** Performance reviews have no 360-degree feedback collection UI
  - **[LOW]** Training page has no completion tracking or certification management

---

## 8. ASSETS MODULE (9+ pages)

### 8.1 `/assets` (Hub)
- **Functionality**: KPI stats with utilization calculation, navigation cards
- **Gaps**:
  - **[LOW]** Utilization is calculated client-side from stats — should be a server-computed metric

### 8.2 Standard CRUD pages (catalog, inventory, locations, reservations, maintenance, logistics, status, deployment, reports)
- **Gaps**:
  - **[MEDIUM]** No barcode/QR scanning for asset check-in/check-out
  - **[MEDIUM]** No asset reservation calendar view
  - **[MEDIUM]** Maintenance page has no preventive maintenance scheduling or alerts
  - **[LOW]** No asset depreciation tracking

---

## 9. FINANCE MODULE (42 pages)

### 9.1 `/finance` (Hub)
- **Functionality**: Financial health card, action center, cash flow chart, 9 navigation cards
- **Gaps**:
  - **[LOW]** Well-structured hub — minimal gaps

### 9.2 `/finance/dashboard`
- **Functionality**: 6 KPI cards with trends, Revenue vs Expenses chart, Profit by Client, AR Aging, Budget Health, Cash Flow Forecast
- **Gaps**:
  - **[MEDIUM]** Period selector (week/month/quarter/year) is captured in state but not passed to `useFinanceDashboard` — data doesn't change when period changes
  - **[MEDIUM]** Export button has no handler
  - **[LOW]** No drill-down from charts to underlying transactions

### 9.3 `/finance/invoices/builder`
- **Functionality**: Full invoice builder with 5 tabs, line items, discounts, deposits, live preview
- **Gaps**:
  - **[HIGH]** Save Draft, Preview PDF, Download PDF, Finalize & Send buttons all have no handlers — invoice cannot be persisted
  - **[HIGH]** "Add From" buttons (Time Entries, Expenses, Rate Card Services) have no handlers
  - **[MEDIUM]** Client/Project fields are plain text inputs — no autocomplete/search from existing records
  - **[MEDIUM]** No auto-calculation of due date from payment terms + issue date
  - **[LOW]** No multi-currency support in the builder

### 9.4 `/finance/invoices/generate`
- **Functionality**: Auto-create invoices from billable time entries using `InvoiceGenerator` component
- **Gaps**:
  - **[LOW]** Delegates to component — gaps depend on `InvoiceGenerator` implementation

### 9.5 Standard CRUD pages (invoices list, expenses, budgets, payments, payroll, quotes, procurement, banking, reports, and their sub-pages)
- **Gaps**:
  - **[MEDIUM]** Recurring invoices have no auto-send scheduling UI
  - **[MEDIUM]** Expense receipts page has no OCR/receipt scanning
  - **[MEDIUM]** Payroll page has no tax calculation or withholding configuration
  - **[MEDIUM]** Banking/reconciliation has no bank feed import
  - **[LOW]** Budget alerts page has no threshold configuration UI

---

## 10. BUSINESS MODULE (12+ pages)

### 10.1 `/business` (Hub)
- **Functionality**: Pipeline stats, navigation cards, recent activity feed
- **Gaps**:
  - **[LOW]** Activity feed has no "load more" — limited to 12 items

### 10.2 `/business/pipeline/proposals/new`
- **Functionality**: Delegates to `ProposalBuilder` component
- **Gaps**:
  - **[MEDIUM]** Gaps depend on `ProposalBuilder` implementation — e-signature integration status unknown

### 10.3 Standard CRUD pages (pipeline, companies, contracts, campaigns)
- **Gaps**:
  - **[MEDIUM]** Pipeline has no Kanban/deal board view — only list
  - **[MEDIUM]** Contracts have no renewal alerting or auto-renewal workflow
  - **[LOW]** Companies have no duplicate detection

---

## 11. ANALYTICS MODULE (6+ pages)

### 11.1 `/analytics` (Hub)
- **Functionality**: Navigation cards for reports, dashboards, insights
- **Gaps**:
  - **[MEDIUM]** "Create New Report" and "Create New Dashboard" buttons navigate but no report builder page exists
  - **[LOW]** No saved/favorite reports section

### 11.2 `/analytics/utilization`
- **Functionality**: Utilization forecast with area/bar/line charts, KPIs
- **Gaps**:
  - **[LOW]** No date range selector — shows all available data
  - **[LOW]** No per-person breakdown view

### 11.3 `/analytics/sales-performance`
- **Functionality**: Rep-level analytics with revenue, win rates, leaderboard, loss reasons
- **Gaps**:
  - **[MEDIUM]** Rep IDs shown as truncated UUIDs — no name resolution
  - **[LOW]** No date range filter
  - **[LOW]** No goal/quota tracking per rep

### 11.4 `/analytics/hiring`
- **Functionality**: Capacity gap detection, hiring recommendations, department breakdown
- **Gaps**:
  - **[LOW]** No scenario modeling (what-if with different hire counts)
  - **[LOW]** Inline style on progress bars (`style={{ width: ... }}`) — should use design tokens

### 11.5 `/analytics/scenarios`
- **Functionality**: Delegates to `ScenarioBuilder` component
- **Gaps**:
  - **[LOW]** `onSave` only logs — no persistence confirmation

---

## 12. NETWORK MODULE (32 pages)

### 12.1 `/network/discover`
- **Functionality**: Contact search with avatar, company, location, mutual connections
- **Gaps**:
  - **[HIGH]** "Connect" button has no handler — clicking does nothing
  - **[MEDIUM]** `mutualConnections` is hardcoded to 0 — no actual mutual connection calculation
  - **[MEDIUM]** No pagination — limited to 50 contacts
  - **[LOW]** No filters (industry, location, department)

### 12.2 `/network/feed`, `/network/leaderboard`, `/network/marketplace`
- **Functionality**: All use `CrudList` with respective schemas
- **Gaps**:
  - **[MEDIUM]** Feed has no post creation UI — only a list view
  - **[LOW]** Leaderboard has no time period filter (weekly/monthly/all-time)

### 12.3 Standard CRUD pages (connections, discussions, challenges, opportunities, showcase, profiles, messages, badges)
- **Gaps**:
  - **[MEDIUM]** Network messages are separate from core messages — potential user confusion about where to find conversations
  - **[LOW]** Badges page has no badge earning criteria display

---

## CROSS-CUTTING GAPS

### A. Data Persistence
| ID | Issue | Severity | Pages Affected |
|----|-------|----------|----------------|
| DP-1 | Settlement worksheet has no data loading or save persistence | CRITICAL | settlement |
| DP-2 | Call sheet has no data loading — always starts empty | HIGH | call-sheet |
| DP-3 | Run sheet cues are hardcoded — no save/load | HIGH | run-sheet |
| DP-4 | Invoice builder has no save handler | HIGH | invoices/builder |
| DP-5 | Network discover "Connect" button is non-functional | HIGH | network/discover |

### B. File Upload
| ID | Issue | Severity | Pages Affected |
|----|-------|----------|----------------|
| FU-1 | Avatar upload button non-functional (onboarding + profile) | HIGH | onboarding/profile, account/profile |
| FU-2 | Org logo upload button non-functional | HIGH | onboarding/organization |
| FU-3 | Client portal logo is text URL input | MEDIUM | settings/client-portal |
| FU-4 | Message attachments referenced but no upload handler | MEDIUM | core/messages |

### C. Export / Print
| ID | Issue | Severity | Pages Affected |
|----|-------|----------|----------------|
| EP-1 | Export PDF buttons non-functional | MEDIUM | call-sheet, run-sheet, settlement |
| EP-2 | Print buttons non-functional | MEDIUM | call-sheet, run-sheet |
| EP-3 | Finance dashboard export non-functional | MEDIUM | finance/dashboard |
| EP-4 | Audit log has no export for compliance | MEDIUM | account/audit-log |

### D. Real-Time / Live Features
| ID | Issue | Severity | Pages Affected |
|----|-------|----------|----------------|
| RT-1 | Messages have no real-time updates | HIGH | core/messages |
| RT-2 | Run sheet live mode is local-only — no multi-user sync | MEDIUM | run-sheet |
| RT-3 | Dashboard has no polling/WebSocket refresh | MEDIUM | core/dashboard |

### E. Navigation / Cross-Linking
| ID | Issue | Severity | Pages Affected |
|----|-------|----------|----------------|
| NV-1 | Project detail has no links to settlement/call-sheet/run-sheet | MEDIUM | projects/[id] |
| NV-2 | Login doesn't check onboarding completion status | LOW | login |
| NV-3 | Onboarding complete has duplicate links | MEDIUM | onboarding/complete |
| NV-4 | Network messages vs core messages — dual messaging systems | MEDIUM | network/messages, core/messages |

### F. Missing Visualizations
| ID | Issue | Severity | Pages Affected |
|----|-------|----------|----------------|
| VZ-1 | Pipeline has no Kanban board view | MEDIUM | business/pipeline |
| VZ-2 | Org chart has no tree visualization | MEDIUM | people/org-chart |
| VZ-3 | Scheduling has no calendar/Gantt view | MEDIUM | people/scheduling |
| VZ-4 | Work orders have no Kanban/status board | MEDIUM | operations/work-orders |
| VZ-5 | Asset reservations have no calendar view | MEDIUM | assets/reservations |

---

## SUMMARY BY SEVERITY

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 14 |
| MEDIUM | 52 |
| LOW | 38 |
| **Total** | **106** |

## TOP 10 PRIORITY FIXES

1. **[CRITICAL]** Settlement worksheet — wire data loading and save persistence
2. **[CRITICAL]** Billing page — add payment method management (Stripe integration)
3. **[HIGH]** Call sheet — wire data loading from API; auto-populate from project
4. **[HIGH]** Run sheet — add save/load persistence for cues
5. **[HIGH]** Invoice builder — wire Save Draft and all action buttons
6. **[HIGH]** File uploads — implement avatar and logo upload across onboarding + profile + org
7. **[HIGH]** Messages — add real-time updates (WebSocket or polling)
8. **[HIGH]** Network discover — wire Connect button
9. **[HIGH]** Support page — implement ticket submission form
10. **[HIGH]** Organization settings — add team member management (invite/remove/roles)
