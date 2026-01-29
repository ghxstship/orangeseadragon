# Sidebar Reorganization Plan - IMPLEMENTED (v5)

> **Status**: ✅ IMPLEMENTED
> **Date**: January 29, 2026
> **Config Files Updated**:
> - `src/config/navigation.ts` - v5 sidebar structure
> - `src/lib/navigation/ia-structure.ts` - v5 IA definitions
> **Specification**: See `/docs/OPTIMIZED_IA_STRUCTURE.md` for full v5 spec

---

# Legacy Sidebar Reorganization Plan (Archived): ClickUp Alignment (v2)

## Core Principles

1. **ClickUp Folder = App Parent Page**: Every ClickUp folder MUST exist as a parent page in the sidebar
2. **Tabs = Related Data Entities**: Tabs are ONLY for related data sets with different schemas/entities. **NOT** for status filters (All, Active, Pending, etc.)
3. **Status = Enum Field**: Statuses like "Active", "Completed", "Pending" are filterable enum fields on the list view, NOT separate tabs
4. **3NF Compliance**: No redundant data across tabs. Each entity lives in ONE canonical location
5. **SSOT**: Single source of truth for every data type

---

## ClickUp Workspace → App Section Mapping

| ClickUp Workspace | App Top-Level Section | Notes |
|-------------------|----------------------|-------|
| Projects (Productions folder) | **PRODUCTIONS** | Top-level section preserved |
| Projects (Operations subfolder) | **OPERATIONS** | Top-level section preserved |
| Workforce | **WORKFORCE** | Module section |
| Assets | **ASSETS** | Module section |
| Business | **BUSINESS** | Module section |
| Finance | **FINANCE** | Module section |
| Community (in Workforce) | **NETWORK** | Top-level section preserved |

---

## Section 1: CORE (Personal Workspace)

**No ClickUp equivalent** - Personal productivity tools.

| Page | Tabs (Related Entities) |
|------|------------------------|
| Dashboard | *(none - unified view)* |
| Calendar | *(none - unified view)* |
| Tasks | *(none - personal tasks)* |
| Workflows | *(none - personal automations)* |
| Activity | *(none - activity feed)* |
| Documents | *(none - personal library)* |

---

## Section 2: PRODUCTIONS (ClickUp: Projects Workspace)

**Top-level section.** Every ClickUp folder under "Productions" becomes a parent page.

### ClickUp Folders → App Pages

| ClickUp Folder | App Page | Tabs (Related Entities Only) |
|----------------|----------|------------------------------|
| Productions (List) | **Productions** | *(none - status is a filter)* |
| Events | **Events** | *(none - status is a filter)* |
| Activations | **Activations** | *(none - status is a filter)* |
| Compliance | **Compliance** | Permits, Licenses, Certificates |
| Deployment | **Deployment** | *(none)* |
| Installation | **Installation** | *(none)* |
| Restoration | **Restoration** | *(none)* |
| Punch Lists | **Punch Lists** | *(none)* |
| Inspections | **Inspections** | *(none)* |
| Files | **Files** | *(none - file type is a filter)* |

### Additional Pages (from current app, not in ClickUp but production-related):

| Current App Item | App Page | Tabs (Related Entities Only) |
|------------------|----------|------------------------------|
| Shows | **Shows** | *(none)* |
| Runsheets | **Runsheets** | *(none)* |
| Advancing | **Advancing** | Riders, Tech Specs |
| Departments | **Departments** | *(none)* |

### Proposed PRODUCTIONS Structure:

```
PRODUCTIONS (Section)
├── Productions (Page)
├── Events (Page)
├── Activations (Page)
├── Shows (Page)
├── Runsheets (Page)
├── Compliance (Page)
│   └── Tabs: Permits | Licenses | Certificates
├── Deployment (Page)
├── Installation (Page)
├── Restoration (Page)
├── Punch Lists (Page)
├── Inspections (Page)
├── Advancing (Page)
│   └── Tabs: Riders | Tech Specs
├── Departments (Page)
└── Files (Page)
```

---

## Section 3: OPERATIONS (ClickUp: Projects → Operations subfolder)

**Top-level section.** Maps to ClickUp "Operations" folder items.

### ClickUp Folders → App Pages

| ClickUp Folder | App Page | Tabs (Related Entities Only) |
|----------------|----------|------------------------------|
| Operations | **Operations** | Work Orders, Daily Reports |
| *(from ClickUp Inspections)* | *(shared with Productions)* | |
| *(from ClickUp Punch Lists)* | *(shared with Productions)* | |

### Additional Pages (Operations-specific):

| Item | App Page | Tabs (Related Entities Only) |
|------|----------|------------------------------|
| Venues | **Venues** | Floor Plans, Zones, Checkpoints |
| Incidents | **Incidents** | *(none - severity/status are filters)* |
| Support | **Support** | *(none - priority/status are filters)* |
| Weather | **Weather** | *(none)* |
| Radio Channels | **Radio** | *(none)* |

### Proposed OPERATIONS Structure:

```
OPERATIONS (Section)
├── Operations (Page)
│   └── Tabs: Work Orders | Daily Reports
├── Venues (Page)
│   └── Tabs: Floor Plans | Zones | Checkpoints
├── Incidents (Page)
├── Support (Page)
├── Weather (Page)
└── Radio (Page)
```

---

## Section 4: WORKFORCE (ClickUp: Workforce Workspace)

**Every ClickUp folder = parent page.**

### ClickUp Folders → App Pages

| ClickUp Folder | App Page | Tabs (Related Entities Only) |
|----------------|----------|------------------------------|
| Rosters | **Rosters** | *(none - department/position are filters)* |
| Availability | **Availability** | *(none)* |
| Travel & Lodging | **Travel & Lodging** | Bookings, Accommodations |
| Recruitment | **Recruitment** | *(none - stage is a filter)* |
| Onboarding | **Onboarding** | *(none)* |
| Training | **Training** | Courses, Materials |
| Scheduling | **Scheduling** | Shifts |
| Timekeeping | **Timekeeping** | *(none - approval status is a filter)* |
| Performance | **Performance** | Reviews, Goals |
| Incidents | **Incidents** | *(shared with Operations or separate HR Incidents)* |
| Certifications | **Certifications** | *(none - expiry status is a filter)* |
| Positions | **Positions** | *(none)* |
| Community | *(moves to NETWORK)* | |

### Proposed WORKFORCE Structure:

```
WORKFORCE (Section)
├── Rosters (Page)
├── Availability (Page)
├── Travel & Lodging (Page)
│   └── Tabs: Bookings | Accommodations
├── Recruitment (Page)
├── Onboarding (Page)
├── Training (Page)
│   └── Tabs: Courses | Materials
├── Scheduling (Page)
│   └── Tabs: Shifts
├── Timekeeping (Page)
├── Performance (Page)
│   └── Tabs: Reviews | Goals
├── Certifications (Page)
└── Positions (Page)
```

---

## Section 5: ASSETS (ClickUp: Assets Workspace)

**Every ClickUp folder = parent page.** Note: "Advances" = Production Advances (equipment/gear sent ahead), NOT financial advances.

### ClickUp Folders → App Pages

| ClickUp Folder | App Page | Tabs (Related Entities Only) |
|----------------|----------|------------------------------|
| Inventory | **Inventory** | *(none - stock level is a filter)* |
| Logistics | **Logistics** | Shipments, Vehicles |
| Maintenance | **Maintenance** | *(none - status is a filter)* |
| Tracking | **Tracking** | *(none)* |
| Reservations | **Reservations** | *(none - status is a filter)* |
| Orders | **Orders** | *(none - status is a filter)* |
| Advances | **Advances** | *(Production advances - gear/equipment sent ahead)* |
| Catalog | **Catalog** | Categories, Kits |

### Proposed ASSETS Structure:

```
ASSETS (Section)
├── Inventory (Page)
├── Logistics (Page)
│   └── Tabs: Shipments | Vehicles
├── Maintenance (Page)
├── Tracking (Page)
├── Reservations (Page)
├── Orders (Page)
├── Advances (Page)
└── Catalog (Page)
    └── Tabs: Categories | Kits
```

---

## Section 6: BUSINESS (ClickUp: Business Workspace)

**Every ClickUp folder = parent page.**

### ClickUp Folders → App Pages

| ClickUp Folder | App Page | Tabs (Related Entities Only) |
|----------------|----------|------------------------------|
| Pipeline | **Pipeline** | Deals, Opportunities |
| Contracts | **Contracts** | *(none - status is a filter)* |
| Proposals | **Proposals** | *(none - status is a filter)* |
| Opportunities | *(tab under Pipeline)* | |
| Products & Services | **Products & Services** | Products, Services, Packages |
| Campaigns | **Campaigns** | *(none - status is a filter)* |
| Content | **Content** | Forms, Landing Pages, Subscribers |
| Brand Kit | **Brand Kit** | Logos, Colors, Typography, Templates |
| Organization | **Organization** | Teams, Departments, Roles |
| Directory | **Directory** | Contacts, Companies |

### Proposed BUSINESS Structure:

```
BUSINESS (Section)
├── Pipeline (Page)
│   └── Tabs: Deals | Opportunities
├── Contracts (Page)
├── Proposals (Page)
├── Products & Services (Page)
│   └── Tabs: Products | Services | Packages
├── Campaigns (Page)
├── Content (Page)
│   └── Tabs: Forms | Landing Pages | Subscribers
├── Brand Kit (Page)
│   └── Tabs: Logos | Colors | Typography | Templates
├── Organization (Page)
│   └── Tabs: Teams | Departments | Roles
└── Directory (Page)
    └── Tabs: Contacts | Companies
```

---

## Section 7: FINANCE (ClickUp: Finance Workspace)

**Every ClickUp folder = parent page.**

### ClickUp Folders → App Pages

| ClickUp Folder | App Page | Tabs (Related Entities Only) |
|----------------|----------|------------------------------|
| Budgets | **Budgets** | *(none - status is a filter)* |
| Revenue | **Revenue** | *(none - source type is a filter)* |
| Expenses | **Expenses** | *(none - status is a filter)* |
| Procurement | **Procurement** | Purchase Orders, Vendors |
| Transactions | **Transactions** | *(none - type is a filter)* |
| Payroll | **Payroll** | Pay Runs, Adjustments |
| Reconciliation | **Reconciliation** | *(none)* |
| Accounts | **Accounts** | GL Accounts, Bank Accounts |
| Reports | **Reports** | *(none - report type is a filter)* |

### Proposed FINANCE Structure:

```
FINANCE (Section)
├── Budgets (Page)
├── Revenue (Page)
├── Expenses (Page)
├── Procurement (Page)
│   └── Tabs: Purchase Orders | Vendors
├── Transactions (Page)
├── Payroll (Page)
│   └── Tabs: Pay Runs | Adjustments
├── Reconciliation (Page)
├── Accounts (Page)
│   └── Tabs: GL Accounts | Bank Accounts
└── Reports (Page)
```

---

## Section 8: NETWORK (ClickUp: Community)

**Top-level section.** Maps to ClickUp "Community" folder (under Workforce).

### Proposed NETWORK Structure:

```
NETWORK (Section)
├── Connections (Page)
├── Discussions (Page)
│   └── Tabs: Topics | Categories
├── Marketplace (Page)
│   └── Tabs: Listings | Bookings
├── Opportunities (Page)
│   └── Tabs: Jobs | Gigs | RFPs
├── Showcase (Page)
│   └── Tabs: Portfolio | Projects
└── Challenges (Page)
```

---

## Summary: Final Sidebar Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ CORE                                                                 │
│   Dashboard | Calendar | Tasks | Workflows | Activity | Documents    │
├─────────────────────────────────────────────────────────────────────┤
│ PRODUCTIONS                                                          │
│   Productions | Events | Activations | Shows | Runsheets |           │
│   Compliance | Deployment | Installation | Restoration |             │
│   Punch Lists | Inspections | Advancing | Departments | Files        │
├─────────────────────────────────────────────────────────────────────┤
│ OPERATIONS                                                           │
│   Operations | Venues | Incidents | Support | Weather | Radio        │
├─────────────────────────────────────────────────────────────────────┤
│ WORKFORCE                                                            │
│   Rosters | Availability | Travel & Lodging | Recruitment |          │
│   Onboarding | Training | Scheduling | Timekeeping | Performance |   │
│   Certifications | Positions                                         │
├─────────────────────────────────────────────────────────────────────┤
│ ASSETS                                                               │
│   Inventory | Logistics | Maintenance | Tracking | Reservations |    │
│   Orders | Advances | Catalog                                        │
├─────────────────────────────────────────────────────────────────────┤
│ BUSINESS                                                             │
│   Pipeline | Contracts | Proposals | Products & Services |           │
│   Campaigns | Content | Brand Kit | Organization | Directory         │
├─────────────────────────────────────────────────────────────────────┤
│ FINANCE                                                              │
│   Budgets | Revenue | Expenses | Procurement | Transactions |        │
│   Payroll | Reconciliation | Accounts | Reports                      │
├─────────────────────────────────────────────────────────────────────┤
│ NETWORK                                                              │
│   Connections | Discussions | Marketplace | Opportunities |          │
│   Showcase | Challenges                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tab vs Filter Decision Matrix

| If the data... | Then it's a... | Example |
|----------------|----------------|---------|
| Has a different schema/entity | **Tab** | Venues → Floor Plans (different entity) |
| Is the same entity with different status | **Filter (enum)** | Invoices: Draft/Sent/Paid (same entity) |
| Represents a related but distinct dataset | **Tab** | Pipeline → Deals, Opportunities |
| Can be toggled on the same list view | **Filter** | Active/Archived toggle |
| Requires different columns/fields | **Tab** | Logistics → Shipments vs Vehicles |

---

## 3NF/SSOT Compliance Checklist

- [ ] Each entity has ONE canonical page (no duplicates across sections)
- [ ] Tabs contain related entities, not filtered views of the same entity
- [ ] Status fields are enum filters on list views, not separate tabs
- [ ] Cross-references use links, not duplicate data
- [ ] Every ClickUp folder maps to exactly one parent page

---

## Implementation Notes

1. **Parent Pages**: Every ClickUp folder becomes a sidebar parent page
2. **Tabs**: Only for genuinely different data entities related to the parent
3. **Filters**: Status, type, category, date range = filterable enum fields
4. **No Redundancy**: "All | Active | Completed" tabs are WRONG - use filters

---

## Next Steps

1. Update `src/config/navigation.ts` with new structure
2. Update `src/lib/navigation/ia-structure.ts` with new IA
3. Implement filter controls on list views for status/type enums
4. Create tab navigation only for pages with related entities
5. Update route structure in `src/app/(app)/` directory
