# GHXSTSHIP Platform — Information Architecture v1.0

---

## Navigation Structure Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR                                                                      │
│ [Breadcrumbs] ─────────────────── [AI Command] ─── [🔔][📥][⚙️][❓][🌐][🎨][👤] │
├─────────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR                          │ MAIN CONTENT AREA                        │
│                                  │                                          │
│ ┌─ CORE (Personal) ───────────┐  │  ┌──────────────────────────────────┐   │
│ │ Dashboard                   │  │  │                                  │   │
│ │ Calendar                    │  │  │  Page Template                   │   │
│ │ Tasks                       │  │  │  (Component-Driven Layout)       │   │
│ │ Workflows                   │  │  │                                  │   │
│ │ Activity                    │  │  │                                  │   │
│ │ Documents                   │  │  │                                  │   │
│ └─────────────────────────────┘  │  │                                  │   │
│                                  │  │                                  │   │
│ ┌─ MODULES ───────────────────┐  │  │                                  │   │
│ │ Project Management          │  │  │                                  │   │
│ │ Production Management       │  │  │                                  │   │
│ │ Operations Management       │  │  │                                  │   │
│ │ Workforce Management        │  │  │                                  │   │
│ │ Asset Management            │  │  │                                  │   │
│ │ Finance Management          │  │  │                                  │   │
│ │ Business Management         │  │  │                                  │   │
│ └─────────────────────────────┘  │  │                                  │   │
│                                  │  │                                  │   │
│ ┌─ NETWORK ───────────────────┐  │  │                                  │   │
│ │ Showcase                    │  │  │                                  │   │
│ │ Discussions                 │  │  │                                  │   │
│ │ Challenges                  │  │  │                                  │   │
│ │ Marketplace                 │  │  │                                  │   │
│ │ Opportunities               │  │  │                                  │   │
│ │ Connections                 │  │  │                                  │   │
│ └─────────────────────────────┘  │  └──────────────────────────────────┘   │
│                                  │                                          │
│ ┌─ ACCOUNT ───────────────────┐  │                                          │
│ │ (Via User Menu)             │  │                                          │
│ └─────────────────────────────┘  │                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. TOP BAR NAVIGATION

### Route: `@(app)/layout.tsx` — Persistent across all authenticated routes

| Element | Type | Supabase Source | Behavior |
|---------|------|-----------------|----------|
| **Breadcrumbs** | Dynamic | `navigation_breadcrumbs` view | Auto-generated from route hierarchy |
| **AI Command Bar** | Modal Trigger | `ai_commands`, `ai_history` | `⌘K` global shortcut, context-aware |
| **Notifications** | Popover | `notifications` (realtime) | Badge count, mark read, preferences |
| **Inbox** | Popover/Drawer | `messages`, `message_threads` | Unified messaging center |
| **Settings** | Quick Menu | `user_preferences` | Frequently accessed settings |
| **Support** | Modal/Drawer | `support_tickets`, `knowledge_base` | Help center, ticket submission |
| **Language** | Dropdown | `languages`, `user_preferences.locale` | i18n switcher |
| **Theme** | Toggle/Menu | `themes`, `user_preferences.theme` | Light/Dark/System/Custom |
| **User** | Avatar Menu | `profiles`, `organizations` | Profile, org switcher, sign out |

### Top Bar Schema

```sql
-- Navigation state tracking
CREATE TABLE navigation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  current_route TEXT NOT NULL,
  breadcrumb_stack JSONB DEFAULT '[]',
  last_visited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Command history
CREATE TABLE ai_command_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  command_text TEXT NOT NULL,
  context_route TEXT,
  context_entity_type TEXT,
  context_entity_id UUID,
  result_action TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. CORE (Personal)

### Route Group: `@(app)/core/`

| Route | Path | Description | Key Entities |
|-------|------|-------------|--------------|
| **Dashboard** | `/core/dashboard` | Personal command center | `dashboard_widgets`, `dashboard_layouts` |
| **Calendar** | `/core/calendar` | Unified calendar view | `calendar_events`, `calendar_sources` |
| **Tasks** | `/core/tasks` | Personal task management | `tasks`, `task_lists`, `task_labels` |
| **Workflows** | `/core/workflows` | Personal automations | `workflows`, `workflow_triggers`, `workflow_actions` |
| **Activity** | `/core/activity` | Activity feed & history | `activity_logs`, `activity_filters` |
| **Documents** | `/core/documents` | Personal document library | `documents`, `document_folders`, `document_versions` |

### Core Module Schema

```sql
-- Dashboard Configuration
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_type_id UUID REFERENCES widget_types(id),
  name TEXT NOT NULL,
  description TEXT,
  default_config JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  layout_name TEXT NOT NULL DEFAULT 'Default',
  grid_config JSONB NOT NULL, -- {columns, rows, breakpoints}
  widget_placements JSONB NOT NULL, -- [{widget_id, x, y, w, h, config}]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, layout_name)
);

-- Tasks (3NF)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES profiles(id),
  task_list_id UUID REFERENCES task_lists(id),
  parent_task_id UUID REFERENCES tasks(id), -- Subtasks
  title TEXT NOT NULL,
  description TEXT,
  status_id UUID REFERENCES task_statuses(id),
  priority_id UUID REFERENCES task_priorities(id),
  due_date TIMESTAMPTZ,
  estimated_minutes INT,
  actual_minutes INT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  is_complete BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  UNIQUE(org_id, name)
);

CREATE TABLE task_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  level INT NOT NULL, -- 1=highest
  UNIQUE(org_id, name)
);
```

### Core Routes Detail

```
/core
├── /dashboard
│   ├── / ........................ Personal dashboard (widget grid)
│   └── /customize ............... Dashboard layout editor
│
├── /calendar
│   ├── / ........................ Month view (default)
│   ├── /week .................... Week view
│   ├── /day ..................... Day view
│   ├── /agenda .................. List view
│   └── /[event_id] .............. Event detail sheet
│
├── /tasks
│   ├── / ........................ All tasks (filterable)
│   ├── /today ................... Due today
│   ├── /upcoming ................ Next 7 days
│   ├── /lists/[list_id] ......... Specific list view
│   └── /[task_id] ............... Task detail sheet
│
├── /workflows
│   ├── / ........................ Workflow library
│   ├── /new ..................... Workflow builder
│   ├── /[workflow_id] ........... Workflow detail/edit
│   └── /[workflow_id]/runs ....... Execution history
│
├── /activity
│   ├── / ........................ Activity feed
│   └── /filters ................. Saved filter management
│
└── /documents
    ├── / ........................ Root folder view
    ├── /folder/[folder_id] ...... Folder contents
    ├── /[document_id] ........... Document viewer
    └── /[document_id]/versions ... Version history
```

---

## 3. MANAGEMENT MODULES

### Route Group: `@(app)/modules/`

Each module follows an identical structural pattern for consistency:

```
/modules/[module]
├── / ............................ Module dashboard
├── /[entity]/.................... Entity list (table/kanban/calendar)
├── /[entity]/[id] ............... Entity detail
├── /[entity]/[id]/[subentity] ... Nested entity
├── /settings .................... Module-specific settings
└── /reports ..................... Module analytics
```

---

### 3.1 Project Management Module

**Scope**: Team collaboration, project tracking, resource allocation

| Route | Path | Primary Entity |
|-------|------|----------------|
| Dashboard | `/modules/projects` | `projects` |
| Projects | `/modules/projects/projects` | `projects` |
| Sprints | `/modules/projects/sprints` | `sprints` |
| Backlogs | `/modules/projects/backlogs` | `backlog_items` |
| Boards | `/modules/projects/boards` | `kanban_boards` |
| Roadmaps | `/modules/projects/roadmaps` | `roadmap_items` |
| Teams | `/modules/projects/teams` | `teams` |
| Reports | `/modules/projects/reports` | `project_reports` |

```sql
-- Project Management Core Tables
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  parent_project_id UUID REFERENCES projects(id), -- Sub-projects
  name TEXT NOT NULL,
  description TEXT,
  status_id UUID REFERENCES project_statuses(id),
  project_type_id UUID REFERENCES project_types(id),
  lead_id UUID REFERENCES profiles(id),
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  budget_cents BIGINT,
  currency_id UUID REFERENCES currencies(id),
  visibility_id UUID REFERENCES visibility_levels(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES project_roles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);
```

---

### 3.2 Production Management Module

**Scope**: Event lifecycle, department verticals, show/production management

| Route | Path | Primary Entity |
|-------|------|----------------|
| Dashboard | `/modules/production` | Production overview |
| Events | `/modules/production/events` | `events` |
| Shows | `/modules/production/shows` | `shows` |
| Runsheets | `/modules/production/runsheets` | `runsheets` |
| Departments | `/modules/production/departments` | `departments` |
| Advancing | `/modules/production/advancing` | `advancing_sheets` |
| Tech Specs | `/modules/production/tech-specs` | `technical_specifications` |
| Riders | `/modules/production/riders` | `riders` |
| Reports | `/modules/production/reports` | Production analytics |

```sql
-- Production Management Core Tables
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id),
  name TEXT NOT NULL,
  description TEXT,
  event_type_id UUID REFERENCES event_types(id),
  status_id UUID REFERENCES event_statuses(id),
  lifecycle_stage_id UUID REFERENCES event_lifecycle_stages(id),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  doors_datetime TIMESTAMPTZ,
  load_in_datetime TIMESTAMPTZ,
  load_out_datetime TIMESTAMPTZ,
  capacity INT,
  is_public BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_lifecycle_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT NOT NULL,
  color TEXT,
  icon TEXT
);

-- Seed lifecycle stages
INSERT INTO event_lifecycle_stages (name, sort_order) VALUES
  ('Ideation', 1),
  ('Planning', 2),
  ('Pre-Production', 3),
  ('Advancing', 4),
  ('Load-In', 5),
  ('Live', 6),
  ('Load-Out', 7),
  ('Settlement', 8),
  ('Wrap', 9);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  abbreviation TEXT,
  color TEXT,
  icon TEXT,
  parent_department_id UUID REFERENCES departments(id),
  sort_order INT DEFAULT 0,
  UNIQUE(org_id, name)
);

CREATE TABLE runsheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  status_id UUID REFERENCES runsheet_statuses(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE runsheet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  runsheet_id UUID REFERENCES runsheets(id) ON DELETE CASCADE,
  scheduled_time TIME NOT NULL,
  duration_minutes INT,
  item_type_id UUID REFERENCES runsheet_item_types(id),
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  assignee_id UUID REFERENCES profiles(id),
  location TEXT,
  notes TEXT,
  sort_order INT DEFAULT 0
);
```

---

### 3.3 Operations Management Module

**Scope**: Venue management, event operations, logistics, day-of execution

| Route | Path | Primary Entity |
|-------|------|----------------|
| Dashboard | `/modules/operations` | Operations overview |
| Venues | `/modules/operations/venues` | `venues` |
| Floor Plans | `/modules/operations/floor-plans` | `floor_plans` |
| Zones | `/modules/operations/zones` | `venue_zones` |
| Checkpoints | `/modules/operations/checkpoints` | `checkpoints` |
| Incidents | `/modules/operations/incidents` | `incidents` |
| Radio Channels | `/modules/operations/radio` | `radio_channels` |
| Weather | `/modules/operations/weather` | `weather_logs` |
| Reports | `/modules/operations/reports` | Operations analytics |

```sql
-- Operations Management Core Tables
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  venue_type_id UUID REFERENCES venue_types(id),
  address_id UUID REFERENCES addresses(id),
  capacity INT,
  square_footage INT,
  description TEXT,
  amenities JSONB DEFAULT '[]',
  parking_info TEXT,
  load_in_instructions TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  is_owned BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE venue_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  floor_plan_id UUID REFERENCES floor_plans(id),
  name TEXT NOT NULL,
  zone_type_id UUID REFERENCES zone_types(id),
  capacity INT,
  coordinates JSONB, -- For floor plan mapping
  color TEXT,
  access_level_id UUID REFERENCES access_levels(id),
  UNIQUE(venue_id, name)
);

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  venue_id UUID REFERENCES venues(id),
  reported_by UUID REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  incident_type_id UUID REFERENCES incident_types(id),
  severity_id UUID REFERENCES incident_severities(id),
  status_id UUID REFERENCES incident_statuses(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  zone_id UUID REFERENCES venue_zones(id),
  occurred_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.4 Workforce Management Module

**Scope**: Staff scheduling, crew management, credentials, timekeeping

| Route | Path | Primary Entity |
|-------|------|----------------|
| Dashboard | `/modules/workforce` | Workforce overview |
| Roster | `/modules/workforce/roster` | `staff_members` |
| Schedules | `/modules/workforce/schedules` | `schedules` |
| Shifts | `/modules/workforce/shifts` | `shifts` |
| Timesheets | `/modules/workforce/timesheets` | `timesheets` |
| Credentials | `/modules/workforce/credentials` | `credentials` |
| Certifications | `/modules/workforce/certifications` | `certifications` |
| Positions | `/modules/workforce/positions` | `positions` |
| Reports | `/modules/workforce/reports` | Workforce analytics |

```sql
-- Workforce Management Core Tables
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id), -- Null if external/non-user
  employment_type_id UUID REFERENCES employment_types(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  preferred_name TEXT,
  email TEXT,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  shirt_size_id UUID REFERENCES shirt_sizes(id),
  dietary_restrictions TEXT,
  notes TEXT,
  status_id UUID REFERENCES staff_statuses(id),
  hourly_rate_cents BIGINT,
  day_rate_cents BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  name TEXT NOT NULL,
  description TEXT,
  default_hourly_rate_cents BIGINT,
  required_certifications UUID[] DEFAULT '{}',
  color TEXT,
  icon TEXT,
  UNIQUE(org_id, name)
);

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  position_id UUID REFERENCES positions(id),
  staff_member_id UUID REFERENCES staff_members(id),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  break_minutes INT DEFAULT 0,
  location TEXT,
  zone_id UUID REFERENCES venue_zones(id),
  status_id UUID REFERENCES shift_statuses(id),
  check_in_at TIMESTAMPTZ,
  check_out_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  issuing_authority TEXT,
  validity_period_days INT,
  is_required BOOLEAN DEFAULT FALSE,
  UNIQUE(org_id, name)
);

CREATE TABLE staff_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  certification_id UUID REFERENCES certifications(id) ON DELETE CASCADE,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  certificate_number TEXT,
  document_id UUID REFERENCES documents(id),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  UNIQUE(staff_member_id, certification_id)
);
```

---

### 3.5 Asset Management Module

**Scope**: Equipment, inventory, rentals, maintenance

| Route | Path | Primary Entity |
|-------|------|----------------|
| Dashboard | `/modules/assets` | Asset overview |
| Inventory | `/modules/assets/inventory` | `assets` |
| Categories | `/modules/assets/categories` | `asset_categories` |
| Kits | `/modules/assets/kits` | `asset_kits` |
| Reservations | `/modules/assets/reservations` | `asset_reservations` |
| Maintenance | `/modules/assets/maintenance` | `maintenance_records` |
| Check In/Out | `/modules/assets/check` | `asset_transactions` |
| Vendors | `/modules/assets/vendors` | `vendors` |
| Reports | `/modules/assets/reports` | Asset analytics |

```sql
-- Asset Management Core Tables
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES asset_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  asset_tag TEXT UNIQUE,
  serial_number TEXT,
  barcode TEXT,
  status_id UUID REFERENCES asset_statuses(id),
  condition_id UUID REFERENCES asset_conditions(id),
  purchase_date DATE,
  purchase_price_cents BIGINT,
  current_value_cents BIGINT,
  vendor_id UUID REFERENCES vendors(id),
  warranty_expiry_date DATE,
  location_id UUID REFERENCES asset_locations(id),
  assigned_to UUID REFERENCES profiles(id),
  specifications JSONB DEFAULT '{}',
  images UUID[] DEFAULT '{}', -- References to storage
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE asset_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES asset_categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE asset_kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES asset_kits(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  is_required BOOLEAN DEFAULT TRUE,
  UNIQUE(kit_id, asset_id)
);

CREATE TABLE asset_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  kit_id UUID REFERENCES asset_kits(id),
  event_id UUID REFERENCES events(id),
  project_id UUID REFERENCES projects(id),
  reserved_by UUID REFERENCES profiles(id),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  status_id UUID REFERENCES reservation_statuses(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  maintenance_type_id UUID REFERENCES maintenance_types(id),
  performed_by UUID REFERENCES profiles(id),
  vendor_id UUID REFERENCES vendors(id),
  scheduled_date DATE,
  completed_date DATE,
  cost_cents BIGINT,
  description TEXT NOT NULL,
  notes TEXT,
  next_maintenance_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.6 Finance Management Module

**Scope**: Budgets, invoices, expenses, settlements, financial reporting

| Route | Path | Primary Entity |
|-------|------|----------------|
| Dashboard | `/modules/finance` | Finance overview |
| Budgets | `/modules/finance/budgets` | `budgets` |
| Invoices | `/modules/finance/invoices` | `invoices` |
| Expenses | `/modules/finance/expenses` | `expenses` |
| Payments | `/modules/finance/payments` | `payments` |
| Settlements | `/modules/finance/settlements` | `settlements` |
| Accounts | `/modules/finance/accounts` | `financial_accounts` |
| Reports | `/modules/finance/reports` | Finance analytics |

```sql
-- Finance Management Core Tables
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  name TEXT NOT NULL,
  description TEXT,
  budget_type_id UUID REFERENCES budget_types(id),
  total_amount_cents BIGINT NOT NULL,
  currency_id UUID REFERENCES currencies(id),
  fiscal_year INT,
  start_date DATE,
  end_date DATE,
  status_id UUID REFERENCES budget_statuses(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budget_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id),
  department_id UUID REFERENCES departments(id),
  description TEXT NOT NULL,
  budgeted_amount_cents BIGINT NOT NULL,
  actual_amount_cents BIGINT DEFAULT 0,
  notes TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  invoice_type_id UUID REFERENCES invoice_types(id), -- Receivable/Payable
  status_id UUID REFERENCES invoice_statuses(id),
  contact_id UUID REFERENCES contacts(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal_cents BIGINT NOT NULL,
  tax_cents BIGINT DEFAULT 0,
  total_cents BIGINT NOT NULL,
  currency_id UUID REFERENCES currencies(id),
  notes TEXT,
  terms TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, invoice_number)
);

CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price_cents BIGINT NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  total_cents BIGINT NOT NULL,
  category_id UUID REFERENCES expense_categories(id),
  sort_order INT DEFAULT 0
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  category_id UUID REFERENCES expense_categories(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  budget_line_item_id UUID REFERENCES budget_line_items(id),
  vendor_id UUID REFERENCES vendors(id),
  description TEXT NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency_id UUID REFERENCES currencies(id),
  expense_date DATE NOT NULL,
  status_id UUID REFERENCES expense_statuses(id),
  receipt_document_id UUID REFERENCES documents(id),
  reimbursable BOOLEAN DEFAULT FALSE,
  billable BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  status_id UUID REFERENCES settlement_statuses(id),
  settlement_date DATE,
  gross_revenue_cents BIGINT DEFAULT 0,
  total_expenses_cents BIGINT DEFAULT 0,
  net_profit_cents BIGINT DEFAULT 0,
  notes TEXT,
  finalized_by UUID REFERENCES profiles(id),
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.7 Business Management Module

**Scope**: CRM, leads, deals, clients, contracts, proposals

| Route | Path | Primary Entity |
|-------|------|----------------|
| Dashboard | `/modules/business` | Business overview |
| Contacts | `/modules/business/contacts` | `contacts` |
| Companies | `/modules/business/companies` | `companies` |
| Leads | `/modules/business/leads` | `leads` |
| Deals | `/modules/business/deals` | `deals` |
| Proposals | `/modules/business/proposals` | `proposals` |
| Contracts | `/modules/business/contracts` | `contracts` |
| Pipeline | `/modules/business/pipeline` | Pipeline view |
| Reports | `/modules/business/reports` | Business analytics |

```sql
-- Business Management Core Tables
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  contact_type_id UUID REFERENCES contact_types(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  job_title TEXT,
  department TEXT,
  address_id UUID REFERENCES addresses(id),
  notes TEXT,
  tags UUID[] DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id),
  source_id UUID REFERENCES lead_sources(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_type_id UUID REFERENCES company_types(id),
  industry_id UUID REFERENCES industries(id),
  website TEXT,
  email TEXT,
  phone TEXT,
  address_id UUID REFERENCES addresses(id),
  description TEXT,
  employee_count_range TEXT,
  annual_revenue_range TEXT,
  notes TEXT,
  owner_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  owner_id UUID REFERENCES profiles(id),
  pipeline_stage_id UUID REFERENCES pipeline_stages(id),
  deal_type_id UUID REFERENCES deal_types(id),
  value_cents BIGINT,
  currency_id UUID REFERENCES currencies(id),
  probability INT DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  won BOOLEAN,
  loss_reason_id UUID REFERENCES loss_reasons(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES pipelines(id),
  name TEXT NOT NULL,
  probability INT DEFAULT 0,
  sort_order INT NOT NULL,
  color TEXT,
  UNIQUE(pipeline_id, name)
);

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL,
  deal_id UUID REFERENCES deals(id),
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  contract_type_id UUID REFERENCES contract_types(id),
  status_id UUID REFERENCES contract_statuses(id),
  name TEXT NOT NULL,
  value_cents BIGINT,
  currency_id UUID REFERENCES currencies(id),
  start_date DATE,
  end_date DATE,
  renewal_date DATE,
  auto_renew BOOLEAN DEFAULT FALSE,
  terms TEXT,
  document_id UUID REFERENCES documents(id),
  signed_date DATE,
  signed_by_us UUID REFERENCES profiles(id),
  signed_by_them TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, contract_number)
);
```

---

## 4. NETWORK

### Route Group: `@(app)/network/`

| Route | Path | Description | Key Entities |
|-------|------|-------------|--------------|
| **Showcase** | `/network/showcase` | Portfolio gallery | `showcases`, `showcase_items` |
| **Discussions** | `/network/discussions` | Community forums | `discussions`, `discussion_posts` |
| **Challenges** | `/network/challenges` | Competitions/hackathons | `challenges`, `challenge_submissions` |
| **Marketplace** | `/network/marketplace` | Buy/sell/trade | `marketplace_listings` |
| **Opportunities** | `/network/opportunities` | Jobs/gigs/RFPs | `opportunities` |
| **Connections** | `/network/connections` | Professional network | `connections`, `connection_requests` |

```sql
-- Network Core Tables
CREATE TABLE showcases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  showcase_type_id UUID REFERENCES showcase_types(id),
  cover_image_url TEXT,
  visibility_id UUID REFERENCES visibility_levels(id),
  featured BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES discussion_categories(id),
  author_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status_id UUID REFERENCES discussion_statuses(id),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  posted_by UUID REFERENCES profiles(id),
  opportunity_type_id UUID REFERENCES opportunity_types(id), -- Job, Gig, RFP, etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_type_id UUID REFERENCES location_types(id), -- Remote, On-site, Hybrid
  location TEXT,
  compensation_type_id UUID REFERENCES compensation_types(id),
  compensation_min_cents BIGINT,
  compensation_max_cents BIGINT,
  currency_id UUID REFERENCES currencies(id),
  start_date DATE,
  end_date DATE,
  deadline DATE,
  status_id UUID REFERENCES opportunity_statuses(id),
  required_skills UUID[] DEFAULT '{}',
  application_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  connected_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  connection_type_id UUID REFERENCES connection_types(id),
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, connected_user_id),
  CHECK (user_id <> connected_user_id)
);

CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id),
  seller_org_id UUID REFERENCES organizations(id),
  listing_type_id UUID REFERENCES listing_types(id), -- Sale, Rental, Service
  category_id UUID REFERENCES marketplace_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents BIGINT,
  price_type_id UUID REFERENCES price_types(id), -- Fixed, Negotiable, Auction
  currency_id UUID REFERENCES currencies(id),
  condition_id UUID REFERENCES item_conditions(id),
  location TEXT,
  shipping_available BOOLEAN DEFAULT FALSE,
  status_id UUID REFERENCES listing_statuses(id),
  images UUID[] DEFAULT '{}',
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Network Routes Detail

```
/network
├── /showcase
│   ├── / ........................ Gallery feed
│   ├── /featured ................ Featured showcases
│   ├── /[user_id] ............... User's portfolio
│   └── /[showcase_id] ........... Showcase detail
│
├── /discussions
│   ├── / ........................ All discussions
│   ├── /category/[category_id] .. Category view
│   ├── /new ..................... Create discussion
│   └── /[discussion_id] ......... Discussion thread
│
├── /challenges
│   ├── / ........................ Active challenges
│   ├── /past .................... Past challenges
│   ├── /[challenge_id] .......... Challenge detail
│   └── /[challenge_id]/submit ... Submit entry
│
├── /marketplace
│   ├── / ........................ Browse listings
│   ├── /category/[category_id] .. Category browse
│   ├── /sell .................... Create listing
│   └── /[listing_id] ............ Listing detail
│
├── /opportunities
│   ├── / ........................ All opportunities
│   ├── /jobs .................... Job listings
│   ├── /gigs .................... Gig/freelance
│   ├── /rfps .................... RFP/proposals
│   └── /[opportunity_id] ........ Opportunity detail
│
└── /connections
    ├── / ........................ My connections
    ├── /requests ................ Pending requests
    ├── /discover ................ Suggested connections
    └── /[user_id] ............... User profile
```

---

## 5. ACCOUNT

### Route Group: `@(app)/account/`

| Route | Path | Description | Key Entities |
|-------|------|-------------|--------------|
| **Profile** | `/account/profile` | Personal settings | `profiles` |
| **Organization** | `/account/organization` | Org management | `organizations`, `org_members` |
| **Billing** | `/account/billing` | Subscription & payments | `subscriptions`, `payment_methods` |
| **History** | `/account/history` | Audit trail | `audit_logs` |
| **Resources** | `/account/resources` | Help & documentation | `knowledge_base` |
| **Platform** | `/account/platform` | Platform settings | `platform_settings` |
| **Support** | `/account/support` | Support tickets | `support_tickets` |

```sql
-- Account Core Tables
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h',
  theme_id UUID REFERENCES themes(id),
  notification_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  onboarding_completed_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  org_type_id UUID REFERENCES org_types(id),
  industry_id UUID REFERENCES industries(id),
  logo_url TEXT,
  website TEXT,
  description TEXT,
  address_id UUID REFERENCES addresses(id),
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  currency_id UUID REFERENCES currencies(id),
  fiscal_year_start INT DEFAULT 1, -- Month
  subscription_id UUID REFERENCES subscriptions(id),
  settings JSONB DEFAULT '{}',
  whitelabel_config JSONB DEFAULT '{}', -- For turnkey whitelabeling
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES org_roles(id),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status_id UUID REFERENCES member_statuses(id),
  UNIQUE(org_id, user_id)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Whitelabel Configuration
CREATE TABLE tenant_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  brand_name TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  logo_light_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,
  custom_domain TEXT,
  custom_css TEXT,
  email_from_name TEXT,
  email_from_address TEXT,
  support_email TEXT,
  terms_url TEXT,
  privacy_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES features(id),
  enabled BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}',
  UNIQUE(org_id, feature_id)
);
```

### Account Routes Detail

```
/account
├── /profile
│   ├── / ........................ Profile overview
│   ├── /edit .................... Edit profile
│   ├── /security ................ Password, 2FA, sessions
│   └── /notifications ........... Notification preferences
│
├── /organization
│   ├── / ........................ Org overview
│   ├── /settings ................ Org settings
│   ├── /members ................. Member management
│   ├── /roles ................... Role management
│   ├── /teams ................... Team management
│   └── /integrations ............ Connected apps
│
├── /billing
│   ├── / ........................ Billing overview
│   ├── /subscription ............ Plan management
│   ├── /payment-methods ......... Payment methods
│   ├── /invoices ................ Invoice history
│   └── /usage ................... Usage metrics
│
├── /history
│   ├── / ........................ Activity log
│   └── /exports ................. Data exports
│
├── /resources
│   ├── / ........................ Resource center
│   ├── /docs .................... Documentation
│   ├── /videos .................. Video tutorials
│   └── /api ..................... API reference
│
├── /platform
│   ├── / ........................ Platform settings
│   ├── /appearance .............. Theme/branding
│   ├── /localization ............ Language/region
│   └── /data .................... Data management
│
└── /support
    ├── / ........................ Support home
    ├── /tickets ................. My tickets
    ├── /new ..................... Create ticket
    └── /[ticket_id] ............. Ticket detail
```

---

## 6. AUTHENTICATION & ONBOARDING

### Route Group: `@(auth)/`

```
/auth
├── /login ....................... Sign in
├── /register .................... Sign up
├── /forgot-password ............. Password reset request
├── /reset-password .............. Password reset form
├── /verify-email ................ Email verification
├── /verify-mfa .................. MFA verification
├── /sso/[provider] .............. SSO callback
└── /invite/[token] .............. Invitation acceptance
```

### Route Group: `@(onboarding)/`

```
/onboarding
├── / ............................ Onboarding start
├── /profile ..................... Profile setup
├── /organization ................ Org creation/join
├── /team ........................ Team setup
├── /preferences ................. Initial preferences
├── /integrations ................ Connect apps
├── /tour ........................ Product tour
└── /complete .................... Onboarding complete
```

```sql
-- Onboarding Progress Tracking
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_step_id UUID REFERENCES onboarding_steps(id),
  completed_steps UUID[] DEFAULT '{}',
  skipped_steps UUID[] DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  data JSONB DEFAULT '{}' -- Step-specific data
);

CREATE TABLE onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  route TEXT NOT NULL,
  sort_order INT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  is_skippable BOOLEAN DEFAULT FALSE,
  completion_criteria JSONB -- What constitutes completion
);

-- Seed onboarding steps
INSERT INTO onboarding_steps (slug, name, route, sort_order, is_required, is_skippable) VALUES
  ('profile', 'Set up your profile', '/onboarding/profile', 1, TRUE, FALSE),
  ('organization', 'Create or join organization', '/onboarding/organization', 2, TRUE, FALSE),
  ('team', 'Invite your team', '/onboarding/team', 3, FALSE, TRUE),
  ('preferences', 'Set your preferences', '/onboarding/preferences', 4, FALSE, TRUE),
  ('integrations', 'Connect your tools', '/onboarding/integrations', 5, FALSE, TRUE),
  ('tour', 'Take the tour', '/onboarding/tour', 6, FALSE, TRUE);
```

---

## 7. LOOKUP TABLES (Reference Data)

All enums, options, and static choices stored in normalized lookup tables:

```sql
-- Universal Lookup Pattern
CREATE TABLE statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'task', 'project', 'event', etc.
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_final BOOLEAN DEFAULT FALSE, -- Cannot transition from
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, name)
);

-- Specific lookup tables for type safety
CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- USD, EUR, etc.
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimal_places INT DEFAULT 2
);

CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- en, es, fr, etc.
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  rtl BOOLEAN DEFAULT FALSE
);

CREATE TABLE timezones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- America/New_York
  offset_hours DECIMAL(4,2),
  abbreviation TEXT
);

CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('light', 'dark', 'system')),
  tokens JSONB NOT NULL -- Design tokens
);

CREATE TABLE visibility_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'private', 'team', 'organization', 'public'
  description TEXT,
  sort_order INT
);
```

---

## 8. COMPONENT ARCHITECTURE

### Page Template Schema

```sql
CREATE TABLE page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  layout_type TEXT NOT NULL, -- 'list', 'detail', 'dashboard', 'form', 'kanban', 'calendar'
  grid_config JSONB NOT NULL,
  component_slots JSONB NOT NULL, -- [{slot_id, allowed_components, required}]
  default_components JSONB, -- [{slot_id, component_id, config}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ui_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'data-display', 'input', 'navigation', 'feedback', 'layout'
  description TEXT,
  props_schema JSONB NOT NULL, -- JSON Schema for props
  default_props JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE page_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT NOT NULL,
  org_id UUID REFERENCES organizations(id), -- Null for global
  template_id UUID REFERENCES page_templates(id),
  title_key TEXT NOT NULL, -- i18n key
  components JSONB NOT NULL, -- [{slot_id, component_id, config}]
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route, org_id)
);
```

---

## 9. NAVIGATION SCHEMA

```sql
CREATE TABLE navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES navigation_items(id),
  section TEXT NOT NULL, -- 'topbar', 'sidebar', 'user_menu', 'footer'
  group_name TEXT, -- 'core', 'modules', 'network', 'account'
  label_key TEXT NOT NULL, -- i18n key
  icon TEXT,
  route TEXT,
  external_url TEXT,
  badge_source TEXT, -- Query for badge count
  permission_required TEXT,
  feature_flag TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed navigation structure
INSERT INTO navigation_items (section, group_name, label_key, icon, route, sort_order) VALUES
-- Core
('sidebar', 'core', 'nav.dashboard', 'LayoutDashboard', '/core/dashboard', 1),
('sidebar', 'core', 'nav.calendar', 'Calendar', '/core/calendar', 2),
('sidebar', 'core', 'nav.tasks', 'CheckSquare', '/core/tasks', 3),
('sidebar', 'core', 'nav.workflows', 'GitBranch', '/core/workflows', 4),
('sidebar', 'core', 'nav.activity', 'Activity', '/core/activity', 5),
('sidebar', 'core', 'nav.documents', 'FileText', '/core/documents', 6),

-- Modules
('sidebar', 'modules', 'nav.projects', 'FolderKanban', '/modules/projects', 10),
('sidebar', 'modules', 'nav.production', 'Clapperboard', '/modules/production', 11),
('sidebar', 'modules', 'nav.operations', 'Settings2', '/modules/operations', 12),
('sidebar', 'modules', 'nav.workforce', 'Users', '/modules/workforce', 13),
('sidebar', 'modules', 'nav.assets', 'Package', '/modules/assets', 14),
('sidebar', 'modules', 'nav.finance', 'DollarSign', '/modules/finance', 15),
('sidebar', 'modules', 'nav.business', 'Briefcase', '/modules/business', 16),

-- Network
('sidebar', 'network', 'nav.showcase', 'Image', '/network/showcase', 20),
('sidebar', 'network', 'nav.discussions', 'MessageSquare', '/network/discussions', 21),
('sidebar', 'network', 'nav.challenges', 'Trophy', '/network/challenges', 22),
('sidebar', 'network', 'nav.marketplace', 'Store', '/network/marketplace', 23),
('sidebar', 'network', 'nav.opportunities', 'Compass', '/network/opportunities', 24),
('sidebar', 'network', 'nav.connections', 'UserPlus', '/network/connections', 25),

-- Top Bar
('topbar', NULL, 'nav.notifications', 'Bell', NULL, 1),
('topbar', NULL, 'nav.inbox', 'Inbox', NULL, 2),
('topbar', NULL, 'nav.settings', 'Settings', '/account/platform', 3),
('topbar', NULL, 'nav.support', 'HelpCircle', '/account/support', 4),
('topbar', NULL, 'nav.language', 'Globe', NULL, 5),
('topbar', NULL, 'nav.theme', 'Palette', NULL, 6),
('topbar', NULL, 'nav.user', 'User', NULL, 7);
```

---

## 10. RBAC & PERMISSIONS

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id), -- Null for system roles
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, name)
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL, -- 'projects', 'events', etc.
  action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'manage'
  description TEXT,
  UNIQUE(resource, action)
);

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  conditions JSONB DEFAULT '{}', -- Optional conditions
  UNIQUE(role_id, permission_id)
);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects they have access to"
  ON projects FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
    AND (
      visibility_id = (SELECT id FROM visibility_levels WHERE name = 'organization')
      OR id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
  );
```

---

## Summary: Route Structure

```
@(auth)
├── /login
├── /register
├── /forgot-password
├── /reset-password
├── /verify-email
├── /verify-mfa
├── /sso/[provider]
└── /invite/[token]

@(onboarding)
├── /
├── /profile
├── /organization
├── /team
├── /preferences
├── /integrations
├── /tour
└── /complete

@(app)
├── /core
│   ├── /dashboard
│   ├── /calendar
│   ├── /tasks
│   ├── /workflows
│   ├── /activity
│   └── /documents
│
├── /modules
│   ├── /projects
│   ├── /production
│   ├── /operations
│   ├── /workforce
│   ├── /assets
│   ├── /finance
│   └── /business
│
├── /network
│   ├── /showcase
│   ├── /discussions
│   ├── /challenges
│   ├── /marketplace
│   ├── /opportunities
│   └── /connections
│
└── /account
    ├── /profile
    ├── /organization
    ├── /billing
    ├── /history
    ├── /resources
    ├── /platform
    └── /support
```

---