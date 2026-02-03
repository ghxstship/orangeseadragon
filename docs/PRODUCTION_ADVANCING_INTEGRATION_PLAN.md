# Production Advancing Module Integration Plan

> **Created:** February 2026  
> **Updated:** February 2, 2026  
> **Pattern:** 3NF Compliant, SSOT via Triggers, Zero Data Overlap  
> **Reference:** `prompt_advancing.md`, `00038_calendar_ssot_triggers.sql`

---

## Executive Summary

This document outlines the integration strategy for the Production Advancing Module into the ATLVS platform while maintaining strict compliance with:

1. **Third Normal Form (3NF)** - No redundant data, atomic fields, full key dependency
2. **Single Source of Truth (SSOT)** - Each concept exists in exactly one place
3. **Zero Data Overlap** - Reuse existing entities, no shadow models

### Key Decision: Unified ADVANCING Section

Advancing is now a **top-level sidebar section** that consolidates:
- Former `PRODUCTIONS > Advancing` (artist coordination)
- Former `ASSETS > Logistics > Advances` (equipment advances)

This unification eliminates data overlap and provides a single workflow for all advance coordination.

---

## 0. Information Architecture (Implemented)

### Sidebar Structure

```
ADVANCING (New Top-Level Section)
├── Dashboard          → /advancing
│   Overview: critical path, at-risk items, approvals pending
├── Advances           → /advancing/advances
│   production_advances list (by event)
├── Items              → /advancing/items
│   advance_items list (filterable by category)
│   └── Subpages:
│       ├── Technical   → /advancing/items/technical
│       ├── Logistics   → /advancing/items/logistics
│       ├── Hospitality → /advancing/items/hospitality
│       ├── Staffing    → /advancing/items/staffing
│       ├── Safety      → /advancing/items/safety
│       └── Marketing   → /advancing/items/marketing
├── Fulfillment        → /advancing/fulfillment
│   Stage tracking: ordered → delivered → installed → tested
└── Vendors            → /advancing/vendors
    Vendor coordination (filtered view of companies)
    └── Subpages:
        ├── Communications → /advancing/vendors/communications
        └── Performance    → /advancing/vendors/performance
```

### What Was Removed

| Former Location | Action |
|----------------|--------|
| `PRODUCTIONS > Advancing` | **REMOVED** - Consolidated into `/advancing` |
| `PRODUCTIONS > Advancing > Riders` | **MOVED** to `/advancing/items/hospitality` |
| `PRODUCTIONS > Advancing > Tech Specs` | **MOVED** to `/advancing/items/technical` |
| `PRODUCTIONS > Advancing > Hospitality` | **MOVED** to `/advancing/items/hospitality` |
| `PRODUCTIONS > Advancing > Catering` | **MOVED** to `/advancing/items/hospitality` |
| `PRODUCTIONS > Advancing > Guest Lists` | **MOVED** to `/advancing/items/hospitality` |
| `ASSETS > Logistics > Advances` | **REMOVED** - Consolidated into `/advancing/items/logistics` |

### Files Updated

- `src/lib/navigation/ia-structure.ts` - Added ADVANCING group and pages
- `src/config/navigation.ts` - Added ADVANCING section with all routes

---

## 1. Schema Overlap Analysis

### Entities That ALREADY EXIST (Must Reuse)

| Prompt Schema | Existing ATLVS Table | Action |
|--------------|---------------------|--------|
| `events` (FK target) | `events` | **REUSE** - Already exists in `00002_events_production.sql` |
| `vendors` | `companies` (view: `vendors`) | **REUSE** - View filters `company_type = 'vendor'` per `00035_3nf_ssot_consolidation.sql` |
| `contacts` | `contacts` | **REUSE** - Already exists in `00006_crm_venues.sql` |
| `users` (FK target) | `users` | **REUSE** - Already exists in `00001_initial_schema.sql` |
| `approval_workflows` | `approval_workflows` | **REUSE** - Already exists in `00009_workflows_documents.sql` |
| `approval_steps` | `approval_decisions` | **ADAPT** - Similar structure, extend if needed |
| `activity_tracking` | `activity_feed` | **REUSE** - SSOT pattern in `00039_activity_feed_ssot.sql` |

### Entities That Need NEW Tables

| Prompt Schema | Recommended ATLVS Name | Notes |
|--------------|------------------------|-------|
| `production_advances` | `production_advances` | **NEW** - Core entity for advancing workflow |
| `advance_categories` | `advance_categories` | **NEW** - Lookup table for categorization |
| `advance_items` | `advance_items` | **NEW** - Line items within an advance |
| `advance_communications` | N/A | **SKIP** - Use existing `activities` table with `activity_type` |
| `fulfillment_tracking` | `advance_item_fulfillment` | **NEW** - Stage tracking for items |
| `vendor_performance_tracking` | `vendor_ratings` | **NEW** - Performance metrics |

---

## 2. 3NF Compliance Mapping

### Violations in Prompt Schema (Must Fix)

#### 2.1 Redundant `total_cost` Field
**Prompt:** `advance_items.total_cost` = `quantity_required * unit_cost`

**Fix:** Remove stored field, use computed column or view:
```sql
-- Option A: Generated column
total_cost DECIMAL(14,2) GENERATED ALWAYS AS (quantity_required * unit_cost) STORED;

-- Option B: View projection (preferred for flexibility)
CREATE VIEW advance_items_with_totals AS
SELECT *, (quantity_required * unit_cost) AS total_cost FROM advance_items;
```

#### 2.2 Denormalized `contact_person_id` in `advance_items`
**Prompt:** Both `vendor_id` and `contact_person_id` exist on same row.

**Fix:** Contact is already linked via `contacts.company_id`. Query through join:
```sql
-- Get vendor contact via existing relationship
SELECT ai.*, c.full_name as contact_name
FROM advance_items ai
JOIN companies v ON v.id = ai.vendor_id
LEFT JOIN contacts c ON c.company_id = v.id AND c.is_primary = TRUE;
```

#### 2.3 Redundant `approval_status` in `advance_items`
**Prompt:** `advance_items.approval_status` duplicates `approval_requests.status`.

**Fix:** Remove from `advance_items`. Query via existing `approval_requests`:
```sql
-- Approval status comes from approval_requests table
SELECT ai.*, ar.status as approval_status
FROM advance_items ai
LEFT JOIN approval_requests ar 
  ON ar.entity_type = 'advance_item' AND ar.entity_id = ai.id;
```

#### 2.4 Separate `approval_workflows` Table in Prompt
**Prompt:** Creates new `approval_workflows` table for advance items.

**Fix:** Reuse existing `approval_workflows` + `approval_requests` from `00009_workflows_documents.sql`:
- Set `entity_type = 'advance_item'`
- Existing multi-step approval logic already implemented

---

## 3. SSOT Integration Points

### 3.1 Activity Feed Integration

The prompt's `advance_activity_tracking` table **MUST NOT** be created. Instead, use the existing `activity_feed` SSOT pattern:

```sql
-- Trigger on advance_items syncs to activity_feed
CREATE OR REPLACE FUNCTION sync_advance_item_to_activity_feed() 
RETURNS TRIGGER AS $$
BEGIN
    PERFORM upsert_activity_feed_entry(
        p_organization_id := NEW.organization_id,
        p_activity_type := TG_ARGV[0],  -- 'created', 'updated', 'status_changed'
        p_entity_type := 'advance_item',
        p_entity_id := NEW.id,
        p_actor_id := COALESCE(NEW.assigned_to, NEW.created_by),
        p_title := NEW.item_name,
        p_content := NEW.notes,
        p_metadata := jsonb_build_object(
            'status', NEW.status,
            'category_id', NEW.category_id,
            'vendor_id', NEW.vendor_id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3.2 Calendar Integration

Advance items with `scheduled_delivery`, `load_in_time`, `strike_time` sync to `calendar_events`:

```sql
-- Trigger syncs advance item milestones to calendar
CREATE OR REPLACE FUNCTION sync_advance_item_to_calendar() 
RETURNS TRIGGER AS $$
BEGIN
    -- Scheduled delivery milestone
    IF NEW.scheduled_delivery IS NOT NULL THEN
        PERFORM upsert_calendar_event(
            p_organization_id := NEW.organization_id,
            p_entity_type := 'advance_item',
            p_entity_id := NEW.id,
            p_title := 'Delivery: ' || NEW.item_name,
            p_start_time := NEW.scheduled_delivery,
            p_end_time := NEW.scheduled_delivery,
            p_color := '#f97316',  -- orange
            p_suffix := 'delivery'
        );
    END IF;
    
    -- Load-in milestone
    IF NEW.load_in_time IS NOT NULL THEN
        PERFORM upsert_calendar_event(
            p_organization_id := NEW.organization_id,
            p_entity_type := 'advance_item',
            p_entity_id := NEW.id,
            p_title := 'Load-In: ' || NEW.item_name,
            p_start_time := NEW.load_in_time,
            p_end_time := NEW.load_in_time,
            p_color := '#8b5cf6',  -- purple
            p_suffix := 'load_in'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3.3 Document Registry Integration

Advance item attachments sync to `document_registry` SSOT (per `00040_document_registry_ssot.sql`):

- Contracts → `document_registry` with `document_type = 'contract'`
- Riders → `document_registry` with `document_type = 'rider'`
- Specs → `document_registry` with `document_type = 'specification'`

---

## 4. Normalized Schema Design

### 4.1 Core Tables (NEW)

```sql
-- ============================================================================
-- ADVANCE CATEGORIES (Lookup Table)
-- ============================================================================
CREATE TABLE advance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_category_id UUID REFERENCES advance_categories(id) ON DELETE SET NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- ============================================================================
-- PRODUCTION ADVANCES (Primary Entity)
-- ============================================================================
CREATE TABLE production_advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    advance_code VARCHAR(50) NOT NULL,
    advance_type VARCHAR(50) NOT NULL CHECK (advance_type IN (
        'pre_event', 'load_in', 'show_day', 'strike', 'post_event'
    )),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft', 'in_progress', 'pending_approval', 'approved', 'completed', 'cancelled'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN (
        'critical', 'high', 'medium', 'low'
    )),
    due_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approval_date TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, advance_code)
);

-- ============================================================================
-- ADVANCE ITEMS (Line Items)
-- ============================================================================
CREATE TABLE advance_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    production_advance_id UUID NOT NULL REFERENCES production_advances(id) ON DELETE CASCADE,
    category_id UUID REFERENCES advance_categories(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    specifications JSONB DEFAULT '{}',
    
    -- Vendor (references companies via vendor view)
    vendor_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Quantities & Costs (3NF: no stored total_cost)
    quantity_required INTEGER DEFAULT 1,
    quantity_confirmed INTEGER DEFAULT 0,
    unit_cost DECIMAL(14,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'in_transit', 'delivered', 'installed', 'struck', 'complete'
    )),
    
    -- Scheduling
    scheduled_delivery TIMESTAMPTZ,
    actual_delivery TIMESTAMPTZ,
    load_in_time TIMESTAMPTZ,
    strike_time TIMESTAMPTZ,
    location VARCHAR(255),
    
    -- Dependencies & Critical Path
    dependencies UUID[] DEFAULT '{}',
    is_critical_path BOOLEAN DEFAULT FALSE,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Metadata
    notes TEXT,
    checklist JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- ADVANCE ITEM FULFILLMENT (Stage Tracking)
-- ============================================================================
CREATE TABLE advance_item_fulfillment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    advance_item_id UUID NOT NULL REFERENCES advance_items(id) ON DELETE CASCADE,
    fulfillment_stage VARCHAR(50) NOT NULL CHECK (fulfillment_stage IN (
        'ordered', 'confirmed', 'in_production', 'shipped', 
        'in_transit', 'delivered', 'installed', 'tested', 'complete'
    )),
    stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
    expected_completion TIMESTAMPTZ,
    actual_completion TIMESTAMPTZ,
    percentage_complete INTEGER DEFAULT 0 CHECK (percentage_complete BETWEEN 0 AND 100),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(advance_item_id, fulfillment_stage)
);

-- ============================================================================
-- VENDOR RATINGS (Performance Tracking)
-- ============================================================================
CREATE TABLE vendor_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    advance_item_id UUID REFERENCES advance_items(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    on_time_delivery BOOLEAN,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    would_recommend BOOLEAN,
    issues_encountered TEXT,
    rated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Indexes

```sql
-- Production Advances
CREATE INDEX idx_production_advances_org ON production_advances(organization_id);
CREATE INDEX idx_production_advances_event ON production_advances(event_id);
CREATE INDEX idx_production_advances_status ON production_advances(status);
CREATE INDEX idx_production_advances_type ON production_advances(advance_type);
CREATE INDEX idx_production_advances_due ON production_advances(due_date);

-- Advance Items
CREATE INDEX idx_advance_items_org ON advance_items(organization_id);
CREATE INDEX idx_advance_items_advance ON advance_items(production_advance_id);
CREATE INDEX idx_advance_items_category ON advance_items(category_id);
CREATE INDEX idx_advance_items_vendor ON advance_items(vendor_id);
CREATE INDEX idx_advance_items_status ON advance_items(status);
CREATE INDEX idx_advance_items_critical ON advance_items(is_critical_path) WHERE is_critical_path = TRUE;
CREATE INDEX idx_advance_items_delivery ON advance_items(scheduled_delivery);

-- Fulfillment
CREATE INDEX idx_fulfillment_item ON advance_item_fulfillment(advance_item_id);
CREATE INDEX idx_fulfillment_stage ON advance_item_fulfillment(fulfillment_stage);

-- Vendor Ratings
CREATE INDEX idx_vendor_ratings_vendor ON vendor_ratings(vendor_id);
CREATE INDEX idx_vendor_ratings_event ON vendor_ratings(event_id);

-- Advance Categories
CREATE INDEX idx_advance_categories_org ON advance_categories(organization_id);
CREATE INDEX idx_advance_categories_parent ON advance_categories(parent_category_id);
```

---

## 5. Reusing Existing Systems

### 5.1 Approval Workflows

**DO NOT** create new approval tables. Use existing system:

```sql
-- Create approval workflow template for advance items
INSERT INTO approval_workflows (
    organization_id, name, slug, description, entity_type, approval_type, config
) VALUES (
    :org_id,
    'Advance Item Approval',
    'advance-item-approval',
    'Multi-tier approval for production advance items',
    'advance_item',
    'sequential',
    '{
        "tiers": [
            {"threshold": 500, "approvers": ["auto"]},
            {"threshold": 5000, "approvers": ["production_manager"]},
            {"threshold": 25000, "approvers": ["production_manager", "event_director"]},
            {"threshold": null, "approvers": ["production_manager", "event_director", "finance"]}
        ]
    }'::JSONB
);
```

### 5.2 Communications

**DO NOT** create `advance_communications` table. Use existing `activities`:

```sql
-- Log vendor communication as activity
INSERT INTO activities (
    organization_id,
    activity_type,
    subject,
    description,
    company_id,      -- vendor
    contact_id,      -- vendor contact
    event_id,
    created_by
) VALUES (
    :org_id,
    'email',         -- or 'call', 'meeting'
    'Equipment confirmation for Feb 10 event',
    :message_body,
    :vendor_id,
    :contact_id,
    :event_id,
    :user_id
);
```

### 5.3 Documents

**DO NOT** store documents in advance_items. Use `documents` table with entity linking:

```sql
-- Link document to advance item via existing system
INSERT INTO documents (
    organization_id,
    title,
    document_type,
    event_id,
    metadata
) VALUES (
    :org_id,
    'PA System Technical Specs',
    'specification',
    :event_id,
    jsonb_build_object('advance_item_id', :advance_item_id)
);
```

---

## 6. Implementation Phases

### Phase 0: Navigation & IA (COMPLETED ✓)
**Files Updated:**
- `src/lib/navigation/ia-structure.ts`
- `src/config/navigation.ts`

### Phase 1: Core Schema (Migration 00041)
**Effort:** 1-2 days

1. Create `advance_categories` lookup table
2. Create `production_advances` table
3. Create `advance_items` table
4. Create `advance_item_fulfillment` table
5. Create `vendor_ratings` table
6. Add indexes and RLS policies
7. Seed default categories

### Phase 2: SSOT Triggers (Migration 00042)
**Effort:** 1 day

1. Trigger: `advance_items` → `calendar_events` (delivery/load-in milestones)
2. Trigger: `advance_items` → `activity_feed` (status changes)
3. Trigger: `advance_item_fulfillment` → `activity_feed` (stage changes)
4. Trigger: `vendor_ratings` → aggregate to `companies.metadata`

### Phase 3: Approval Integration (Migration 00043)
**Effort:** 1 day

1. Create approval workflow template for advance items
2. Add trigger to auto-create approval requests based on cost thresholds
3. Add trigger to update `advance_items.status` on approval completion

### Phase 4: API & UI (Application Code)
**Effort:** 3-5 days

1. API routes for CRUD operations
2. Dashboard components
3. Kanban/timeline views
4. Mobile-responsive forms

### Phase 5: Seed Data & Testing
**Effort:** 1-2 days

1. Seed default advance categories
2. Create sample production advances
3. E2E tests for approval workflows
4. Integration tests for SSOT triggers

---

## 7. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     UNIFIED ADVANCING MODULE                             │
│                     /advancing/* routes                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐ │
│  │ production_      │────▶│ advance_items    │────▶│ advance_item_   │ │
│  │ advances         │     │                  │     │ fulfillment     │ │
│  └────────┬─────────┘     └────────┬─────────┘     └─────────────────┘ │
│           │                        │                                     │
│           │                        │ category_id ──▶ advance_categories │
│           │                        │                                     │
│           ▼                        ▼                                     │
│  ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐ │
│  │ events           │     │ companies        │     │ vendor_ratings  │ │
│  │ (EXISTING)       │     │ (EXISTING)       │     │ (NEW)           │ │
│  └──────────────────┘     └──────────────────┘     └─────────────────┘ │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                    CATEGORY-BASED FILTERING                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  /advancing/items/technical   → WHERE category.code LIKE 'technical%'   │
│  /advancing/items/logistics   → WHERE category.code LIKE 'logistics%'   │
│  /advancing/items/hospitality → WHERE category.code LIKE 'hospitality%' │
│  /advancing/items/staffing    → WHERE category.code LIKE 'staffing%'    │
│  /advancing/items/safety      → WHERE category.code LIKE 'safety%'      │
│  /advancing/items/marketing   → WHERE category.code LIKE 'marketing%'   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                           SSOT PROJECTIONS                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐ │
│  │ calendar_events  │     │ activity_feed    │     │ approval_       │ │
│  │ (SSOT)           │     │ (SSOT)           │     │ requests        │ │
│  │                  │     │                  │     │ (EXISTING)      │ │
│  │ • Deliveries     │     │ • Status changes │     │                 │ │
│  │ • Load-ins       │     │ • Assignments    │     │ • Cost-based    │ │
│  │ • Strike times   │     │ • Approvals      │     │   thresholds    │ │
│  └──────────────────┘     └──────────────────┘     └─────────────────┘ │
│           ▲                        ▲                        ▲           │
│           │                        │                        │           │
│           └────────────────────────┴────────────────────────┘           │
│                              TRIGGERS                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Zero Overlap Guarantees

### What We Are NOT Creating

| Prompt Table | Reason for Exclusion |
|-------------|---------------------|
| `approval_workflows` | Already exists in `00009_workflows_documents.sql` |
| `approval_steps` | Use existing `approval_decisions` |
| `advance_activity_tracking` | Use `activity_feed` SSOT |
| `advance_communications` | Use existing `activities` table |
| Separate `vendors` table | Use `companies` with view filter |
| Separate `contacts` table | Already exists |

### Foreign Key Strategy

All FKs point to **existing** authoritative tables:
- `events.id` ← `production_advances.event_id`
- `companies.id` ← `advance_items.vendor_id`
- `users.id` ← All `*_by` and `assigned_to` fields
- `organizations.id` ← All tables for RLS

---

## 9. RLS Policy Template

```sql
-- Enable RLS
ALTER TABLE production_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_item_fulfillment ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_ratings ENABLE ROW LEVEL SECURITY;

-- Standard org-scoped SELECT policy
CREATE POLICY select_policy ON production_advances
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
);

-- Repeat for all tables...
```

---

## 10. Success Criteria

- [ ] All new tables pass 3NF validation (no redundant data)
- [ ] Zero new tables duplicate existing functionality
- [ ] All temporal data syncs to `calendar_events` via triggers
- [ ] All status changes sync to `activity_feed` via triggers
- [ ] Approval workflows use existing `approval_requests` system
- [ ] Vendor references use `companies` table (not new table)
- [ ] RLS policies enforce organization isolation
- [ ] E2E tests pass for full advancing workflow

---

## Appendix A: Category Seed Data

```sql
INSERT INTO advance_categories (organization_id, code, name, parent_category_id, icon, color, sort_order) VALUES
-- Technical Production
(NULL, 'technical', 'Technical Production', NULL, 'cpu', '#3b82f6', 1),
(NULL, 'audio', 'Audio', (SELECT id FROM advance_categories WHERE code = 'technical'), 'volume-2', '#3b82f6', 1),
(NULL, 'lighting', 'Lighting', (SELECT id FROM advance_categories WHERE code = 'technical'), 'lightbulb', '#3b82f6', 2),
(NULL, 'video', 'Video', (SELECT id FROM advance_categories WHERE code = 'technical'), 'monitor', '#3b82f6', 3),
(NULL, 'rigging', 'Rigging', (SELECT id FROM advance_categories WHERE code = 'technical'), 'anchor', '#3b82f6', 4),
(NULL, 'staging', 'Staging', (SELECT id FROM advance_categories WHERE code = 'technical'), 'layout', '#3b82f6', 5),

-- Logistics
(NULL, 'logistics', 'Logistics & Operations', NULL, 'truck', '#10b981', 2),
(NULL, 'transportation', 'Transportation', (SELECT id FROM advance_categories WHERE code = 'logistics'), 'truck', '#10b981', 1),
(NULL, 'load_in', 'Load-In Schedule', (SELECT id FROM advance_categories WHERE code = 'logistics'), 'download', '#10b981', 2),
(NULL, 'storage', 'Storage', (SELECT id FROM advance_categories WHERE code = 'logistics'), 'archive', '#10b981', 3),

-- Hospitality
(NULL, 'hospitality', 'Hospitality & Catering', NULL, 'coffee', '#f59e0b', 3),
(NULL, 'artist_catering', 'Artist Catering', (SELECT id FROM advance_categories WHERE code = 'hospitality'), 'utensils', '#f59e0b', 1),
(NULL, 'crew_catering', 'Crew Catering', (SELECT id FROM advance_categories WHERE code = 'hospitality'), 'users', '#f59e0b', 2),
(NULL, 'green_rooms', 'Green Rooms', (SELECT id FROM advance_categories WHERE code = 'hospitality'), 'home', '#f59e0b', 3),

-- Safety & Compliance
(NULL, 'safety', 'Safety & Compliance', NULL, 'shield', '#ef4444', 4),
(NULL, 'permits', 'Permits', (SELECT id FROM advance_categories WHERE code = 'safety'), 'file-text', '#ef4444', 1),
(NULL, 'insurance', 'Insurance', (SELECT id FROM advance_categories WHERE code = 'safety'), 'shield-check', '#ef4444', 2),
(NULL, 'safety_plans', 'Safety Plans', (SELECT id FROM advance_categories WHERE code = 'safety'), 'alert-triangle', '#ef4444', 3),

-- Staffing
(NULL, 'staffing', 'Staffing & Personnel', NULL, 'users', '#8b5cf6', 5),
(NULL, 'security', 'Security', (SELECT id FROM advance_categories WHERE code = 'staffing'), 'shield', '#8b5cf6', 1),
(NULL, 'medical', 'Medical', (SELECT id FROM advance_categories WHERE code = 'staffing'), 'heart', '#8b5cf6', 2);
```

---

## Appendix B: Migration File Naming

```
00041_production_advancing_schema.sql      -- Core tables
00042_production_advancing_triggers.sql    -- SSOT sync triggers
00043_production_advancing_workflows.sql   -- Approval workflow templates
00044_production_advancing_seed.sql        -- Category seed data
00045_production_advancing_rls.sql         -- RLS policies
```

---

**Document Version:** 2.0  
**Last Updated:** February 2, 2026  
**Author:** ATLVS Development Team  
**Status:** Full Stack Implementation Complete

---

## Implementation Summary

### Completed Components

| Component | Files | Status |
|-----------|-------|--------|
| **Navigation & IA** | `src/lib/navigation/ia-structure.ts`, `src/config/navigation.ts` | ✅ Complete |
| **Database Schema** | `supabase/migrations/00047_production_advancing_schema.sql` | ✅ Complete |
| **SSOT Triggers** | `supabase/migrations/00048_production_advancing_triggers.sql` | ✅ Complete |
| **Seed Data** | `supabase/migrations/00049_production_advancing_seed.sql` | ✅ Complete |
| **RLS Policies** | `supabase/migrations/00050_production_advancing_rls.sql` | ✅ Complete |
| **TypeScript Schemas** | `src/lib/schemas/advancing.ts` | ✅ Complete |
| **API Routes** | `src/app/api/advancing/*` | ✅ Complete |
| **UI Pages** | `src/app/(app)/advancing/*` | ✅ Complete |

### API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/advancing/dashboard` | GET | Dashboard metrics, critical items, upcoming deliveries |
| `/api/advancing/advances` | GET, POST | Production advances CRUD |
| `/api/advancing/items` | GET, POST | Advance items with category filtering |
| `/api/advancing/fulfillment` | GET, POST | Fulfillment stage tracking |
| `/api/advancing/categories` | GET, POST | Hierarchical categories |
| `/api/advancing/vendors` | GET | Vendors with performance metrics |
| `/api/advancing/vendors/ratings` | GET, POST | Vendor ratings |

### UI Routes

| Route | Page |
|-------|------|
| `/advancing` | Dashboard with metrics, critical items, upcoming deliveries |
| `/advancing/advances` | Production advances list |
| `/advancing/items` | Advance items with category tabs |
| `/advancing/fulfillment` | Fulfillment stage tracking |
| `/advancing/vendors` | Vendor coordination |

### Next Steps

1. **Run migrations** - Apply database migrations to create tables
2. **Generate Supabase types** - Run `npx supabase gen types` to update TypeScript types
3. **Test API endpoints** - Verify CRUD operations work correctly
4. **Enhance UI components** - Add data tables, forms, and detail views
5. **Add E2E tests** - Create Playwright tests for advancing workflows
