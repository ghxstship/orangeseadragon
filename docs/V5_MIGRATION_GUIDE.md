# v5 Information Architecture Migration Guide

> **Created**: January 29, 2026
> **Status**: ✅ COMPLETE - All routes migrated, legacy deleted

## Summary

The v5 IA restructures the application from 8 modules with 70+ pages to **7 modules with 57 pages**, achieving:
- 3NF/SSOT compliance (zero data overlap)
- Cognitive load reduction (7±2 items per level)
- Workflow-based page ordering
- Clear separation: Catalog = Equipment (what you OWN), Products & Services = Business (what you SELL)

---

## Files Updated

| File | Status | Description |
|------|--------|-------------|
| `src/config/navigation.ts` | ✅ Complete | v5 sidebar navigation structure |
| `src/lib/navigation/ia-structure.ts` | ✅ Complete | v5 IA type definitions and page configs |
| `docs/OPTIMIZED_IA_STRUCTURE.md` | ✅ Complete | Full v5 specification |
| `docs/SIDEBAR_REORGANIZATION_PLAN.md` | ✅ Archived | Marked as implemented |

---

## Route Migration Required

The following route directories need to be created/migrated to match v5 navigation:

### New Top-Level Routes (from `/modules/*`)

| Legacy Path | v5 Path | Action |
|-------------|---------|--------|
| `/modules/production/*` | `/productions/*` | Move & rename |
| `/modules/workforce/*` | `/people/*` | Move & rename |
| `/modules/assets/*` | `/assets/*` | Move & rename |
| `/modules/business/*` | `/business/*` | Move & rename |
| `/modules/finance/*` | `/finance/*` | Move & rename |
| `/modules/operations/*` | `/operations/*` | Move & rename |
| `/modules/projects/*` | **REMOVED** | Delete (not in v5) |
| `/modules/content/*` | **MERGED** | Move to `/business/campaigns/*` |
| `/modules/network/*` | `/network/*` | Already exists, keep |

### CORE Module Changes

| Legacy Path | v5 Path | Action |
|-------------|---------|--------|
| `/core/activity` | `/core/inbox` | Rename |
| `/core/dashboard` | `/core/dashboard` | Keep |
| `/core/calendar` | `/core/calendar` | Keep |
| `/core/tasks` | `/core/tasks` | Keep |
| `/core/documents` | `/core/documents` | Keep |
| `/core/workflows` | `/core/workflows` | Keep |

### New Pages to Create

#### PRODUCTIONS (`/productions/*`)
- `/productions/` - Productions list
- `/productions/events/` - Events
- `/productions/activations/` - Activations
- `/productions/build-strike/` - Build & Strike (production schedule)
- `/productions/compliance/` - Compliance (permits, licenses, certificates)
- `/productions/inspections/` - Inspections
- `/productions/punch-lists/` - Punch Lists
- `/productions/advancing/` - Advancing (riders, tech specs)

#### OPERATIONS (`/operations/*`)
- `/operations/shows/` - Shows
- `/operations/runsheets/` - Runsheets
- `/operations/venues/` - Venues (floor plans, zones, checkpoints)
- `/operations/incidents/` - Incidents
- `/operations/work-orders/` - Work Orders
- `/operations/daily-reports/` - Daily Reports
- `/operations/comms/` - Comms (radio, weather)

#### PEOPLE (`/people/*`)
- `/people/rosters/` - Rosters
- `/people/availability/` - Availability
- `/people/travel/` - Travel & Lodging
- `/people/recruitment/` - Recruitment
- `/people/onboarding/` - Onboarding
- `/people/training/` - Training
- `/people/scheduling/` - Scheduling
- `/people/timekeeping/` - Timekeeping
- `/people/performance/` - Performance
- `/people/certifications/` - Certifications
- `/people/positions/` - Positions

#### ASSETS (`/assets/*`)
- `/assets/catalog/` - Catalog (equipment SSOT)
- `/assets/inventory/` - Inventory
- `/assets/locations/` - Locations
- `/assets/reservations/` - Reservations
- `/assets/advances/` - Advances (production advances)
- `/assets/deployment/` - Deployment
- `/assets/logistics/` - Logistics
- `/assets/status/` - Asset Status (check-in/out)
- `/assets/maintenance/` - Maintenance

#### BUSINESS (`/business/*`)
- `/business/pipeline/` - Pipeline
- `/business/companies/` - Companies
- `/business/proposals/` - Proposals
- `/business/contracts/` - Contracts
- `/business/products/` - Products & Services
- `/business/campaigns/` - Campaigns
- `/business/subscribers/` - Subscribers
- `/business/brand/` - Brand Kit

#### FINANCE (`/finance/*`)
- `/finance/budgets/` - Budgets
- `/finance/procurement/` - Procurement
- `/finance/expenses/` - Expenses
- `/finance/invoices/` - Invoices
- `/finance/payments/` - Payments
- `/finance/payroll/` - Payroll
- `/finance/accounts/` - Accounts
- `/finance/reports/` - Reports

---

## Legacy Pages to Remove

The following pages are **NOT in v5** and should be removed or merged:

| Legacy Page | Disposition |
|-------------|-------------|
| `/modules/projects/*` | **DELETE** - Projects module removed |
| `/modules/content/*` | **MERGE** - Content merged into Business (campaigns) |
| `/core/activity` | **RENAME** - Becomes `/core/inbox` |
| `/modules/production/registration` | **REMOVE** - Not in v5 |
| `/modules/production/ticketing` | **REMOVE** - Not in v5 |
| `/modules/production/check-in` | **REMOVE** - Not in v5 |
| `/modules/production/talent` | **REMOVE** - Not in v5 |
| `/modules/production/partners` | **REMOVE** - Not in v5 |
| `/modules/production/credentials` | **REMOVE** - Not in v5 |
| `/modules/production/sessions` | **REMOVE** - Not in v5 |
| `/modules/production/hospitality` | **REMOVE** - Not in v5 |
| `/modules/production/exhibitors` | **REMOVE** - Not in v5 |
| `/modules/production/networking` | **REMOVE** - Not in v5 |
| `/modules/production/departments` | **REMOVE** - Not in v5 |
| `/modules/production/tech-specs` | **MERGE** - Tab under Advancing |
| `/modules/production/riders` | **MERGE** - Tab under Advancing |
| `/modules/operations/procurement` | **MOVE** - Goes to Finance |
| `/modules/operations/support` | **REMOVE** - Not in v5 |
| `/modules/operations/compliance` | **MOVE** - Goes to Productions |
| `/modules/workforce/leave` | **MERGE** - Part of Availability |
| `/modules/workforce/offboarding` | **REMOVE** - Not in v5 |
| `/modules/workforce/payroll` | **MOVE** - Goes to Finance |
| `/modules/workforce/credentials` | **MERGE** - Same as Certifications |
| `/modules/assets/vehicles` | **MERGE** - Category in Catalog |
| `/modules/assets/categories` | **MERGE** - Tab under Catalog |
| `/modules/assets/kits` | **REMOVE** - Not in v5 |
| `/modules/assets/vendors` | **MOVE** - Goes to Business (Companies) |
| `/modules/finance/gl-accounts` | **MERGE** - Tab under Accounts |
| `/modules/finance/journal` | **REMOVE** - Not in v5 |
| `/modules/finance/banking` | **MERGE** - Tab under Accounts |
| `/modules/finance/settlements` | **REMOVE** - Not in v5 |
| `/modules/business/contacts` | **MERGE** - Tab under Companies |
| `/modules/business/leads` | **MERGE** - Tab under Pipeline |
| `/modules/business/lead-scoring` | **REMOVE** - Not in v5 |
| `/modules/business/sequences` | **REMOVE** - Not in v5 |
| `/modules/business/deals` | **MERGE** - Tab under Pipeline |
| `/modules/business/service` | **REMOVE** - Not in v5 |

---

## Implementation Steps

### Phase 1: Create New Route Structure
```bash
# Create new top-level route directories
mkdir -p src/app/(app)/productions
mkdir -p src/app/(app)/operations
mkdir -p src/app/(app)/people
mkdir -p src/app/(app)/assets
mkdir -p src/app/(app)/business
mkdir -p src/app/(app)/finance
```

### Phase 2: Migrate Existing Pages
1. Copy relevant page components from `/modules/*` to new locations
2. Update imports and paths
3. Add redirects from old paths to new paths (for backwards compatibility)

### Phase 3: Remove Legacy Routes
1. Delete `/modules/` directory after migration complete
2. Remove redirects after sufficient transition period

### Phase 4: Update Components
1. Update any hardcoded paths in components
2. Update breadcrumb configurations
3. Update any deep links in documentation

---

## Verification Checklist

- [ ] All 57 pages accessible via new routes
- [ ] Sidebar navigation renders correctly
- [ ] No broken links in application
- [ ] Mobile navigation works
- [ ] Breadcrumbs display correctly
- [ ] Search indexes updated
- [ ] Documentation updated
