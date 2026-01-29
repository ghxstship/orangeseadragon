# Optimized Information Architecture (v5)

> **Status**: ✅ IMPLEMENTED
> **Date**: January 29, 2026
> **Routes**: All 57 pages created, legacy `/modules/` deleted

## Design Principles

1. **Lifecycle-Driven Modules**: Organize by WHEN work happens, not WHAT it is
2. **Entity Ownership**: Each entity has ONE canonical home (SSOT)
3. **FK-Based Lookups**: Related data accessed via foreign key relationships, not duplication
4. **Cognitive Load Reduction**: Max 7±2 items per navigation level
5. **Zero Overlap**: No entity appears in multiple modules/pages
6. **Progressive Disclosure**: Show complexity only when needed
7. **Catalog-Centric Equipment Management**: Equipment catalog (Uline-style) is SSOT for all physical assets; Products/Services are business-level managed
8. **Category Normalization**: All equipment types (vehicles, AV gear, staging, etc.) are catalog categories, not separate entities

---

## Entity Relationship Model

### Core Entities & Canonical Locations

| Entity | Canonical Module | FK Relationships |
|--------|------------------|------------------|
| `production` | PRODUCTIONS | → events[], budgets[], build_strike_schedules[] |
| `event` | PRODUCTIONS | → production_id, venue_id, shows[] |
| `venue` | OPERATIONS | → floor_plans[], zones[], checkpoints[] |
| `person` | PEOPLE | → positions[], certifications[], schedules[] |
| `company` | BUSINESS | → contacts[], contracts[], type (client/vendor/partner) |
| `contact` | BUSINESS | → company_id, person_id (optional) |
| `catalog_item` | ASSETS | → category_id, deployments[], advances[] (equipment only) |
| `asset` | ASSETS | → catalog_item_id, reservations[], maintenance[] |
| `location` | ASSETS | → assets[], type (warehouse/staging/on-site) |
| `budget` | FINANCE | → production_id, line_items[], transactions[] |
| `invoice` | FINANCE | → company_id, line_items[], payments[] |

### Lookup Pattern (Not Duplication)

When a page needs related data, it uses FK lookups:
- **Events page** shows venue info via `event.venue_id → venues.lookup()`
- **Budgets page** shows production info via `budget.production_id → productions.lookup()`
- **Schedules page** shows person info via `schedule.person_id → people.lookup()`
- **Advances page** shows catalog info via `advance.catalog_item_id → catalog.lookup()`
- **Products page** shows offerings via `product.id` (BUSINESS-owned, not Catalog)

**Never duplicate the entity in multiple modules.**

---

## Optimized Module Structure

### Overview: 7 Modules

| Module | Purpose | Lifecycle Phase |
|--------|---------|-----------------|
| **CORE** | Personal productivity | Always |
| **PRODUCTIONS** | Plan → Build → Strike | Pre/Post Event |
| **OPERATIONS** | Run of Show | During Event |
| **PEOPLE** | Human resources & scheduling | Cross-cutting |
| **ASSETS** | Equipment, products, services & logistics | Cross-cutting |
| **BUSINESS** | Revenue + Relationships | Cross-cutting |
| **FINANCE** | Money In/Out | Cross-cutting |

**PEOPLE** (formerly Workforce): All human resource management
**ASSETS**: All physical/virtual assets with full lifecycle from Catalog → Advance → Deploy → Track → Maintain

**NETWORK** moves to a separate community/social layer (not core workflow)

---

## Module 1: CORE (Personal Workspace)

**Purpose**: Individual productivity and unified views across all modules.

### Pages (6)

| Page | Entity | Tabs | Description |
|------|--------|------|-------------|
| **Dashboard** | - | - | Unified command center |
| **Calendar** | - | - | Aggregated calendar (all modules) |
| **Tasks** | `task` | - | Personal task list |
| **Inbox** | `notification` | - | Unified notifications/approvals |
| **Documents** | `document` | - | Personal document library |
| **Workflows** | `workflow` | - | Personal automations |

### Structure

```
CORE
├── Dashboard
├── Calendar
├── Tasks
├── Inbox
├── Documents
└── Workflows
```

---

## Module 2: PRODUCTIONS (Pre/Post Event Lifecycle)

**Purpose**: Everything from concept to load-in and from load-out to wrap. The production schedule (Build & Strike) is the heartbeat of this module.

### Canonical Entities

| Entity | Description |
|--------|-------------|
| `production` | Master production record |
| `event` | Individual event within a production |
| `activation` | Brand activation/sponsorship execution |
| `build_strike_task` | Build/setup or strike/teardown task |
| `inspection` | Pre/post event inspection |
| `punch_item` | Deficiency/fix item |
| `advancing` | Artist/vendor advance coordination |
| `permit` | Permit/license/certificate |

### Pages (8)

| Page | Entity | Tabs (Related Entities) | FK Lookups |
|------|--------|------------------------|------------|
| **Productions** | `production` | - | budgets, events |
| **Events** | `event` | - | production, venue, shows |
| **Activations** | `activation` | - | production, company (sponsor) |
| **Build & Strike** | `build_strike_task` | - | production, venue (production schedule lives here) |
| **Compliance** | `permit` | Permits, Licenses, Certificates | production |
| **Inspections** | `inspection` | - | production, venue |
| **Punch Lists** | `punch_item` | - | production, inspection |
| **Advancing** | `advancing` | Riders, Tech Specs | production, company (artist/vendor) |

### Structure

```
PRODUCTIONS
├── Productions
├── Events
├── Activations
├── Build & Strike (Production Schedule - combines Installation + Restoration)
├── Compliance
│   └── Tabs: Permits | Licenses | Certificates
├── Inspections
├── Punch Lists
└── Advancing
    └── Tabs: Riders | Tech Specs
```

---

## Module 3: OPERATIONS (Run of Show)

**Purpose**: Everything that happens while doors are open.

### Canonical Entities

| Entity | Description |
|--------|-------------|
| `show` | Live show/performance |
| `runsheet` | Real-time schedule/cue sheet |
| `venue` | Physical location (canonical home) |
| `floor_plan` | Venue floor plan |
| `zone` | Venue zone/area |
| `checkpoint` | Access control point |
| `incident` | Live incident report |
| `work_order` | On-site fix request |
| `daily_report` | End-of-day summary |
| `weather_alert` | Weather monitoring |
| `radio_channel` | Comms channel assignment |

### Pages (7)

| Page | Entity | Tabs (Related Entities) | FK Lookups |
|------|--------|------------------------|------------|
| **Shows** | `show` | - | event, venue, runsheet |
| **Runsheets** | `runsheet` | - | show, event |
| **Venues** | `venue` | Floor Plans, Zones, Checkpoints | - |
| **Incidents** | `incident` | - | event, venue, person (reporter) |
| **Work Orders** | `work_order` | - | venue, asset, person (assignee) |
| **Daily Reports** | `daily_report` | - | event, venue |
| **Comms** | `radio_channel` | Weather | event, venue |

### Structure

```
OPERATIONS
├── Shows
├── Runsheets
├── Venues
│   └── Tabs: Floor Plans | Zones | Checkpoints
├── Incidents
├── Work Orders
├── Daily Reports
└── Comms
    └── Tabs: Radio | Weather
```

---

## Module 4: PEOPLE (Human Resources)

**Purpose**: All human resource management - scheduling, training, performance, payroll coordination.

### Canonical Entities

| Entity | Description |
|--------|-------------|
| `person` | Individual (staff, crew, contractor, talent) |
| `position` | Job role/title |
| `certification` | Person certification/credential |
| `schedule` | Person schedule assignment |
| `availability` | Person availability |
| `timesheet` | Time tracking record |
| `training_record` | Person training completion |
| `performance_review` | Performance evaluation |

### Pages (11)

| Page | Entity | Tabs (Related Entities) | FK Lookups |
|------|--------|------------------------|------------|
| **Rosters** | `person` | - | positions, certifications |
| **Availability** | `availability` | - | person |
| **Travel & Lodging** | `travel_request` | Bookings, Accommodations | person, event |
| **Recruitment** | `candidate` | - | position |
| **Onboarding** | `onboarding_task` | - | person, position |
| **Training** | `training_record` | Courses, Materials | person, certification |
| **Scheduling** | `schedule` | Shifts | person, event |
| **Timekeeping** | `timesheet` | - | person, schedule |
| **Performance** | `performance_review` | Reviews, Goals | person |
| **Certifications** | `certification` | - | person |
| **Positions** | `position` | - | - |

### Structure

```
PEOPLE
├── Rosters
├── Availability
├── Travel & Lodging
│   └── Tabs: Bookings | Accommodations
├── Recruitment
├── Onboarding
├── Training
│   └── Tabs: Courses | Materials
├── Scheduling
│   └── Tabs: Shifts
├── Timekeeping
├── Performance
│   └── Tabs: Reviews | Goals
├── Certifications
└── Positions
```

---

## Module 5: ASSETS (Equipment & Logistics)

**Purpose**: Full equipment lifecycle management from Catalog (Uline-style equipment database) through reservation, deployment, tracking, and maintenance. All equipment types (vehicles, AV, staging, rigging, etc.) are normalized as catalog categories.

### Canonical Entities

| Entity | Description |
|--------|-------------|
| `catalog_item` | Master equipment entry (Uline-style - equipment only, NOT products/services) |
| `category` | Equipment category (vehicles, AV, staging, rigging, power, comms, etc.) |
| `asset` | Physical instance of a catalog item |
| `location` | Storage/staging location (warehouse, staging area, on-site) |
| `advance` | Production advance (gear/equipment sent ahead) |
| `deployment` | Asset/equipment deployment to production |
| `reservation` | Asset reservation request |
| `shipment` | Logistics shipment |
| `maintenance` | Maintenance record |
| `asset_status` | Check-in/out, in-service/out-of-service status record |

### Pages (9) - Ordered by Lifecycle Flow

| Page | Entity | Tabs (Related Entities) | FK Lookups |
|------|--------|------------------------|------------|
| **Catalog** | `catalog_item` | Categories | (equipment SSOT - like Uline) |
| **Inventory** | `asset` | - | catalog_item, location, category |
| **Locations** | `location` | Warehouses, Staging Areas | assets[] |
| **Reservations** | `reservation` | - | asset, event, person (requester) |
| **Advances** | `advance` | - | catalog_item, production |
| **Deployment** | `deployment` | - | assets, production, location |
| **Logistics** | `shipment` | Shipments, Vehicles | assets, deployment, location |
| **Asset Status** | `asset_status` | Check-In/Out, Service Status | asset, person, location |
| **Maintenance** | `maintenance` | Scheduled, Repairs | asset |

### Catalog Category Normalization

All equipment types are categories in the Catalog, NOT separate entities:

| Category | Examples | NOT a separate page |
|----------|----------|---------------------|
| `vehicles` | Trucks, vans, forklifts | ~~Vehicles page~~ |
| `av_equipment` | Speakers, screens, projectors | ~~AV page~~ |
| `staging` | Stages, risers, platforms | ~~Staging page~~ |
| `rigging` | Truss, motors, chain hoists | ~~Rigging page~~ |
| `power` | Generators, distros, cables | ~~Power page~~ |
| `comms` | Radios, intercoms, headsets | ~~Comms page~~ |
| `furniture` | Tables, chairs, tents | ~~Furniture page~~ |
| `signage` | Banners, flags, wayfinding | ~~Signage page~~ |

### Equipment Lifecycle Flow

```
CATALOG (Equipment SSOT - Uline style)
    │
    ├── Category: vehicles, av, staging, rigging, power, comms, etc.
    │
    └── Asset Instance Created → INVENTORY
            │
            ├── Stored at → LOCATIONS (warehouse/staging)
            │
            ├── Reserved for event → RESERVATIONS
            │
            ├── Sent ahead → ADVANCES (production advances)
            │
            ├── Deployed to site → DEPLOYMENT
            │
            ├── Shipped/transported → LOGISTICS
            │
            ├── Status tracked → ASSET STATUS
            │       ├── Check-in/Check-out
            │       ├── In-service/Out-of-service
            │       └── Condition tracking
            │
            └── Maintained → MAINTENANCE
                    ├── Scheduled maintenance
                    └── Repairs
```

### Metrics Aggregation (from Catalog)

The Catalog enables metrics at all levels:
- **Item Level**: Individual asset utilization, maintenance history
- **Category Level**: Category-wide availability, demand patterns (e.g., all vehicles)
- **Team/Event Level**: Per-event asset allocation, costs
- **Production Level**: Cross-event asset usage
- **Organization Level**: Fleet utilization, ROI
- **Platform Level**: Industry trends, benchmarking

### Structure

```
ASSETS (Ordered by lifecycle flow)
├── Catalog (Equipment SSOT - Uline style)
│   └── Tabs: Categories
├── Inventory
├── Locations
│   └── Tabs: Warehouses | Staging Areas
├── Reservations
├── Advances (Production Advances)
├── Deployment
├── Logistics
│   └── Tabs: Shipments | Vehicles
├── Asset Status (Check-in/out, Service Status)
│   └── Tabs: Check-In/Out | Service Status
└── Maintenance
    └── Tabs: Scheduled | Repairs
```

---

## Module 6: BUSINESS (Revenue + Relationships)

**Purpose**: All external relationships, revenue generation, and business-level product/service management. Products & Services are business offerings (NOT equipment from Catalog).

### Canonical Entities

| Entity | Description |
|--------|-------------|
| `company` | Organization (client, vendor, partner, sponsor) |
| `contact` | Individual at a company (external people) |
| `deal` | Sales opportunity |
| `proposal` | Formal proposal document |
| `contract` | Signed agreement |
| `product` | Business product offering (NOT equipment) |
| `service` | Business service offering |
| `campaign` | Marketing campaign |
| `subscriber` | Email/marketing subscriber |

### Pages (8) - Ordered by Sales Flow

| Page | Entity | Tabs (Related Entities) | FK Lookups |
|------|--------|------------------------|------------|
| **Pipeline** | `deal` | Leads, Opportunities | company, contact |
| **Companies** | `company` | Contacts | contracts, invoices, deals |
| **Proposals** | `proposal` | - | company, deal, products |
| **Contracts** | `contract` | - | company, production, products |
| **Products & Services** | `product`, `service` | Products, Services | (business-level SSOT) |
| **Campaigns** | `campaign` | Email, Content, Forms | subscribers |
| **Subscribers** | `subscriber` | - | campaign, form |
| **Brand Kit** | `brand_asset` | Logos, Colors, Typography | - |

### Products vs Catalog Distinction

| BUSINESS → Products & Services | ASSETS → Catalog |
|-------------------------------|------------------|
| What you SELL | What you OWN |
| Revenue-generating offerings | Physical equipment inventory |
| Pricing, packages, service tiers | Serial numbers, locations, maintenance |
| Example: "Full AV Package - $5,000" | Example: "JBL VTX A12 #SN-12345" |
| Example: "Stage Management Service" | Example: "Forklift - Toyota 8FGU25" |

### Structure

```
BUSINESS (Ordered by sales flow)
├── Pipeline
│   └── Tabs: Leads | Opportunities
├── Companies
│   └── Tabs: Contacts
├── Proposals
├── Contracts
├── Products & Services (Business offerings SSOT)
│   └── Tabs: Products | Services
├── Campaigns
│   └── Tabs: Email | Content | Forms
├── Subscribers
└── Brand Kit
    └── Tabs: Logos | Colors | Typography
```

---

## Module 7: FINANCE (Money In/Out)

**Purpose**: All financial transactions and reporting.

### Canonical Entities

| Entity | Description |
|--------|-------------|
| `budget` | Production/project budget |
| `budget_line` | Budget line item |
| `invoice` | Customer invoice |
| `expense` | Expense record |
| `payment` | Payment (in or out) |
| `transaction` | Ledger transaction |
| `account` | GL/bank account |
| `payroll_run` | Payroll batch |
| `purchase_order` | Procurement PO |

### Pages (8) - Ordered by Financial Flow

| Page | Entity | Tabs (Related Entities) | FK Lookups |
|------|--------|------------------------|------------|
| **Budgets** | `budget` | Line Items | production, catalog_item (for costing) |
| **Procurement** | `purchase_order` | - | company (vendor), budget, catalog_item |
| **Expenses** | `expense` | - | person, production, category |
| **Invoices** | `invoice` | Line Items, Payments | company, production, products |
| **Payments** | `payment` | Incoming, Outgoing | invoice, expense, company |
| **Payroll** | `payroll_run` | Pay Stubs | person, timesheet |
| **Accounts** | `account` | GL, Bank | transactions |
| **Reports** | - | P&L, Cash Flow, AR/AP | Aggregated views |

### Structure

```
FINANCE (Ordered by financial flow)
├── Budgets
│   └── Tabs: Line Items
├── Procurement
├── Expenses
├── Invoices
│   └── Tabs: Line Items | Payments
├── Payments
│   └── Tabs: Incoming | Outgoing
├── Payroll
│   └── Tabs: Pay Stubs
├── Accounts
│   └── Tabs: GL | Bank
└── Reports
    └── Tabs: P&L | Cash Flow | AR/AP
```

---

## Network (Separate Layer)

**NETWORK** is a community/social layer, not a core workflow module. It should be:
- Accessible via header/profile menu
- Not competing for sidebar space with operational modules

```
NETWORK (Header/Profile Access)
├── Connections
├── Discussions
├── Marketplace
├── Opportunities
├── Showcase
└── Challenges
```

---

## Final Optimized Sidebar

```
┌─────────────────────────────────────────────────────────────────────┐
│ CORE (6 pages) - Personal Workspace                                  │
│   Dashboard | Calendar | Tasks | Inbox | Documents | Workflows       │
├─────────────────────────────────────────────────────────────────────┤
│ PRODUCTIONS (8 pages) - Pre/Post Event Lifecycle                     │
│   Productions | Events | Activations | Build & Strike | Compliance | │
│   Inspections | Punch Lists | Advancing                              │
├─────────────────────────────────────────────────────────────────────┤
│ OPERATIONS (7 pages) - Run of Show                                   │
│   Shows | Runsheets | Venues | Incidents | Work Orders |             │
│   Daily Reports | Comms                                              │
├─────────────────────────────────────────────────────────────────────┤
│ PEOPLE (11 pages) - Human Resources                                  │
│   Rosters | Availability | Travel & Lodging | Recruitment |          │
│   Onboarding | Training | Scheduling | Timekeeping | Performance |   │
│   Certifications | Positions                                         │
├─────────────────────────────────────────────────────────────────────┤
│ ASSETS (9 pages) - Equipment & Logistics (Lifecycle Flow)            │
│   Catalog | Inventory | Locations | Reservations | Advances |        │
│   Deployment | Logistics | Asset Status | Maintenance                │
├─────────────────────────────────────────────────────────────────────┤
│ BUSINESS (8 pages) - Revenue + Relationships (Sales Flow)            │
│   Pipeline | Companies | Proposals | Contracts | Products & Services │
│   Campaigns | Subscribers | Brand Kit                                │
├─────────────────────────────────────────────────────────────────────┤
│ FINANCE (8 pages) - Money In/Out (Financial Flow)                    │
│   Budgets | Procurement | Expenses | Invoices | Payments |           │
│   Payroll | Accounts | Reports                                       │
└─────────────────────────────────────────────────────────────────────┘

Total: 7 modules, 57 pages
```

---

## Cognitive Load Analysis

### Before (v2)
- 8 modules
- 70+ pages
- Significant overlap (Incidents in both Workforce and Operations)
- Status-based tabs creating redundancy

### After (v5)
- 7 modules (optimized separation of concerns)
- 57 pages (19% reduction from v2)
- Zero entity overlap
- Tabs only for genuinely different entities
- Clear lifecycle separation (Productions vs Operations)
- Catalog = equipment SSOT (Uline-style); Products/Services = business offerings SSOT
- Page ordering optimized by workflow flow (lifecycle, sales, financial)
- All equipment types normalized as catalog categories (no separate vehicle/AV/staging pages)

### Navigation Depth

| Level | Max Items | Rationale |
|-------|-----------|-----------|
| Modules | 7 | At 7±2 cognitive limit |
| Pages per module | 7-10 | At the limit, but grouped logically |
| Tabs per page | 2-4 | Minimal, only for related entities |

---

## FK Relationship Map

```
production (PRODUCTIONS)
├── → events[]
├── → budget_id (lookup to FINANCE)
├── → build_strike_tasks[]
├── → contracts[] (lookup to BUSINESS)
└── → advances[] (lookup to ASSETS)

event (PRODUCTIONS)
├── → production_id
├── → venue_id (lookup to OPERATIONS)
├── → shows[]
├── → schedules[] (lookup to PEOPLE)
└── → incidents[]

venue (OPERATIONS)
├── → floor_plans[]
├── → zones[]
└── → checkpoints[]

person (PEOPLE)
├── → position_id (lookup)
├── → certifications[]
├── → schedules[]
├── → timesheets[]
└── → expenses[] (lookup to FINANCE)

catalog_item (ASSETS - Equipment SSOT)
├── → category_id (vehicles, av, staging, rigging, power, comms, etc.)
├── → assets[] (physical instances)
├── → advances[]
└── → deployments[]

asset (ASSETS)
├── → catalog_item_id (lookup to Catalog)
├── → location_id (lookup to Locations)
├── → category_id (inherited from catalog_item)
├── → reservations[]
├── → maintenance[]
├── → asset_statuses[] (check-in/out history)
└── → shipments[]

location (ASSETS)
├── → type (enum: warehouse|staging|on-site)
└── → assets[]

product (BUSINESS - Offerings SSOT)
├── → pricing[]
├── → proposal_line_items[]
└── → contract_line_items[]

service (BUSINESS - Offerings SSOT)
├── → pricing[]
├── → proposal_line_items[]
└── → contract_line_items[]

company (BUSINESS)
├── → contacts[]
├── → contracts[]
├── → invoices[] (lookup to FINANCE)
├── → deals[]
└── → type (enum: client|vendor|partner|sponsor)

budget (FINANCE)
├── → production_id (lookup to PRODUCTIONS)
├── → line_items[] (→ catalog_item_id for equipment costing)
├── → line_items[] (→ product_id/service_id for offerings costing)
└── → transactions[]

invoice (FINANCE)
├── → company_id (lookup to BUSINESS)
├── → production_id (lookup to PRODUCTIONS)
├── → line_items[] (→ product_id/service_id)
└── → payments[]
```

---

## 3NF Compliance Verification

| Rule | Status | Implementation |
|------|--------|----------------|
| 1NF: Atomic values | ✅ | No arrays in DB columns, use junction tables |
| 2NF: Full functional dependency | ✅ | All non-key attributes depend on entire PK |
| 3NF: No transitive dependency | ✅ | No derived/calculated fields stored |
| SSOT | ✅ | Each entity has ONE canonical page |
| No overlap | ✅ | Zero entities appear in multiple modules |

---

## SSOT Verification

| Entity | Canonical Location | Accessed From (via FK) |
|--------|-------------------|------------------------|
| `production` | PRODUCTIONS → Productions | Events, Budgets, Contracts, Build & Strike |
| `event` | PRODUCTIONS → Events | Shows, Schedules, Incidents |
| `build_strike_task` | PRODUCTIONS → Build & Strike | Productions (production schedule) |
| `venue` | OPERATIONS → Venues | Events, Shows, Incidents |
| `person` | PEOPLE → Rosters | Schedules, Timesheets, Expenses, Training |
| `catalog_item` | ASSETS → Catalog | Inventory, Advances, Deployment, Budgets (equipment costing) |
| `category` | ASSETS → Catalog (Categories tab) | catalog_item, asset |
| `asset` | ASSETS → Inventory | Reservations, Maintenance, Logistics, Asset Status |
| `location` | ASSETS → Locations | Inventory, Deployment, Logistics |
| `asset_status` | ASSETS → Asset Status | Asset (check-in/out, service status history) |
| `product` | BUSINESS → Products & Services | Proposals, Contracts, Invoices (offerings costing) |
| `service` | BUSINESS → Products & Services | Proposals, Contracts, Invoices (offerings costing) |
| `company` | BUSINESS → Companies | Contracts, Invoices, Deals |
| `budget` | FINANCE → Budgets | Productions, Expenses |
| `invoice` | FINANCE → Invoices | Companies, Payments |

### Dual SSOT Pattern (Equipment vs Offerings)

| What you OWN (Equipment) | What you SELL (Offerings) |
|--------------------------|---------------------------|
| `catalog_item` → ASSETS | `product` / `service` → BUSINESS |
| Physical inventory | Revenue-generating packages |
| Serial numbers, locations | Pricing, tiers, bundles |
| Maintenance, depreciation | Margins, discounts |
| FK: `budget.line_items.catalog_item_id` | FK: `invoice.line_items.product_id` |

---

## Implementation Priorities

### Phase 1: Core Structure
1. Implement 7-module sidebar navigation
2. Create canonical entity pages
3. Implement FK-based lookups (not duplication)
4. Build Catalog as equipment SSOT (Uline-style)
5. Build Products & Services as business offerings SSOT

### Phase 2: Tab Navigation
1. Add tab navigation component
2. Implement tabs only for related entities
3. Remove all status-based tabs (use filters)

### Phase 3: Cross-Module Linking
1. Implement contextual links between modules
2. Add "Related" sections on detail pages
3. Implement global search across all entities

---

## ClickUp Alignment

| ClickUp Workspace | App Module |
|-------------------|------------|
| Projects (Productions folder) | PRODUCTIONS |
| Projects (Operations folder) | OPERATIONS |
| Workforce | PEOPLE |
| Assets | ASSETS |
| Business | BUSINESS |
| Finance | FINANCE |
| Community | NETWORK (header access) |

---

## Terminology Update (Repo-wide)

**Workforce → People**: All references to "Workforce" should be renamed to "People" throughout the codebase:
- Module name: `PEOPLE`
- Route paths: `/people/*`
- Component directories: `src/app/(app)/people/`
- Config references: Update `navigation.ts` and `ia-structure.ts`
- Database/API: Consider if schema changes needed or just UI labels

---

## 3NF/SSOT Compliance Summary (v5)

### Zero Redundancy Verification

| Potential Overlap | Resolution | Status |
|-------------------|------------|--------|
| Products in Catalog vs Business | **Separated**: Catalog = equipment (what you OWN), Products & Services = offerings (what you SELL) | ✅ |
| Tracking vs Logistics | **Renamed**: Tracking → Asset Status (check-in/out, service status). Logistics = shipments/transport | ✅ |
| Vehicles as separate entity | **Normalized**: Vehicles = catalog category, not separate page | ✅ |
| Contacts vs People | **Clarified**: Contacts = external (BUSINESS), People = internal (PEOPLE) | ✅ |
| Certifications page vs FK | **Valid**: Page manages cert types; person.certifications[] tracks holdings | ✅ |
| Positions page vs FK | **Valid**: Page manages position definitions; person.position_id references | ✅ |
| Work Orders vs Punch Lists | **Valid**: Different lifecycle phases (live vs pre/post) | ✅ |
| Advancing vs Advances | **Valid**: Advancing = artist coordination (PRODUCTIONS), Advances = equipment sent ahead (ASSETS) | ✅ |

### Entity Ownership (No Duplication)

Every entity has exactly ONE canonical home:

| Entity Type | Canonical Module | NOT duplicated in |
|-------------|------------------|-------------------|
| Equipment definitions | ASSETS → Catalog | ~~BUSINESS~~ |
| Equipment instances | ASSETS → Inventory | ~~anywhere else~~ |
| Equipment categories | ASSETS → Catalog (Categories tab) | ~~separate pages~~ |
| Business products | BUSINESS → Products & Services | ~~ASSETS~~ |
| Business services | BUSINESS → Products & Services | ~~ASSETS~~ |
| External people | BUSINESS → Companies (Contacts tab) | ~~PEOPLE~~ |
| Internal people | PEOPLE → Rosters | ~~BUSINESS~~ |
| Check-in/out records | ASSETS → Asset Status | ~~Logistics~~ |

### Page Ordering Rationale

Each module's pages are ordered by **workflow flow**:

| Module | Flow Type | Order Logic |
|--------|-----------|-------------|
| PRODUCTIONS | Lifecycle | Plan → Build → Execute → Inspect → Close |
| OPERATIONS | Run of Show | Shows → Runsheets → Venues → Incidents → Reports |
| PEOPLE | HR Lifecycle | Roster → Availability → Recruit → Onboard → Train → Schedule → Track → Review |
| ASSETS | Equipment Lifecycle | Catalog → Inventory → Locate → Reserve → Advance → Deploy → Ship → Status → Maintain |
| BUSINESS | Sales Flow | Pipeline → Companies → Propose → Contract → Products → Market → Subscribers |
| FINANCE | Financial Flow | Budget → Procure → Expense → Invoice → Pay → Payroll → Accounts → Report |
