# ATLVS Post-Implementation Verification, Remediation & UI Surfacing Prompt
## Windsurf Follow-Up Directive — GHXSTSHIP Industries LLC

---

## CONTEXT

You have just completed the ATLVS × Productive.io feature parity implementation. This follow-up prompt executes a **three-pass audit** across every feature implemented in the previous sprint to ensure:

1. **VERIFY** — Every feature works end-to-end against real production lifecycle scenarios
2. **REMEDIATE** — Every violation of architecture standards, data integrity, or business logic is fixed
3. **SURFACE** — Every feature is accessible in the UI through reusable design system components with zero ad hoc code

This is a **zero-tolerance audit**. No feature ships with broken logic, orphaned data, inline styles, one-off components, or dead-end UI flows. Every path a user takes must complete its full lifecycle loop.

---

## GOVERNING PRINCIPLES (APPLY TO EVERY ACTION IN THIS PROMPT)

### Data Architecture — Non-Negotiable
- **Third Normal Form (3NF)**: No transitive dependencies. No repeated data groups. Every non-key column depends on the key, the whole key, and nothing but the key. If you find a table that stores a derived value (e.g., `total_cost` that could be computed from line items), remove it and replace with a computed view or real-time calculation.
- **Single Source of Truth (SSOT)**: Every data entity lives in exactly one table. No duplication across modules. If `People` and `Jobs` both reference a contact, they share the same `contacts` table via foreign key — not separate copies. Audit every foreign key relationship for correctness.
- **Row Level Security (RLS)**: Every table has RLS policies. Every query respects `organization_id` tenant isolation. No data leaks between orgs. Test by switching org context and confirming zero cross-contamination.
- **Soft Deletes**: All user-facing records use `deleted_at` timestamps. No hard deletes. Archived records remain queryable for reporting and audit trails.
- **Audit Trail**: All financial records (budgets, invoices, payments, expenses, time entries) have immutable append-only history tables. Every mutation creates a history record with `actor_id`, `action`, `previous_value`, `new_value`, `timestamp`.

### UI Architecture — Non-Negotiable
- **Design System Only**: Every UI element must use an existing ATLVS design system token or component. If a component doesn't exist, create it in the design system first, then consume it. Never inline.
- **No Ad Hoc CSS**: Zero `style={{}}` props. Zero one-off classNames. Zero component-local CSS modules that aren't part of the design system. All styling flows through design tokens (colors, spacing, typography, shadows, radii, breakpoints).
- **No Inline Styles**: This includes Tailwind utility classes used in non-standard combinations that create implicit one-off components. If you find yourself writing more than 5 utility classes on a single element, that's a component — extract it.
- **Reusable Components Only**: Every UI pattern that appears more than once must be a shared component. Tables, modals, forms, cards, status badges, metric widgets, timeline entries, empty states, loading states, error states — all from the design system.
- **Token-Driven Theming**: Colors, fonts, spacing, and elevation come from CSS custom properties / design tokens. No hardcoded hex values, pixel values, or font stacks outside the token layer.
- **Atomic Design Hierarchy**: Atoms → Molecules → Organisms → Templates → Pages. Audit every new component to confirm it sits at the correct level.

### Business Logic — Non-Negotiable
- **Production Lifecycle Awareness**: Every feature must understand where it sits in the production lifecycle: `Pitch → Pre-Production → Advance → Load-In → Show Day → Load-Out → Strike → Settlement → Post-Mortem`. Features that ignore this context are incomplete.
- **End-to-End Completion**: Every user flow must have a beginning, middle, and end. No dead-end screens. No forms that submit to nowhere. No status changes that don't trigger downstream effects. No reports that reference data that can't be created in the UI.
- **Bidirectional Navigation**: If you can navigate from Project → Budget, you must be able to navigate from Budget → Project. Every relationship is traversable in both directions from the UI.
- **Cascading Effects**: When a parent record changes, all dependent records update. When a budget is approved, related resource bookings become confirmed. When an event date changes, all task due dates shift. When a crew member is removed, their time entries are flagged for reassignment — not silently orphaned.

---

## PASS 1: FEATURE VERIFICATION SCAN

For **every feature** implemented in the previous sprint, execute the following verification protocol. Document results in a verification matrix.

### 1.1 — Data Layer Verification

For each new or modified database table:

```
□ Table follows 3NF — no transitive dependencies, no repeated groups
□ Primary key is UUID (not serial integer)
□ organization_id column exists with NOT NULL constraint
□ RLS policy exists and enforces organization_id isolation
□ created_at, updated_at, deleted_at columns exist
□ created_by column references auth.users
□ All foreign keys have ON DELETE SET NULL or ON DELETE RESTRICT (never CASCADE for user-facing data)
□ Indexes exist on: organization_id, created_at, all foreign keys, all columns used in WHERE clauses
□ No duplicate data that exists in another table (SSOT violation)
□ No stored computed values that should be derived at query time
□ Financial tables have companion _history audit table
□ Enum values use a lookup table or Supabase enum type — not raw strings
□ All text fields have appropriate length constraints
□ All monetary values stored as BIGINT (cents) or NUMERIC(19,4) — never FLOAT
□ Timestamps are TIMESTAMPTZ (timezone-aware)
```

### 1.2 — API Layer Verification

For each endpoint (Edge Function, RPC, or client-side query):

```
□ Input validation exists for all parameters
□ Authorization check confirms user belongs to organization
□ Permission check confirms user has required role for this action
□ Error responses use consistent error schema: { code, message, details }
□ Successful responses use consistent schema with pagination where applicable
□ No N+1 query patterns — use joins or batch fetches
□ Optimistic locking on concurrent-edit-prone records (budgets, schedules)
□ Rate limiting on write endpoints
□ Audit log entry created for all mutations on financial/sensitive data
□ Real-time subscription channel exists for collaborative features
□ Response time under 200ms for reads, under 500ms for writes
```

### 1.3 — Business Logic Verification

For each feature, trace the **complete user story** through the production lifecycle:

#### PROJECT MANAGEMENT
```
□ Can create project with production type (festival, brand activation, concert, corporate, theater, immersive)
□ Production phase auto-populates based on project type with correct task templates
□ Phase transition triggers downstream automations (status changes, notifications, task unlocks)
□ Gantt dependencies adjust correctly when dates shift (including skip-weekends logic)
□ Task templates include department-specific defaults (Audio, Lighting, Video, Staging, etc.)
□ Call sheet generates from assigned people + schedule data with correct formatting
□ Run sheet view displays minute-by-minute timeline for show day
□ Critical path is highlighted and updates dynamically
□ Project completion triggers settlement workflow automatically
□ Archived projects remain accessible for reporting and post-mortem
□ Duplicating a project carries forward templates but resets dates and assignments
```

#### TIME TRACKING
```
□ Timer start → stop creates time entry linked to correct task, project, and budget
□ Manual entry allows retroactive logging with date picker
□ Timesheet view shows weekly grid with daily totals and project breakdown
□ Billable vs. non-billable classification auto-applies based on budget type
□ Overtime calculates correctly per rate card rules (1.5x after 8hrs, 2x after 12hrs, etc.)
□ Meal penalty auto-flags when 6+ hours pass without break logged
□ Turnaround violation alerts when less than 10 hours between crew call times
□ Approved time entries lock and cannot be edited without admin override
□ Time entries flow into budget actuals in real-time
□ Time entries attach to invoices correctly with line-item detail
□ Crew check-in/check-out timestamps match time entry bookends
□ Per diem and travel days track separately from work hours
```

#### BUDGETING & FINANCIAL MANAGEMENT
```
□ Budget creation supports all types: Fixed-price, T&M, Retainer, Hybrid
□ Production budget categories are complete: Talent, Labor, Equipment, Venue, Catering, Transport, Lodging, Supplies, Permits/Insurance, Contingency, Agency Fee, Markup
□ Rate cards apply correctly per role, per event type, per client
□ Budget phases split correctly and roll up to project total
□ Expense entry → approval → budget deduction flows end-to-end
□ Purchase order creation → vendor assignment → receipt → reconciliation completes
□ Real-time burn rate updates as time entries and expenses are logged
□ Profitability view shows: Revenue − (Labor Cost + Expenses + Overhead) = Margin
□ Budget alerts fire at configured thresholds (50%, 75%, 90%, 100%)
□ Scenario builder saves and compares multiple budget models
□ Settlement worksheet auto-generates from actuals at project close
□ Variance analysis (estimated vs. actual) calculates per line item and per category
□ Multi-currency conversions use correct exchange rates at transaction date
□ Fiscal year close locks financial records and prevents retroactive edits
□ Client markup/agency fee calculates correctly across all budget types
```

#### INVOICING & BILLING
```
□ Invoice draft creates from budget with correct line items and amounts
□ Progressive billing milestones trigger draft invoices at correct production phases
□ Deposit schedule (50/25/25 or custom splits) tracks payments against totals
□ Tax calculation applies correctly per line item
□ Credit notes offset original invoices and update outstanding balance
□ Send-to-client delivers email with PDF attachment
□ Payment recording marks invoice as partial or fully paid
□ Overdue invoice triggers automated payment reminder sequence
□ Settlement invoice reconciles all actuals and generates final bill
□ Invoice status history tracks: Draft → Finalized → Sent → Viewed → Partial → Paid
□ Multi-budget invoicing combines line items with correct budget attribution
□ Timesheet attachment includes detailed hour breakdown per person per day
□ Invoice custom fields render correctly in PDF export
□ Revenue recognition books income at correct accounting period
```

#### CRM / SALES PIPELINE
```
□ Deal creation captures: client, production type, estimated value, probability, close date
□ Pipeline stages advance with drag-and-drop on Kanban view
□ Deal probability auto-calculates weighted revenue forecast
□ Convert-to-project creates project with correct type, budget template, and team
□ Proposal PDF exports with branding, scope, pricing, and terms
□ Email attachment to deal links communication history
□ Tentative hold management tracks first/second hold with expiration
□ Multi-year deal tracking shows recurring event history
□ Win/loss analytics capture reason codes and competitive intelligence
□ Revenue forecast aggregates across pipeline by month/quarter/year
□ Client relationship timeline shows all touchpoints across deals and projects
□ RFP deadline tracking with automated reminders
```

#### RESOURCE PLANNING & SCHEDULING
```
□ Person booking creates visual block on resource timeline
□ Conflict detection prevents double-booking same person on overlapping dates
□ Tentative vs. confirmed bookings display with distinct visual treatment
□ Role-based scheduling fills slots by role type, not just named individuals
□ Skill/certification filter narrows candidate pool for specialized roles
□ Travel days auto-insert based on venue distance from crew home base
□ Equipment booking integrates with inventory and shows availability
□ Utilization percentage calculates correctly: booked hours / available hours
□ Overbooking triggers alert — does not silently allow
□ Split booking divides a person's time across concurrent projects correctly
□ Placeholder booking allows "TBD Rigger" until specific person is assigned
□ Resource plan links to budget — booking cost updates budget forecast in real-time
□ Crew confirmation workflow sends offer → tracks accept/decline → confirms assignment
□ Day-of roster generates from confirmed bookings with check-in status
```

#### PEOPLE MANAGEMENT
```
□ Employee profile contains: personal info, rate cards, certifications, ratings, availability
□ Contractor profile includes: W-9 status, COI expiration, NDA status, payment terms
□ Certification expiration alerts fire 30/14/7 days before expiry
□ Crew rating system captures per-gig feedback with aggregate score
□ Time off request → approval → calendar block → resource planner update flows end-to-end
□ Organization chart reflects reporting hierarchy accurately
□ Freelancer availability submission allows self-service date blocking
□ Emergency contact info is accessible to on-site PM role but hidden from other roles
□ Deactivated people remain in historical data but are excluded from new assignments
□ Employee custom fields render in profile, reports, and filters consistently
```

#### DOCS & COLLABORATION
```
□ Document creation from template pre-populates project-specific data
□ Call sheet template pulls: project, date, venue, crew list, call times, contacts, weather
□ Run sheet template pulls: timeline, cues, responsible parties, contingencies
□ Settlement sheet template pulls: budget, actuals, variance, invoice status
□ Real-time collaborative editing shows presence indicators and cursors
□ Client portal shows only documents tagged as client-visible
□ Version history allows rollback to any previous save
□ Digital sign-off creates immutable record with timestamp and signer identity
□ Photo/video uploads attach to correct project and are searchable
□ AI writing assistance operates within document editor context
```

#### REPORTING & ANALYTICS
```
□ Every report type references data that can be created and populated through the UI
□ Show P&L report accurately calculates: Revenue − COGS − Overhead = Net Profit per event
□ Utilization report matches resource planner data exactly (no drift)
□ Client profitability ranking aggregates across all projects for each client
□ Year-over-year comparison pulls equivalent date ranges correctly
□ Vendor spend analysis matches sum of all POs and expenses per vendor
□ Dashboard widgets pull live data — no stale cache without refresh mechanism
□ Report export (PDF, CSV, XLS) formats correctly with all columns and calculations
□ Automated report delivery (Pulse) sends on configured schedule to correct recipients
□ AI report generation produces valid queries from natural language descriptions
□ Drilldown from chart → underlying data rows works for all chart types
□ Multi-currency reports convert at correct historical exchange rates
□ Formula fields calculate correctly across grouped and pivoted data
```

#### INTEGRATIONS & AUTOMATION
```
□ API endpoints return correct data with proper auth headers
□ Webhook payloads include all relevant fields and fire on correct triggers
□ Calendar sync creates/updates/deletes events bidirectionally
□ Slack notifications deliver to correct channels with actionable formatting
□ Accounting integration maps chart of accounts correctly
□ Automation triggers fire reliably on configured conditions
□ Automation actions complete without silent failures
□ Error handling on integration failures notifies admin and queues for retry
□ OAuth token refresh prevents expired-token failures on long-running integrations
□ Rate limiting respects third-party API limits with exponential backoff
```

#### SECURITY & ADMINISTRATION
```
□ RBAC enforces: Org Admin > Production Manager > Dept Head > Crew Lead > Crew > Client > Vendor
□ Each role sees only permitted menu items, data, and actions
□ Client role cannot access internal budgets, crew rates, or margin data
□ Vendor role sees only their own POs, invoices, and assigned tasks
□ Time-bound access expires crew accounts after event end date + configured buffer
□ Audit log captures all admin actions with before/after state
□ SSO login completes successfully and provisions user with correct role
□ 2FA enrollment and verification works on web and mobile
□ Permission changes take effect immediately (no stale session cache)
□ Sandbox environment is isolated from production data completely
```

#### MOBILE APP
```
□ All critical workflows function on iOS and Android
□ Offline mode queues mutations and syncs when connectivity returns
□ Conflict resolution on sync handles concurrent edits gracefully
□ Crew check-in captures GPS coordinates and timestamps correctly
□ Photo capture attaches to correct task/issue with metadata
□ Push notifications deliver within 5 seconds of trigger event
□ Day-of run sheet updates in real-time via WebSocket/Realtime subscription
□ QR code scanner identifies equipment and links to correct asset record
□ Performance is acceptable on 3G connectivity (common at outdoor venues)
```

---

## PASS 2: REMEDIATION PROTOCOL

For every failure identified in Pass 1, apply the following remediation framework:

### 2.1 — Data Layer Remediation

```sql
-- PATTERN: Fix SSOT violations
-- If duplicate data exists, determine the canonical table,
-- migrate all references to foreign keys, drop the duplicate columns.

-- PATTERN: Fix missing RLS
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;
CREATE POLICY "{table_name}_org_isolation" ON {table_name}
  FOR ALL USING (organization_id = (SELECT organization_id FROM auth.users WHERE id = auth.uid()));

-- PATTERN: Fix missing audit trail
CREATE TABLE {table_name}_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES {table_name}(id),
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('CREATE','UPDATE','DELETE','RESTORE')),
  previous_value JSONB,
  new_value JSONB,
  changed_fields TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATTERN: Fix monetary storage
-- Replace FLOAT/DECIMAL with BIGINT (store cents) or NUMERIC(19,4)
ALTER TABLE {table_name} ALTER COLUMN {amount_column} TYPE NUMERIC(19,4);

-- PATTERN: Fix 3NF violations
-- Remove computed/derived columns, create views instead
CREATE VIEW {table_name}_computed AS
SELECT *, (column_a - column_b) AS derived_value FROM {table_name};
```

### 2.2 — UI Layer Remediation

For every UI violation found, apply this decision tree:

```
Is it an inline style?
  → Extract to design token + utility class or component prop

Is it a one-off component?
  → Does a similar pattern exist in the design system?
    → YES: Replace with existing component, extend props if needed
    → NO: Create new design system component, then consume it

Is it a hardcoded color/font/spacing value?
  → Replace with design token reference: var(--color-*), var(--space-*), var(--font-*)

Is it more than 5 Tailwind classes on one element?
  → Extract to named component in design system

Is it a state (loading, empty, error) without a standardized treatment?
  → Use design system state components: <LoadingState />, <EmptyState />, <ErrorState />

Is it a form without validation?
  → Add schema validation (Zod) with design system error display components

Is it a modal/drawer/popover created ad hoc?
  → Replace with design system overlay component

Is it a data table without sorting/filtering/pagination?
  → Replace with design system DataTable component with full feature set
```

### 2.3 — Business Logic Remediation

For every broken user flow or missing cascading effect:

```
1. Map the complete lifecycle of the data entity:
   Creation → Validation → Storage → Display → Mutation → Side Effects → Archival

2. Identify the break point:
   - Does creation fail? → Fix form/API/validation
   - Does display fail? → Fix query/component/permissions
   - Does mutation fail? → Fix update logic/optimistic UI/conflict resolution
   - Do side effects fail? → Fix triggers/webhooks/automation engine
   - Does archival fail? → Fix soft delete/cascade/history logging

3. Trace upstream and downstream:
   - What creates this data? Ensure that creator exists and works.
   - What consumes this data? Ensure all consumers handle all states (null, pending, active, archived).
   - What depends on this data? Ensure all dependents update when this data changes.

4. Test the production lifecycle path:
   - Can this feature be used during Load-In at an outdoor venue with spotty WiFi?
   - Can this feature handle a 3-day festival with 200 crew members and 50 vendors?
   - Can this feature generate correct financial data for a $2M production?
   - Can a client see only what they should see?
   - Can a crew lead use this on their phone between sets?
```

---

## PASS 3: UI SURFACING AUDIT

Every implemented feature must be **discoverable and accessible** in the UI. A feature that exists in the database but has no path to it from the interface does not exist to the user.

### 3.1 — Navigation Audit

For each module, verify the complete navigation tree:

```
DASHBOARD
  □ All new widgets are available in the widget picker
  □ Dashboard customization (add/remove/reorder widgets) works
  □ Each widget links to its detail view (click-through to source data)
  □ Real-time data updates without manual refresh

PROJECTS
  □ All project views accessible: Kanban, List, Gantt, Calendar, Table, Timeline
  □ Production phase indicator visible on project header
  □ Phase transition controls accessible to PM role
  □ Department filter available in all views
  □ Call sheet and run sheet generators accessible from project actions menu
  □ Task automations configurable from project settings
  □ Template library accessible from project creation flow

PEOPLE
  □ Directory shows all active employees and contractors
  □ Crew search filters by: skill, certification, availability, rating, rate
  □ Profile detail includes: info, rates, certs, ratings, history, documents
  □ Availability calendar accessible per person and aggregate
  □ Time off request flow accessible to all roles
  □ Crew rating submission accessible after project close

RESOURCES
  □ Asset catalog browsable and searchable
  □ Equipment booking accessible from resource planner and project view
  □ Maintenance schedule visible on asset detail
  □ QR code generation accessible per asset
  □ Kit builder accessible for creating equipment packages

JOBS (CRM)
  □ Pipeline board shows all stages with deal cards
  □ Deal detail includes: client, value, probability, documents, emails, tasks
  □ Convert-to-project button accessible on qualified deals
  □ Proposal builder accessible from deal actions
  □ Client relationship timeline visible on company detail
  □ Revenue forecast visible in pipeline analytics view

MONEY
  □ Budget list with status indicators (on track, at risk, over budget)
  □ Budget detail with phase breakdown, actuals, forecast, profitability
  □ Expense submission accessible to all roles with receipt upload
  □ Invoice list with status filters (draft, sent, overdue, paid)
  □ Invoice builder with line items, tax, attachments
  □ Settlement worksheet accessible from completed projects
  □ Rate card management in settings
  □ Payment recording accessible on invoice detail

ANALYTICS
  □ Report library browsable by category (financial, utilization, project, custom)
  □ Report builder accessible with field picker, filters, grouping, formulas
  □ Dashboard builder accessible with widget drag-and-drop
  □ Export buttons (PDF, CSV, XLS) present on all reports and dashboards
  □ Automated report scheduling accessible in report settings
  □ AI report generator accessible from report builder

LEGEND (Admin)
  □ Role management with permission matrix
  □ Organization settings accessible
  □ Integration management with connection status
  □ Automation rule builder accessible
  □ Audit log browsable with filters
  □ Sandbox toggle accessible to admin role

PROFILE
  □ Personal info, notification preferences, connected accounts
  □ Time tracking history and current timer
  □ Message inbox with threading
  □ Integration connection management (personal: calendar, email)
```

### 3.2 — Cross-Module Link Audit

Verify that every entity is reachable from every module that references it:

```
□ Project → Budget(s): clickable link from project detail to each budget
□ Budget → Project: clickable link from budget detail back to project
□ Budget → Invoice(s): clickable link from budget to generated invoices
□ Invoice → Budget: clickable link from invoice back to source budget
□ Invoice → Time Entries: expandable section showing attached time records
□ Time Entry → Task: clickable link to the task the time was logged against
□ Time Entry → Budget: clickable link to the budget the time affects
□ Task → Person: clickable assignee link to person profile
□ Person → Projects: list of all projects this person is assigned to
□ Person → Time Entries: complete history of logged time
□ Person → Bookings: all resource planner bookings for this person
□ Deal → Client: clickable link to company record
□ Deal → Project: clickable link (post-conversion) to resulting project
□ Client → Deals: list of all pipeline deals for this client
□ Client → Projects: list of all projects for this client
□ Client → Invoices: list of all invoices for this client
□ Vendor → POs: list of all purchase orders for this vendor
□ Vendor → Expenses: list of all expenses attributed to this vendor
□ Equipment → Bookings: list of all resource planner bookings for this asset
□ Equipment → Projects: list of all projects this asset is assigned to
□ Report → Source Data: drilldown from any aggregate to underlying records
```

### 3.3 — State Completeness Audit

Every view must handle all possible states:

```
□ LOADING: Skeleton loaders or spinner from design system (never blank screen)
□ EMPTY: Contextual empty state with illustration and call-to-action (never "No data")
□ ERROR: Error boundary with retry action and support escalation (never raw stack trace)
□ PERMISSION DENIED: Graceful message explaining what role is needed (never blank/404)
□ OFFLINE: Queue indicator showing pending sync count (never silent failure)
□ PARTIAL: Loading indicators on individual widgets that load independently
□ STALE: Visual indicator when data may be outdated (e.g., "Last updated 5m ago")
```

### 3.4 — Component Registry Verification

Produce a final registry of all UI components used across the implementation. Flag any that are NOT in the design system:

```
Component Name | Design System? | Instances Used | Action Required
─────────────────────────────────────────────────────────────────
DataTable      | ✅ YES         | 47             | None
BudgetCard     | ✅ YES         | 12             | None
CustomToggle   | ❌ NO          | 3              | Extract to design system
InlineChart    | ❌ NO          | 8              | Extract to design system
...
```

**Every component flagged ❌ must be extracted into the design system before this audit is considered complete.**

---

## DELIVERABLES

Upon completion of all three passes, produce:

### 1. Verification Matrix (Spreadsheet or Markdown Table)
- Every feature listed with PASS/FAIL status
- Failure reason and severity (Critical/Important/Enhancement)
- Remediation action taken
- Post-remediation status

### 2. Remediation Log
- Every fix applied with: what changed, why, before/after state
- Database migrations generated
- Components created or modified in design system

### 3. UI Surface Map
- Complete sitemap showing every screen, every navigation path, every cross-module link
- Annotated with which features are accessible from each screen
- Highlighted orphan features (implemented but unreachable) — these must be fixed

### 4. Component Audit Report
- Complete registry of all components used
- Design system compliance percentage (target: 100%)
- List of newly created design system components

### 5. Production Scenario Test Results
- Minimum 3 end-to-end scenarios tested:
  - **Scenario A**: Single-day brand activation ($150K budget, 25 crew, 8 vendors)
  - **Scenario B**: 3-day music festival ($2M budget, 200 crew, 50 vendors, 5 stages)
  - **Scenario C**: 10-city corporate tour ($500K budget, 15 crew, recurring monthly)
- Each scenario traced from deal creation through settlement with all features exercised

---

## EXECUTION ORDER

```
1. Run Pass 1 (Verification) — document all findings, do not fix yet
2. Prioritize findings: Critical → Important → Enhancement
3. Run Pass 2 (Remediation) — fix all Critical, then Important, then Enhancement
4. Run Pass 3 (UI Surfacing) — ensure every fix is accessible in the interface
5. Re-run Pass 1 on remediated features — confirm all now PASS
6. Produce deliverables
7. Flag any items that require architectural decisions beyond this scope
```

**Begin with Pass 1. Scan every module systematically. Do not skip any checklist item. Document everything before making any changes.**