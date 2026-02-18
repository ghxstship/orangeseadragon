# ATLVS Page-by-Page UI Normalization, Optimization & Business Logic Completion
## Windsurf Follow-Up Directive #2 — GHXSTSHIP Industries LLC

---

## MISSION

Open **every single page** in ATLVS. Review it. Analyze what's there, what's missing, what's inconsistent, and what's suboptimal. Then normalize and optimize every page so the entire platform feels like **one product built by one team in one sprint** — not a patchwork of features bolted together over time.

The experience standard is defined by four reference products. Every page in ATLVS must meet or exceed the combined standard of all four:

| Reference | What We Take From It |
|-----------|---------------------|
| **NetSuite** | Depth of business logic. Every field has a reason. Every form captures what finance, operations, and compliance actually need. Nothing is decorative — every element drives a business outcome. Record types have complete lifecycle management with status transitions, approval chains, and downstream automation. |
| **ClickUp** | Breadth of data views and visualizations. Every dataset can be viewed as: List, Board/Kanban, Table, Gantt, Calendar, Timeline, Workload, Activity, Mind Map, Whiteboard, Dashboard, and Embedded views. Users switch between views instantly. Views remember user preferences. Custom fields render in every view. |
| **Productive.io** | Lifecycle completeness. A deal flows into a project flows into budgets flows into time tracking flows into invoicing flows into reporting. Nothing is siloed. Every module feeds every other module. Financial data is always one click away from operational data. |
| **Spotify + UberEats** | Intuitiveness and delight. Zero learning curve for core actions. Progressive disclosure — simple surface, depth on demand. Contextual actions appear where you need them. Navigation feels like muscle memory after 5 minutes. Search finds everything. Empty states teach. Loading states entertain. The app feels fast even when it isn't. |

---

## GOVERNING STANDARDS

### Layout Consistency Protocol

Every page in ATLVS follows ONE of these standardized layout templates. No page may invent its own layout.

```
LAYOUT A — "Collection View" (List/Board/Table pages)
┌─────────────────────────────────────────────────────────┐
│ [Module Icon] Page Title          [+ Create] [⚙ Settings]│
│ ─────────────────────────────────────────────────────── │
│ [View Switcher: List|Board|Table|Gantt|Calendar|...]    │
│ [Filter Bar] [Sort] [Group By] [Search] [Saved Views ▾] │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Active Data View Area               │   │
│  │    (respects selected view type + filters)       │   │
│  │                                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│ [Pagination / Infinite Scroll] [Total Count] [Per Page] │
└─────────────────────────────────────────────────────────┘

LAYOUT B — "Record Detail" (Single record pages)
┌─────────────────────────────────────────────────────────┐
│ [← Back] [Breadcrumb: Module > Collection > Record]     │
│ ─────────────────────────────────────────────────────── │
│ [Record Title]          [Status Badge] [Actions Menu ▾] │
│ [Subtitle / Key Metadata]              [Edit] [Archive] │
│ ─────────────────────────────────────────────────────── │
│ [Tab Bar: Overview|Details|Activity|Files|Related|...]  │
│ ─────────────────────────────────────────────────────── │
│ ┌──────────────────────┐ ┌────────────────────────────┐│
│ │   Primary Content    │ │    Sidebar / Properties    ││
│ │   (tab-dependent)    │ │    (always visible)        ││
│ │                      │ │    - Key fields            ││
│ │                      │ │    - Quick actions         ││
│ │                      │ │    - Related records       ││
│ │                      │ │    - Activity feed         ││
│ └──────────────────────┘ └────────────────────────────┘│
└─────────────────────────────────────────────────────────┘

LAYOUT C — "Dashboard / Analytics" (Metrics and reporting pages)
┌─────────────────────────────────────────────────────────┐
│ [Module Icon] Dashboard Title     [Date Range] [Filters]│
│ ─────────────────────────────────────────────────────── │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│ │ KPI │ │ KPI │ │ KPI │ │ KPI │ │ KPI │ │ KPI │     │
│ │Card │ │Card │ │Card │ │Card │ │Card │ │Card │     │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘     │
│ ─────────────────────────────────────────────────────── │
│ ┌───────────────────────┐ ┌───────────────────────────┐│
│ │    Chart / Graph      │ │    Chart / Graph          ││
│ │    (interactive)      │ │    (interactive)          ││
│ └───────────────────────┘ └───────────────────────────┘│
│ ┌─────────────────────────────────────────────────────┐│
│ │    Data Table (drill-down from charts above)        ││
│ └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘

LAYOUT D — "Workspace / Builder" (Configuration and creation tools)
┌─────────────────────────────────────────────────────────┐
│ [← Back to Collection]  [Title: Editable]  [Save] [Run]│
│ ─────────────────────────────────────────────────────── │
│ ┌──────────┐ ┌──────────────────────────────────────┐  │
│ │ Tool     │ │                                      │  │
│ │ Sidebar  │ │         Canvas / Editor              │  │
│ │          │ │                                      │  │
│ │ - Drag   │ │     (context-specific workspace)     │  │
│ │ - Drop   │ │                                      │  │
│ │ - Config │ │                                      │  │
│ │ - Props  │ │                                      │  │
│ └──────────┘ └──────────────────────────────────────┘  │
│ ─────────────────────────────────────────────────────── │
│ [Properties Panel / Inspector] (collapsible bottom/right)│
└─────────────────────────────────────────────────────────┘

LAYOUT E — "Settings / Admin" (Configuration pages)
┌─────────────────────────────────────────────────────────┐
│ Settings                                                │
│ ─────────────────────────────────────────────────────── │
│ ┌──────────────┐ ┌──────────────────────────────────┐  │
│ │ Settings Nav │ │                                  │  │
│ │              │ │     Setting Group Title          │  │
│ │ ○ General   │ │     Description text             │  │
│ │ ○ Billing   │ │                                  │  │
│ │ ○ Team      │ │     ┌─ Setting Row ─────────┐   │  │
│ │ ○ Perms     │ │     │ Label     [Control]   │   │  │
│ │ ○ Integs    │ │     └───────────────────────┘   │  │
│ │ ○ Security  │ │     ┌─ Setting Row ─────────┐   │  │
│ │              │ │     │ Label     [Control]   │   │  │
│ │              │ │     └───────────────────────┘   │  │
│ └──────────────┘ └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Rule: Every page must declare which layout template it uses. If it doesn't fit any of the five, the page is redesigned until it does. No exceptions.**

### Data View Standard

Every collection page (Layout A) must support ALL of the following views. If a view type doesn't make sense for the data type (e.g., Gantt for Contacts), it is hidden from the view switcher — but the underlying component and data adapter must still exist so it can be enabled later.

```
VIEW TYPE        │ DESCRIPTION                                          │ REQUIRED FOR
─────────────────┼──────────────────────────────────────────────────────┼──────────────────
List             │ Vertical stack of record cards with key fields       │ All collections
Board / Kanban   │ Columns by status/phase/stage, drag-and-drop cards  │ Tasks, Deals, Projects
Table            │ Spreadsheet-style with inline editing, column resize │ All collections
Gantt            │ Horizontal timeline with dependencies and milestones │ Projects, Tasks, Schedules
Calendar         │ Month/week/day views with event placement           │ Events, Tasks, Bookings, Time Off
Timeline         │ Horizontal swim-lane by resource/person/department  │ Resource Planning, Crew Schedules
Workload         │ Capacity bars per person per time period            │ People, Resource Planning
Activity         │ Chronological feed of all actions on the collection │ All collections
Map              │ Geographic pins for location-based data             │ Venues, Crew Locations, Equipment
Chart            │ Configurable chart from collection data (bar/line/pie/donut/area/scatter) │ All collections
Summary          │ Aggregated metrics cards with sparklines            │ Budgets, Invoices, Utilization
```

**Rule: The view switcher is a GLOBAL design system component. It renders identically on every collection page. User view preference persists per collection per user. Filter, sort, group, and search states persist per view.**

### Form / Drawer / Modal / Dialog Standard

Every interactive overlay follows this classification:

```
COMPONENT    │ WHEN TO USE                                    │ MAX WIDTH  │ CLOSES ON
─────────────┼────────────────────────────────────────────────┼────────────┼───────────────
Quick Action │ Single-field inline edits (status, assignee)   │ Popover    │ Click outside
Dialog       │ Confirmations, warnings, destructive actions   │ 480px      │ Button only
Modal        │ Simple creation forms (< 8 fields)             │ 640px      │ ESC or button
Drawer       │ Complex forms, detail panels, multi-section    │ 720px      │ ESC or button
Full Page    │ Builders, editors, multi-step wizards          │ 100%       │ Navigation
Sheet        │ Data-heavy side panels (record previews)       │ 50% screen │ Click outside
Command Bar  │ Global search, quick navigation (⌘K)          │ 640px      │ ESC
Toast        │ Success confirmations, non-blocking alerts     │ 380px      │ Auto-dismiss 5s
```

**Rules:**
- Every form field has: label, placeholder, help text (hover), validation rules, error message
- Every form has: title, description, required field indicators, cancel button, submit button, loading state on submit
- Every drawer has: header with title + close button, scrollable body, sticky footer with actions
- Every modal has: focus trap, ESC to close, backdrop click behavior per type
- Every dialog has: clear destructive vs. safe action styling (red vs. primary)
- Every form field type comes from the design system: TextInput, TextArea, NumberInput, DatePicker, DateRangePicker, TimePicker, Select, MultiSelect, Checkbox, RadioGroup, Toggle, FileUpload, RichTextEditor, ColorPicker, CurrencyInput, PhoneInput, EmailInput, URLInput, TagInput, UserPicker, LocationPicker
- No form renders without Zod schema validation
- No form submits without all required fields validated client-side first
- All forms are keyboard-navigable (Tab between fields, Enter to submit)

---

## PAGE-BY-PAGE AUDIT PROTOCOL

For every page in ATLVS, execute the following analysis in order. Do not skip any page. Do not skip any step.

### Step 1: OPEN — Identify What Exists

```
Page: [Module > Subpage > Context]
Layout Template: [A|B|C|D|E or NONE — if NONE, flag for redesign]
Current Data Views: [which views are implemented]
Current Forms/Drawers/Modals: [list all interactive overlays]
Current Business Logic: [what operations can the user perform]
Current State Handling: [loading|empty|error|offline — which exist]
```

### Step 2: REVIEW — Evaluate Against Standards

```
LAYOUT COMPLIANCE
□ Page uses one of the 5 standardized layouts — YES/NO
□ Header structure matches template — YES/NO
□ Navigation elements are in correct positions — YES/NO
□ Spacing, padding, and grid follow design tokens — YES/NO
□ Responsive behavior matches design system breakpoints — YES/NO

DATA VIEW COMPLIANCE
□ View switcher component is present (if collection page) — YES/NO
□ All applicable view types are available — YES/NO
□ View preference persists per user — YES/NO
□ Filters, sorts, groups persist per view — YES/NO
□ Custom fields render in all views — YES/NO
□ Bulk actions available in list/table views — YES/NO
□ Drag-and-drop functional in board/kanban/gantt — YES/NO
□ Inline editing available in table view — YES/NO
□ Empty states contextual per view type — YES/NO

FORM/OVERLAY COMPLIANCE
□ All forms use correct overlay type per classification table — YES/NO
□ All form fields from design system — YES/NO
□ All forms have Zod validation — YES/NO
□ All required fields marked with indicator — YES/NO
□ All forms have loading state on submit — YES/NO
□ All forms have success/error feedback — YES/NO
□ All drawers have sticky footer — YES/NO
□ All modals have focus trap — YES/NO
□ All dialogs have destructive action styling — YES/NO
□ Keyboard navigation works — YES/NO

AESTHETIC COMPLIANCE (Spotify/UberEats Standard)
□ Visual hierarchy is clear — primary action obvious within 1 second — YES/NO
□ Information density is appropriate — not too sparse, not overwhelming — YES/NO
□ Micro-interactions exist — hover states, transitions, feedback animations — YES/NO
□ Typography scale is consistent with design tokens — YES/NO
□ Color usage is semantic (success=green, warning=amber, error=red, info=blue) — YES/NO
□ Icons are from the design system icon set — no random SVGs — YES/NO
□ Shadows and elevation follow design system depth tokens — YES/NO
□ Border radii consistent with design tokens — YES/NO
□ Dark mode renders correctly — YES/NO
□ Skeleton loaders match the layout of loaded content — YES/NO
```

### Step 3: ANALYZE — Identify Business Logic Gaps

For each page, answer every question. If the answer is NO, that's a gap to fill.

```
COMPLETENESS
□ Can the user perform every CRUD operation for this entity from this page?
□ Can the user perform all status transitions for this entity from this page?
□ Can the user access all related records from this page?
□ Does this page show all fields that the business requires for this entity?
□ Are computed/derived fields displayed (not just stored raw values)?
□ Are monetary values formatted correctly (currency symbol, commas, 2 decimal places)?
□ Are dates formatted consistently (user's locale preference)?
□ Are percentages calculated and displayed where relevant?
□ Are status badges color-coded semantically?

CONTEXTUAL INTELLIGENCE
□ Does the page show contextual actions based on the current state?
  (e.g., "Generate Invoice" only appears on approved budgets with uninvoiced amounts)
□ Does the page hide actions the user doesn't have permission to perform?
  (not greyed out — hidden entirely, unless educational tooltip explains why)
□ Does the page surface warnings proactively?
  (e.g., budget at 90% burn, certification expiring in 14 days, schedule conflict)
□ Does the page suggest next actions based on workflow state?
  (e.g., "This project is in Load-In phase. Would you like to generate the call sheet?")
□ Does the page show progress toward completion for lifecycle entities?
  (e.g., project phase progress bar, invoice payment progress, budget burn gauge)

PRODUCTION LIFECYCLE AWARENESS
□ Does this page adapt its content based on the current production phase?
□ Are phase-specific fields shown/hidden appropriately?
  (e.g., Settlement fields hidden during Pre-Production)
□ Can the user take phase-transition actions from this page?
  (e.g., "Advance to Load-In" button when pre-production is complete)
□ Does this page surface time-sensitive information prominently?
  (e.g., days until event, overdue tasks, pending approvals blocking progress)
□ Does this page handle the difference between pre-event and post-event context?
  (e.g., Budget shows "Estimated" before event, "Actuals" during/after)

FINANCIAL INTELLIGENCE (applies to any page touching money)
□ Are all monetary displays consistent: $X,XXX.XX with correct currency?
□ Do profitability calculations follow: Revenue − (Labor + Expenses + Overhead) = Margin?
□ Is margin displayed as both absolute value and percentage?
□ Are variance indicators shown (estimated vs. actual) with +/- and color coding?
□ Do financial summaries roll up correctly from line items?
□ Are tax calculations applied and displayed correctly?
□ Is the budget health indicator visible (on track / at risk / over budget)?
```

### Step 4: NORMALIZE — Apply Corrections

For every gap identified in Steps 2 and 3, apply corrections following these rules:

```
LAYOUT NORMALIZATION
- Assign the correct layout template (A through E)
- Restructure the page DOM to match the template exactly
- Replace all ad hoc spacing with design system space tokens
- Replace all ad hoc grid/flex layouts with design system layout components
- Ensure the page header, toolbar, content area, and footer match the template

DATA VIEW NORMALIZATION
- Install the global ViewSwitcher component if missing
- Wire up each view type to the collection's data adapter
- Implement missing view types using shared view components
- Configure default columns/fields for table view
- Configure default grouping for board view
- Configure date field mapping for calendar and Gantt views
- Configure resource field mapping for timeline and workload views
- Persist view state to user preferences (Supabase user_preferences table)

FORM NORMALIZATION
- Audit every field in every form against the entity's database schema
- Add missing fields that the business logic requires
- Remove fields that duplicate data available elsewhere (SSOT)
- Replace all ad hoc inputs with design system form components
- Add Zod validation schema matching database constraints
- Add help text for any field that isn't self-explanatory
- Configure conditional field visibility (show/hide based on other field values)
- Add default values where business logic implies them
  (e.g., new budget defaults to current user's organization currency)
- Add smart defaults from context
  (e.g., new task on a project inherits the project's phase, department, due date range)

OVERLAY NORMALIZATION
- Audit every modal/drawer/dialog against the classification table
- Reclassify and rebuild any overlay using the wrong type
- Ensure every creation form is accessible from:
  1. The collection page's [+ Create] button
  2. The Command Bar (⌘K → "Create [Entity]")
  3. Contextual "+" buttons where inline creation makes sense
- Ensure every edit form is accessible from:
  1. The record detail page's [Edit] button
  2. Inline editing in table view
  3. Quick-edit pencil icon on card/list views
- Ensure every delete/archive action uses a confirmation dialog with:
  1. Record name displayed
  2. Downstream impact listed ("This will also archive 12 tasks and 3 invoices")
  3. "Archive" as default (soft delete), "Delete Permanently" as secondary with extra confirmation
```

### Step 5: OPTIMIZE — Elevate to Reference Standard

After normalization, apply these optimizations to every page:

```
NETSUITE-LEVEL BUSINESS DEPTH
- Every record detail page has a "Related Records" section showing all entities that reference it
- Every financial field has a "View Breakdown" action that shows line-item composition
- Every status has a "History" view showing all state transitions with actor, timestamp, and reason
- Every approval-gated action shows the approval chain and current position
- Every entity with a lifecycle shows a horizontal stepper/progress indicator
- Every entity with a financial impact shows a mini P&L widget in the sidebar
- Every entity with a schedule impact shows a mini calendar/timeline in the sidebar
- Record locking indicators when another user is editing the same record
- Related record creation directly from the parent's detail page without navigating away
- Mass update capabilities on collection pages (select multiple → bulk edit)
- Import/Export (CSV) available on every collection page
- Duplicate record with smart field copying (reset unique fields, increment version)

CLICKUP-LEVEL VISUALIZATION DEPTH
Every applicable collection page gets:
- Configurable columns in table view (show/hide, reorder, resize, freeze)
- Color coding configurable per field (status colors, priority colors, custom field colors)
- Swimlane grouping in board view (group by status, then sub-group by department)
- Dependency arrows in Gantt view with critical path highlighting
- Drag-to-reschedule in Gantt and Calendar views
- Capacity heat map in workload view (green/yellow/red by utilization %)
- Activity feed with rich formatting (inline previews of changes, @mentions, attachments)
- Card density settings (compact, comfortable, expanded) per view
- Pin/star important records for quick access
- Saved views with sharing (personal views + team-shared views)
- Quick filters (single-click toggles for common filter states)
- Filter indicators showing active filter count with one-click clear

PRODUCTIVE.IO-LEVEL LIFECYCLE DEPTH
- Budget sidebar widget on every project page showing: total, burned, remaining, margin
- Time tracking widget accessible from every task detail (start timer without leaving page)
- Invoice generation accessible from every completed budget (one-click draft)
- Resource booking accessible from every crew assignment (link task → booking)
- Profitability indicator on every client, project, and budget record
- Utilization indicator on every person record
- Pipeline value indicator on every company record
- Settlement readiness checker on every project approaching completion
- Aging indicators on all time-sensitive data (overdue tasks: red, invoices: yellow at 15d, red at 30d)
- Cross-module notification badges (budget approaching limit visible from project page)

SPOTIFY/UBEREATS-LEVEL INTUITIVENESS
- Command Bar (⌘K) searches across ALL modules with categorized results
  - Recent items shown on open (no typing required)
  - Fuzzy search with highlighting
  - Action shortcuts: "⌘K → create project" executes immediately
  - Context-aware suggestions: on a project page, ⌘K prioritizes project-related actions
- Breadcrumb navigation with dropdown pickers at each level
  (click "Projects" in breadcrumb → dropdown shows all projects for quick switch)
- Hover previews on linked records (hover over a client name → mini card with key info)
- Drag-and-drop everywhere it's natural:
  - Tasks between columns, lists, and assignees
  - Files onto records to attach
  - People onto projects to assign
  - Timeline blocks to reschedule
- Contextual right-click menus on all records with relevant actions
- Keyboard shortcuts for all primary actions (documented in ⌘K → "shortcuts")
- Progressive disclosure:
  - Cards show 3-4 key fields, expand to show all
  - Sections collapse/expand with remembered state
  - Advanced options hidden behind "More options" toggles
  - Settings grouped by complexity (basic → advanced → expert)
- Onboarding hints on first visit to each module
  (non-intrusive, dismissible, one-time spotlight on key features)
- Animations and transitions:
  - Page transitions: 200ms ease-out fade/slide
  - Card/list reordering: 150ms spring animation
  - Modal open/close: 250ms scale + fade
  - Toast entry/exit: 300ms slide from edge
  - Skeleton loaders: subtle shimmer animation
  - Status changes: color transition with subtle pulse
  - All animations respect prefers-reduced-motion
- Smart empty states per context:
  - New project with no tasks: "Start by adding tasks or importing a production template"
  - Budget with no expenses: "Expenses will appear here as your team logs them"
  - Pipeline with no deals: "Create your first deal or import from a spreadsheet"
  - Each empty state includes: illustration, message, primary CTA button, secondary link to docs
```

---

## MODULE-BY-MODULE PAGE MANIFEST

Open every page listed below. Apply Steps 1-5 to each. Check off when complete.

### DASHBOARD MODULE

```
□ Main Dashboard (Layout C)
  - KPI cards: Open Tasks, Active Projects, This Week's Events, Budget Health, Team Utilization, Revenue MTD
  - Charts: Revenue trend (line), Project status distribution (donut), Upcoming events (calendar mini), Budget burn rates (bar)
  - Activity feed: latest cross-module activity
  - My Day: personal agenda, my tasks due today, my timers, my pending approvals
  - Quick actions: Create Task, Log Time, Submit Expense, Create Deal
  - All widgets clickable → drill down to source data
  - Customizable: add/remove/reorder widgets, save layout per user

□ My Tasks (Layout A — personal cross-project task view)
  - All tasks assigned to current user across all projects
  - Grouped by: Today, Tomorrow, This Week, Next Week, Later, Overdue
  - Views: List, Board (by project), Calendar
  - Quick status change and time logging from list

□ My Timesheet (Layout A — personal time entry view)
  - Weekly grid: rows = projects/tasks, columns = days
  - Cell = hours logged, click to edit
  - Running timer indicator
  - Weekly total, billable total, utilization percentage
  - Submit for approval action

□ Notifications Center (Layout A)
  - Grouped by: Today, Earlier This Week, Last Week, Older
  - Filterable by type: mentions, approvals, deadlines, system
  - Mark as read, mark all as read, notification preferences link
```

### PROJECTS MODULE

```
□ All Projects (Layout A)
  - Views: List, Board (by phase), Table, Calendar (by event dates), Timeline (by date range)
  - Columns: Name, Client, Production Type, Phase, Start Date, Event Date, Budget Health, PM, Status
  - Quick filters: My Projects, Active, Completed, By Phase, By Type
  - Board default grouping: Production Phase

□ Project Detail (Layout B)
  - Header: Project name, client, production type badge, phase stepper, status
  - Sidebar: Key dates, PM, budget summary (total/burned/remaining/margin), team count, venue
  - Tabs:
    □ Overview: Phase progress, upcoming milestones, budget gauge, recent activity, key contacts
    □ Tasks: Full task collection (Layout A nested) with all views and department filters
    □ Schedule: Gantt view of all tasks with dependencies and milestones
    □ Team: Assigned crew with roles, rates, availability, check-in status
    □ Budget: All budgets for this project with phase breakdown and P&L
    □ Time: All time entries for this project with person/task/date breakdown
    □ Expenses: All expenses for this project with category breakdown and receipt attachments
    □ Documents: Production documents (call sheets, riders, contracts, site maps, photos)
    □ Invoices: All invoices generated from this project's budgets
    □ Activity: Chronological feed of all actions on this project
    □ Settings: Project-level settings, automations, permissions, templates

□ Task Detail (Layout B — accessed from project tasks or global task views)
  - Header: Task name, status badge, priority, due date
  - Sidebar: Assignee(s), project, department, time estimate vs. actual, attached budget line
  - Tabs:
    □ Details: Description (rich text), checklist/subtasks, custom fields, dependencies
    □ Time: Time entries logged against this task with timer controls
    □ Activity: Comments, status changes, assignment changes, file uploads
    □ Files: Attached documents and images

□ Call Sheet Generator (Layout D — builder tool)
  - Auto-populates from: Project, Date, Venue, Crew Assignments, Schedule, Weather API
  - Editable sections: Production Info, Key Contacts, Department Call Times, Schedule, Notes, Maps
  - Preview → Export PDF → Send to Crew (email/SMS)

□ Run Sheet View (Layout D — show-day timeline)
  - Minute-by-minute timeline for show day
  - Columns: Time, Item/Cue, Department, Responsible, Location, Notes
  - Real-time progress indicator (current time marker)
  - Color-coded by department
  - Print-friendly export

□ Settlement Worksheet (Layout D — post-event financial reconciliation)
  - Sections: Budget Summary, Labor Actuals, Vendor Costs, Expenses, Adjustments
  - Side-by-side: Estimated vs. Actual per line item with variance
  - Auto-calculate: Total Cost, Revenue, Margin, Agency Fee
  - Approval workflow: PM Review → Finance Review → Client Approval
  - Generate Final Invoice button
```

### PEOPLE MODULE

```
□ People Directory (Layout A)
  - Views: List, Table, Board (by department), Map (by location), Org Chart
  - Columns: Name, Role, Department, Skills, Rating, Hourly Rate, Availability, Status
  - Quick filters: Employees, Contractors, Available This Week, By Skill, By Certification
  - Org chart view shows reporting hierarchy with expandable nodes

□ Person Detail (Layout B)
  - Header: Name, photo, title, department, status badge, rating stars
  - Sidebar: Contact info, emergency contact, rates, certifications (with expiry dates), tags
  - Tabs:
    □ Overview: Utilization gauge, upcoming bookings, recent projects, rating summary
    □ Schedule: Calendar view of bookings, time off, availability
    □ Time: All time entries with project/task/date breakdown
    □ Projects: All assigned projects with role and date range
    □ Skills & Certs: Certification cards with expiry tracking, skill tags, training history
    □ Ratings: Per-gig ratings with comments, aggregate score, trend
    □ Documents: W-9, COI, NDA, contracts, ID copies
    □ Compensation: Rate cards, payment history, per diem records
    □ Activity: Assignment changes, status changes, feedback received

□ Availability Calendar (Layout A — aggregate view)
  - Timeline view: all people as rows, days as columns, bookings as blocks
  - Color coding: Available (green), Booked (blue), Tentative (yellow), Time Off (gray), Conflict (red)
  - Click person → person detail drawer
  - Click gap → create booking drawer
  - Filter by: Department, Skill, Rate Range, Location, Certification

□ Time Off Management (Layout A)
  - Views: Calendar (team), List (requests), Board (by status: pending/approved/denied)
  - Quick actions: Request Time Off, Approve Selected, Deny with Note

□ Crew Onboarding (Layout D — checklist wizard)
  - Steps: Personal Info → Rates & Payment → Certifications → Documents → Emergency Contact → Review
  - Progress indicator per step
  - Save draft capability
  - Submit for admin approval
```

### RESOURCES MODULE

```
□ Asset Catalog (Layout A)
  - Views: List, Table, Board (by category), Map (by current location)
  - Columns: Name, Category, Status, Location, Last Maintenance, Next Due, Assigned To
  - Quick filters: Available, In Use, In Maintenance, By Category, By Location

□ Asset Detail (Layout B)
  - Header: Asset name, category badge, status, QR code thumbnail
  - Sidebar: Serial number, purchase date, value, depreciation, current location
  - Tabs:
    □ Overview: Photo gallery, specs, current assignment, condition notes
    □ Booking History: Timeline of all checkouts/returns with project and person
    □ Maintenance: Scheduled and completed maintenance records
    □ Documents: Manuals, warranties, insurance certificates
    □ Activity: Check-in/check-out log, location changes, damage reports

□ Equipment Kits (Layout A)
  - Kit builder: drag assets into kit configurations
  - Kit templates for common production setups
  - One-click kit checkout to project

□ Warehouse Map (Layout D — visual warehouse management)
  - Spatial layout of storage locations
  - Drag assets to locations
  - Search and highlight specific items
  - Low stock indicators
```

### JOBS (CRM) MODULE

```
□ Pipeline Board (Layout A)
  - Views: Board (by stage), List, Table, Timeline (by expected close date)
  - Board columns: Lead → Qualified → Proposal Sent → Negotiation → Won → Lost
  - Card shows: Deal name, client, value, probability, age, next action date
  - Drag between stages updates probability automatically
  - Revenue forecast bar at bottom of each column

□ Deal Detail (Layout B)
  - Header: Deal name, client, stage badge, value, probability percentage
  - Sidebar: Expected close date, production type, assigned salesperson, win probability, weighted value
  - Tabs:
    □ Overview: Key metrics, next actions, stage history, competitive notes
    □ Contacts: People involved from client side with roles
    □ Proposal: Proposal builder with scope, pricing, terms → PDF export
    □ Communications: Email thread linked to deal, notes, meeting summaries
    □ Tasks: Deal-specific tasks (follow-ups, deliverables, approvals)
    □ Documents: Pitch deck, creative brief, RFP response, contracts
    □ Activity: Stage changes, email opens, proposal views, notes added

□ Companies (Layout A)
  - Views: List, Table, Map (by HQ location)
  - Columns: Name, Industry, Total Revenue, Active Projects, Deal Count, Last Contact
  - Click → Company Detail with: overview, contacts, deals, projects, invoices, relationship timeline

□ Contacts (Layout A)
  - Views: List, Table
  - Columns: Name, Company, Title, Email, Phone, Last Contacted, Tags
  - Click → Contact Detail with: info, related deals, related projects, communication history

□ Revenue Forecast (Layout C — dashboard)
  - Pipeline value by stage (funnel chart)
  - Weighted revenue by month (bar chart)
  - Revenue by client (treemap)
  - Close rate trend (line chart)
  - Data table: all open deals with filters
```

### MONEY MODULE

```
□ Budget Overview (Layout A)
  - Views: List, Table, Board (by status: Draft/Active/Complete/Archived), Chart (burn rates)
  - Columns: Name, Project, Client, Type, Total, Burned, Remaining, Margin %, Status
  - Quick filters: Over Budget, At Risk, On Track, By Client, By Project

□ Budget Detail (Layout B)
  - Header: Budget name, project, client, type badge, health gauge
  - Sidebar: Total, Burned, Remaining, Margin $, Margin %, Invoiced, Uninvoiced
  - Tabs:
    □ Overview: Burn rate chart, phase breakdown, category breakdown, alerts
    □ Line Items: Editable table of all budget lines with category, estimated, actual, variance
    □ Time: Time entries charging to this budget with cost calculation
    □ Expenses: Expenses allocated to this budget with receipt images
    □ Purchase Orders: POs linked to this budget with delivery/payment status
    □ Invoices: Invoices generated from this budget with payment status
    □ Scenarios: Saved what-if models with comparison view
    □ Activity: All financial mutations with audit trail

□ Expense Management (Layout A)
  - Views: List, Table, Board (by status: Draft/Submitted/Approved/Rejected/Reimbursed)
  - Columns: Date, Description, Category, Amount, Project, Budget, Vendor, Status, Receipt
  - Quick submit: photo upload → auto-extract amount and vendor (OCR-ready)
  - Approval workflow: Submit → Manager Review → Finance Approve → Process Payment

□ Invoice Management (Layout A)
  - Views: List, Table, Board (by status: Draft/Sent/Viewed/Partial/Paid/Overdue)
  - Columns: Invoice #, Client, Project, Amount, Tax, Total, Issued Date, Due Date, Status
  - Aging summary: Current, 1-15 days, 16-30 days, 31-60 days, 60+ days

□ Invoice Builder (Layout D)
  - Client selector, budget selector (auto-populate line items)
  - Line items: description, quantity, unit price, tax rate, subtotal
  - Add from: time entries, expenses, rate card services
  - Totals: Subtotal, Tax, Discount, Total, Deposit Credit, Amount Due
  - Preview PDF → Finalize → Send to Client
  - Payment recording: amount, date, method, reference number

□ Rate Card Management (Layout E — settings subpage)
  - Default rate card configuration
  - Client-specific rate cards
  - Role + rate + currency + OT multiplier per card
  - Effective date ranges for rate changes

□ Purchase Orders (Layout A)
  - Views: List, Table, Board (by status: Draft/Sent/Acknowledged/Received/Invoiced)
  - Columns: PO #, Vendor, Project, Budget, Amount, Status, Delivery Date
  - PO → Vendor Invoice matching workflow

□ Financial Dashboard (Layout C)
  - KPIs: Revenue MTD/QTD/YTD, Profit Margin, Outstanding AR, Outstanding AP, Cash Forecast
  - Charts: Revenue vs. Expenses (monthly trend), Profit by Client, Budget Health Distribution, AR Aging
  - Drill-down table: all financial transactions with filters
```

### ANALYTICS MODULE

```
□ Report Library (Layout A)
  - Pre-built reports categorized: Financial, Project, Utilization, People, Sales, Custom
  - Each report card shows: name, description, data freshness, last viewed
  - Click → Report View (Layout C with configurable filters)

□ Report Builder (Layout D)
  - Left sidebar: Field picker from all modules, drag onto canvas
  - Canvas: Columns, rows, values, filters, sort
  - Visualization picker: Table, Bar, Line, Area, Pie, Donut, Scatter, Heatmap, Funnel, Gauge
  - Formula builder for calculated fields
  - Grouping and pivoting controls
  - Save, share, schedule delivery

□ Dashboard Builder (Layout D)
  - Widget palette: KPI Card, Chart, Table, Note, Heading, Divider, Embed
  - Drag-and-drop grid layout
  - Widget configuration: data source, filters, refresh interval
  - Save, share, set as default for role

□ Scheduled Reports (Layout E)
  - Report → schedule → recipients → frequency (daily/weekly/monthly) → format (PDF/CSV/email body)
  - Delivery history log
```

### LEGEND (ADMIN) MODULE

```
□ Organization Settings (Layout E)
  - Company info, logo, branding colors, timezone, fiscal year, default currency
  - Subscription/billing management (Stripe portal link)

□ Roles & Permissions (Layout E)
  - Role list with permission matrix (modules × actions: view/create/edit/delete/admin)
  - Custom role creation
  - User → role assignment

□ Integration Hub (Layout A)
  - Available integrations as cards with status (connected/available/coming soon)
  - Click → configuration drawer with auth flow and field mapping

□ Automation Rules (Layout A)
  - Views: List, Table
  - Click → Automation Builder (Layout D) with trigger → condition → action flow
  - Templates library for common automations

□ Audit Log (Layout A)
  - Views: Table (primary)
  - Columns: Timestamp, Actor, Action, Entity, Module, Details
  - Filters: Date range, actor, module, action type
  - Export capability

□ Sandbox (Layout E)
  - Toggle sandbox mode
  - Reset sandbox data
  - Promote sandbox changes to production (with approval)
```

### PROFILE MODULE

```
□ My Profile (Layout E)
  - Personal info, photo, contact details
  - Notification preferences (per event type: email, push, in-app)
  - Connected accounts (calendar, email, Slack)
  - Theme preference (light/dark/system)
  - Timezone, date format, number format

□ My Messages (Layout A)
  - Inbox with threading
  - Compose with @mentions and record linking
  - Search across message history

□ My History (Layout A — activity log for current user)
  - All actions taken by current user across all modules
  - Filterable by module, action type, date range
```

---

## COMPLETION CRITERIA

This audit is complete when:

```
□ Every page listed above has been opened, reviewed, and processed through Steps 1-5
□ Every page uses one of the 5 standardized layout templates
□ Every collection page has the global ViewSwitcher with all applicable views
□ Every form uses design system components with Zod validation
□ Every overlay uses the correct type per the classification table
□ Every record detail page has bidirectional navigation to all related records
□ Every financial display uses consistent currency formatting
□ Every date display uses consistent locale-aware formatting
□ Every status uses consistent semantic color coding
□ Every page handles all states: loading, empty, error, permission denied, offline
□ Every page has keyboard shortcuts for primary actions
□ Command Bar (⌘K) indexes all entities, actions, and navigation targets
□ All hover previews, contextual menus, and progressive disclosure patterns are implemented
□ All animations respect prefers-reduced-motion
□ Dark mode renders correctly on every page
□ No inline styles exist anywhere in the codebase
□ No ad hoc components exist outside the design system
□ No hardcoded colors, fonts, spacing, or radii exist outside design tokens
□ Component audit report shows 100% design system compliance
□ Three production scenarios (brand activation, festival, corporate tour) can be executed
  end-to-end through the UI without encountering a dead end, missing form, or broken link
```

**Begin with the Dashboard module. Open the main dashboard page. Execute Steps 1 through 5. Then proceed to the next page. Do not batch — process one page at a time so that each page gets full attention.**