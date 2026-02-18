# ATLVS × Productive.io Feature Gap Analysis & Implementation Prompt
## Windsurf Development Directive — GHXSTSHIP Industries LLC

---

## CONTEXT & MISSION

You are implementing a comprehensive feature upgrade to **ATLVS**, the internal business operations platform for GHXSTSHIP Industries LLC — a Tampa-based immersive entertainment and experiential marketing agency. ATLVS serves the live entertainment industry from intimate theater productions to major festivals (400K+ attendees) with multi-million dollar budgets across clients like PATRÓN, Red Bull, Heineken, and Formula 1.

**Productive.io** is an all-in-one agency management platform ($9–$32/user/mo) serving creative agencies with integrated project management, CRM, budgeting, invoicing, time tracking, resource planning, and reporting. It is the current gold standard for agency operations software.

**Your mission**: Conduct a full feature gap analysis between ATLVS's current state and Productive.io's complete feature set (Essential through Enterprise tiers). Then implement every missing feature while **optimizing each one for the live production lifecycle** — meaning every feature must account for the unique realities of event production: advance planning → load-in → show day → load-out → settlement → post-mortem.

---

## ATLVS CURRENT MODULE ARCHITECTURE

```
Dashboard ─── Daily Agenda | Open Tasks | Unread Messages | Notifications | Recent Activity
Projects ──── Project & Event Management (Gantt, Kanban, Calendar, List, Timeline views)
People ─────── Workforce Management (Directory, Availability, Performance, Development)
Resources ──── Inventory, Logistics, Warehousing (Asset Catalog, Utilization, Storage Mapping)
Jobs ────────── CRM & Contract Management (Pipeline, Contacts, Contracts, Proposals)
Money ─────── Finance, Budget, & Spend Management (Budgets, Expenses, Invoices, Payments)
Analytics ──── Reports, Insights, Forecasts
Legend ─────── Organization Access Control, Permissions, Settings
Profile ────── Profile, Notifications, Messages, History, Integrations, Account, Billing
```

**Tech Stack**: Next.js 15+, React 19, Supabase (PostgreSQL + Auth + Storage + Realtime), Stripe, Vercel

---

## PHASE 1: FEATURE GAP ANALYSIS

Audit every ATLVS module against Productive.io's complete feature inventory below. For each gap, classify as:
- 🔴 **CRITICAL** — Core functionality missing, blocks competitive parity
- 🟡 **IMPORTANT** — Significant feature gap, degrades user experience
- 🟢 **ENHANCEMENT** — Nice-to-have, adds polish and depth

### PRODUCTIVE.IO COMPLETE FEATURE INVENTORY TO AUDIT AGAINST

#### 1. PROJECT MANAGEMENT
- [ ] Multiple project views: Kanban board, List, Gantt chart, Calendar, Table, Timeline
- [ ] Custom task statuses with workflow stages
- [ ] Task dependencies (finish-to-start, start-to-start, finish-to-finish, start-to-finish)
- [ ] Task templates and project templates
- [ ] Subtasks with unlimited nesting depth
- [ ] Task comments with threaded replies
- [ ] File attachments on tasks
- [ ] Task time estimates vs. actual tracking
- [ ] Task priority levels (urgent, high, normal, low)
- [ ] Task assignees (multiple)
- [ ] Task due dates with overdue highlighting
- [ ] Task labels/tags
- [ ] Custom fields on tasks (text, number, date, select, multi-select, checkbox, URL, email, phone, formula)
- [ ] Task list duplication with dependencies preserved
- [ ] Private folders (client visibility control)
- [ ] Personal task dashboard across all projects
- [ ] Project progress bar with percentage completion
- [ ] Bulk task operations (assign, move, status change, delete)
- [ ] Task automations / no-code workflow builder
  - Trigger on status change, date, assignment, creation
  - Actions: change status, assign, notify, move, create task, send to Slack, create invoice
  - Cross-project automation triggers
  - Apply automations to multiple projects at once
- [ ] Project milestones
- [ ] Critical path identification
- [ ] Gantt chart drag-and-drop with dependency auto-adjustment
- [ ] Skip weekends when moving tasks in Gantt
- [ ] Task board (folder) organization within projects
- [ ] Quick-add tasks from any view
- [ ] Task workload view (see assignments per person per day/week)
- [ ] Create tasks from workload view

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- Implement "Production Phase" field on all projects: Pitch → Pre-Production → Advance → Load-In → Show Day → Load-Out → Strike → Settlement → Post-Mortem
- Auto-generate phase-specific task templates per production type (festival, brand activation, concert, corporate, theater)
- Call sheet generation from task/people assignments
- Day-of-show run sheet view (minute-by-minute timeline)
- Weather contingency task branching
- Curfew countdown timers on show-day views
- Department-level views (Audio, Lighting, Video, Staging, Catering, Security, VIP, Talent)

#### 2. TIME TRACKING
- [ ] Built-in timer (start/stop with desktop widget)
- [ ] Manual time entry (retroactive)
- [ ] Timesheet view (weekly grid)
- [ ] Automatic time tracking suggestions based on task activity
- [ ] Time linked to budgets automatically
- [ ] Billable vs. non-billable hour classification
- [ ] Time approval workflows
- [ ] Time tracking policies (rules for when/how time is logged)
- [ ] Overtime calculation
- [ ] Alternating work hours support
- [ ] Time entries linked to invoices
- [ ] Time entry reports by person, project, budget, service type
- [ ] Desktop timer widget
- [ ] Mobile time tracking
- [ ] Locked timesheet periods (prevent retroactive edits)
- [ ] Billable hours calculator with utilization rate

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- Crew call-time check-in/check-out (GPS-verified on-site)
- Automatic overtime calculation per state/union labor rules (IATSE, Teamsters, etc.)
- Meal penalty tracking (6-hour rule)
- Turnaround time violation detection (10-hour minimum between calls)
- Per diem and travel day tracking
- Rate card management per role per event type (day rate, hourly, flat, OT multipliers)
- Union vs. non-union crew rate differentiation

#### 3. BUDGETING & FINANCIAL MANAGEMENT
- [ ] Simple budget editor
- [ ] Multiple budgets per project
- [ ] Budget types: Fixed-price, Time & Materials, Retainer, Hybrid/Mixed
- [ ] Budget phases (split large budgets into phases)
- [ ] Budget spent warnings / custom alert thresholds
- [ ] Revenue recognition
- [ ] Expense tracking and management
- [ ] Expense approvals workflow
- [ ] Purchase orders
- [ ] Rate cards (employee billing rates bundled by service)
  - Default rate cards
  - Client-specific rate cards
  - Unlimited rate cards (Enterprise)
- [ ] Budget templates
- [ ] Real-time budget burn tracking (planned vs. actual)
- [ ] Profitability view per budget (revenue – costs = margin)
- [ ] Service custom fields
- [ ] Tracking options for services
- [ ] Retainer management and invoicing
- [ ] Financial forecasting on budgets
- [ ] Overhead cost calculation
- [ ] Scenario Builder (model different budget outcomes)
- [ ] Budget and deal cost rates
- [ ] Flexible person-day hours
- [ ] Fiscal year configuration
- [ ] Financials month closing
- [ ] Client access to budget data (with permissions)
- [ ] Budget progress bar with invoicing status (invoiced, draft, available)
- [ ] Bulk budget invoicing

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- Production budget categories: Talent, Labor, Equipment Rental, Venue, Catering, Transportation, Lodging, Production Supplies, Permits/Insurance, Contingency, Agency Fee, Markup
- Vendor cost tracking with PO-to-invoice matching
- Real-time show-cost dashboard (live updating during event)
- Settlement worksheet generation
- Client markup/agency fee calculation (cost-plus, flat fee, percentage)
- Multi-currency support for international productions
- Per-show vs. series/tour budget roll-ups
- Weather insurance cost tracking
- Force majeure contingency budgets
- Estimated vs. actual comparison with variance analysis
- Wrap/final cost report auto-generation

#### 4. INVOICING & BILLING
- [ ] Global invoicing overview dashboard
- [ ] Draft and finalized invoice states
- [ ] Tax per invoice line item
- [ ] Credit notes
- [ ] Send invoice to client directly from platform
- [ ] Invoice multiple budgets in one invoice
- [ ] Invoice bulk copy
- [ ] Payment reminders (automated)
- [ ] Custom invoicing email address
- [ ] Remove platform branding from invoices
- [ ] Invoice PDF export
- [ ] Automatic invoice drafts for recurring budgets
- [ ] Rich-text invoice line item descriptions
- [ ] Default billing recipient per company
- [ ] Invoice custom fields
- [ ] e-Invoicing (Peppol XML)
- [ ] Attach timesheets to invoices
- [ ] Monthly eInvoice limits by plan
- [ ] Invoice automations (auto-create on budget triggers)
- [ ] Invoice status tracking (sent, viewed, paid, overdue)

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- Deposit / advance payment scheduling (50% on signing, 25% on load-in, 25% net-30 post-event)
- Progressive billing milestones tied to production phases
- Vendor payment scheduling with approval gates
- Settlement-based final invoicing (actual costs → client invoice)
- Multi-entity invoicing (GHXSTSHIP entity → client, with sub-vendor pass-throughs)
- Retainer drawdown tracking for ongoing client relationships
- Quick-invoice from approved estimate/proposal

#### 5. CRM / SALES PIPELINE
- [ ] Deals (opportunities) management
- [ ] Companies (accounts) management
- [ ] Contacts management with relationship mapping
- [ ] Expected close date on deals
- [ ] Export proposal to PDF
- [ ] Attach emails to sales deals
- [ ] Convert deal to project (one-click)
- [ ] Sales funnel report
- [ ] Multiple pipelines (up to 5)
- [ ] Custom pipeline stages
- [ ] Deal probability per stage
- [ ] Projected revenue distribution (even or custom)
- [ ] Default probability per stage
- [ ] Sales inbox (forward emails to deals)
- [ ] Deal collaboration (tasks, assignees, deadlines on deals)
- [ ] Contact info management (email, address, website)
- [ ] Company custom fields and payment terms
- [ ] Deal-to-budget connection for financial forecasting
- [ ] Revenue projection by client

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- Production type tagging on deals (festival, brand activation, concert, corporate, immersive theater, etc.)
- Multi-year deal tracking (recurring annual events)
- Pitch deck / creative brief attachment per deal
- Win/loss analysis with competitive intelligence
- Client event history and relationship timeline
- Referral source tracking
- RFP response management with deadline tracking
- Venue availability cross-reference during deal qualification
- Tentative hold management (first hold, second hold, confirmed, released)
- Deal-level margin forecasting before project conversion

#### 6. RESOURCE PLANNING & SCHEDULING
- [ ] Visual resource planner (timeline view by person)
- [ ] Resource planning by person or project view
- [ ] Booking creation and management
- [ ] Tentative bookings
- [ ] Repeating bookings
- [ ] Split bookings
- [ ] Booking conflict resolver
- [ ] Plan team utilization across projects
- [ ] Person availability in resource planning
- [ ] Scheduling placeholders (for unnamed/TBD roles)
- [ ] Color-coded utilization indicators (over/under/optimal)
- [ ] Capacity indicators with popover details
- [ ] Remote work indicators
- [ ] Resource planning by deal/budget
- [ ] Budget/time usage indicators per booking
- [ ] Right-click booking actions (edit, duplicate, split, repeat)
- [ ] Timeframe navigation (week, month, quarter)
- [ ] Absence approval from resource planner view
- [ ] Deactivated user visibility in planner
- [ ] Resource planning filter by people custom fields

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- Crew availability grid with conflict detection across overlapping events
- Role-based scheduling (not just person-based): need 4 stagehands, 2 riggers, 1 TD
- Skill/certification matching (CDL, forklift, rigging, pyro license, OSHA-30)
- Travel day scheduling with transit time calculation between venues
- Equipment resource planning (not just people — trucks, generators, staging, etc.)
- Venue-specific crew requirements auto-population
- Union jurisdiction management
- Per diem and hotel booking integration per resource booking
- Crew confirmation workflow (offer → accept/decline → confirmed → checked-in)
- Day-of roster with mobile check-in

#### 7. PEOPLE MANAGEMENT / HR
- [ ] Time off and remote work management
- [ ] Holiday calendars (multiple, region-specific)
- [ ] Employee custom fields (up to 30)
- [ ] Organization chart
- [ ] Person status (active, deactivated, etc.)
- [ ] Time off and remote work approvals
- [ ] Approval policies (configurable rules)
- [ ] Time off entitlements management
- [ ] Absence status sync with resource planner
- [ ] Employee vs. contractor differentiation
- [ ] Person split (separate employees from contacts)
- [ ] HRIS integrations (BambooHR, Breathe, Personio, Hibob, Rippling)

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- Contractor/freelancer database with availability, rates, and ratings
- Crew rating system (1-5 stars + written reviews per gig)
- W-9 / W-8BEN collection and tracking
- Insurance certificate (COI) tracking per contractor
- NDA/non-compete status tracking
- Crew certifications with expiration alerts
- Emergency contact and medical info (accessible to on-site PM)
- T-shirt size, dietary restrictions, and accommodation preferences for crew care
- Blackout dates and preferred availability submission by freelancers
- Seasonal availability patterns for recurring events

#### 8. DOCS & COLLABORATION
- [ ] Real-time collaborative document editing
- [ ] Document templates
- [ ] AI-powered writing assistance
  - Draft project specifications
  - Write marketing content
  - Translate (8+ languages)
  - Summarize documents
  - Improve writing tone
  - Explain complex terms
- [ ] Docs organized within projects
- [ ] Client portal for collaboration
  - Client access to tasks
  - Client access to budgets (with permissions)
  - Private folders to control client visibility

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- Production document templates: Technical Rider, Advance Sheet, Call Sheet, Run Sheet, Settlement Sheet, Site Map, Safety Plan, Catering BEO, Stage Plot, Input List, Patch List
- Auto-generate call sheets from project + people + schedule data
- Digital sign-off workflows for safety briefings and NDAs
- Version-controlled creative briefs with client approval tracking
- Photo/video asset library per production
- Post-mortem / AAR (After Action Review) template with lessons learned database

#### 9. REPORTING & ANALYTICS
- [ ] Reports library (pre-built templates)
- [ ] Custom report builder
- [ ] Dashboards (customizable)
- [ ] Dashboard widgets: Note, Heading, Divider, Formula, Target
- [ ] Dashboard autolayout
- [ ] Reports sharing (internal and external)
- [ ] Dashboard sharing
- [ ] Financial reports
- [ ] Project management reports
- [ ] Utilization reports
- [ ] Export reports to PDF, CSV, XLS
- [ ] Report targets (set goals and track against them)
- [ ] Table pivoting
- [ ] Formula fields in reports
- [ ] View reports in multiple currencies
- [ ] Multi-grouping
- [ ] Pulse — automated, periodic report delivery (email/Slack)
- [ ] AI-generated reports (describe in natural language)
- [ ] Report drilldown on charts
- [ ] OR filters across all report modules
- [ ] Time entries report with invoice reference
- [ ] People report with service types
- [ ] Purchase orders report

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- Show P&L report (per event, per tour, per client, per quarter)
- Crew utilization report (billable hours vs. availability across productions)
- Equipment utilization and ROI report
- Client profitability ranking
- Year-over-year event comparison dashboard
- Venue performance analytics
- Vendor spend analysis with preferred vendor ranking
- On-time delivery / punch-list completion metrics
- Safety incident tracking and reporting
- Sustainability/waste metrics per production
- Real-time show-day dashboard (crew check-in %, equipment status, timeline adherence)

#### 10. INTEGRATIONS & AUTOMATION
- [ ] API access (Open API)
- [ ] Calendar integrations (Google Calendar, Outlook)
- [ ] Slack integration (send/receive notifications)
- [ ] Accounting integrations (Xero, QuickBooks)
- [ ] HRIS integrations (BambooHR, Breathe, Humaans, Personio, Hibob, Rippling)
- [ ] Jira time tracking add-on
- [ ] Zapier integration (1000+ app connections)
- [ ] HubSpot integration
- [ ] Webhooks
- [ ] Gmail / Outlook inbox sync (view emails, link to activity feeds)
- [ ] Memtime integration
- [ ] Forms → tasks/emails/Slack automations
- [ ] Peppol e-invoicing

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- RFID/NFC crew check-in integration
- Weather API integration (auto-alerts for outdoor events)
- Mapping/GPS integration for venue logistics
- Digital signage / show control system integration
- Two-way radio / comms system logging
- Ticketing platform integration (Eventbrite, DICE, AXS, Ticketmaster)
- Streaming platform integration for hybrid events
- Social media analytics pull-in for event ROI
- Permitting system integration (city/county/fire marshal)
- CAD/technical drawing viewer integration

#### 11. SECURITY & ADMINISTRATION
- [ ] Role-based access control (RBAC)
- [ ] Custom permission sets
- [ ] Single Sign-On (SSO)
- [ ] Two-Factor Authentication (2FA)
- [ ] GDPR compliance
- [ ] SOC 2 Type II compliance
- [ ] Audit logging (activity logs)
- [ ] Client permissions (separate from internal)
- [ ] Rate card permissions
- [ ] Email permissions
- [ ] Integration permissions
- [ ] Champions feature (module ownership assignment)
- [ ] Sandbox environment for testing
- [ ] Multi-organization switching
- [ ] Custom branding / white-label options

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- Venue-specific access levels (crew, vendor, client, VIP, public)
- Time-bound access (auto-expire after event date)
- Geo-fenced data access for sensitive event information
- NDA-gated document access
- Client-facing portal with production-appropriate views only
- Separate admin levels: Organization Admin, Production Manager, Department Head, Crew Lead, Crew Member, Client, Vendor

#### 12. MOBILE APP
- [ ] Track time
- [ ] Create, manage, comment on tasks
- [ ] View and upload attachments
- [ ] Track profitability for budgets
- [ ] Push notifications
- [ ] Sales pipeline overview
- [ ] Contact management
- [ ] Multi-organization switching

**LIVE PRODUCTION OPTIMIZATION REQUIREMENTS:**
- Offline mode (venues often have poor connectivity)
- Crew check-in/check-out with GPS
- Photo documentation (take and attach to tasks/issues instantly)
- Walkie-talkie style push-to-talk
- Emergency alert broadcast
- Day-of run sheet with real-time updates
- QR code scanner for equipment tracking

---

## PHASE 2: IMPLEMENTATION PRIORITIES

After completing the gap analysis, implement in this order:

### Priority 1: Revenue-Critical (Week 1-2)
1. Budgeting engine with production-specific categories and rate cards
2. Time tracking with crew-specific features (overtime, meal penalties, turnaround)
3. Invoicing with progressive billing and settlement worksheets
4. CRM pipeline with deal-to-project conversion

### Priority 2: Operations-Critical (Week 3-4)
5. Resource planning with crew scheduling and conflict detection
6. Task automations and production phase workflow engine
7. People management with contractor database and certification tracking
8. Project templates per production type

### Priority 3: Intelligence-Critical (Week 5-6)
9. Reporting engine with financial, utilization, and production-specific reports
10. Dashboard builder with customizable widgets
11. AI-powered report generation
12. Automated periodic reports (Pulse equivalent)

### Priority 4: Ecosystem-Critical (Week 7-8)
13. Docs and collaboration with production document templates
14. Client portal with appropriate access controls
15. Integration framework (API, webhooks, Zapier-equivalent)
16. Mobile app with offline mode and crew check-in

---

## PHASE 3: TECHNICAL IMPLEMENTATION STANDARDS

### Database Architecture
- **Third Normal Form (3NF)** minimum for all new tables
- **Row Level Security (RLS)** on every Supabase table
- **Multi-tenant isolation** via organization_id on all records
- **Audit trail** on all financial transactions (immutable append-only)
- **Soft deletes** for all user-facing records
- **UTC timestamps** with timezone-aware display

### API Design
- RESTful endpoints following existing ATLVS patterns
- Supabase Edge Functions for complex business logic
- Real-time subscriptions for collaborative features
- Rate limiting and input validation on all endpoints

### UI/UX Standards
- Follow existing ATLVS design system (Miami aesthetic, dark/light mode)
- Atomic design principles (atoms → molecules → organisms → templates → pages)
- Responsive design: desktop-first with mobile optimization
- Loading states, error states, and empty states for every view
- Keyboard shortcuts for power users
- Drag-and-drop where contextually appropriate

### Performance Requirements
- Sub-200ms API response times
- Optimistic UI updates for all CRUD operations
- Infinite scroll / virtual lists for large datasets
- Background sync for offline-capable features

---

## PHASE 4: STRATEGIC DIFFERENTIATORS (EXCEED PRODUCTIVE.IO)

After achieving feature parity, implement these ATLVS-exclusive features that Productive.io cannot offer:

1. **Production Phase Intelligence** — AI that learns from past productions to predict budget overruns, scheduling conflicts, and resource shortfalls before they happen
2. **5 Senses Framework Integration** — Built-in tools for designing multisensory experiences (audio, visual, tactile, olfactory, gustatory) mapped to venue zones
3. **XYZ Spatial-Temporal Engine** — 3D venue mapping with time-based resource placement (where is every person and piece of equipment at every minute)
4. **Live Show Dashboard** — Real-time command center for show day with crew GPS, equipment status, timeline adherence, weather, and emergency protocols
5. **Settlement Automation** — One-click event settlement that reconciles all costs, generates client invoice, calculates profit, and archives the production
6. **Vendor Marketplace** — Internal marketplace connecting GHXSTSHIP's vendor network with production needs (eventually GVTEWAY integration)
7. **Experience Scoring** — Post-event analytics combining operational metrics with audience feedback and social media sentiment
8. **Tour/Series Management** — Multi-date production management with shared resources, progressive learning, and aggregate financial tracking
9. **Union Compliance Engine** — Automated labor rule checking for IATSE, Teamsters, and local union jurisdictions
10. **Sustainability Tracker** — Carbon footprint, waste, and sustainability metrics per production with certification support

---

## EXECUTION INSTRUCTIONS

For each feature you implement:

1. **Create the Supabase migration** (tables, RLS policies, indexes, triggers)
2. **Build the API layer** (Supabase Edge Functions or client-side queries)
3. **Implement the UI components** (following ATLVS design system)
4. **Add real-time subscriptions** where collaborative editing is needed
5. **Write the business logic** with production-lifecycle awareness
6. **Test with production scenarios** (not generic test data — use realistic event production data)
7. **Document the feature** with inline comments and README updates

**Begin with Phase 1 (Feature Gap Analysis) — audit every module listed above against the current ATLVS codebase and produce a detailed gap report with severity classifications before writing any implementation code.**