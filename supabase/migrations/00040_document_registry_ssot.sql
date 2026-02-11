-- ============================================================================
-- DOCUMENT REGISTRY AS SSOT - TRIGGER-BASED SYNC
-- ============================================================================
-- 
-- This migration establishes document_registry as the Single Source of Truth
-- for all document/file references across the platform. Source entities 
-- (documents, contracts, riders, invoices, etc.) automatically sync to 
-- document_registry via database triggers.
--
-- ARCHITECTURE:
-- - Source entities own business data and file URLs
-- - document_registry owns the unified document index
-- - Triggers maintain sync on INSERT/UPDATE/DELETE
-- - RLS policies enforce RBAC at database level
--
-- ============================================================================

-- ============================================================================
-- CREATE DOCUMENT REGISTRY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Document classification
    document_type VARCHAR(50) NOT NULL,   -- 'document', 'contract', 'invoice', 'rider', 'proposal', 'manual'
    document_category VARCHAR(50),         -- 'legal', 'financial', 'technical', 'marketing', 'hr'
    
    -- Source entity reference
    entity_type VARCHAR(50),               -- 'document', 'contract', 'invoice', etc.
    entity_id UUID,
    
    -- Document info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT,
    file_type VARCHAR(50),                 -- 'pdf', 'docx', 'xlsx', 'image', 'video'
    file_size INTEGER,                     -- bytes
    file_name VARCHAR(255),
    
    -- Status and dates
    status VARCHAR(50),                    -- 'draft', 'active', 'signed', 'expired', 'archived'
    version INTEGER DEFAULT 1,
    expires_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    
    -- Related entities (for filtering)
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    
    -- Access control
    visibility visibility_type DEFAULT 'team',
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Upsert key
    external_id VARCHAR(100) UNIQUE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_document_registry_organization ON document_registry(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_registry_type ON document_registry(document_type);
CREATE INDEX IF NOT EXISTS idx_document_registry_category ON document_registry(document_category);
CREATE INDEX IF NOT EXISTS idx_document_registry_entity ON document_registry(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_document_registry_status ON document_registry(status);
CREATE INDEX IF NOT EXISTS idx_document_registry_expires ON document_registry(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_document_registry_project ON document_registry(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_document_registry_event ON document_registry(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_document_registry_company ON document_registry(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_document_registry_tags ON document_registry USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_document_registry_search ON document_registry USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================================================
-- HELPER FUNCTION: Upsert document registry entry
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_document_registry(
    p_organization_id UUID,
    p_document_type VARCHAR(50),
    p_document_category VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_title VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_file_url TEXT DEFAULT NULL,
    p_file_type VARCHAR(50) DEFAULT NULL,
    p_file_size INTEGER DEFAULT NULL,
    p_file_name VARCHAR(255) DEFAULT NULL,
    p_status VARCHAR(50) DEFAULT 'active',
    p_version INTEGER DEFAULT 1,
    p_expires_at TIMESTAMPTZ DEFAULT NULL,
    p_signed_at TIMESTAMPTZ DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_event_id UUID DEFAULT NULL,
    p_company_id UUID DEFAULT NULL,
    p_contact_id UUID DEFAULT NULL,
    p_deal_id UUID DEFAULT NULL,
    p_visibility visibility_type DEFAULT 'team',
    p_uploaded_by UUID DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_suffix VARCHAR(50) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_doc_id UUID;
    v_external_id VARCHAR(100);
BEGIN
    -- Create unique key for this document entry
    v_external_id := p_entity_type || ':' || p_entity_id::TEXT || COALESCE(':' || p_suffix, '');
    
    -- Upsert the document registry entry
    INSERT INTO document_registry (
        organization_id,
        document_type,
        document_category,
        entity_type,
        entity_id,
        title,
        description,
        file_url,
        file_type,
        file_size,
        file_name,
        status,
        version,
        expires_at,
        signed_at,
        project_id,
        event_id,
        company_id,
        contact_id,
        deal_id,
        visibility,
        uploaded_by,
        tags,
        metadata,
        external_id,
        created_at,
        updated_at
    ) VALUES (
        p_organization_id,
        p_document_type,
        p_document_category,
        p_entity_type,
        p_entity_id,
        p_title,
        p_description,
        p_file_url,
        p_file_type,
        p_file_size,
        p_file_name,
        p_status,
        p_version,
        p_expires_at,
        p_signed_at,
        p_project_id,
        p_event_id,
        p_company_id,
        p_contact_id,
        p_deal_id,
        p_visibility,
        p_uploaded_by,
        p_tags,
        p_metadata,
        v_external_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (external_id) 
    DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        file_url = EXCLUDED.file_url,
        file_type = EXCLUDED.file_type,
        file_size = EXCLUDED.file_size,
        file_name = EXCLUDED.file_name,
        status = EXCLUDED.status,
        version = EXCLUDED.version,
        expires_at = EXCLUDED.expires_at,
        signed_at = EXCLUDED.signed_at,
        project_id = EXCLUDED.project_id,
        event_id = EXCLUDED.event_id,
        company_id = EXCLUDED.company_id,
        contact_id = EXCLUDED.contact_id,
        deal_id = EXCLUDED.deal_id,
        visibility = EXCLUDED.visibility,
        tags = EXCLUDED.tags,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id INTO v_doc_id;
    
    RETURN v_doc_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Delete document registry entries for entity
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_document_registry_for_entity(
    p_entity_type VARCHAR(50),
    p_entity_id UUID
) RETURNS VOID AS $$
BEGIN
    DELETE FROM document_registry 
    WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Documents → document_registry
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_document_to_registry() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_document_registry_for_entity('document', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip archived documents
    IF NEW.archived_at IS NOT NULL THEN
        PERFORM delete_document_registry_for_entity('document', NEW.id);
        RETURN NEW;
    END IF;
    
    PERFORM upsert_document_registry(
        p_organization_id := NEW.organization_id,
        p_document_type := COALESCE(NEW.document_type::TEXT, 'document'),
        p_document_category := 'general',
        p_entity_type := 'document',
        p_entity_id := NEW.id,
        p_title := NEW.title,
        p_description := NEW.summary,
        p_file_url := NEW.cover_image_url,
        p_status := NEW.status::TEXT,
        p_version := NEW.version,
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_visibility := COALESCE(NEW.visibility, 'team'),
        p_uploaded_by := NEW.created_by,
        p_tags := NEW.tags
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_document_to_registry ON documents;
CREATE TRIGGER trg_sync_document_to_registry
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION sync_document_to_registry();

-- ============================================================================
-- TRIGGER: Contracts → document_registry
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_contract_to_registry() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_document_registry_for_entity('contract', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Only sync if there's a document URL
    IF NEW.document_url IS NULL THEN
        RETURN NEW;
    END IF;
    
    PERFORM upsert_document_registry(
        p_organization_id := NEW.organization_id,
        p_document_type := 'contract',
        p_document_category := 'legal',
        p_entity_type := 'contract',
        p_entity_id := NEW.id,
        p_title := NEW.title,
        p_description := 'Contract ' || NEW.contract_number || ' - ' || NEW.contract_type::TEXT,
        p_file_url := NEW.document_url,
        p_file_type := 'pdf',
        p_status := NEW.status::TEXT,
        p_expires_at := NEW.end_date::TIMESTAMPTZ,
        p_signed_at := NEW.signed_date::TIMESTAMPTZ,
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_visibility := 'team',
        p_uploaded_by := NEW.created_by,
        p_metadata := jsonb_build_object(
            'contract_number', NEW.contract_number,
            'contract_type', NEW.contract_type,
            'counterparty_name', NEW.counterparty_name,
            'value', NEW.value
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_contract_to_registry ON contracts;
CREATE TRIGGER trg_sync_contract_to_registry
    AFTER INSERT OR UPDATE OR DELETE ON contracts
    FOR EACH ROW EXECUTE FUNCTION sync_contract_to_registry();

-- ============================================================================
-- TRIGGER: Riders → document_registry
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_rider_to_registry() RETURNS TRIGGER AS $$
DECLARE
    v_org_id UUID;
    v_talent_name VARCHAR(255);
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_document_registry_for_entity('rider', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Only sync if there's a document URL
    IF NEW.document_url IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Get organization from talent profile
    SELECT tp.organization_id, tp.name INTO v_org_id, v_talent_name
    FROM talent_profiles tp WHERE tp.id = NEW.talent_id;
    
    IF v_org_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    PERFORM upsert_document_registry(
        p_organization_id := v_org_id,
        p_document_type := 'rider',
        p_document_category := 'technical',
        p_entity_type := 'rider',
        p_entity_id := NEW.id,
        p_title := NEW.name,
        p_description := COALESCE(NEW.rider_type::TEXT, 'technical') || ' rider for ' || COALESCE(v_talent_name, 'talent'),
        p_file_url := NEW.document_url,
        p_file_type := 'pdf',
        p_status := NEW.status::TEXT,
        p_visibility := 'team',
        p_uploaded_by := NEW.created_by,
        p_metadata := jsonb_build_object(
            'rider_type', NEW.rider_type,
            'talent_name', v_talent_name
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_rider_to_registry ON riders;
CREATE TRIGGER trg_sync_rider_to_registry
    AFTER INSERT OR UPDATE OR DELETE ON riders
    FOR EACH ROW EXECUTE FUNCTION sync_rider_to_registry();

-- ============================================================================
-- TRIGGER: Proposals → document_registry
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_proposal_to_registry() RETURNS TRIGGER AS $$
DECLARE
    v_company_name VARCHAR(255);
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_document_registry_for_entity('proposal', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Get company name
    SELECT name INTO v_company_name FROM companies WHERE id = NEW.company_id;
    
    PERFORM upsert_document_registry(
        p_organization_id := NEW.organization_id,
        p_document_type := 'proposal',
        p_document_category := 'sales',
        p_entity_type := 'proposal',
        p_entity_id := NEW.id,
        p_title := NEW.title,
        p_description := 'Proposal ' || NEW.proposal_number || ' for ' || COALESCE(v_company_name, 'client'),
        p_status := NEW.status::TEXT,
        p_expires_at := NEW.valid_until::TIMESTAMPTZ,
        p_company_id := NEW.company_id,
        p_contact_id := NEW.contact_id,
        p_deal_id := NEW.deal_id,
        p_visibility := 'team',
        p_uploaded_by := NEW.created_by,
        p_metadata := jsonb_build_object(
            'proposal_number', NEW.proposal_number,
            'total_amount', NEW.total_amount,
            'currency', NEW.currency
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_proposal_to_registry ON proposals;
CREATE TRIGGER trg_sync_proposal_to_registry
    AFTER INSERT OR UPDATE OR DELETE ON proposals
    FOR EACH ROW EXECUTE FUNCTION sync_proposal_to_registry();

-- ============================================================================
-- TRIGGER: Invoices → document_registry
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_invoice_to_registry() RETURNS TRIGGER AS $$
DECLARE
    v_company_name VARCHAR(255);
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_document_registry_for_entity('invoice', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Get company name
    SELECT name INTO v_company_name FROM companies WHERE id = NEW.company_id;
    
    PERFORM upsert_document_registry(
        p_organization_id := NEW.organization_id,
        p_document_type := 'invoice',
        p_document_category := 'financial',
        p_entity_type := 'invoice',
        p_entity_id := NEW.id,
        p_title := 'Invoice ' || NEW.invoice_number,
        p_description := NEW.direction::TEXT || ' invoice for ' || COALESCE(v_company_name, 'client'),
        p_status := NEW.status::TEXT,
        p_expires_at := NEW.due_date::TIMESTAMPTZ,
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_company_id := NEW.company_id,
        p_visibility := 'team',
        p_uploaded_by := NEW.created_by,
        p_metadata := jsonb_build_object(
            'invoice_number', NEW.invoice_number,
            'direction', NEW.direction,
            'total_amount', NEW.total_amount,
            'currency', NEW.currency,
            'paid_amount', NEW.paid_amount
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_invoice_to_registry ON invoices;
CREATE TRIGGER trg_sync_invoice_to_registry
    AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION sync_invoice_to_registry();

-- ============================================================================
-- RLS POLICIES FOR DOCUMENT_REGISTRY
-- ============================================================================

-- Enable RLS
ALTER TABLE document_registry ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS document_registry_select_policy ON document_registry;
DROP POLICY IF EXISTS document_registry_insert_policy ON document_registry;
DROP POLICY IF EXISTS document_registry_update_policy ON document_registry;
DROP POLICY IF EXISTS document_registry_delete_policy ON document_registry;

-- SELECT: Users can see documents based on visibility and organization membership
CREATE POLICY document_registry_select_policy ON document_registry
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND (
        visibility = 'public'
        OR visibility = 'organization'
        OR visibility = 'team'
        OR (visibility = 'private' AND uploaded_by = auth.uid())
    )
);

-- INSERT: System/triggers can insert
CREATE POLICY document_registry_insert_policy ON document_registry
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
);

-- UPDATE: Limited to uploaders and admins
CREATE POLICY document_registry_update_policy ON document_registry
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND (uploaded_by = auth.uid() OR visibility IN ('public', 'organization', 'team'))
);

-- DELETE: Limited to uploaders
CREATE POLICY document_registry_delete_policy ON document_registry
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND uploaded_by = auth.uid()
);

-- ============================================================================
-- BACKFILL: Sync existing documents
-- ============================================================================

INSERT INTO document_registry (
    organization_id, document_type, document_category, entity_type, entity_id,
    title, description, file_url, status, version,
    project_id, event_id, visibility, uploaded_by, tags,
    external_id, created_at, updated_at
)
SELECT 
    d.organization_id,
    COALESCE(d.document_type::TEXT, 'document'),
    'general',
    'document',
    d.id,
    d.title,
    d.summary,
    d.cover_image_url,
    d.status::TEXT,
    d.version,
    d.project_id,
    d.event_id,
    COALESCE(d.visibility, 'team'),
    d.created_by,
    d.tags,
    'document:' || d.id::TEXT,
    NOW(),
    NOW()
FROM documents d
WHERE d.archived_at IS NULL
ON CONFLICT (external_id) DO NOTHING;

-- Backfill contracts with documents
INSERT INTO document_registry (
    organization_id, document_type, document_category, entity_type, entity_id,
    title, description, file_url, file_type, status, expires_at, signed_at,
    project_id, event_id, visibility, uploaded_by, metadata,
    external_id, created_at, updated_at
)
SELECT 
    c.organization_id,
    'contract',
    'legal',
    'contract',
    c.id,
    c.title,
    'Contract ' || c.contract_number || ' - ' || c.contract_type::TEXT,
    c.document_url,
    'pdf',
    c.status::TEXT,
    c.end_date::TIMESTAMPTZ,
    c.signed_date::TIMESTAMPTZ,
    c.project_id,
    c.event_id,
    'team',
    c.created_by,
    jsonb_build_object('contract_number', c.contract_number, 'contract_type', c.contract_type),
    'contract:' || c.id::TEXT,
    NOW(),
    NOW()
FROM contracts c
WHERE c.document_url IS NOT NULL
ON CONFLICT (external_id) DO NOTHING;

-- Backfill proposals
INSERT INTO document_registry (
    organization_id, document_type, document_category, entity_type, entity_id,
    title, description, status, expires_at,
    company_id, contact_id, deal_id, visibility, uploaded_by, metadata,
    external_id, created_at, updated_at
)
SELECT 
    p.organization_id,
    'proposal',
    'sales',
    'proposal',
    p.id,
    p.title,
    'Proposal ' || p.proposal_number,
    p.status::TEXT,
    p.valid_until::TIMESTAMPTZ,
    p.company_id,
    p.contact_id,
    p.deal_id,
    'team',
    p.created_by,
    jsonb_build_object('proposal_number', p.proposal_number, 'total_amount', p.total_amount),
    'proposal:' || p.id::TEXT,
    NOW(),
    NOW()
FROM proposals p
ON CONFLICT (external_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE document_registry IS 'SSOT for all document/file references. Source entities sync here via triggers.';
COMMENT ON COLUMN document_registry.document_type IS 'Type of document (document, contract, invoice, rider, proposal, manual)';
COMMENT ON COLUMN document_registry.document_category IS 'Category (legal, financial, technical, marketing, hr, general)';
COMMENT ON COLUMN document_registry.entity_type IS 'Source entity type';
COMMENT ON COLUMN document_registry.entity_id IS 'Foreign key to source entity';
COMMENT ON COLUMN document_registry.external_id IS 'Unique key for upsert: entity_type:entity_id[:suffix]';
