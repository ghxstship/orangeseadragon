-- Migration 00067: Global Public Profiles
-- LinkedIn style public-facing profiles as extensions of existing entities (SSOT/3NF)

-- 1. Entity Type Enum
DO $$ BEGIN
    CREATE TYPE public_profile_type AS ENUM (
        'professional', 'business', 'artist', 'agency', 'sponsor', 'investor', 
        'affiliate', 'influencer', 'media', 'event', 'experience'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Public Profiles Table
CREATE TABLE IF NOT EXISTS public_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Routing
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- Source Reference (3NF Extension)
    entity_type public_profile_type NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Profile Content
    is_public BOOLEAN DEFAULT FALSE,
    headline VARCHAR(255),
    summary TEXT,
    detailed_bio TEXT,
    
    -- Rich Metadata (JSONB for flexibility without breaking 3NF for core fields)
    content_blocks JSONB DEFAULT '[]', -- Sections like "Exhibitions", "Projects", "Portfolio"
    social_links JSONB DEFAULT '{}',
    contact_info JSONB DEFAULT '{}',
    stats JSONB DEFAULT '{}', -- public metrics: events_count, followers_count
    
    -- Media
    avatar_url TEXT,
    banner_url TEXT,
    gallery JSONB DEFAULT '[]',
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    
    -- Metrics
    views_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Ensure one public profile per entity per organization (or global)
    UNIQUE(entity_type, entity_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_public_profile_slug ON public_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_public_profile_entity ON public_profiles(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_public_profile_public ON public_profiles(is_public) WHERE is_public = TRUE;

-- 4. RLS for Public Profiles
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Anonymous can read public profiles
CREATE POLICY public_profiles_anon_read ON public_profiles
    FOR SELECT USING (is_public = TRUE AND deleted_at IS NULL);

-- Users can manage their own profiles (if linked to user_id)
-- Note: complex logic for "manage" depends on how we link entities, 
-- but for now allow organization members to manage profiles within their org
CREATE POLICY public_profiles_org_manage ON public_profiles
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    );

-- 5. Updated At Trigger
CREATE TRIGGER trg_public_profiles_updated_at
    BEFORE UPDATE ON public_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Help Text
COMMENT ON TABLE public_profiles IS 'LinkedIn-style public profiles extending existing entities (Professionals, Businesses, Artists, etc)';
COMMENT ON COLUMN public_profiles.slug IS 'SEO-friendly URL identifier, e.g., "john-expert" or "summer-fest-2026"';
COMMENT ON COLUMN public_profiles.entity_id IS 'UUID of record in users, companies, talent, or events tables based on entity_type';
