# Information Architecture Hierarchy Specification v7

## Executive Summary

This document defines the **canonical navigation hierarchy** for ATLVS, establishing a consistent **Section → Page → Subpage → Tab** model that reduces cognitive overload while maintaining business logic coherence.

---

## Core Principles

### 1. Miller's Law Compliance
- **7±2 items per navigation level** (max 9, ideal 5-7)
- Reduces cognitive load and decision fatigue
- Enables faster scanning and selection

### 2. Progressive Disclosure
- **Level 1 (Sidebar)**: Module sections - "What domain?"
- **Level 2 (Page)**: Primary entities - "What am I managing?"
- **Level 3 (Subpage Tabs)**: Data subsets - "Which subset?"
- **Level 4 (View Tabs)**: Presentation modes - "How do I see it?"

### 3. SSOT Navigation
- Navigation structure defined in `ia-structure.ts`
- Subpage tabs defined in EntitySchema `layouts.list.subpages`
- View modes defined in EntitySchema `layouts.list.availableViews`
- **No duplicate definitions** across files

### 4. Consistent Tab Patterns
Every entity list page MUST have:
- **Subpage tabs** (data filters) - horizontal tabs below header
- **View toggle** (table/kanban/calendar) - in toolbar, not tabs

---

## Hierarchy Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: SIDEBAR SECTIONS (7 modules + Settings)                            │
│ Purpose: Domain selection                                                   │
│ UI: Collapsible sidebar groups                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ CORE | PRODUCTIONS | ADVANCING | OPERATIONS | PEOPLE | ASSETS | BUSINESS | FINANCE │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 2: PAGES (5-8 per section)                                            │
│ Purpose: Entity/feature selection                                           │
│ UI: Sidebar navigation items                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Example (FINANCE): Budgets | Invoices | Expenses | Payroll | Accounts       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 3: SUBPAGE TABS (2-7 per page)                                        │
│ Purpose: Data subset filtering                                              │
│ UI: Horizontal underline tabs below page header                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Example (Invoices): All | Draft | Sent | Paid | Overdue                     │
│ Pattern: Status-based OR Category-based OR Workflow-stage-based             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEVEL 4: VIEW MODES (in toolbar, NOT tabs)                                  │
│ Purpose: Presentation format selection                                      │
│ UI: Segmented control / icon toggle in toolbar                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Options: Table | Kanban | Calendar | Timeline | Gallery | Map               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Standardized Subpage Tab Patterns

### Pattern A: Status-Based (Most Common)
For entities with lifecycle states.

```typescript
subpages: [
  { key: 'all', label: 'All', query: { where: {} }, count: true },
  { key: 'active', label: 'Active', query: { where: { status: { $in: ['active', 'in_progress'] } } }, count: true },
  { key: 'pending', label: 'Pending', query: { where: { status: 'pending' } } },
  { key: 'completed', label: 'Completed', query: { where: { status: 'completed' } } },
  { key: 'archived', label: 'Archived', query: { where: { archived: true } } },
]
```

**Use for**: Tasks, Invoices, Expenses, Work Orders, Approvals, Permits

### Pattern B: Category-Based
For entities with type classifications.

```typescript
subpages: [
  { key: 'all', label: 'All', query: { where: {} }, count: true },
  { key: 'type-a', label: 'Type A', query: { where: { type: 'type_a' } }, count: true },
  { key: 'type-b', label: 'Type B', query: { where: { type: 'type_b' } }, count: true },
  { key: 'type-c', label: 'Type C', query: { where: { type: 'type_c' } }, count: true },
]
```

**Use for**: Companies (Clients/Vendors/Partners), Assets (by category), Documents (by type)

### Pattern C: Time-Based
For entities with temporal relevance.

```typescript
subpages: [
  { key: 'all', label: 'All', query: { where: {} }, count: true },
  { key: 'upcoming', label: 'Upcoming', query: { where: { date: { $gte: 'now' } } }, count: true },
  { key: 'today', label: 'Today', query: { where: { date: { $eq: 'today' } } } },
  { key: 'past', label: 'Past', query: { where: { date: { $lt: 'now' } } } },
]
```

**Use for**: Events, Bookings, Schedules, Deadlines

### Pattern D: Assignment-Based
For entities with ownership/assignment.

```typescript
subpages: [
  { key: 'all', label: 'All', query: { where: {} }, count: true },
  { key: 'mine', label: 'My Items', query: { where: { assignedTo: '$currentUser' } }, count: true },
  { key: 'team', label: 'Team', query: { where: { teamId: '$currentTeam' } } },
  { key: 'unassigned', label: 'Unassigned', query: { where: { assignedTo: null } } },
]
```

**Use for**: Tasks, Work Orders, Leads, Support Tickets

### Pattern E: Workflow-Stage-Based
For entities in multi-stage processes.

```typescript
subpages: [
  { key: 'all', label: 'All', query: { where: {} }, count: true },
  { key: 'stage-1', label: 'Stage 1', query: { where: { stage: 'stage_1' } }, count: true },
  { key: 'stage-2', label: 'Stage 2', query: { where: { stage: 'stage_2' } }, count: true },
  { key: 'stage-3', label: 'Stage 3', query: { where: { stage: 'stage_3' } }, count: true },
]
```

**Use for**: Pipeline Deals, Recruitment Candidates, Onboarding

---

## Module-by-Module Specification

### CORE (6 Pages)

| Page | Subpage Tabs | View Modes |
|------|--------------|------------|
| **Dashboard** | — (single view) | Dashboard |
| **Calendar** | All \| My Events \| Team | Calendar, List |
| **Tasks** | All \| To Do \| In Progress \| Done \| Blocked | Table, Kanban |
| **Inbox** | All \| Unread \| Approvals \| Mentions | List |
| **Documents** | All \| Recent \| Shared \| Templates | Table, Gallery |
| **Workflows** | All \| Active \| Paused \| Completed | Table |

### PRODUCTIONS (5 Pages)

| Page | Subpage Tabs | View Modes |
|------|--------------|------------|
| **Productions** | All \| Active \| Planning \| Completed | Table, Kanban |
| **Events** | All \| Upcoming \| Live \| Past | Table, Calendar |
| **Activations** | All \| Active \| Pending \| Completed | Table, Kanban |
| **Build & Strike** | All \| Build \| Strike \| Complete | Table, Timeline |
| **Compliance** | All \| Active \| Expiring \| Expired | Table |

### ADVANCING (5 Pages)

| Page | Subpage Tabs | View Modes |
|------|--------------|------------|
| **Dashboard** | — (single view) | Dashboard |
| **Advances** | All \| Active \| Completed | Table, Kanban |
| **Items** | All \| Technical \| Logistics \| Hospitality \| Staffing \| Safety \| Marketing | Table, Kanban, Timeline |
| **Fulfillment** | All \| In Progress \| Complete | Table |
| **Vendors** | All \| Active \| Top Rated | Table |

### OPERATIONS (5 Pages)

| Page | Subpage Tabs | View Modes |
|------|--------------|------------|
| **Events** | All \| Today \| This Week \| Upcoming | Table, Calendar |
| **Venues** | All \| Active \| Inactive | Table, Map |
| **Incidents** | All \| Open \| In Progress \| Resolved | Table, Kanban |
| **Work Orders** | All \| Open \| In Progress \| Complete | Table, Kanban |
| **Comms** | Radio \| Weather \| Daily Reports | Table |

### PEOPLE (6 Pages)

| Page | Subpage Tabs | View Modes |
|------|--------------|------------|
| **Rosters** | All \| Staff \| Crew \| Contractors \| Talent | Table, Gallery |
| **Recruitment** | All \| New \| Screening \| Interview \| Offer | Table, Kanban |
| **Scheduling** | All \| Available \| Scheduled \| Unavailable | Table, Calendar |
| **Training** | All \| In Progress \| Completed \| Expired | Table |
| **Travel** | All \| Upcoming \| In Transit \| Completed | Table, Calendar |
| **Performance** | All \| Pending Review \| Completed | Table |

### ASSETS (5 Pages)

| Page | Subpage Tabs | View Modes |
|------|--------------|------------|
| **Catalog** | All \| Equipment \| Consumables \| Kits | Table, Gallery |
| **Locations** | All \| Warehouses \| Staging \| Deployed | Table, Map |
| **Logistics** | All \| Pending \| In Transit \| Delivered | Table, Timeline |
| **Reservations** | All \| Pending \| Confirmed \| Checked Out | Table, Calendar |
| **Maintenance** | All \| Scheduled \| Overdue \| Complete | Table, Calendar |

### BUSINESS (5 Pages)

| Page | Subpage Tabs | View Modes |
|------|--------------|------------|
| **Pipeline** | All \| Prospecting \| Proposal \| Negotiation \| Won \| Lost | Table, Kanban |
| **Companies** | All \| Clients \| Vendors \| Partners \| Sponsors | Table |
| **Products** | All \| Products \| Services \| Packages | Table, Gallery |
| **Campaigns** | All \| Draft \| Active \| Completed | Table |
| **Brand Kit** | Logos \| Colors \| Typography \| Assets | Gallery |

### FINANCE (5 Pages)

| Page | Subpage Tabs | View Modes |
|------|--------------|------------|
| **Budgets** | All \| Active \| Draft \| Closed | Table |
| **Invoices** | All \| Draft \| Sent \| Paid \| Overdue | Table |
| **Expenses** | All \| Pending \| Approved \| Rejected | Table |
| **Payroll** | All \| Draft \| Processing \| Complete | Table |
| **Accounts** | GL \| Bank \| Transactions | Table |

---

## Implementation Rules

### Rule 1: Every List Page Has Subpage Tabs
```typescript
// ✅ CORRECT - Always define subpages
layouts: {
  list: {
    subpages: [
      { key: 'all', label: 'All', query: { where: {} }, count: true },
      // ... additional subpages
    ],
    defaultView: 'table',
    availableViews: ['table'],
  }
}

// ❌ WRONG - Empty or missing subpages
layouts: {
  list: {
    subpages: [], // Never empty
    defaultView: 'table',
  }
}
```

### Rule 2: "All" Tab is Always First
```typescript
// ✅ CORRECT
subpages: [
  { key: 'all', label: 'All', query: { where: {} }, count: true },
  { key: 'active', label: 'Active', ... },
]

// ❌ WRONG - "All" not first
subpages: [
  { key: 'active', label: 'Active', ... },
  { key: 'all', label: 'All', ... },
]
```

### Rule 3: Max 7 Subpage Tabs
If more than 7 subsets needed, use:
- Dropdown filter instead of tabs
- Combine related subsets
- Move to separate page

### Rule 4: Subpage Keys are URL-Safe
```typescript
// ✅ CORRECT
{ key: 'in-progress', label: 'In Progress', ... }

// ❌ WRONG
{ key: 'in progress', label: 'In Progress', ... }
{ key: 'In_Progress', label: 'In Progress', ... }
```

### Rule 5: View Modes in Toolbar, Not Tabs
```typescript
// ✅ CORRECT - Views in availableViews, rendered in toolbar
layouts: {
  list: {
    subpages: [...],
    defaultView: 'table',
    availableViews: ['table', 'kanban'],
  }
}

// ❌ WRONG - Views as subpage tabs
subpages: [
  { key: 'table-view', label: 'Table', ... },
  { key: 'kanban-view', label: 'Kanban', ... },
]
```

### Rule 6: Count Badges for Actionable Tabs
```typescript
// ✅ CORRECT - Count on actionable items
{ key: 'pending', label: 'Pending', query: {...}, count: true },
{ key: 'overdue', label: 'Overdue', query: {...}, count: true },

// ❌ WRONG - Count on "All" when not useful
{ key: 'all', label: 'All', query: {...}, count: true }, // Only if total matters
```

---

## Migration Checklist

### Phase 1: Schema Updates
- [ ] Audit all schemas in `/lib/schemas/`
- [ ] Ensure every schema has `layouts.list.subpages` with 2-7 items
- [ ] Ensure "All" is first subpage
- [ ] Ensure keys are URL-safe kebab-case
- [ ] Add `count: true` to actionable subpages

### Phase 2: Navigation Alignment
- [ ] Update `ia-structure.ts` to match schema subpages
- [ ] Update `navigation.ts` to remove duplicate subpage definitions
- [ ] Ensure sidebar items match page definitions

### Phase 3: Page Implementation
- [ ] All list pages use `CrudList` with schema
- [ ] Remove hardcoded tab definitions from page components
- [ ] Verify subpage tabs render correctly

### Phase 4: Testing
- [ ] Each subpage tab filters data correctly
- [ ] URL updates when switching tabs
- [ ] Count badges update in real-time
- [ ] View mode persists across tab switches

---

## Anti-Patterns to Avoid

### ❌ Nested Tabs
Never nest tabs within tabs. Use:
- Subpage tabs for data filtering
- Drawer/modal for related entity views
- Separate page for complex sub-entities

### ❌ Tabs for Different Entities
Each page shows ONE entity type. Related entities:
- Appear in detail view tabs
- Link to their own page
- Never share list-level tabs

### ❌ Tabs for Settings/Config
Settings belong in:
- Settings page (global)
- Entity detail view (per-record)
- Modal (quick config)

### ❌ More Than 7 Tabs
If you need more:
- Combine related filters
- Use dropdown filter
- Create separate page

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v7 | 2026-02-02 | Standardized subpage tab patterns, max 7 tabs rule |
| v6 | 2026-01-15 | Consolidated to 7 modules |
| v5 | 2025-12-01 | Initial IA structure |
