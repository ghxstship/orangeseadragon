-- ============================================================================
-- PEOPLE DIRECTORY AS SSOT - TRIGGER-BASED SYNC
-- ============================================================================
-- 
-- This migration establishes people_directory as the Single Source of Truth
-- for all person/contact references across the platform. Source entities 
-- (users, contacts, talent_profiles) automatically sync to people_directory
-- via database triggers.
--
-- ARCHITECTURE:
-- - Source entities own business data
-- - people_directory owns the unified people index
-- - Triggers maintain sync on INSERT/UPDATE/DELETE
-- - RLS policies enforce RBAC at database level
--
-- ============================================================================

-- ============================================================================
-- CREATE PEOPLE DIRECTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS people_directory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Person classification
    person_type VARCHAR(50) NOT NULL,     -- 'user', 'contact', 'talent', 'vendor_contact'
    
    -- Source entity reference
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Name fields
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),            -- Preferred display name
    
    -- Contact info
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Professional info
    job_title VARCHAR(100),
    department VARCHAR(100),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    company_name VARCHAR(255),
    
    -- Profile
    avatar_url TEXT,
    bio TEXT,
    
    -- Social/web
    linkedin_url VARCHAR(255),
    twitter_handle VARCHAR(100),
    website_url TEXT,
    
    -- Classification
    is_internal BOOLEAN DEFAULT FALSE,    -- Internal user vs external contact
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Tags for filtering
    tags TEXT[],
    
    -- Access control
    visibility visibility_type DEFAULT 'team',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Upsert key
    external_id VARCHAR(100) UNIQUE
);

-- Indexes for common queries
CREATE INDEX idx_people_directory_organization ON people_directory(organization_id);
CREATE INDEX idx_people_directory_type ON people_directory(person_type);
CREATE INDEX idx_people_directory_entity ON people_directory(entity_type, entity_id);
CREATE INDEX idx_people_directory_email ON people_directory(email) WHERE email IS NOT NULL;
CREATE INDEX idx_people_directory_name ON people_directory(full_name);
CREATE INDEX idx_people_directory_company ON people_directory(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_people_directory_internal ON people_directory(is_internal);
CREATE INDEX idx_people_directory_tags ON people_directory USING GIN(tags);
CREATE INDEX idx_people_directory_search ON people_directory USING GIN(
    to_tsvector('english', full_name || ' ' || COALESCE(email, '') || ' ' || COALESCE(company_name, ''))
);

-- ============================================================================
-- HELPER FUNCTION: Upsert people directory entry
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_people_directory(
    p_organization_id UUID,
    p_person_type VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_first_name VARCHAR(100) DEFAULT NULL,
    p_last_name VARCHAR(100) DEFAULT NULL,
    p_full_name VARCHAR(255) DEFAULT NULL,
    p_display_name VARCHAR(255) DEFAULT NULL,
    p_email VARCHAR(255) DEFAULT NULL,
    p_phone VARCHAR(50) DEFAULT NULL,
    p_mobile VARCHAR(50) DEFAULT NULL,
    p_job_title VARCHAR(100) DEFAULT NULL,
    p_department VARCHAR(100) DEFAULT NULL,
    p_company_id UUID DEFAULT NULL,
    p_company_name VARCHAR(255) DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_linkedin_url VARCHAR(255) DEFAULT NULL,
    p_twitter_handle VARCHAR(100) DEFAULT NULL,
    p_website_url TEXT DEFAULT NULL,
    p_is_internal BOOLEAN DEFAULT FALSE,
    p_is_active BOOLEAN DEFAULT TRUE,
    p_tags TEXT[] DEFAULT NULL,
    p_visibility visibility_type DEFAULT 'team',
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_person_id UUID;
    v_external_id VARCHAR(100);
    v_full_name VARCHAR(255);
BEGIN
    -- Create unique key for this person entry
    v_external_id := p_entity_type || ':' || p_entity_id::TEXT;
    
    -- Compute full name if not provided
    v_full_name := COALESCE(
        p_full_name,
        NULLIF(TRIM(COALESCE(p_first_name, '') || ' ' || COALESCE(p_last_name, '')), ''),
        p_display_name,
        'Unknown'
    );
    
    -- Upsert the people directory entry
    INSERT INTO people_directory (
        organization_id,
        person_type,
        entity_type,
        entity_id,
        first_name,
        last_name,
        full_name,
        display_name,
        email,
        phone,
        mobile,
        job_title,
        department,
        company_id,
        company_name,
        avatar_url,
        bio,
        linkedin_url,
        twitter_handle,
        website_url,
        is_internal,
        is_active,
        tags,
        visibility,
        metadata,
        external_id,
        created_at,
        updated_at
    ) VALUES (
        p_organization_id,
        p_person_type,
        p_entity_type,
        p_entity_id,
        p_first_name,
        p_last_name,
        v_full_name,
        COALESCE(p_display_name, v_full_name),
        p_email,
        p_phone,
        p_mobile,
        p_job_title,
        p_department,
        p_company_id,
        p_company_name,
        p_avatar_url,
        p_bio,
        p_linkedin_url,
        p_twitter_handle,
        p_website_url,
        p_is_internal,
        p_is_active,
        p_tags,
        p_visibility,
        p_metadata,
        v_external_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (external_id) 
    DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        mobile = EXCLUDED.mobile,
        job_title = EXCLUDED.job_title,
        department = EXCLUDED.department,
        company_id = EXCLUDED.company_id,
        company_name = EXCLUDED.company_name,
        avatar_url = EXCLUDED.avatar_url,
        bio = EXCLUDED.bio,
        linkedin_url = EXCLUDED.linkedin_url,
        twitter_handle = EXCLUDED.twitter_handle,
        website_url = EXCLUDED.website_url,
        is_internal = EXCLUDED.is_internal,
        is_active = EXCLUDED.is_active,
        tags = EXCLUDED.tags,
        visibility = EXCLUDED.visibility,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id INTO v_person_id;
    
    RETURN v_person_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Delete people directory entries for entity
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_people_directory_for_entity(
    p_entity_type VARCHAR(50),
    p_entity_id UUID
) RETURNS VOID AS $$
BEGIN
    DELETE FROM people_directory 
    WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Organization Members → people_directory
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_org_member_to_directory() RETURNS TRIGGER AS $$
DECLARE
    v_user_record RECORD;
    v_dept_name VARCHAR(255);
    v_position_title VARCHAR(255);
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM people_directory 
        WHERE entity_type = 'user' 
        AND entity_id = OLD.user_id
        AND organization_id = OLD.organization_id;
        RETURN OLD;
    END IF;
    
    -- Skip non-active members
    IF NEW.status NOT IN ('active', 'invited') THEN
        DELETE FROM people_directory 
        WHERE entity_type = 'user' 
        AND entity_id = NEW.user_id
        AND organization_id = NEW.organization_id;
        RETURN NEW;
    END IF;
    
    -- Get user details
    SELECT * INTO v_user_record FROM users WHERE id = NEW.user_id;
    
    IF v_user_record IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Get department name
    SELECT name INTO v_dept_name FROM departments WHERE id = NEW.department_id;
    
    -- Get position title
    SELECT name INTO v_position_title FROM positions WHERE id = NEW.position_id;
    
    -- Use org-specific external_id
    INSERT INTO people_directory (
        organization_id,
        person_type,
        entity_type,
        entity_id,
        full_name,
        display_name,
        email,
        phone,
        job_title,
        department,
        avatar_url,
        is_internal,
        is_active,
        visibility,
        external_id,
        created_at,
        updated_at
    ) VALUES (
        NEW.organization_id,
        'user',
        'user',
        NEW.user_id,
        v_user_record.full_name,
        v_user_record.full_name,
        v_user_record.email,
        v_user_record.phone,
        v_position_title,
        v_dept_name,
        v_user_record.avatar_url,
        TRUE,
        COALESCE(v_user_record.is_active, TRUE) AND NEW.status = 'active',
        'organization',
        'user:' || NEW.organization_id::TEXT || ':' || NEW.user_id::TEXT,
        NOW(),
        NOW()
    )
    ON CONFLICT (external_id) 
    DO UPDATE SET
        full_name = EXCLUDED.full_name,
        display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        job_title = EXCLUDED.job_title,
        department = EXCLUDED.department,
        avatar_url = EXCLUDED.avatar_url,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_org_member_to_directory ON organization_members;
CREATE TRIGGER trg_sync_org_member_to_directory
    AFTER INSERT OR UPDATE OR DELETE ON organization_members
    FOR EACH ROW EXECUTE FUNCTION sync_org_member_to_directory();

-- ============================================================================
-- TRIGGER: Contacts → people_directory
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_contact_to_directory() RETURNS TRIGGER AS $$
DECLARE
    v_company_name VARCHAR(255);
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_people_directory_for_entity('contact', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip inactive contacts
    IF NEW.is_active = FALSE THEN
        PERFORM delete_people_directory_for_entity('contact', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Get company name
    SELECT name INTO v_company_name FROM companies WHERE id = NEW.company_id;
    
    PERFORM upsert_people_directory(
        p_organization_id := NEW.organization_id,
        p_person_type := 'contact',
        p_entity_type := 'contact',
        p_entity_id := NEW.id,
        p_first_name := NEW.first_name,
        p_last_name := NEW.last_name,
        p_full_name := NEW.full_name,
        p_email := NEW.email,
        p_phone := NEW.phone,
        p_mobile := NEW.mobile,
        p_job_title := NEW.job_title,
        p_department := NEW.department,
        p_company_id := NEW.company_id,
        p_company_name := v_company_name,
        p_avatar_url := NEW.avatar_url,
        p_linkedin_url := NEW.linkedin_url,
        p_twitter_handle := NEW.twitter_handle,
        p_is_internal := FALSE,
        p_is_active := NEW.is_active,
        p_tags := NEW.tags,
        p_visibility := 'team'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_contact_to_directory ON contacts;
CREATE TRIGGER trg_sync_contact_to_directory
    AFTER INSERT OR UPDATE OR DELETE ON contacts
    FOR EACH ROW EXECUTE FUNCTION sync_contact_to_directory();

-- ============================================================================
-- TRIGGER: Talent Profiles → people_directory
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_talent_to_directory() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_people_directory_for_entity('talent', OLD.id);
        RETURN OLD;
    END IF;
    
    PERFORM upsert_people_directory(
        p_organization_id := NEW.organization_id,
        p_person_type := 'talent',
        p_entity_type := 'talent',
        p_entity_id := NEW.id,
        p_full_name := NEW.name,
        p_display_name := NEW.name,
        p_email := NEW.email,
        p_phone := NEW.phone,
        p_bio := NEW.bio,
        p_website_url := NEW.website,
        p_is_internal := FALSE,
        p_is_active := TRUE,
        p_visibility := 'team',
        p_metadata := jsonb_build_object(
            'talent_type', NEW.talent_type,
            'genre', NEW.genre,
            'hometown', NEW.hometown,
            'based_in', NEW.based_in,
            'booking_fee_min', NEW.booking_fee_min,
            'booking_fee_max', NEW.booking_fee_max
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_talent_to_directory ON talent_profiles;
CREATE TRIGGER trg_sync_talent_to_directory
    AFTER INSERT OR UPDATE OR DELETE ON talent_profiles
    FOR EACH ROW EXECUTE FUNCTION sync_talent_to_directory();

-- ============================================================================
-- RLS POLICIES FOR PEOPLE_DIRECTORY
-- ============================================================================

-- Enable RLS
ALTER TABLE people_directory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS people_directory_select_policy ON people_directory;
DROP POLICY IF EXISTS people_directory_insert_policy ON people_directory;
DROP POLICY IF EXISTS people_directory_update_policy ON people_directory;
DROP POLICY IF EXISTS people_directory_delete_policy ON people_directory;

-- SELECT: Users can see people based on organization membership
CREATE POLICY people_directory_select_policy ON people_directory
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND (
        visibility = 'public'
        OR visibility = 'organization'
        OR visibility = 'team'
    )
);

-- INSERT: System/triggers can insert
CREATE POLICY people_directory_insert_policy ON people_directory
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
);

-- UPDATE: Limited to system
CREATE POLICY people_directory_update_policy ON people_directory
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
);

-- DELETE: Limited to system
CREATE POLICY people_directory_delete_policy ON people_directory
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- BACKFILL: Sync existing organization members
-- ============================================================================

INSERT INTO people_directory (
    organization_id, person_type, entity_type, entity_id,
    full_name, display_name, email, phone, job_title, department,
    avatar_url, is_internal, is_active, visibility,
    external_id, created_at, updated_at
)
SELECT 
    om.organization_id,
    'user',
    'user',
    om.user_id,
    u.full_name,
    u.full_name,
    u.email,
    u.phone,
    p.name,
    d.name,
    u.avatar_url,
    TRUE,
    COALESCE(u.is_active, TRUE) AND om.status = 'active',
    'organization',
    'user:' || om.organization_id::TEXT || ':' || om.user_id::TEXT,
    NOW(),
    NOW()
FROM organization_members om
JOIN users u ON u.id = om.user_id
LEFT JOIN departments d ON d.id = om.department_id
LEFT JOIN positions p ON p.id = om.position_id
WHERE om.status IN ('active', 'invited')
ON CONFLICT (external_id) DO NOTHING;

-- Backfill contacts
INSERT INTO people_directory (
    organization_id, person_type, entity_type, entity_id,
    first_name, last_name, full_name, display_name,
    email, phone, mobile, job_title, department,
    company_id, company_name, avatar_url,
    linkedin_url, twitter_handle,
    is_internal, is_active, tags, visibility,
    external_id, created_at, updated_at
)
SELECT 
    c.organization_id,
    'contact',
    'contact',
    c.id,
    c.first_name,
    c.last_name,
    c.full_name,
    c.full_name,
    c.email,
    c.phone,
    c.mobile,
    c.job_title,
    c.department,
    c.company_id,
    co.name,
    c.avatar_url,
    c.linkedin_url,
    c.twitter_handle,
    FALSE,
    c.is_active,
    c.tags,
    'team',
    'contact:' || c.id::TEXT,
    NOW(),
    NOW()
FROM contacts c
LEFT JOIN companies co ON co.id = c.company_id
WHERE c.is_active = TRUE
ON CONFLICT (external_id) DO NOTHING;

-- Backfill talent profiles
INSERT INTO people_directory (
    organization_id, person_type, entity_type, entity_id,
    full_name, display_name, email, phone, bio, website_url,
    is_internal, is_active, visibility, metadata,
    external_id, created_at, updated_at
)
SELECT 
    tp.organization_id,
    'talent',
    'talent',
    tp.id,
    tp.name,
    tp.name,
    tp.email,
    tp.phone,
    tp.bio,
    tp.website,
    FALSE,
    TRUE,
    'team',
    jsonb_build_object('talent_type', tp.talent_type, 'genres', tp.genres),
    'talent:' || tp.id::TEXT,
    NOW(),
    NOW()
FROM talent_profiles tp
ON CONFLICT (external_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE people_directory IS 'SSOT for all person/contact references. Source entities sync here via triggers.';
COMMENT ON COLUMN people_directory.person_type IS 'Type of person (user, contact, talent, vendor_contact)';
COMMENT ON COLUMN people_directory.entity_type IS 'Source entity type';
COMMENT ON COLUMN people_directory.entity_id IS 'Foreign key to source entity';
COMMENT ON COLUMN people_directory.is_internal IS 'True for internal users, false for external contacts';
COMMENT ON COLUMN people_directory.external_id IS 'Unique key for upsert: entity_type:entity_id';
