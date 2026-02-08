-- ATLVS Contact Data Enrichment
-- External API integration for contact and company data enrichment
-- Migration: 00048

-- ============================================================================
-- ENRICHMENT PROVIDERS (API configuration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS enrichment_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Provider info
    provider_name VARCHAR(50) NOT NULL CHECK (provider_name IN ('clearbit', 'apollo', 'zoominfo', 'linkedin', 'hunter', 'custom')),
    display_name VARCHAR(100),
    
    -- API configuration
    api_key TEXT,
    api_endpoint VARCHAR(255),
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    auto_enrich_new_contacts BOOLEAN DEFAULT FALSE,
    auto_enrich_new_companies BOOLEAN DEFAULT FALSE,
    
    -- Rate limiting
    daily_limit INTEGER DEFAULT 100,
    requests_today INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    
    -- Stats
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enrichment_providers_organization ON enrichment_providers(organization_id);
CREATE INDEX idx_enrichment_providers_active ON enrichment_providers(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- ENRICHMENT RESULTS (Cached enrichment data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS enrichment_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Entity reference
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('contact', 'company')),
    entity_id UUID NOT NULL,
    
    -- Provider
    provider_id UUID REFERENCES enrichment_providers(id) ON DELETE SET NULL,
    provider_name VARCHAR(50) NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'partial', 'failed', 'not_found')),
    
    -- Enriched data
    enriched_data JSONB DEFAULT '{}',
    -- Example for contact: {
    --   "job_title": "VP of Sales",
    --   "seniority": "executive",
    --   "department": "sales",
    --   "linkedin_url": "...",
    --   "twitter_handle": "...",
    --   "phone": "...",
    --   "location": { "city": "...", "state": "...", "country": "..." }
    -- }
    
    -- Field mapping (which fields were updated)
    fields_updated JSONB DEFAULT '[]',
    fields_skipped JSONB DEFAULT '[]',
    
    -- Confidence
    confidence_score DECIMAL(5, 2),
    match_type VARCHAR(20), -- exact, fuzzy, inferred
    
    -- Timestamps
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(entity_type, entity_id, provider_name)
);

CREATE INDEX idx_enrichment_results_entity ON enrichment_results(entity_type, entity_id);
CREATE INDEX idx_enrichment_results_status ON enrichment_results(status);
CREATE INDEX idx_enrichment_results_provider ON enrichment_results(provider_id);

-- ============================================================================
-- ENRICHMENT QUEUE (Pending enrichment requests)
-- ============================================================================

CREATE TABLE IF NOT EXISTS enrichment_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Entity
    entity_type VARCHAR(20) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Request details
    provider_id UUID REFERENCES enrichment_providers(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Timing
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Retry
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enrichment_queue_pending ON enrichment_queue(status, scheduled_at) 
    WHERE status = 'pending';
CREATE INDEX idx_enrichment_queue_entity ON enrichment_queue(entity_type, entity_id);

-- ============================================================================
-- Add enrichment fields to contacts
-- ============================================================================

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS enrichment_status VARCHAR(20) DEFAULT 'not_enriched';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS enrichment_source VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS seniority VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(100);

-- ============================================================================
-- Add enrichment fields to companies
-- ============================================================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS enrichment_status VARCHAR(20) DEFAULT 'not_enriched';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS enrichment_source VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS funding_total DECIMAL(14, 2);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS funding_stage VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS technologies JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_profiles JSONB DEFAULT '{}';

-- ============================================================================
-- FUNCTION: Request enrichment
-- ============================================================================

CREATE OR REPLACE FUNCTION request_enrichment(
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_provider_id UUID DEFAULT NULL,
    p_priority INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
    v_org_id UUID;
    v_provider RECORD;
    v_queue_id UUID;
BEGIN
    -- Get organization
    IF p_entity_type = 'contact' THEN
        SELECT organization_id INTO v_org_id FROM contacts WHERE id = p_entity_id;
    ELSIF p_entity_type = 'company' THEN
        SELECT organization_id INTO v_org_id FROM companies WHERE id = p_entity_id;
    ELSE
        RAISE EXCEPTION 'Invalid entity type';
    END IF;
    
    -- Get provider
    IF p_provider_id IS NOT NULL THEN
        SELECT * INTO v_provider FROM enrichment_providers WHERE id = p_provider_id;
    ELSE
        SELECT * INTO v_provider FROM enrichment_providers 
        WHERE organization_id = v_org_id AND is_active = TRUE
        ORDER BY provider_name
        LIMIT 1;
    END IF;
    
    IF v_provider IS NULL THEN
        RAISE EXCEPTION 'No active enrichment provider found';
    END IF;
    
    -- Check rate limit
    IF v_provider.last_reset_date < CURRENT_DATE THEN
        UPDATE enrichment_providers SET
            requests_today = 0,
            last_reset_date = CURRENT_DATE
        WHERE id = v_provider.id;
    ELSIF v_provider.requests_today >= v_provider.daily_limit THEN
        RAISE EXCEPTION 'Daily enrichment limit reached';
    END IF;
    
    -- Add to queue
    INSERT INTO enrichment_queue (
        organization_id,
        entity_type,
        entity_id,
        provider_id,
        priority
    ) VALUES (
        v_org_id,
        p_entity_type,
        p_entity_id,
        v_provider.id,
        p_priority
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_queue_id;
    
    RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Apply enrichment to contact
-- ============================================================================

CREATE OR REPLACE FUNCTION apply_contact_enrichment(
    p_contact_id UUID,
    p_enriched_data JSONB,
    p_provider_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_fields_updated JSONB := '[]';
BEGIN
    -- Update contact with enriched data (only if field is empty)
    UPDATE contacts SET
        job_title = COALESCE(job_title, p_enriched_data->>'job_title'),
        department = COALESCE(department, p_enriched_data->>'department'),
        phone = COALESCE(phone, p_enriched_data->>'phone'),
        mobile = COALESCE(mobile, p_enriched_data->>'mobile'),
        linkedin_url = COALESCE(linkedin_url, p_enriched_data->>'linkedin_url'),
        twitter_handle = COALESCE(twitter_handle, p_enriched_data->>'twitter_handle'),
        seniority = COALESCE(seniority, p_enriched_data->>'seniority'),
        enrichment_status = 'enriched',
        enriched_at = NOW(),
        enrichment_source = p_provider_name,
        updated_at = NOW()
    WHERE id = p_contact_id;
    
    -- Track which fields were updated
    SELECT jsonb_agg(field) INTO v_fields_updated
    FROM (
        SELECT unnest(ARRAY['job_title', 'department', 'phone', 'linkedin_url', 'seniority']) as field
    ) f
    WHERE p_enriched_data->>f.field IS NOT NULL;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Apply enrichment to company
-- ============================================================================

CREATE OR REPLACE FUNCTION apply_company_enrichment(
    p_company_id UUID,
    p_enriched_data JSONB,
    p_provider_name VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE companies SET
        industry = COALESCE(industry, p_enriched_data->>'industry'),
        employee_count = COALESCE(employee_count, (p_enriched_data->>'employee_count')::INTEGER),
        annual_revenue = COALESCE(annual_revenue, (p_enriched_data->>'annual_revenue')::DECIMAL),
        website = COALESCE(website, p_enriched_data->>'website'),
        description = COALESCE(description, p_enriched_data->>'description'),
        founded_year = COALESCE(founded_year, (p_enriched_data->>'founded_year')::INTEGER),
        funding_total = COALESCE(funding_total, (p_enriched_data->>'funding_total')::DECIMAL),
        funding_stage = COALESCE(funding_stage, p_enriched_data->>'funding_stage'),
        technologies = COALESCE(technologies, p_enriched_data->'technologies'),
        social_profiles = COALESCE(social_profiles, p_enriched_data->'social_profiles'),
        enrichment_status = 'enriched',
        enriched_at = NOW(),
        enrichment_source = p_provider_name,
        updated_at = NOW()
    WHERE id = p_company_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Auto-enrich new contacts
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_auto_enrich_contact()
RETURNS TRIGGER AS $$
DECLARE
    v_provider RECORD;
BEGIN
    -- Check if auto-enrich is enabled
    SELECT * INTO v_provider FROM enrichment_providers 
    WHERE organization_id = NEW.organization_id 
      AND is_active = TRUE 
      AND auto_enrich_new_contacts = TRUE
    LIMIT 1;
    
    IF v_provider IS NOT NULL THEN
        PERFORM request_enrichment('contact', NEW.id, v_provider.id, 0);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_enrich_contact ON contacts;
CREATE TRIGGER trigger_auto_enrich_contact
    AFTER INSERT ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_enrich_contact();

-- ============================================================================
-- VIEW: Enrichment stats
-- ============================================================================

CREATE OR REPLACE VIEW enrichment_stats AS
SELECT 
    organization_id,
    entity_type,
    COUNT(*) as total_entities,
    COUNT(*) FILTER (WHERE status = 'success') as enriched_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'success')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
        1
    ) as enrichment_rate
FROM enrichment_results
GROUP BY organization_id, entity_type;

COMMENT ON VIEW enrichment_stats IS 'Enrichment statistics by organization and entity type';

-- ============================================================================
-- VIEW: Contacts needing enrichment
-- ============================================================================

CREATE OR REPLACE VIEW contacts_needing_enrichment AS
SELECT 
    c.*,
    CASE 
        WHEN c.email IS NULL THEN 0
        WHEN c.job_title IS NULL THEN 1
        WHEN c.phone IS NULL THEN 2
        ELSE 3
    END as enrichment_priority
FROM contacts c
WHERE c.enrichment_status = 'not_enriched'
  AND c.email IS NOT NULL
ORDER BY enrichment_priority, c.created_at DESC;

COMMENT ON VIEW contacts_needing_enrichment IS 'Contacts that have not been enriched yet';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE enrichment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS enrichment_providers_org_isolation ON enrichment_providers;
CREATE POLICY enrichment_providers_org_isolation ON enrichment_providers
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS enrichment_results_org_isolation ON enrichment_results;
CREATE POLICY enrichment_results_org_isolation ON enrichment_results
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS enrichment_queue_org_isolation ON enrichment_queue;
CREATE POLICY enrichment_queue_org_isolation ON enrichment_queue
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));
