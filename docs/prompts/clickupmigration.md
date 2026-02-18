# ClickUp → ATLVS Import Bridge Schema Map

> **Purpose**: Technical specification for building a data import bridge from ClickUp workspace to ATLVS platform
> **Version**: 1.0 | January 2026
> **Target**: Windsurf AI IDE

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [ClickUp API Reference](#clickup-api-reference)
3. [Entity Mapping Matrix](#entity-mapping-matrix)
4. [ATLVS Database Schema](#atlvs-database-schema)
5. [Field Mapping Specifications](#field-mapping-specifications)
6. [Relationship Mapping](#relationship-mapping)
7. [Data Transformations](#data-transformations)
8. [Sync Strategy](#sync-strategy)
9. [API Endpoints](#api-endpoints)
10. [Error Handling](#error-handling)

---

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│    CLICKUP      │         │  IMPORT BRIDGE   │         │     ATLVS       │
│    WORKSPACE    │────────▶│                  │────────▶│    DATABASE     │
│                 │         │  • Extract       │         │                 │
│  5 Spaces       │         │  • Transform     │         │  PostgreSQL     │
│  51 Folders     │         │  • Load          │         │  45+ Tables     │
│  192 Lists      │         │  • Sync          │         │  3NF Compliant  │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Design Principles

- **SSOT Preservation**: ClickUp SSOT entities map 1:1 to ATLVS master tables
- **3NF Compliance**: All relationships use foreign keys, no data duplication
- **Incremental Sync**: Track `date_updated` for delta imports
- **Idempotent Operations**: Re-running import produces same result
- **Audit Trail**: All imports logged with timestamps and source IDs

---

## ClickUp API Reference

### Authentication

```typescript
const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

interface ClickUpConfig {
  apiKey: string;           // Personal API token or OAuth token
  workspaceId: string;      // Team/Workspace ID
  rateLimitPerMinute: 100;  // API rate limit
}
```

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/team/{team_id}/space` | GET | List all spaces |
| `/space/{space_id}/folder` | GET | List folders in space |
| `/folder/{folder_id}/list` | GET | List lists in folder |
| `/list/{list_id}/task` | GET | Get tasks with custom fields |
| `/task/{task_id}` | GET | Get single task details |
| `/list/{list_id}/field` | GET | Get custom field definitions |

### Pagination

```typescript
interface ClickUpPagination {
  page: number;           // 0-indexed
  order_by: string;       // 'created', 'updated', 'due_date'
  reverse: boolean;       // true = descending
  subtasks: boolean;      // include subtasks
  statuses: string[];     // filter by status
  include_closed: boolean;
  date_updated_gt: number; // Unix timestamp for delta sync
}
```

---

## Entity Mapping Matrix

### Space → Schema Mapping

| ClickUp Space | ATLVS Schema | Primary Tables |
|---------------|--------------|----------------|
| `Projects` | `projects` | `productions`, `events`, `activations`, `permits`, `shipments` |
| `Workforce` | `workforce` | `personnel`, `talent`, `certifications`, `time_entries` |
| `Assets` | `assets` | `assets`, `catalog_items`, `venues`, `reservations`, `maintenance_orders` |
| `Business` | `business` | `accounts`, `contacts`, `deals`, `proposals`, `contracts` |
| `Finance` | `finance` | `invoices`, `bills`, `purchase_orders`, `budgets`, `transactions` |

### List → Table Mapping (Complete)

#### PROJECTS Space

| ClickUp List | ATLVS Table | Entity Type |
|--------------|-------------|-------------|
| `Productions > All Productions` | `projects.productions` | Production |
| `Productions > Production Templates` | `projects.production_templates` | Template |
| `Events > All Events` | `projects.events` | Event |
| `Events > Event Templates` | `projects.event_templates` | Template |
| `Activations > All Activations` | `projects.activations` | Activation |
| `Compliance > Permits` | `projects.permits` | Permit |
| `Compliance > Certificates of Insurance` | `projects.certificates_of_insurance` | COI |
| `Compliance > Safety Plans` | `projects.safety_plans` | SafetyPlan |
| `Compliance > Fire Marshal Approvals` | `projects.fire_marshal_approvals` | Approval |
| `Deployment > Outbound Shipments` | `projects.shipments` | Shipment |
| `Deployment > Pull Lists` | `projects.pull_lists` | PullList |
| `Deployment > Load Plans` | `projects.load_plans` | LoadPlan |
| `Deployment > Site Advances` | `projects.site_advances` | Advance |
| `Installation > Install Work Orders` | `projects.install_work_orders` | WorkOrder |
| `Installation > Daily Site Reports` | `projects.daily_site_reports` | Report |
| `Installation > Site Crew Assignments` | `projects.site_crew_assignments` | Assignment |
| `Installation > Site Issues` | `projects.site_issues` | Issue |
| `Operations > Run of Show` | `projects.run_of_show` | ROSElement |
| `Operations > Crew Positions` | `projects.show_crew_positions` | Position |
| `Operations > Comms Plan` | `projects.comms_plans` | CommsPlan |
| `Operations > Incident Log` | `projects.show_incidents` | Incident |
| `Restoration > Strike Work Orders` | `projects.strike_work_orders` | WorkOrder |
| `Restoration > Return Shipments` | `projects.return_shipments` | Shipment |
| `Restoration > Damage Reports` | `projects.damage_reports` | DamageReport |
| `Restoration > Venue Restoration` | `projects.venue_restoration_tasks` | Task |
| `Punch Lists > Active Punch Items` | `projects.punch_items` | PunchItem |
| `Inspections > QC Inspections` | `projects.qc_inspections` | Inspection |
| `Inspections > Safety Inspections` | `projects.safety_inspections` | Inspection |
| `Inspections > Client Walkthroughs` | `projects.client_walkthroughs` | Walkthrough |
| `Inspections > Final Sign-Offs` | `projects.final_signoffs` | SignOff |
| `Files > Document Index` | `projects.document_index` | DocumentRef |

#### WORKFORCE Space

| ClickUp List | ATLVS Table | Entity Type |
|--------------|-------------|-------------|
| `Rosters > Personnel` | `workforce.personnel` | Person |
| `Rosters > Talent Pool` | `workforce.talent` | Talent |
| `Availability > Availability Submissions` | `workforce.availability` | Availability |
| `Availability > Blackout Dates` | `workforce.blackout_dates` | Blackout |
| `Travel & Lodging > Travel Requests` | `workforce.travel_requests` | TravelRequest |
| `Travel & Lodging > Flights` | `workforce.flights` | Flight |
| `Travel & Lodging > Hotels` | `workforce.hotels` | Hotel |
| `Travel & Lodging > Ground Transport` | `workforce.ground_transport` | Transport |
| `Travel & Lodging > Per Diems` | `workforce.per_diems` | PerDiem |
| `Recruitment > Open Positions` | `workforce.requisitions` | Requisition |
| `Recruitment > Candidates` | `workforce.candidates` | Candidate |
| `Recruitment > Interview Schedule` | `workforce.interviews` | Interview |
| `Recruitment > Offers` | `workforce.offers` | Offer |
| `Onboarding > Active Onboarding` | `workforce.onboarding` | Onboarding |
| `Onboarding > Onboarding Tasks` | `workforce.onboarding_tasks` | Task |
| `Training > Training Catalog` | `workforce.training_programs` | Program |
| `Training > Training Assignments` | `workforce.training_assignments` | Assignment |
| `Training > Completions` | `workforce.training_completions` | Completion |
| `Training > Training Schedule` | `workforce.training_sessions` | Session |
| `Scheduling > Crew Calls` | `workforce.crew_calls` | CrewCall |
| `Scheduling > Shift Schedule` | `workforce.shifts` | Shift |
| `Scheduling > On-Call Roster` | `workforce.on_call` | OnCall |
| `Scheduling > Schedule Requests` | `workforce.schedule_requests` | Request |
| `Timekeeping > Time Entries` | `workforce.time_entries` | TimeEntry |
| `Timekeeping > Timesheets` | `workforce.timesheets` | Timesheet |
| `Performance > Performance Reviews` | `workforce.performance_reviews` | Review |
| `Performance > Goals` | `workforce.goals` | Goal |
| `Performance > Feedback` | `workforce.feedback` | Feedback |
| `Performance > PIPs` | `workforce.pips` | PIP |
| `Incidents > Incident Reports` | `workforce.incident_reports` | Incident |
| `Incidents > Near Misses` | `workforce.near_misses` | NearMiss |
| `Incidents > Safety Observations` | `workforce.safety_observations` | Observation |
| `Incidents > Workers Comp Claims` | `workforce.workers_comp_claims` | Claim |
| `Certifications > Active Certifications` | `workforce.certifications` | Certification |
| `Positions > Job Catalog` | `workforce.positions` | Position |
| `Positions > Org Chart` | `workforce.org_nodes` | OrgNode |
| `Positions > Headcount Plan` | `workforce.headcount_plan` | Headcount |
| `Community > Team Events` | `workforce.team_events` | Event |
| `Community > Recognition` | `workforce.recognition` | Recognition |
| `Community > Announcements` | `workforce.announcements` | Announcement |
| `Community > Suggestions` | `workforce.suggestions` | Suggestion |

#### ASSETS Space

| ClickUp List | ATLVS Table | Entity Type |
|--------------|-------------|-------------|
| `Inventory > All Assets` | `assets.assets` | Asset |
| `Logistics > Fleet Vehicles` | `assets.vehicles` | Vehicle |
| `Logistics > Carriers` | `assets.carriers` | Carrier |
| `Logistics > Shipment Tracking` | `assets.shipment_tracking` | Shipment |
| `Logistics > Freight Quotes` | `assets.freight_quotes` | Quote |
| `Maintenance > Work Orders` | `assets.maintenance_orders` | WorkOrder |
| `Maintenance > Preventive Schedule` | `assets.pm_schedules` | PMSchedule |
| `Maintenance > Service History` | `assets.service_history` | ServiceRecord |
| `Maintenance > Parts Inventory` | `assets.parts` | Part |
| `Tracking > GPS Devices` | `assets.gps_devices` | GPSUnit |
| `Tracking > Location Log` | `assets.location_log` | LocationEntry |
| `Tracking > Check-In/Out Log` | `assets.custody_log` | CustodyTransaction |
| `Tracking > Missing Items` | `assets.missing_items` | MissingItem |
| `Reservations > All Reservations` | `assets.reservations` | Reservation |
| `Orders > Purchase Requests` | `assets.purchase_requests` | PurchaseRequest |
| `Orders > Rental Orders` | `assets.rental_orders` | RentalOrder |
| `Orders > Receiving` | `assets.receiving` | Receipt |
| `Orders > Returns to Vendor` | `assets.vendor_returns` | Return |
| `Advances > Site Advances` | `assets.site_advances` | Advance |
| `Advances > Advance Reports` | `assets.advance_reports` | Report |
| `Advances > Venue Specs` | `assets.venue_specs` | SpecSheet |
| `Catalog > Audio Equipment` | `assets.catalog_items` | CatalogItem |
| `Catalog > Lighting Equipment` | `assets.catalog_items` | CatalogItem |
| `Catalog > Video Equipment` | `assets.catalog_items` | CatalogItem |
| `Catalog > Staging & Decks` | `assets.catalog_items` | CatalogItem |
| `Catalog > Scenic Elements` | `assets.catalog_items` | CatalogItem |
| `Catalog > Furniture & Décor` | `assets.catalog_items` | CatalogItem |
| `Catalog > Rigging Hardware` | `assets.catalog_items` | CatalogItem |
| `Catalog > Power & Distro` | `assets.catalog_items` | CatalogItem |
| `Catalog > Tools & Consumables` | `assets.catalog_items` | CatalogItem |
| `Catalog > Venues` | `assets.venues` | Venue |

#### BUSINESS Space

| ClickUp List | ATLVS Table | Entity Type |
|--------------|-------------|-------------|
| `Pipeline > All Deals` | `business.deals` | Deal |
| `Contracts > All Contracts` | `business.contracts` | Contract |
| `Proposals > All Proposals` | `business.proposals` | Proposal |
| `Proposals > Proposal Templates` | `business.proposal_templates` | Template |
| `Products & Services > Service Catalog` | `business.services` | Service |
| `Products & Services > Package Offerings` | `business.packages` | Package |
| `Products & Services > Rate Card` | `business.rates` | Rate |
| `Campaigns > All Campaigns` | `business.campaigns` | Campaign |
| `Content > Content Calendar` | `business.content` | Content |
| `Content > Social Posts` | `business.social_posts` | Post |
| `Content > Blog Articles` | `business.articles` | Article |
| `Content > Case Studies` | `business.case_studies` | CaseStudy |
| `Content > Press Releases` | `business.press_releases` | PressRelease |
| `Brand Kit > Brand Guidelines` | `business.brand_guidelines` | Guideline |
| `Brand Kit > Logo Files` | `business.brand_assets` | BrandAsset |
| `Brand Kit > Templates` | `business.brand_templates` | Template |
| `Organization > Legal Entities` | `business.legal_entities` | Entity |
| `Organization > Departments` | `business.departments` | Department |
| `Organization > Locations` | `business.locations` | Location |
| `Organization > Business Licenses` | `business.business_licenses` | License |
| `Organization > Insurance Policies` | `business.insurance_policies` | Policy |
| `Directory > All Accounts` | `business.accounts` | Account |
| `Directory > Contacts` | `business.contacts` | Contact |

#### FINANCE Space

| ClickUp List | ATLVS Table | Entity Type |
|--------------|-------------|-------------|
| `Budgets > Project Budgets` | `finance.project_budgets` | Budget |
| `Budgets > Department Budgets` | `finance.department_budgets` | Budget |
| `Budgets > Annual Budget` | `finance.annual_budgets` | Budget |
| `Budgets > Budget Templates` | `finance.budget_templates` | Template |
| `Revenue > All Invoices` | `finance.invoices` | Invoice |
| `Revenue > Payments Received` | `finance.payments_received` | Payment |
| `Expenses > All Bills` | `finance.bills` | Bill |
| `Expenses > Expense Reports` | `finance.expense_reports` | ExpenseReport |
| `Expenses > Credit Memos` | `finance.credit_memos` | CreditMemo |
| `Procurement > Purchase Orders` | `finance.purchase_orders` | PurchaseOrder |
| `Procurement > Receiving` | `finance.receiving` | Receipt |
| `Transactions > Bank Transactions` | `finance.transactions` | Transaction |
| `Transactions > Payments Out` | `finance.payments_out` | Payment |
| `Transactions > Payments In` | `finance.deposits` | Deposit |
| `Transactions > Transfers` | `finance.transfers` | Transfer |
| `Payroll > Payroll Runs` | `finance.payroll_runs` | PayrollRun |
| `Payroll > Paychecks` | `finance.paychecks` | Paycheck |
| `Payroll > Payroll Adjustments` | `finance.payroll_adjustments` | Adjustment |
| `Payroll > Tax Filings` | `finance.tax_filings` | Filing |
| `Reconciliation > Bank Reconciliation` | `finance.reconciliations` | Reconciliation |
| `Accounts > Chart of Accounts` | `finance.gl_accounts` | GLAccount |
| `Accounts > Cost Centers` | `finance.cost_centers` | CostCenter |
| `Accounts > Bank Accounts` | `finance.bank_accounts` | BankAccount |
| `Reports > Monthly Reports` | `finance.reports` | Report |
| `Reports > Project P&Ls` | `finance.project_pnl` | ProjectPnL |

---

## ATLVS Database Schema

### Schema Creation

```sql
-- Create schemas
CREATE SCHEMA IF NOT EXISTS projects;
CREATE SCHEMA IF NOT EXISTS workforce;
CREATE SCHEMA IF NOT EXISTS assets;
CREATE SCHEMA IF NOT EXISTS business;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS sync;  -- For import bridge metadata
```

### Core Tables

#### sync.import_log (Audit Trail)

```sql
CREATE TABLE sync.import_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_system VARCHAR(50) NOT NULL DEFAULT 'clickup',
    source_id VARCHAR(100) NOT NULL,           -- ClickUp task ID
    target_schema VARCHAR(50) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    target_id UUID,                            -- ATLVS record ID
    operation VARCHAR(20) NOT NULL,            -- INSERT, UPDATE, SKIP
    status VARCHAR(20) NOT NULL,               -- SUCCESS, FAILED, PENDING
    error_message TEXT,
    payload JSONB,                             -- Original ClickUp data
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    imported_by VARCHAR(100)
);

CREATE INDEX idx_import_log_source ON sync.import_log(source_system, source_id);
CREATE INDEX idx_import_log_target ON sync.import_log(target_schema, target_table, target_id);
CREATE INDEX idx_import_log_status ON sync.import_log(status, imported_at);
```

#### sync.field_mapping (Dynamic Field Map)

```sql
CREATE TABLE sync.field_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_space VARCHAR(100) NOT NULL,
    clickup_list VARCHAR(200) NOT NULL,
    clickup_field_id VARCHAR(100),             -- Custom field ID
    clickup_field_name VARCHAR(200) NOT NULL,
    clickup_field_type VARCHAR(50) NOT NULL,
    atlvs_schema VARCHAR(50) NOT NULL,
    atlvs_table VARCHAR(100) NOT NULL,
    atlvs_column VARCHAR(100) NOT NULL,
    atlvs_column_type VARCHAR(50) NOT NULL,
    transform_function VARCHAR(200),           -- Optional transformation
    is_required BOOLEAN DEFAULT FALSE,
    is_relationship BOOLEAN DEFAULT FALSE,
    relationship_target VARCHAR(200),          -- schema.table for FK
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_field_mapping_unique 
ON sync.field_mapping(clickup_space, clickup_list, clickup_field_name);
```

#### sync.sync_state (Delta Tracking)

```sql
CREATE TABLE sync.sync_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_list_id VARCHAR(100) NOT NULL UNIQUE,
    clickup_list_name VARCHAR(200) NOT NULL,
    last_sync_at TIMESTAMPTZ,
    last_task_updated_at BIGINT,               -- Unix timestamp from ClickUp
    tasks_synced INTEGER DEFAULT 0,
    tasks_failed INTEGER DEFAULT 0,
    sync_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Master Entity Tables

#### business.accounts (CRM - SSOT)

```sql
CREATE TABLE business.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_task_id VARCHAR(100) UNIQUE,       -- Source reference
    
    -- Business Fields
    account_id VARCHAR(20) UNIQUE NOT NULL,    -- ACCT-XXXX
    account_name VARCHAR(200) NOT NULL,
    account_type VARCHAR(50) NOT NULL,         -- Client, Prospect, Vendor, Partner, Venue
    industry VARCHAR(100),
    website VARCHAR(500),
    phone VARCHAR(50),
    address_street VARCHAR(200),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'USA',
    
    -- Relationship Fields
    account_owner_id UUID REFERENCES workforce.personnel(id),
    parent_account_id UUID REFERENCES business.accounts(id),
    
    -- Financial Fields
    lifetime_value DECIMAL(15,2) DEFAULT 0,
    payment_terms VARCHAR(20),                 -- Net 15, 30, 45, 60
    credit_limit DECIMAL(15,2),
    tax_id VARCHAR(50),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PROSPECT',
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

CREATE INDEX idx_accounts_type ON business.accounts(account_type);
CREATE INDEX idx_accounts_status ON business.accounts(status);
CREATE INDEX idx_accounts_owner ON business.accounts(account_owner_id);
```

#### business.contacts (SSOT)

```sql
CREATE TABLE business.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_task_id VARCHAR(100) UNIQUE,
    
    -- Identity
    contact_id VARCHAR(20) UNIQUE NOT NULL,    -- CONT-XXXX
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    title VARCHAR(100),
    
    -- Contact Info
    email VARCHAR(200),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Relationships
    account_id UUID NOT NULL REFERENCES business.accounts(id),
    
    -- Attributes
    role VARCHAR(50),                          -- Decision Maker, Influencer, User, Admin
    is_primary BOOLEAN DEFAULT FALSE,
    linkedin_url VARCHAR(500),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_account ON business.contacts(account_id);
CREATE INDEX idx_contacts_email ON business.contacts(email);
```

#### workforce.personnel (SSOT)

```sql
CREATE TABLE workforce.personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_task_id VARCHAR(100) UNIQUE,
    
    -- Identity
    employee_id VARCHAR(20) UNIQUE NOT NULL,   -- EMP-XXXX
    legal_name VARCHAR(200) NOT NULL,
    preferred_name VARCHAR(100),
    email VARCHAR(200) UNIQUE,
    phone VARCHAR(50),
    
    -- Employment
    employment_type VARCHAR(50) NOT NULL,      -- Full-Time, Part-Time, Freelance, Contractor
    department VARCHAR(100),
    position_id UUID REFERENCES workforce.positions(id),
    manager_id UUID REFERENCES workforce.personnel(id),
    primary_facility VARCHAR(50),              -- NYC, Vegas, Miami, Remote
    
    -- Compensation
    hourly_rate DECIMAL(10,2),
    ot_rate DECIMAL(10,2),
    union_affiliation VARCHAR(50),
    
    -- Dates
    hire_date DATE,
    term_date DATE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PROSPECT',
    
    -- Additional
    skills TEXT[],                             -- Array of skills
    emergency_contact VARCHAR(200),
    tshirt_size VARCHAR(10),
    headshot_url VARCHAR(500),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_personnel_status ON workforce.personnel(status);
CREATE INDEX idx_personnel_department ON workforce.personnel(department);
CREATE INDEX idx_personnel_manager ON workforce.personnel(manager_id);
CREATE INDEX idx_personnel_facility ON workforce.personnel(primary_facility);
```

#### assets.assets (SSOT)

```sql
CREATE TABLE assets.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_task_id VARCHAR(100) UNIQUE,
    
    -- Identity
    asset_id VARCHAR(20) UNIQUE NOT NULL,      -- AST-XXXX
    asset_name VARCHAR(200) NOT NULL,
    serial_number VARCHAR(100),
    barcode VARCHAR(100),
    
    -- Classification
    catalog_item_id UUID REFERENCES assets.catalog_items(id),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Location
    home_facility VARCHAR(50) NOT NULL,        -- NYC, Vegas, Miami
    current_location VARCHAR(100),
    current_project_id UUID,                   -- FK to projects when deployed
    
    -- Condition & Value
    condition VARCHAR(50),                     -- Excellent, Good, Fair, Poor
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    current_value DECIMAL(12,2),
    warranty_expiration DATE,
    
    -- Maintenance
    next_maintenance_date DATE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    
    -- Media
    photo_url VARCHAR(500),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_status ON assets.assets(status);
CREATE INDEX idx_assets_facility ON assets.assets(home_facility);
CREATE INDEX idx_assets_location ON assets.assets(current_location);
CREATE INDEX idx_assets_catalog ON assets.assets(catalog_item_id);
CREATE INDEX idx_assets_project ON assets.assets(current_project_id);
```

#### assets.catalog_items (SSOT)

```sql
CREATE TABLE assets.catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_task_id VARCHAR(100) UNIQUE,
    
    -- Identity
    sku VARCHAR(50) UNIQUE NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    
    -- Classification
    category VARCHAR(100) NOT NULL,            -- Audio, Lighting, Video, etc.
    subcategory VARCHAR(100),
    
    -- Description
    description TEXT,
    
    -- Specifications
    weight_lbs DECIMAL(10,2),
    dimensions VARCHAR(100),                   -- L x W x H
    power_requirements VARCHAR(100),
    
    -- Pricing
    msrp DECIMAL(12,2),
    our_cost DECIMAL(12,2),
    rental_rate_day DECIMAL(10,2),
    rental_rate_week DECIMAL(10,2),
    
    -- Media
    spec_sheet_url VARCHAR(500),
    photo_url VARCHAR(500),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_catalog_category ON assets.catalog_items(category);
CREATE INDEX idx_catalog_manufacturer ON assets.catalog_items(manufacturer);
```

#### assets.venues (SSOT)

```sql
CREATE TABLE assets.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_task_id VARCHAR(100) UNIQUE,
    
    -- Identity
    venue_code VARCHAR(20) UNIQUE NOT NULL,    -- VEN-XXX
    venue_name VARCHAR(200) NOT NULL,
    venue_type VARCHAR(50),                    -- Arena, Theater, Convention, Outdoor, Club, Hotel
    
    -- Location
    address_street VARCHAR(200),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'USA',
    
    -- Specifications
    capacity INTEGER,
    stage_dimensions VARCHAR(100),             -- W x D x H
    rigging_points INTEGER,
    rigging_capacity VARCHAR(100),
    power_available VARCHAR(100),
    has_loading_dock BOOLEAN DEFAULT FALSE,
    has_green_room BOOLEAN DEFAULT FALSE,
    
    -- Contacts
    primary_contact_name VARCHAR(200),
    primary_contact_phone VARCHAR(50),
    primary_contact_email VARCHAR(200),
    
    -- Media
    photo_gallery_url VARCHAR(500),
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venues_type ON assets.venues(venue_type);
CREATE INDEX idx_venues_city ON assets.venues(address_city);
```

#### projects.productions (SSOT)

```sql
CREATE TABLE projects.productions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_task_id VARCHAR(100) UNIQUE,
    
    -- Identity
    production_id VARCHAR(20) UNIQUE NOT NULL, -- PRD-YYYY-XXX
    production_name VARCHAR(200) NOT NULL,
    production_type VARCHAR(50),               -- Stage, Scenic, Touring, Installation
    
    -- Relationships
    client_id UUID REFERENCES business.accounts(id),
    venue_id UUID REFERENCES assets.venues(id),
    budget_id UUID REFERENCES finance.project_budgets(id),
    project_manager_id UUID REFERENCES workforce.personnel(id),
    account_executive_id UUID REFERENCES workforce.personnel(id),
    
    -- Location
    facility VARCHAR(50),                      -- NYC, Vegas, Miami, Multi
    
    -- Dates
    event_start DATE,
    event_end DATE,
    load_in_date DATE,
    strike_date DATE,
    
    -- Financial
    contract_value DECIMAL(15,2),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'INTAKE',
    health VARCHAR(50) DEFAULT 'On Track',     -- On Track, At Risk, Critical, Blocked
    
    -- External Links
    drive_folder_url VARCHAR(500),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_productions_status ON projects.productions(status);
CREATE INDEX idx_productions_client ON projects.productions(client_id);
CREATE INDEX idx_productions_dates ON projects.productions(event_start, event_end);
CREATE INDEX idx_productions_pm ON projects.productions(project_manager_id);
```

#### business.deals (SSOT)

```sql
CREATE TABLE business.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_task_id VARCHAR(100) UNIQUE,
    
    -- Identity
    deal_id VARCHAR(20) UNIQUE NOT NULL,       -- DEAL-YYYY-XXX
    deal_name VARCHAR(200) NOT NULL,
    
    -- Relationships
    account_id UUID REFERENCES business.accounts(id),
    account_executive_id UUID REFERENCES workforce.personnel(id),
    
    -- Contact
    contact_name VARCHAR(200),
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    
    -- Classification
    lead_source VARCHAR(50),                   -- Referral, Website, Event, Cold, Repeat
    project_type VARCHAR(50),                  -- Production, Event, Activation
    
    -- Financials
    estimated_value DECIMAL(15,2),
    win_probability INTEGER,                   -- 0-100
    weighted_value DECIMAL(15,2) GENERATED ALWAYS AS (estimated_value * win_probability / 100) STORED,
    
    -- Dates
    event_date DATE,
    decision_date DATE,
    closed_date DATE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'LEAD',
    
    -- Win/Loss
    competitors TEXT[],
    loss_reason VARCHAR(100),
    
    -- Links
    proposal_id UUID REFERENCES business.proposals(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deals_status ON business.deals(status);
CREATE INDEX idx_deals_account ON business.deals(account_id);
CREATE INDEX idx_deals_ae ON business.deals(account_executive_id);
CREATE INDEX idx_deals_dates ON business.deals(decision_date, event_date);
```

#### finance.invoices (SSOT)

```sql
CREATE TABLE finance.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_task_id VARCHAR(100) UNIQUE,
    
    -- Identity
    invoice_number VARCHAR(20) UNIQUE NOT NULL, -- INV-YYYY-XXXX
    
    -- Relationships
    project_id UUID,                           -- FK to productions/events/activations
    project_type VARCHAR(50),                  -- Production, Event, Activation
    client_id UUID REFERENCES business.accounts(id),
    contract_id UUID REFERENCES business.contracts(id),
    
    -- Classification
    invoice_type VARCHAR(50),                  -- Progress, Final, Deposit, Change Order
    
    -- Dates
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    -- Terms
    payment_terms VARCHAR(20),                 -- Net 15, 30, 45, 60
    
    -- Amounts
    amount DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    balance_due DECIMAL(15,2) GENERATED ALWAYS AS (amount - amount_paid) STORED,
    
    -- Accounting
    gl_code VARCHAR(50),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    
    -- Calculated
    days_outstanding INTEGER GENERATED ALWAYS AS (
        CASE WHEN status IN ('SENT', 'VIEWED', 'PARTIAL', 'OVERDUE') 
        THEN EXTRACT(DAY FROM (CURRENT_DATE - due_date))::INTEGER 
        ELSE 0 END
    ) STORED,
    
    -- Links
    invoice_url VARCHAR(500),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_status ON finance.invoices(status);
CREATE INDEX idx_invoices_client ON finance.invoices(client_id);
CREATE INDEX idx_invoices_project ON finance.invoices(project_id, project_type);
CREATE INDEX idx_invoices_dates ON finance.invoices(due_date, invoice_date);
```

#### finance.purchase_orders (SSOT)

```sql
CREATE TABLE finance.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_task_id VARCHAR(100) UNIQUE,
    
    -- Identity
    po_number VARCHAR(20) UNIQUE NOT NULL,     -- PO-YYYY-XXXX
    
    -- Relationships
    vendor_id UUID REFERENCES business.accounts(id),
    project_id UUID,
    project_type VARCHAR(50),
    budget_id UUID REFERENCES finance.project_budgets(id),
    
    -- Dates
    po_date DATE NOT NULL,
    delivery_date DATE,
    
    -- Shipping
    ship_to VARCHAR(50),                       -- NYC, Vegas, Miami, Site
    ship_to_address TEXT,
    
    -- Amounts
    subtotal DECIMAL(15,2),
    tax DECIMAL(15,2) DEFAULT 0,
    shipping DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) GENERATED ALWAYS AS (subtotal + tax + shipping) STORED,
    
    -- Accounting
    gl_code VARCHAR(50),
    terms VARCHAR(20),                         -- Net 15, 30, 45, 60
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    
    -- Links
    document_url VARCHAR(500),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_po_status ON finance.purchase_orders(status);
CREATE INDEX idx_po_vendor ON finance.purchase_orders(vendor_id);
CREATE INDEX idx_po_project ON finance.purchase_orders(project_id, project_type);
```

---

## Field Mapping Specifications

### ClickUp Field Types → PostgreSQL Types

| ClickUp Type | PostgreSQL Type | Transform Notes |
|--------------|-----------------|-----------------|
| `short_text` | `VARCHAR(n)` | Direct mapping |
| `text` | `TEXT` | Direct mapping |
| `number` | `INTEGER` or `DECIMAL` | Based on decimal places |
| `currency` | `DECIMAL(15,2)` | Convert from cents if needed |
| `date` | `DATE` or `TIMESTAMPTZ` | Parse ISO format |
| `checkbox` | `BOOLEAN` | true/false |
| `dropdown` | `VARCHAR(100)` | Store selected value |
| `labels` | `TEXT[]` | PostgreSQL array |
| `email` | `VARCHAR(200)` | Direct mapping |
| `phone` | `VARCHAR(50)` | Direct mapping |
| `url` | `VARCHAR(500)` | Direct mapping |
| `relationship` | `UUID` (FK) | Resolve ClickUp ID → ATLVS UUID |
| `people` | `UUID` (FK) | Map ClickUp user → personnel |
| `formula` | `GENERATED COLUMN` | Recreate in PostgreSQL |

### Status Mapping

```typescript
const STATUS_MAPS = {
  // Productions
  productions: {
    'INTAKE': 'INTAKE',
    'SCOPING': 'SCOPING',
    'PROPOSAL': 'PROPOSAL',
    'AWARDED': 'AWARDED',
    'DESIGN': 'DESIGN',
    'FABRICATION': 'FABRICATION',
    'DEPLOYMENT': 'DEPLOYMENT',
    'INSTALLATION': 'INSTALLATION',
    'SHOW': 'SHOW',
    'STRIKE': 'STRIKE',
    'CLOSEOUT': 'CLOSEOUT',
    'ARCHIVED': 'ARCHIVED'
  },
  
  // Personnel
  personnel: {
    'PROSPECT': 'PROSPECT',
    'SCREENING': 'SCREENING',
    'INTERVIEWING': 'INTERVIEWING',
    'OFFER': 'OFFER',
    'ONBOARDING': 'ONBOARDING',
    'ACTIVE': 'ACTIVE',
    'ON LEAVE': 'ON_LEAVE',
    'OFFBOARDING': 'OFFBOARDING',
    'INACTIVE': 'INACTIVE',
    'ALUMNI': 'ALUMNI'
  },
  
  // Assets
  assets: {
    'AVAILABLE': 'AVAILABLE',
    'RESERVED': 'RESERVED',
    'PULLED': 'PULLED',
    'IN TRANSIT': 'IN_TRANSIT',
    'ON SITE': 'ON_SITE',
    'IN USE': 'IN_USE',
    'RETURNING': 'RETURNING',
    'CHECK-IN': 'CHECK_IN',
    'MAINTENANCE': 'MAINTENANCE',
    'RETIRED': 'RETIRED'
  },
  
  // Deals
  deals: {
    'LEAD': 'LEAD',
    'QUALIFYING': 'QUALIFYING',
    'DISCOVERY': 'DISCOVERY',
    'PROPOSAL': 'PROPOSAL',
    'NEGOTIATING': 'NEGOTIATING',
    'VERBAL': 'VERBAL',
    'CONTRACT': 'CONTRACT',
    'WON': 'WON',
    'LOST': 'LOST',
    'ON HOLD': 'ON_HOLD'
  },
  
  // Invoices
  invoices: {
    'DRAFT': 'DRAFT',
    'PENDING APPROVAL': 'PENDING_APPROVAL',
    'APPROVED': 'APPROVED',
    'SENT': 'SENT',
    'VIEWED': 'VIEWED',
    'PARTIAL': 'PARTIAL',
    'PAID': 'PAID',
    'OVERDUE': 'OVERDUE',
    'COLLECTIONS': 'COLLECTIONS',
    'WRITTEN OFF': 'WRITTEN_OFF'
  }
};
```

---

## Relationship Mapping

### Cross-Reference Resolution

```typescript
interface RelationshipResolver {
  // ClickUp relationship field → ATLVS foreign key
  resolvers: {
    'Project Link': async (clickupTaskIds: string[]) => {
      // Query sync.import_log to find ATLVS UUIDs
      // Returns: UUID[] from projects.productions/events/activations
    },
    'Account Link': async (clickupTaskIds: string[]) => {
      // Returns: UUID[] from business.accounts
    },
    'Client Link': async (clickupTaskIds: string[]) => {
      // Returns: UUID[] from business.accounts WHERE account_type = 'Client'
    },
    'Vendor Link': async (clickupTaskIds: string[]) => {
      // Returns: UUID[] from business.accounts WHERE account_type = 'Vendor'
    },
    'Personnel Link': async (clickupTaskIds: string[]) => {
      // Returns: UUID[] from workforce.personnel
    },
    'Asset Link': async (clickupTaskIds: string[]) => {
      // Returns: UUID[] from assets.assets
    },
    'Catalog Link': async (clickupTaskIds: string[]) => {
      // Returns: UUID[] from assets.catalog_items
    },
    'Venue Link': async (clickupTaskIds: string[]) => {
      // Returns: UUID[] from assets.venues
    },
    'Budget Link': async (clickupTaskIds: string[]) => {
      // Returns: UUID[] from finance.project_budgets
    },
    'Deal Link': async (clickupTaskIds: string[]) => {
      // Returns: UUID[] from business.deals
    },
    'PO Link': async (clickupTaskIds: string[]) => {
      // Returns: UUID[] from finance.purchase_orders
    },
    'Position Link': async (clickupTaskIds: string[]) => {
      // Returns: UUID[] from workforce.positions
    }
  }
}
```

### Relationship Resolution Query

```sql
-- Function to resolve ClickUp task ID to ATLVS UUID
CREATE OR REPLACE FUNCTION sync.resolve_clickup_id(
    p_clickup_task_id VARCHAR(100),
    p_target_schema VARCHAR(50) DEFAULT NULL,
    p_target_table VARCHAR(100) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_atlvs_id UUID;
BEGIN
    SELECT target_id INTO v_atlvs_id
    FROM sync.import_log
    WHERE source_id = p_clickup_task_id
      AND source_system = 'clickup'
      AND status = 'SUCCESS'
      AND (p_target_schema IS NULL OR target_schema = p_target_schema)
      AND (p_target_table IS NULL OR target_table = p_target_table)
    ORDER BY imported_at DESC
    LIMIT 1;
    
    RETURN v_atlvs_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Data Transformations

### Transform Functions

```typescript
// Transform module for ClickUp → ATLVS data conversion

export const transforms = {
  
  // Generate ATLVS ID from ClickUp data
  generateId: (prefix: string, date: Date, sequence: number): string => {
    const year = date.getFullYear();
    const seq = sequence.toString().padStart(3, '0');
    return `${prefix}-${year}-${seq}`;
  },
  
  // Parse ClickUp date (Unix timestamp in ms)
  parseDate: (clickupDate: number | string | null): Date | null => {
    if (!clickupDate) return null;
    if (typeof clickupDate === 'number') {
      return new Date(clickupDate);
    }
    return new Date(clickupDate);
  },
  
  // Parse currency (ClickUp stores as string or number)
  parseCurrency: (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const num = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.-]/g, ''))
      : value;
    return isNaN(num) ? null : Math.round(num * 100) / 100;
  },
  
  // Parse labels/multi-select to array
  parseLabels: (labels: any[]): string[] => {
    if (!Array.isArray(labels)) return [];
    return labels.map(l => typeof l === 'string' ? l : l.name || l.label);
  },
  
  // Normalize status
  normalizeStatus: (status: string, statusMap: Record<string, string>): string => {
    const normalized = status?.toUpperCase().trim();
    return statusMap[normalized] || normalized || 'UNKNOWN';
  },
  
  // Parse ClickUp user to personnel reference
  parseUser: async (clickupUser: any, db: Database): Promise<string | null> => {
    if (!clickupUser?.id) return null;
    // Look up by ClickUp user ID or email
    const personnel = await db.query(
      `SELECT id FROM workforce.personnel 
       WHERE clickup_user_id = $1 OR email = $2`,
      [clickupUser.id, clickupUser.email]
    );
    return personnel.rows[0]?.id || null;
  },
  
  // Extract custom field value by name
  extractCustomField: (task: ClickUpTask, fieldName: string): any => {
    const field = task.custom_fields?.find(
      f => f.name.toLowerCase() === fieldName.toLowerCase()
    );
    if (!field) return null;
    
    // Handle different field types
    switch (field.type) {
      case 'drop_down':
        return field.type_config?.options?.find(o => o.orderindex === field.value)?.name;
      case 'labels':
        return field.value?.map(v => 
          field.type_config?.options?.find(o => o.id === v)?.label
        ).filter(Boolean);
      case 'date':
        return field.value ? new Date(parseInt(field.value)) : null;
      case 'currency':
        return field.value ? parseFloat(field.value) : null;
      case 'number':
        return field.value !== null ? parseFloat(field.value) : null;
      case 'checkbox':
        return field.value === 'true' || field.value === true;
      case 'users':
        return field.value?.[0]?.id || null;
      case 'tasks': // Relationship field
        return field.value?.map(t => t.id) || [];
      default:
        return field.value;
    }
  }
};
```

### Entity-Specific Transformers

```typescript
// Production transformer
export const transformProduction = async (
  task: ClickUpTask,
  ctx: TransformContext
): Promise<Partial<Production>> => {
  const { transforms, resolvers } = ctx;
  
  return {
    clickup_task_id: task.id,
    production_id: transforms.extractCustomField(task, 'Production ID') 
      || transforms.generateId('PRD', new Date(), ctx.sequence),
    production_name: task.name,
    production_type: transforms.extractCustomField(task, 'Production Type'),
    
    // Resolve relationships
    client_id: await resolvers['Client Link'](
      transforms.extractCustomField(task, 'Client Link')
    ),
    venue_id: await resolvers['Venue Link'](
      transforms.extractCustomField(task, 'Venue Link')
    ),
    budget_id: await resolvers['Budget Link'](
      transforms.extractCustomField(task, 'Budget Link')
    ),
    project_manager_id: await transforms.parseUser(
      transforms.extractCustomField(task, 'Project Manager'),
      ctx.db
    ),
    account_executive_id: await transforms.parseUser(
      transforms.extractCustomField(task, 'Account Executive'),
      ctx.db
    ),
    
    // Dates
    event_start: transforms.parseDate(transforms.extractCustomField(task, 'Event Start')),
    event_end: transforms.parseDate(transforms.extractCustomField(task, 'Event End')),
    load_in_date: transforms.parseDate(transforms.extractCustomField(task, 'Load-In Date')),
    strike_date: transforms.parseDate(transforms.extractCustomField(task, 'Strike Date')),
    
    // Financial
    contract_value: transforms.parseCurrency(
      transforms.extractCustomField(task, 'Contract Value')
    ),
    
    // Status
    status: transforms.normalizeStatus(task.status?.status, STATUS_MAPS.productions),
    health: transforms.extractCustomField(task, 'Health') || 'On Track',
    
    // Links
    drive_folder_url: transforms.extractCustomField(task, 'Drive Folder'),
    
    // Metadata
    facility: transforms.extractCustomField(task, 'Facility'),
    updated_at: new Date()
  };
};

// Account transformer
export const transformAccount = async (
  task: ClickUpTask,
  ctx: TransformContext
): Promise<Partial<Account>> => {
  const { transforms } = ctx;
  
  return {
    clickup_task_id: task.id,
    account_id: transforms.extractCustomField(task, 'Account ID')
      || transforms.generateId('ACCT', new Date(), ctx.sequence),
    account_name: task.name,
    account_type: transforms.extractCustomField(task, 'Account Type') || 'Prospect',
    industry: transforms.extractCustomField(task, 'Industry'),
    website: transforms.extractCustomField(task, 'Website'),
    phone: transforms.extractCustomField(task, 'Phone'),
    address_street: transforms.extractCustomField(task, 'Address'),
    address_city: transforms.extractCustomField(task, 'City'),
    address_state: transforms.extractCustomField(task, 'State'),
    address_zip: transforms.extractCustomField(task, 'Zip'),
    
    // Resolve owner
    account_owner_id: await transforms.parseUser(
      transforms.extractCustomField(task, 'Account Owner'),
      ctx.db
    ),
    
    // Financial
    lifetime_value: transforms.parseCurrency(
      transforms.extractCustomField(task, 'Lifetime Value')
    ),
    payment_terms: transforms.extractCustomField(task, 'Payment Terms'),
    credit_limit: transforms.parseCurrency(
      transforms.extractCustomField(task, 'Credit Limit')
    ),
    tax_id: transforms.extractCustomField(task, 'Tax ID'),
    
    // Status
    status: transforms.normalizeStatus(task.status?.status, STATUS_MAPS.accounts),
    
    notes: task.description,
    updated_at: new Date()
  };
};
```

---

## Sync Strategy

### Import Order (Dependency Resolution)

```typescript
// Import order to respect foreign key dependencies
const IMPORT_ORDER = [
  // Tier 1: No dependencies (SSOT masters)
  { schema: 'workforce', table: 'positions', list: 'Positions > Job Catalog' },
  { schema: 'assets', table: 'catalog_items', list: 'Catalog > *' },
  { schema: 'assets', table: 'venues', list: 'Catalog > Venues' },
  { schema: 'business', table: 'accounts', list: 'Directory > All Accounts' },
  { schema: 'finance', table: 'gl_accounts', list: 'Accounts > Chart of Accounts' },
  
  // Tier 2: Depends on Tier 1
  { schema: 'business', table: 'contacts', list: 'Directory > Contacts' },
  { schema: 'workforce', table: 'personnel', list: 'Rosters > Personnel' },
  { schema: 'workforce', table: 'talent', list: 'Rosters > Talent Pool' },
  { schema: 'assets', table: 'assets', list: 'Inventory > All Assets' },
  { schema: 'assets', table: 'carriers', list: 'Logistics > Carriers' },
  
  // Tier 3: Depends on Tier 1 & 2
  { schema: 'finance', table: 'project_budgets', list: 'Budgets > Project Budgets' },
  { schema: 'business', table: 'deals', list: 'Pipeline > All Deals' },
  { schema: 'business', table: 'services', list: 'Products & Services > Service Catalog' },
  
  // Tier 4: Depends on Tier 1-3
  { schema: 'projects', table: 'productions', list: 'Productions > All Productions' },
  { schema: 'projects', table: 'events', list: 'Events > All Events' },
  { schema: 'projects', table: 'activations', list: 'Activations > All Activations' },
  { schema: 'business', table: 'proposals', list: 'Proposals > All Proposals' },
  { schema: 'business', table: 'contracts', list: 'Contracts > All Contracts' },
  
  // Tier 5: Project-dependent entities
  { schema: 'finance', table: 'invoices', list: 'Revenue > All Invoices' },
  { schema: 'finance', table: 'purchase_orders', list: 'Procurement > Purchase Orders' },
  { schema: 'finance', table: 'bills', list: 'Expenses > All Bills' },
  { schema: 'projects', table: 'permits', list: 'Compliance > Permits' },
  { schema: 'projects', table: 'shipments', list: 'Deployment > Outbound Shipments' },
  { schema: 'assets', table: 'reservations', list: 'Reservations > All Reservations' },
  { schema: 'workforce', table: 'crew_calls', list: 'Scheduling > Crew Calls' },
  
  // Tier 6: Operational entities
  { schema: 'workforce', table: 'time_entries', list: 'Timekeeping > Time Entries' },
  { schema: 'workforce', table: 'certifications', list: 'Certifications > Active Certifications' },
  { schema: 'assets', table: 'maintenance_orders', list: 'Maintenance > Work Orders' },
  { schema: 'projects', table: 'install_work_orders', list: 'Installation > Install Work Orders' },
  { schema: 'projects', table: 'punch_items', list: 'Punch Lists > Active Punch Items' },
  
  // Continue for all remaining lists...
];
```

### Sync Modes

```typescript
enum SyncMode {
  FULL = 'full',           // Complete re-import (truncate + insert)
  INCREMENTAL = 'incremental', // Delta sync (date_updated_gt)
  SELECTIVE = 'selective'  // Specific lists only
}

interface SyncConfig {
  mode: SyncMode;
  lists?: string[];        // For selective mode
  since?: Date;            // For incremental mode
  dryRun?: boolean;        // Validate without writing
  batchSize?: number;      // Tasks per batch (default: 100)
  concurrency?: number;    // Parallel list processing (default: 3)
}
```

### Incremental Sync Logic

```typescript
async function incrementalSync(listId: string, ctx: SyncContext): Promise<SyncResult> {
  // Get last sync state
  const state = await ctx.db.query(
    `SELECT last_task_updated_at FROM sync.sync_state WHERE clickup_list_id = $1`,
    [listId]
  );
  
  const lastUpdated = state.rows[0]?.last_task_updated_at || 0;
  
  // Fetch updated tasks from ClickUp
  const tasks = await ctx.clickup.getTasks(listId, {
    date_updated_gt: lastUpdated,
    include_closed: true,
    subtasks: true
  });
  
  let maxUpdated = lastUpdated;
  const results: ImportResult[] = [];
  
  for (const task of tasks) {
    const result = await processTask(task, ctx);
    results.push(result);
    
    if (task.date_updated > maxUpdated) {
      maxUpdated = task.date_updated;
    }
  }
  
  // Update sync state
  await ctx.db.query(
    `INSERT INTO sync.sync_state (clickup_list_id, clickup_list_name, last_sync_at, last_task_updated_at, tasks_synced, tasks_failed, sync_status)
     VALUES ($1, $2, NOW(), $3, $4, $5, 'COMPLETE')
     ON CONFLICT (clickup_list_id) DO UPDATE SET
       last_sync_at = NOW(),
       last_task_updated_at = $3,
       tasks_synced = sync.sync_state.tasks_synced + $4,
       tasks_failed = sync.sync_state.tasks_failed + $5,
       sync_status = 'COMPLETE',
       updated_at = NOW()`,
    [
      listId,
      ctx.listName,
      maxUpdated,
      results.filter(r => r.status === 'SUCCESS').length,
      results.filter(r => r.status === 'FAILED').length
    ]
  );
  
  return { listId, results };
}
```

---

## API Endpoints

### Import Bridge REST API

```typescript
// Express/Fastify route definitions

/**
 * POST /api/sync/full
 * Trigger full sync of all lists
 */
app.post('/api/sync/full', async (req, res) => {
  const { dryRun = false } = req.body;
  const jobId = await queueFullSync({ dryRun });
  res.json({ jobId, status: 'queued' });
});

/**
 * POST /api/sync/incremental
 * Trigger incremental sync
 */
app.post('/api/sync/incremental', async (req, res) => {
  const jobId = await queueIncrementalSync();
  res.json({ jobId, status: 'queued' });
});

/**
 * POST /api/sync/list/:listId
 * Sync specific list
 */
app.post('/api/sync/list/:listId', async (req, res) => {
  const { listId } = req.params;
  const { mode = 'incremental' } = req.body;
  const jobId = await queueListSync(listId, mode);
  res.json({ jobId, status: 'queued' });
});

/**
 * GET /api/sync/status/:jobId
 * Get sync job status
 */
app.get('/api/sync/status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const status = await getSyncJobStatus(jobId);
  res.json(status);
});

/**
 * GET /api/sync/state
 * Get all list sync states
 */
app.get('/api/sync/state', async (req, res) => {
  const states = await db.query('SELECT * FROM sync.sync_state ORDER BY last_sync_at DESC');
  res.json(states.rows);
});

/**
 * GET /api/sync/log
 * Get import log with filtering
 */
app.get('/api/sync/log', async (req, res) => {
  const { status, schema, table, limit = 100, offset = 0 } = req.query;
  const logs = await getImportLogs({ status, schema, table, limit, offset });
  res.json(logs);
});

/**
 * POST /api/mapping/refresh
 * Refresh field mappings from ClickUp
 */
app.post('/api/mapping/refresh', async (req, res) => {
  await refreshFieldMappings();
  res.json({ status: 'refreshed' });
});

/**
 * GET /api/mapping
 * Get current field mappings
 */
app.get('/api/mapping', async (req, res) => {
  const mappings = await db.query('SELECT * FROM sync.field_mapping ORDER BY clickup_space, clickup_list');
  res.json(mappings.rows);
});

/**
 * POST /api/resolve/:clickupId
 * Resolve ClickUp ID to ATLVS UUID
 */
app.post('/api/resolve/:clickupId', async (req, res) => {
  const { clickupId } = req.params;
  const atlvsId = await resolveClickUpId(clickupId);
  res.json({ clickupId, atlvsId });
});
```

### Webhook Handler (Real-time Sync)

```typescript
/**
 * POST /api/webhook/clickup
 * Handle ClickUp webhooks for real-time updates
 */
app.post('/api/webhook/clickup', async (req, res) => {
  const { event, task_id, history_items } = req.body;
  
  // Verify webhook signature
  const signature = req.headers['x-signature'];
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  switch (event) {
    case 'taskCreated':
    case 'taskUpdated':
      await queueTaskSync(task_id);
      break;
    case 'taskDeleted':
      await markTaskDeleted(task_id);
      break;
    case 'taskStatusUpdated':
      await syncTaskStatus(task_id, history_items);
      break;
    default:
      console.log(`Unhandled event: ${event}`);
  }
  
  res.json({ received: true });
});
```

---

## Error Handling

### Error Types

```typescript
enum ImportErrorType {
  VALIDATION = 'VALIDATION',       // Data validation failed
  TRANSFORM = 'TRANSFORM',         // Transformation error
  RELATIONSHIP = 'RELATIONSHIP',   // FK resolution failed
  DATABASE = 'DATABASE',           // DB write error
  API = 'API',                     // ClickUp API error
  RATE_LIMIT = 'RATE_LIMIT',       // API rate limited
  TIMEOUT = 'TIMEOUT'              // Operation timeout
}

interface ImportError {
  type: ImportErrorType;
  message: string;
  clickupTaskId: string;
  field?: string;
  originalValue?: any;
  expectedType?: string;
  stack?: string;
}
```

### Error Recovery

```typescript
const errorHandlers: Record<ImportErrorType, ErrorHandler> = {
  
  [ImportErrorType.VALIDATION]: async (error, task, ctx) => {
    // Log validation error, skip task
    await logImportError(error, task, 'SKIPPED');
    return { action: 'skip', reason: error.message };
  },
  
  [ImportErrorType.RELATIONSHIP]: async (error, task, ctx) => {
    // Queue for retry after dependency imports
    await queueRetry(task.id, { 
      reason: 'pending_relationship',
      dependency: error.field 
    });
    return { action: 'retry_later' };
  },
  
  [ImportErrorType.RATE_LIMIT]: async (error, task, ctx) => {
    // Exponential backoff
    const delay = Math.min(60000, 1000 * Math.pow(2, ctx.retryCount));
    await sleep(delay);
    return { action: 'retry_now' };
  },
  
  [ImportErrorType.DATABASE]: async (error, task, ctx) => {
    if (error.message.includes('unique constraint')) {
      // Duplicate - try upsert
      return { action: 'upsert' };
    }
    await logImportError(error, task, 'FAILED');
    return { action: 'skip' };
  },
  
  [ImportErrorType.TIMEOUT]: async (error, task, ctx) => {
    if (ctx.retryCount < 3) {
      return { action: 'retry_now' };
    }
    await logImportError(error, task, 'FAILED');
    return { action: 'skip' };
  }
};
```

### Validation Rules

```typescript
const validationRules: Record<string, ValidationRule[]> = {
  'business.accounts': [
    { field: 'account_name', required: true, maxLength: 200 },
    { field: 'account_type', required: true, enum: ['Client', 'Prospect', 'Vendor', 'Partner', 'Venue'] },
    { field: 'email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { field: 'payment_terms', enum: ['Net 15', 'Net 30', 'Net 45', 'Net 60'] }
  ],
  
  'workforce.personnel': [
    { field: 'legal_name', required: true, maxLength: 200 },
    { field: 'email', required: true, unique: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { field: 'employment_type', required: true, enum: ['Full-Time', 'Part-Time', 'Freelance', 'Contractor'] },
    { field: 'hourly_rate', min: 0, max: 1000 }
  ],
  
  'assets.assets': [
    { field: 'asset_name', required: true, maxLength: 200 },
    { field: 'home_facility', required: true, enum: ['NYC', 'Vegas', 'Miami'] },
    { field: 'status', required: true },
    { field: 'purchase_price', min: 0 }
  ],
  
  'finance.invoices': [
    { field: 'invoice_number', required: true, unique: true, pattern: /^INV-\d{4}-\d{4}$/ },
    { field: 'client_id', required: true, foreignKey: 'business.accounts' },
    { field: 'amount', required: true, min: 0 },
    { field: 'invoice_date', required: true },
    { field: 'due_date', required: true }
  ]
};
```

---

## Usage Examples

### Full Import

```bash
# Trigger full sync via CLI
curl -X POST http://localhost:3000/api/sync/full \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'

# Response
{
  "jobId": "sync-2026-01-28-abc123",
  "status": "queued",
  "estimatedDuration": "15-30 minutes"
}
```

### Incremental Sync

```bash
# Trigger incremental sync
curl -X POST http://localhost:3000/api/sync/incremental

# Check status
curl http://localhost:3000/api/sync/status/sync-2026-01-28-abc123
```

### Single List Sync

```bash
# Sync specific list
curl -X POST http://localhost:3000/api/sync/list/901234567890 \
  -H "Content-Type: application/json" \
  -d '{"mode": "full"}'
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create PostgreSQL schemas and base tables
- [ ] Set up sync metadata tables (import_log, field_mapping, sync_state)
- [ ] Implement ClickUp API client with rate limiting
- [ ] Build core transform functions

### Phase 2: Entity Transformers
- [ ] Implement Account transformer
- [ ] Implement Contact transformer
- [ ] Implement Personnel transformer
- [ ] Implement Asset transformer
- [ ] Implement Catalog Item transformer
- [ ] Implement Venue transformer
- [ ] Implement Production transformer
- [ ] Implement Deal transformer
- [ ] Implement Invoice transformer
- [ ] Implement PO transformer
- [ ] Implement remaining entity transformers

### Phase 3: Relationship Resolution
- [ ] Build relationship resolver service
- [ ] Implement cross-reference lookup
- [ ] Handle circular dependencies
- [ ] Add retry queue for pending relationships

### Phase 4: Sync Engine
- [ ] Implement full sync mode
- [ ] Implement incremental sync mode
- [ ] Add job queue (Bull/BullMQ)
- [ ] Build progress tracking

### Phase 5: API & Webhooks
- [ ] Build REST API endpoints
- [ ] Implement webhook handler
- [ ] Add authentication/authorization
- [ ] Build admin dashboard

### Phase 6: Testing & Validation
- [ ] Unit tests for transformers
- [ ] Integration tests for sync flows
- [ ] Data validation tests
- [ ] Performance benchmarks

---

## Notes for Windsurf

1. **Start with SSOT tables** - Import master entities first (accounts, personnel, assets, catalog)
2. **Batch API calls** - ClickUp rate limit is 100/min, use pagination
3. **Use transactions** - Wrap related inserts in transactions
4. **Idempotent upserts** - Use `ON CONFLICT DO UPDATE` for re-runnability
5. **Log everything** - Every import operation should be logged to sync.import_log
6. **Handle nulls** - ClickUp custom fields can be null/undefined
7. **Status normalization** - Map ClickUp statuses to ATLVS enum values
8. **Relationship resolution** - Resolve after all SSOT entities imported

---

*Generated for GHXSTSHIP Industries LLC | ATLVS Platform*