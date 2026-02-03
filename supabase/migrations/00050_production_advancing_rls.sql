-- Migration: Production Advancing RLS Policies
-- Phase 5: Row Level Security for advancing tables
-- See: docs/PRODUCTION_ADVANCING_INTEGRATION_PLAN.md

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE advance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_item_fulfillment ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_ratings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ADVANCE CATEGORIES POLICIES
-- System categories (org_id = NULL) visible to all, org-specific to members
-- ============================================================================

CREATE POLICY advance_categories_select ON advance_categories
    FOR SELECT USING (
        organization_id IS NULL  -- System-wide categories
        OR organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY advance_categories_insert ON advance_categories
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY advance_categories_update ON advance_categories
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY advance_categories_delete ON advance_categories
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- PRODUCTION ADVANCES POLICIES
-- ============================================================================

CREATE POLICY production_advances_select ON production_advances
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY production_advances_insert ON production_advances
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY production_advances_update ON production_advances
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY production_advances_delete ON production_advances
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- ADVANCE ITEMS POLICIES
-- ============================================================================

CREATE POLICY advance_items_select ON advance_items
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY advance_items_insert ON advance_items
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY advance_items_update ON advance_items
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY advance_items_delete ON advance_items
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- ADVANCE ITEM FULFILLMENT POLICIES
-- ============================================================================

CREATE POLICY advance_item_fulfillment_select ON advance_item_fulfillment
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY advance_item_fulfillment_insert ON advance_item_fulfillment
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY advance_item_fulfillment_update ON advance_item_fulfillment
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY advance_item_fulfillment_delete ON advance_item_fulfillment
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- VENDOR RATINGS POLICIES
-- ============================================================================

CREATE POLICY vendor_ratings_select ON vendor_ratings
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY vendor_ratings_insert ON vendor_ratings
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY vendor_ratings_update ON vendor_ratings
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
        AND rated_by = auth.uid()  -- Only rater can update their rating
    );

CREATE POLICY vendor_ratings_delete ON vendor_ratings
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
        AND rated_by = auth.uid()  -- Only rater can delete their rating
    );

-- ============================================================================
-- SERVICE ROLE BYPASS (for triggers and background jobs)
-- ============================================================================

CREATE POLICY advance_categories_service ON advance_categories
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY production_advances_service ON production_advances
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY advance_items_service ON advance_items
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY advance_item_fulfillment_service ON advance_item_fulfillment
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY vendor_ratings_service ON vendor_ratings
    FOR ALL USING (auth.role() = 'service_role');
