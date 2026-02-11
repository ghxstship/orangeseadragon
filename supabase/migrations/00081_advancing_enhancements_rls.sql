-- Migration 00071: RLS Policies for Advancing Enhancements
-- Row Level Security for new tables from migration 00070

-- ============================================================================
-- ASSET TAGS RLS
-- ============================================================================
ALTER TABLE asset_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view asset tags in their organization" ON asset_tags;
CREATE POLICY "Users can view asset tags in their organization"
    ON asset_tags FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create asset tags in their organization" ON asset_tags;
CREATE POLICY "Users can create asset tags in their organization"
    ON asset_tags FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update asset tags in their organization" ON asset_tags;
CREATE POLICY "Users can update asset tags in their organization"
    ON asset_tags FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete asset tags in their organization" ON asset_tags;
CREATE POLICY "Users can delete asset tags in their organization"
    ON asset_tags FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- SCAN EVENTS RLS
-- ============================================================================
ALTER TABLE scan_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view scan events in their organization" ON scan_events;
CREATE POLICY "Users can view scan events in their organization"
    ON scan_events FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create scan events in their organization" ON scan_events;
CREATE POLICY "Users can create scan events in their organization"
    ON scan_events FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- INVENTORY CONFLICTS RLS
-- ============================================================================
ALTER TABLE inventory_conflicts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view conflicts in their organization" ON inventory_conflicts;
CREATE POLICY "Users can view conflicts in their organization"
    ON inventory_conflicts FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create conflicts in their organization" ON inventory_conflicts;
CREATE POLICY "Users can create conflicts in their organization"
    ON inventory_conflicts FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update conflicts in their organization" ON inventory_conflicts;
CREATE POLICY "Users can update conflicts in their organization"
    ON inventory_conflicts FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- ACTIVITY EVENTS RLS
-- ============================================================================
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view activity in their organization" ON activity_events;
CREATE POLICY "Users can view activity in their organization"
    ON activity_events FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create activity in their organization" ON activity_events;
CREATE POLICY "Users can create activity in their organization"
    ON activity_events FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- COMMENTS RLS
-- ============================================================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view comments in their organization" ON comments;
CREATE POLICY "Users can view comments in their organization"
    ON comments FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create comments in their organization" ON comments;
CREATE POLICY "Users can create comments in their organization"
    ON comments FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
        AND author_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    USING (author_id = auth.uid());

-- ============================================================================
-- REMINDERS RLS
-- ============================================================================
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view reminders in their organization" ON reminders;
CREATE POLICY "Users can view reminders in their organization"
    ON reminders FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create reminders in their organization" ON reminders;
CREATE POLICY "Users can create reminders in their organization"
    ON reminders FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
        AND created_by = auth.uid()
    );

DROP POLICY IF EXISTS "Users can update their own reminders" ON reminders;
CREATE POLICY "Users can update their own reminders"
    ON reminders FOR UPDATE
    USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own reminders" ON reminders;
CREATE POLICY "Users can delete their own reminders"
    ON reminders FOR DELETE
    USING (created_by = auth.uid());

-- ============================================================================
-- CREW MEMBERS RLS
-- ============================================================================
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view crew in their organization" ON crew_members;
CREATE POLICY "Users can view crew in their organization"
    ON crew_members FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create crew in their organization" ON crew_members;
CREATE POLICY "Users can create crew in their organization"
    ON crew_members FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update crew in their organization" ON crew_members;
CREATE POLICY "Users can update crew in their organization"
    ON crew_members FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete crew in their organization" ON crew_members;
CREATE POLICY "Users can delete crew in their organization"
    ON crew_members FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- CREW AVAILABILITY RLS
-- ============================================================================
ALTER TABLE crew_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view crew availability in their organization" ON crew_availability;
CREATE POLICY "Users can view crew availability in their organization"
    ON crew_availability FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can manage crew availability in their organization" ON crew_availability;
CREATE POLICY "Users can manage crew availability in their organization"
    ON crew_availability FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- CREW ASSIGNMENTS RLS
-- ============================================================================
ALTER TABLE crew_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view crew assignments in their organization" ON crew_assignments;
CREATE POLICY "Users can view crew assignments in their organization"
    ON crew_assignments FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can manage crew assignments in their organization" ON crew_assignments;
CREATE POLICY "Users can manage crew assignments in their organization"
    ON crew_assignments FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
