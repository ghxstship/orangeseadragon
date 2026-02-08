-- ATLVS Duplicate Detection
-- Contact and Company Duplicate Detection and Merge
-- Migration: 00045

-- ============================================================================
-- DUPLICATE CANDIDATES (Potential duplicates detected)
-- ============================================================================

CREATE TABLE IF NOT EXISTS duplicate_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Entity info
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('contact', 'company')),
    entity_id_1 UUID NOT NULL,
    entity_id_2 UUID NOT NULL,
    
    -- Matching details
    confidence_score DECIMAL(5, 2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    match_reasons JSONB DEFAULT '[]', -- Array of { field, reason, score }
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'dismissed', 'merged')),
    
    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_action VARCHAR(20), -- merge, dismiss, keep_both
    merged_into_id UUID, -- The surviving record after merge
    
    -- Detection metadata
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    detection_source VARCHAR(20) DEFAULT 'automatic' CHECK (detection_source IN ('automatic', 'import', 'manual')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure we don't create duplicate duplicate records
    UNIQUE(organization_id, entity_type, entity_id_1, entity_id_2)
);

CREATE INDEX idx_duplicate_candidates_organization ON duplicate_candidates(organization_id);
CREATE INDEX idx_duplicate_candidates_entity ON duplicate_candidates(entity_type, entity_id_1);
CREATE INDEX idx_duplicate_candidates_status ON duplicate_candidates(status);
CREATE INDEX idx_duplicate_candidates_pending ON duplicate_candidates(organization_id, status) 
    WHERE status = 'pending';

-- ============================================================================
-- MERGE AUDIT LOG (Track what was merged)
-- ============================================================================

CREATE TABLE IF NOT EXISTS merge_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Merge details
    entity_type VARCHAR(20) NOT NULL,
    surviving_id UUID NOT NULL,
    merged_id UUID NOT NULL,
    
    -- Data snapshots
    surviving_data_before JSONB NOT NULL,
    merged_data_before JSONB NOT NULL,
    surviving_data_after JSONB NOT NULL,
    
    -- Field-level merge decisions
    field_decisions JSONB DEFAULT '{}', -- { field: 'kept_surviving' | 'used_merged' | 'combined' }
    
    -- Metadata
    merged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    merged_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Undo support
    can_undo BOOLEAN DEFAULT TRUE,
    undo_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX idx_merge_audit_organization ON merge_audit_log(organization_id);
CREATE INDEX idx_merge_audit_entity ON merge_audit_log(entity_type, surviving_id);

-- ============================================================================
-- FUNCTION: Find duplicate contacts
-- ============================================================================

CREATE OR REPLACE FUNCTION find_duplicate_contacts(
    p_organization_id UUID,
    p_min_confidence DECIMAL DEFAULT 70
) RETURNS TABLE (
    contact_id_1 UUID,
    contact_id_2 UUID,
    confidence_score DECIMAL,
    match_reasons JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH contact_pairs AS (
        SELECT 
            c1.id as id1,
            c2.id as id2,
            c1.email as email1,
            c2.email as email2,
            c1.first_name as fn1,
            c2.first_name as fn2,
            c1.last_name as ln1,
            c2.last_name as ln2,
            c1.phone as phone1,
            c2.phone as phone2,
            c1.company_id as company1,
            c2.company_id as company2
        FROM contacts c1
        JOIN contacts c2 ON c1.organization_id = c2.organization_id 
            AND c1.id < c2.id -- Avoid duplicates and self-matches
        WHERE c1.organization_id = p_organization_id
    ),
    scored_pairs AS (
        SELECT 
            id1,
            id2,
            -- Calculate confidence score
            (
                -- Exact email match: 50 points
                CASE WHEN LOWER(email1) = LOWER(email2) AND email1 IS NOT NULL THEN 50 ELSE 0 END +
                -- Same name: 30 points
                CASE WHEN LOWER(fn1) = LOWER(fn2) AND LOWER(ln1) = LOWER(ln2) 
                     AND fn1 IS NOT NULL AND ln1 IS NOT NULL THEN 30 ELSE 0 END +
                -- Similar name (fuzzy): 15 points
                CASE WHEN fn1 IS NOT NULL AND ln1 IS NOT NULL 
                     AND (LOWER(fn1) = LOWER(fn2) OR LOWER(ln1) = LOWER(ln2)) THEN 15 ELSE 0 END +
                -- Same phone: 20 points
                CASE WHEN REGEXP_REPLACE(phone1, '[^0-9]', '', 'g') = REGEXP_REPLACE(phone2, '[^0-9]', '', 'g')
                     AND phone1 IS NOT NULL THEN 20 ELSE 0 END +
                -- Same company: 10 points
                CASE WHEN company1 = company2 AND company1 IS NOT NULL THEN 10 ELSE 0 END
            )::DECIMAL as score,
            -- Build match reasons
            jsonb_build_array(
                CASE WHEN LOWER(email1) = LOWER(email2) AND email1 IS NOT NULL 
                     THEN jsonb_build_object('field', 'email', 'reason', 'exact_match', 'score', 50) END,
                CASE WHEN LOWER(fn1) = LOWER(fn2) AND LOWER(ln1) = LOWER(ln2) AND fn1 IS NOT NULL 
                     THEN jsonb_build_object('field', 'name', 'reason', 'exact_match', 'score', 30) END,
                CASE WHEN REGEXP_REPLACE(phone1, '[^0-9]', '', 'g') = REGEXP_REPLACE(phone2, '[^0-9]', '', 'g') AND phone1 IS NOT NULL 
                     THEN jsonb_build_object('field', 'phone', 'reason', 'exact_match', 'score', 20) END,
                CASE WHEN company1 = company2 AND company1 IS NOT NULL 
                     THEN jsonb_build_object('field', 'company', 'reason', 'same_company', 'score', 10) END
            ) - 'null' as reasons
        FROM contact_pairs
    )
    SELECT id1, id2, score, reasons
    FROM scored_pairs
    WHERE score >= p_min_confidence
    ORDER BY score DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Find duplicate companies
-- ============================================================================

CREATE OR REPLACE FUNCTION find_duplicate_companies(
    p_organization_id UUID,
    p_min_confidence DECIMAL DEFAULT 70
) RETURNS TABLE (
    company_id_1 UUID,
    company_id_2 UUID,
    confidence_score DECIMAL,
    match_reasons JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH company_pairs AS (
        SELECT 
            c1.id as id1,
            c2.id as id2,
            c1.name as name1,
            c2.name as name2,
            c1.website as website1,
            c2.website as website2,
            c1.email as email1,
            c2.email as email2,
            c1.phone as phone1,
            c2.phone as phone2,
            c1.tax_id as tax1,
            c2.tax_id as tax2
        FROM companies c1
        JOIN companies c2 ON c1.organization_id = c2.organization_id 
            AND c1.id < c2.id
        WHERE c1.organization_id = p_organization_id
    ),
    scored_pairs AS (
        SELECT 
            id1,
            id2,
            (
                -- Exact name match: 40 points
                CASE WHEN LOWER(TRIM(name1)) = LOWER(TRIM(name2)) THEN 40 ELSE 0 END +
                -- Same domain: 35 points
                CASE WHEN website1 IS NOT NULL AND website2 IS NOT NULL
                     AND LOWER(REGEXP_REPLACE(website1, '^https?://(www\.)?', '')) = 
                         LOWER(REGEXP_REPLACE(website2, '^https?://(www\.)?', ''))
                     THEN 35 ELSE 0 END +
                -- Same email domain: 25 points
                CASE WHEN email1 IS NOT NULL AND email2 IS NOT NULL
                     AND SPLIT_PART(LOWER(email1), '@', 2) = SPLIT_PART(LOWER(email2), '@', 2)
                     THEN 25 ELSE 0 END +
                -- Same phone: 20 points
                CASE WHEN REGEXP_REPLACE(phone1, '[^0-9]', '', 'g') = REGEXP_REPLACE(phone2, '[^0-9]', '', 'g')
                     AND phone1 IS NOT NULL THEN 20 ELSE 0 END +
                -- Same tax ID: 50 points (very strong signal)
                CASE WHEN tax1 = tax2 AND tax1 IS NOT NULL THEN 50 ELSE 0 END
            )::DECIMAL as score,
            jsonb_build_array(
                CASE WHEN LOWER(TRIM(name1)) = LOWER(TRIM(name2)) 
                     THEN jsonb_build_object('field', 'name', 'reason', 'exact_match', 'score', 40) END,
                CASE WHEN website1 IS NOT NULL AND website2 IS NOT NULL
                     AND LOWER(REGEXP_REPLACE(website1, '^https?://(www\.)?', '')) = 
                         LOWER(REGEXP_REPLACE(website2, '^https?://(www\.)?', ''))
                     THEN jsonb_build_object('field', 'website', 'reason', 'same_domain', 'score', 35) END,
                CASE WHEN tax1 = tax2 AND tax1 IS NOT NULL 
                     THEN jsonb_build_object('field', 'tax_id', 'reason', 'exact_match', 'score', 50) END
            ) - 'null' as reasons
        FROM company_pairs
    )
    SELECT id1, id2, score, reasons
    FROM scored_pairs
    WHERE score >= p_min_confidence
    ORDER BY score DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Merge contacts
-- ============================================================================

CREATE OR REPLACE FUNCTION merge_contacts(
    p_surviving_id UUID,
    p_merged_id UUID,
    p_field_decisions JSONB DEFAULT '{}',
    p_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_surviving RECORD;
    v_merged RECORD;
    v_audit_id UUID;
    v_org_id UUID;
BEGIN
    -- Get both records
    SELECT * INTO v_surviving FROM contacts WHERE id = p_surviving_id;
    SELECT * INTO v_merged FROM contacts WHERE id = p_merged_id;
    
    IF v_surviving IS NULL OR v_merged IS NULL THEN
        RAISE EXCEPTION 'One or both contacts not found';
    END IF;
    
    v_org_id := v_surviving.organization_id;
    
    -- Create audit log
    INSERT INTO merge_audit_log (
        organization_id,
        entity_type,
        surviving_id,
        merged_id,
        surviving_data_before,
        merged_data_before,
        surviving_data_after,
        field_decisions,
        merged_by
    ) VALUES (
        v_org_id,
        'contact',
        p_surviving_id,
        p_merged_id,
        to_jsonb(v_surviving),
        to_jsonb(v_merged),
        '{}'::jsonb, -- Will update after merge
        p_field_decisions,
        p_user_id
    ) RETURNING id INTO v_audit_id;
    
    -- Update surviving record with merged data where appropriate
    UPDATE contacts SET
        phone = COALESCE(phone, v_merged.phone),
        mobile = COALESCE(mobile, v_merged.mobile),
        job_title = COALESCE(job_title, v_merged.job_title),
        department = COALESCE(department, v_merged.department),
        linkedin_url = COALESCE(linkedin_url, v_merged.linkedin_url),
        notes = CASE 
            WHEN notes IS NULL THEN v_merged.notes
            WHEN v_merged.notes IS NULL THEN notes
            ELSE notes || E'\n\n--- Merged from duplicate ---\n' || v_merged.notes
        END,
        tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || COALESCE(v_merged.tags, '{}'))),
        updated_at = NOW()
    WHERE id = p_surviving_id;
    
    -- Reassign related records
    UPDATE activities SET contact_id = p_surviving_id WHERE contact_id = p_merged_id;
    UPDATE deals SET contact_id = p_surviving_id WHERE contact_id = p_merged_id;
    UPDATE email_messages SET contact_id = p_surviving_id WHERE contact_id = p_merged_id;
    UPDATE meeting_bookings SET contact_id = p_surviving_id WHERE contact_id = p_merged_id;
    UPDATE proposals SET contact_id = p_surviving_id WHERE contact_id = p_merged_id;
    
    -- Update audit log with final state
    UPDATE merge_audit_log SET
        surviving_data_after = (SELECT to_jsonb(c) FROM contacts c WHERE c.id = p_surviving_id)
    WHERE id = v_audit_id;
    
    -- Soft delete the merged record (or hard delete based on preference)
    UPDATE contacts SET 
        is_active = FALSE,
        notes = COALESCE(notes, '') || E'\n\n[MERGED INTO ' || p_surviving_id::text || ' on ' || NOW()::text || ']'
    WHERE id = p_merged_id;
    
    -- Update duplicate candidate status
    UPDATE duplicate_candidates SET
        status = 'merged',
        resolved_at = NOW(),
        resolved_by = p_user_id,
        resolution_action = 'merge',
        merged_into_id = p_surviving_id
    WHERE (entity_id_1 = p_merged_id OR entity_id_2 = p_merged_id)
      AND entity_type = 'contact'
      AND status = 'pending';
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Merge companies
-- ============================================================================

CREATE OR REPLACE FUNCTION merge_companies(
    p_surviving_id UUID,
    p_merged_id UUID,
    p_field_decisions JSONB DEFAULT '{}',
    p_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_surviving RECORD;
    v_merged RECORD;
    v_audit_id UUID;
    v_org_id UUID;
BEGIN
    SELECT * INTO v_surviving FROM companies WHERE id = p_surviving_id;
    SELECT * INTO v_merged FROM companies WHERE id = p_merged_id;
    
    IF v_surviving IS NULL OR v_merged IS NULL THEN
        RAISE EXCEPTION 'One or both companies not found';
    END IF;
    
    v_org_id := v_surviving.organization_id;
    
    -- Create audit log
    INSERT INTO merge_audit_log (
        organization_id,
        entity_type,
        surviving_id,
        merged_id,
        surviving_data_before,
        merged_data_before,
        surviving_data_after,
        field_decisions,
        merged_by
    ) VALUES (
        v_org_id,
        'company',
        p_surviving_id,
        p_merged_id,
        to_jsonb(v_surviving),
        to_jsonb(v_merged),
        '{}'::jsonb,
        p_field_decisions,
        p_user_id
    ) RETURNING id INTO v_audit_id;
    
    -- Update surviving record
    UPDATE companies SET
        phone = COALESCE(phone, v_merged.phone),
        website = COALESCE(website, v_merged.website),
        industry = COALESCE(industry, v_merged.industry),
        annual_revenue = COALESCE(annual_revenue, v_merged.annual_revenue),
        employee_count = COALESCE(employee_count, v_merged.employee_count),
        description = CASE 
            WHEN description IS NULL THEN v_merged.description
            WHEN v_merged.description IS NULL THEN description
            ELSE description || E'\n\n--- Merged from duplicate ---\n' || v_merged.description
        END,
        tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, '{}') || COALESCE(v_merged.tags, '{}'))),
        updated_at = NOW()
    WHERE id = p_surviving_id;
    
    -- Reassign related records
    UPDATE contacts SET company_id = p_surviving_id WHERE company_id = p_merged_id;
    UPDATE deals SET company_id = p_surviving_id WHERE company_id = p_merged_id;
    UPDATE activities SET company_id = p_surviving_id WHERE company_id = p_merged_id;
    UPDATE email_messages SET company_id = p_surviving_id WHERE company_id = p_merged_id;
    UPDATE meeting_bookings SET company_id = p_surviving_id WHERE company_id = p_merged_id;
    UPDATE proposals SET company_id = p_surviving_id WHERE company_id = p_merged_id;
    
    -- Update audit log
    UPDATE merge_audit_log SET
        surviving_data_after = (SELECT to_jsonb(c) FROM companies c WHERE c.id = p_surviving_id)
    WHERE id = v_audit_id;
    
    -- Soft delete merged company
    UPDATE companies SET 
        is_active = FALSE,
        description = COALESCE(description, '') || E'\n\n[MERGED INTO ' || p_surviving_id::text || ' on ' || NOW()::text || ']'
    WHERE id = p_merged_id;
    
    -- Update duplicate candidate status
    UPDATE duplicate_candidates SET
        status = 'merged',
        resolved_at = NOW(),
        resolved_by = p_user_id,
        resolution_action = 'merge',
        merged_into_id = p_surviving_id
    WHERE (entity_id_1 = p_merged_id OR entity_id_2 = p_merged_id)
      AND entity_type = 'company'
      AND status = 'pending';
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Check for duplicates on contact insert
-- ============================================================================

CREATE OR REPLACE FUNCTION check_contact_duplicates()
RETURNS TRIGGER AS $$
DECLARE
    v_duplicate RECORD;
BEGIN
    -- Find potential duplicates
    FOR v_duplicate IN 
        SELECT * FROM find_duplicate_contacts(NEW.organization_id, 70)
        WHERE contact_id_1 = NEW.id OR contact_id_2 = NEW.id
        LIMIT 5
    LOOP
        -- Insert duplicate candidate if not exists
        INSERT INTO duplicate_candidates (
            organization_id,
            entity_type,
            entity_id_1,
            entity_id_2,
            confidence_score,
            match_reasons,
            detection_source
        ) VALUES (
            NEW.organization_id,
            'contact',
            LEAST(v_duplicate.contact_id_1, v_duplicate.contact_id_2),
            GREATEST(v_duplicate.contact_id_1, v_duplicate.contact_id_2),
            v_duplicate.confidence_score,
            v_duplicate.match_reasons,
            'automatic'
        )
        ON CONFLICT (organization_id, entity_type, entity_id_1, entity_id_2) DO NOTHING;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_contact_duplicates ON contacts;
CREATE TRIGGER trigger_check_contact_duplicates
    AFTER INSERT ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION check_contact_duplicates();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE duplicate_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE merge_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS duplicate_candidates_org_isolation ON duplicate_candidates;
CREATE POLICY duplicate_candidates_org_isolation ON duplicate_candidates
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS merge_audit_org_isolation ON merge_audit_log;
CREATE POLICY merge_audit_org_isolation ON merge_audit_log
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- VIEW: Pending duplicates summary
-- ============================================================================

CREATE OR REPLACE VIEW pending_duplicates_summary AS
SELECT 
    organization_id,
    entity_type,
    COUNT(*) as pending_count,
    AVG(confidence_score) as avg_confidence,
    MAX(detected_at) as latest_detected
FROM duplicate_candidates
WHERE status = 'pending'
GROUP BY organization_id, entity_type;

COMMENT ON VIEW pending_duplicates_summary IS 'Summary of pending duplicate candidates by organization and entity type';
