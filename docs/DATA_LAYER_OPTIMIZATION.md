# ATLVS Data Layer Optimization Report

> **Generated**: January 29, 2026  
> **Purpose**: 3NF/SSOT compliance audit and consolidation recommendations  
> **Scope**: Database schema, migrations, navigation/IA, and TypeScript types

---

## Executive Summary

After comprehensive analysis of the ATLVS data layer including 34 migrations, navigation configuration, and TypeScript schema types, I've identified **23 optimization opportunities** across 5 categories:

| Category | Issues Found | Priority |
|----------|-------------|----------|
| 3NF Violations | 8 | Critical |
| SSOT Breaches | 6 | Critical |
| Entity Consolidation | 5 | High |
| Navigation/IA Cleanup | 3 | Medium |
| Schema Normalization | 1 | Low |

---

## 1. 3NF VIOLATIONS

### 1.1 Vendor Entity Missing - CRITICAL

**Problem**: Multiple tables reference `vendor_id` as UUID but no `vendors` table exists. Instead, vendors are stored in `companies` table with `company_type = 'vendor'`.

**Affected Tables**:
- `assets.vendor_id` (00003)
- `purchase_orders.vendor_id` (00005)
- `purchase_requisition_items.preferred_vendor_id` (00005)
- `asset_maintenance.vendor_id` (00003)
- `service_history.vendor_id` (00034)
- `certificates_of_insurance.vendor_id` (00031)
- `shipments.carrier_id` → references `vendors` (00032)

**Current State**: These are dangling FKs with no referential integrity.

**Solution**: Create a `vendors` view or consolidate to use `companies` table with proper FK constraints.

### 1.2 Duplicate Rate Cards Tables

**Problem**: Two separate `rate_cards` tables exist:
1. `rate_cards` in 00004_workforce.sql (workforce rate cards)
2. `rate_cards` in 00034_clickup_ssot_business_assets.sql (service rate cards)

**Solution**: Consolidate into single polymorphic `rate_cards` table with `rate_card_type` discriminator.

### 1.3 Redundant Address Fields

**Problem**: Address fields are duplicated across 15+ tables instead of using a normalized `addresses` table:
- `organizations` (address, city, state, country, postal_code)
- `companies` (same fields)
- `contacts` (same fields)
- `venues` (same fields)
- `locations` (same fields)
- `contractors` (same fields)
- `hotels` (hotel_address)

**Solution**: Create `addresses` table with polymorphic relationship.

### 1.4 Inconsistent Project/Event References

**Problem**: Many tables have both `project_id` and `event_id` columns, creating ambiguity about which is the canonical parent:
- `budgets` (project_id, event_id)
- `invoices` (project_id, event_id)
- `purchase_orders` (project_id, event_id)
- `expenses` (project_id, event_id)
- `crew_calls` (project_id, event_id)
- `shifts` (project_id, event_id)
- `asset_check_actions` (project_id, event_id)
- `asset_reservations` (project_id, event_id)

**Solution**: Use polymorphic `parent_type` + `parent_id` pattern OR enforce that events belong to projects and only reference project_id.

### 1.5 Duplicate Shipment Tracking

**Problem**: Shipment tracking exists in two places:
1. `shipments` table (00032) with `tracking_number`, `tracking_url`
2. `assets.shipment_tracking` referenced in clickupmigration.md but not implemented

**Solution**: Ensure single `shipments` table is SSOT for all shipment tracking.

### 1.6 Inconsistent Status Enums vs VARCHAR

**Problem**: Some tables use proper ENUMs for status while others use VARCHAR with CHECK constraints:
- ENUMs: `production_status`, `shipment_status`, `work_order_status`
- VARCHAR+CHECK: `safety_plans.status`, `pull_lists.status`, `load_plans.status`, `daily_site_reports.status`

**Solution**: Standardize on ENUMs for all status fields for type safety.

### 1.7 Duplicate Contact Information

**Problem**: Contact info stored redundantly:
- `venues` has `contact_name`, `primary_contact_phone`, `primary_contact_email`
- `contacts` table exists for this purpose
- `site_advances` has `advance_contact_id` (correct pattern)

**Solution**: Remove inline contact fields from `venues`, use `venue_contacts` junction table.

### 1.8 Computed Fields Stored Instead of Generated

**Problem**: Some computed values are stored rather than using PostgreSQL GENERATED columns:
- `per_diems.total_amount` should be `daily_rate * total_days`
- `timesheets.total_amount` should be computed from entries

**Solution**: Convert to GENERATED ALWAYS AS columns where possible.

---

## 2. SSOT BREACHES

### 2.1 Companies vs Accounts Terminology

**Problem**: ClickUp migration spec uses `business.accounts` but existing schema uses `companies` table. This creates terminology confusion:
- Navigation uses "Companies" (`/modules/business/companies`)
- clickupmigration.md references `business.accounts`
- Database has `companies` table

**Solution**: Standardize on `companies` as the table name, use "Accounts" in UI only if needed.

### 2.2 Personnel vs Users

**Problem**: Two overlapping concepts:
- `users` table (auth-linked, all platform users)
- clickupmigration.md references `workforce.personnel` (employee records)
- Current schema uses `users` + `organization_members` for workforce

**Solution**: Keep `users` as auth SSOT, add `employee_profiles` table for HR-specific data (hire_date, term_date, hourly_rate, etc.) that extends users.

### 2.3 Productions vs Projects vs Events

**Problem**: Three overlapping project-type entities:
- `projects` (generic project management)
- `productions` (00031 - event production lifecycle)
- `events` (00002 - event instances)

**Relationships unclear**:
- `productions.project_id` → references projects
- `events.project_id` → references projects
- `activations.project_id` → references projects

**Solution**: Clarify hierarchy:
```
projects (container)
  └── productions (type: stage/scenic/touring)
  └── events (type: festival/conference/concert)
  └── activations (type: brand activation)
```

### 2.4 Duplicate Inspection Tables

**Problem**: Two inspection-related structures:
1. `inspections` table (00032) - generic inspections
2. clickupmigration.md references separate `qc_inspections`, `safety_inspections`, `client_walkthroughs`, `final_signoffs`

**Solution**: Use single `inspections` table with `inspection_type` enum (already implemented correctly).

### 2.5 Catalog Items vs Asset Categories

**Problem**: Two overlapping concepts for asset classification:
- `asset_categories` (00003) - hierarchical categories
- `catalog_items` referenced in clickupmigration.md - product catalog
- `assets.catalog_item_id` referenced but table doesn't exist

**Solution**: Create `catalog_items` table as product master, `asset_categories` for classification hierarchy.

### 2.6 Multiple Training/Certification Structures

**Problem**: Training data split across:
- `certification_types` + `user_certifications` (00004)
- clickupmigration.md references `training_programs`, `training_assignments`, `training_completions`, `training_sessions`

**Solution**: Implement training tables from clickupmigration.md spec, link to certifications.

---

## 3. ENTITY CONSOLIDATION OPPORTUNITIES

### 3.1 Consolidate Work Order Types

**Current State**:
- `work_orders` (00032) with `work_order_type` enum
- clickupmigration.md references separate `install_work_orders`, `strike_work_orders`

**Recommendation**: Single `work_orders` table with type discriminator (already correct).

### 3.2 Consolidate Document/Report Types

**Current State**:
- `daily_site_reports` (00032)
- `advance_reports` (00034)
- `incident_reports` (00002)
- `near_misses` (00033)
- `safety_observations` (00033)

**Recommendation**: Consider unified `reports` table with `report_type` discriminator, or keep separate for domain clarity (current approach is acceptable).

### 3.3 Consolidate Feedback/Review Types

**Current State**:
- `peer_feedback` (00033)
- `performance_reviews` (referenced but not found)
- `goals` (00033)

**Recommendation**: Ensure `performance_reviews` table exists, link feedback and goals properly.

### 3.4 Unify Approval Workflows

**Current State**: Multiple tables have approval patterns:
- `approved_by`, `approved_at` on budgets, job_requisitions, job_offers, etc.
- `approval_requests` table exists in workflow system

**Recommendation**: Use workflow engine's approval system consistently.

### 3.5 Consolidate Location Tracking

**Current State**:
- `locations` table (00003) - warehouses, venues, etc.
- `location_log` (00034) - GPS tracking
- `custody_log` (00034) - asset custody changes

**Recommendation**: Keep separate (correct domain separation).

---

## 4. NAVIGATION/IA CLEANUP

### 4.1 Missing Module Pages

**Problem**: Navigation references pages that may not have full implementations:
- `/modules/workforce/candidates` - exists but needs `candidates` table (added in 00033)
- `/modules/assets/vehicles` - exists but needs `vehicles` table (added in 00034)
- `/modules/assets/shipments` - exists but needs `shipments` table (added in 00032)

**Solution**: Verify all navigation items have corresponding database tables and API endpoints.

### 4.2 Inconsistent Path Patterns

**Problem**: Mixed patterns in navigation:
- `/modules/production/productions` (redundant)
- `/modules/projects/projects` (redundant)
- `/modules/business/companies` (correct)

**Solution**: Standardize: `/modules/{domain}/{entity}` without redundancy.

### 4.3 Content Module Outside Modules

**Problem**: Content module uses `/content/*` instead of `/modules/content/*`:
```typescript
{
  title: "Content",
  path: "/content",  // Should be /modules/content
  ...
}
```

**Solution**: Move to `/modules/content` for consistency.

---

## 5. SCHEMA NORMALIZATION

### 5.1 Missing Foreign Key Constraints

**Problem**: Several FK references lack proper constraints:
- `invoices.company_id` - no FK constraint
- `invoices.contact_id` - no FK constraint
- `purchase_orders.vendor_id` - no FK constraint
- `stages.venue_id` - no FK constraint
- `events.venue_id` - no FK constraint

**Solution**: Add proper FK constraints in consolidation migration.

---

## RECOMMENDED MIGRATION PLAN

### Phase 1: Critical 3NF Fixes (Migration 00035)

1. Create `vendors` view from `companies WHERE company_type = 'vendor'`
2. Add missing FK constraints
3. Consolidate `rate_cards` tables
4. Standardize status fields to ENUMs

### Phase 2: SSOT Consolidation (Migration 00036)

1. Create `employee_profiles` table for HR data
2. Create `catalog_items` table
3. Create training tables (`training_programs`, `training_assignments`, etc.)
4. Add `performance_reviews` table

### Phase 3: Navigation/IA Cleanup

1. Fix Content module path
2. Remove redundant path segments
3. Verify all routes have backing tables

### Phase 4: Address Normalization (Optional)

1. Create `addresses` table
2. Migrate address data
3. Update FKs

---

## IMPLEMENTATION PRIORITY

| Priority | Item | Impact | Effort |
|----------|------|--------|--------|
| P0 | Add missing FK constraints | Data integrity | Low |
| P0 | Create vendors view | FK resolution | Low |
| P1 | Create catalog_items table | Asset management | Medium |
| P1 | Create employee_profiles table | Workforce management | Medium |
| P1 | Create training tables | Workforce management | Medium |
| P2 | Consolidate rate_cards | Code simplification | Medium |
| P2 | Fix navigation paths | UX consistency | Low |
| P3 | Normalize addresses | Data quality | High |

---

## IMPLEMENTATION STATUS

| Item | Status | File |
|------|--------|------|
| Create migration 00035 | ✅ Complete | `supabase/migrations/00035_3nf_ssot_consolidation.sql` |
| Vendors view | ✅ Complete | Migration 00035 |
| Missing FK constraints | ✅ Complete | Migration 00035 |
| Catalog items table | ✅ Complete | Migration 00035 |
| Employee profiles table | ✅ Complete | Migration 00035 |
| Training tables | ✅ Complete | Migration 00035 |
| Performance reviews table | ✅ Complete | Migration 00035 |
| RLS policies for new tables | ✅ Complete | Migration 00035 |
| Rate cards consolidation | ✅ Complete | `supabase/migrations/00036_rate_cards_consolidation.sql` |
| TypeScript types | ✅ Complete | `src/lib/schema/consolidated-types.ts` |
| Navigation path fixes | ✅ Complete | `src/config/navigation.ts` |
| Training API services | ✅ Complete | `src/lib/api/services/training.ts` |
| Performance API services | ✅ Complete | `src/lib/api/services/performance.ts` |
| Employee profiles API | ✅ Complete | `src/lib/api/services/employee-profiles.ts` |
| Catalog items API | ✅ Complete | `src/lib/api/services/catalog.ts` |
| Training program schema | ✅ Complete | `src/lib/schemas/trainingProgram.ts` |
| Training assignment schema | ✅ Complete | `src/lib/schemas/trainingAssignment.ts` |
| Performance review schema | ✅ Complete | `src/lib/schemas/performanceReview.ts` (updated) |
| Address normalization (P3) | ✅ Complete | `supabase/migrations/00037_address_normalization.sql` |
| Addresses API service | ✅ Complete | `src/lib/api/services/addresses.ts` |

## NEXT STEPS

1. **Run migrations** `supabase db push` or `supabase migration up`
2. **Run address migration function** `SELECT migrate_inline_addresses();` (after reviewing data)
3. **Regenerate Supabase types** `supabase gen types typescript --local > src/lib/supabase/database.types.ts`
4. **Test API endpoints** for new tables
5. **Verify UI pages** render correctly with new schemas
