-- Migration 00068: Public Profile Enhancements
-- Implements competitive analysis recommendations: SEO, Links, Analytics, Leads, Themes

-- ============================================================================
-- 1. SEO META CUSTOMIZATION (Priority 1)
-- ============================================================================
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS seo_title VARCHAR(70);
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS seo_description VARCHAR(160);
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS og_image_url TEXT;

COMMENT ON COLUMN public_profiles.seo_title IS 'Custom meta title for search engines (max 70 chars)';
COMMENT ON COLUMN public_profiles.seo_description IS 'Custom meta description for search engines (max 160 chars)';
COMMENT ON COLUMN public_profiles.og_image_url IS 'Custom Open Graph image URL for social sharing';

-- ============================================================================
-- 2. CUSTOM LINK BLOCKS (Priority 2)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profile_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public_profiles(id) ON DELETE CASCADE,
    
    title VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    icon VARCHAR(50), -- lucide icon name or emoji
    description VARCHAR(255),
    
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    
    click_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_profile_links_profile ON profile_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_links_order ON profile_links(profile_id, display_order);

ALTER TABLE profile_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY profile_links_public_read ON profile_links
    FOR SELECT USING (
        deleted_at IS NULL AND
        profile_id IN (SELECT id FROM public_profiles WHERE is_public = TRUE AND deleted_at IS NULL)
    );

CREATE POLICY profile_links_org_manage ON profile_links
    FOR ALL USING (
        profile_id IN (
            SELECT pp.id FROM public_profiles pp
            JOIN organization_members om ON pp.organization_id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE TRIGGER trg_profile_links_updated_at
    BEFORE UPDATE ON profile_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE profile_links IS 'Custom link blocks for public profiles (like Linktree links)';

-- ============================================================================
-- 3. PROFILE ANALYTICS (Priority 5)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profile_analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public_profiles(id) ON DELETE CASCADE,
    
    event_type VARCHAR(50) NOT NULL, -- 'view', 'link_click', 'social_click', 'contact_view', 'lead_submit'
    target_id UUID, -- link_id or null for page views
    target_url TEXT,
    
    referrer TEXT,
    user_agent TEXT,
    
    geo_country VARCHAR(2),
    geo_city VARCHAR(100),
    
    session_id VARCHAR(64),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_profile_date ON profile_analytics_events(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON profile_analytics_events(profile_id, event_type);

ALTER TABLE profile_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_org_read ON profile_analytics_events
    FOR SELECT USING (
        profile_id IN (
            SELECT pp.id FROM public_profiles pp
            JOIN organization_members om ON pp.organization_id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY analytics_insert_anon ON profile_analytics_events
    FOR INSERT WITH CHECK (TRUE);

COMMENT ON TABLE profile_analytics_events IS 'Analytics events for public profile views and interactions';

-- ============================================================================
-- 4. LEAD CAPTURE (Priority 6)
-- ============================================================================
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS lead_capture_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS lead_capture_type VARCHAR(20) DEFAULT 'contact'; -- 'contact', 'newsletter', 'both'

CREATE TABLE IF NOT EXISTS profile_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public_profiles(id) ON DELETE CASCADE,
    
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    
    lead_type VARCHAR(20) NOT NULL DEFAULT 'contact', -- 'contact', 'newsletter', 'inquiry'
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'read', 'replied', 'archived'
    
    source_url TEXT,
    referrer TEXT,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_leads_profile ON profile_leads(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_leads_status ON profile_leads(profile_id, status);

ALTER TABLE profile_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY leads_org_manage ON profile_leads
    FOR ALL USING (
        profile_id IN (
            SELECT pp.id FROM public_profiles pp
            JOIN organization_members om ON pp.organization_id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY leads_insert_anon ON profile_leads
    FOR INSERT WITH CHECK (TRUE);

CREATE TRIGGER trg_profile_leads_updated_at
    BEFORE UPDATE ON profile_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE profile_leads IS 'Lead captures from public profile contact forms';

-- ============================================================================
-- 5. THEME CUSTOMIZATION (Priority 7)
-- ============================================================================
ALTER TABLE public_profiles ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{
    "primary_color": "#6366f1",
    "secondary_color": "#8b5cf6",
    "background_style": "gradient",
    "font_family": "system",
    "card_style": "rounded",
    "layout": "default"
}'::jsonb;

COMMENT ON COLUMN public_profiles.theme_config IS 'Theme customization: colors, fonts, layout preferences';

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to increment view count and log analytics
CREATE OR REPLACE FUNCTION log_profile_view(
    p_profile_id UUID,
    p_referrer TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Increment view count
    UPDATE public_profiles 
    SET views_count = views_count + 1,
        updated_at = NOW()
    WHERE id = p_profile_id;
    
    -- Log analytics event
    INSERT INTO profile_analytics_events (
        profile_id, event_type, referrer, user_agent, session_id
    ) VALUES (
        p_profile_id, 'view', p_referrer, p_user_agent, p_session_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log link clicks
CREATE OR REPLACE FUNCTION log_link_click(
    p_link_id UUID,
    p_referrer TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_profile_id UUID;
    v_url TEXT;
BEGIN
    -- Get profile_id and url from link
    SELECT profile_id, url INTO v_profile_id, v_url
    FROM profile_links WHERE id = p_link_id;
    
    IF v_profile_id IS NOT NULL THEN
        -- Increment click count
        UPDATE profile_links 
        SET click_count = click_count + 1,
            updated_at = NOW()
        WHERE id = p_link_id;
        
        -- Log analytics event
        INSERT INTO profile_analytics_events (
            profile_id, event_type, target_id, target_url, referrer, session_id
        ) VALUES (
            v_profile_id, 'link_click', p_link_id, v_url, p_referrer, p_session_id
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon for public tracking
GRANT EXECUTE ON FUNCTION log_profile_view TO anon;
GRANT EXECUTE ON FUNCTION log_link_click TO anon;

-- ============================================================================
-- 7. ANALYTICS AGGREGATION VIEW
-- ============================================================================
CREATE OR REPLACE VIEW profile_analytics_summary AS
SELECT 
    pp.id AS profile_id,
    pp.slug,
    pp.views_count AS total_views,
    COUNT(DISTINCT pae.id) FILTER (WHERE pae.created_at >= NOW() - INTERVAL '7 days') AS views_7d,
    COUNT(DISTINCT pae.id) FILTER (WHERE pae.created_at >= NOW() - INTERVAL '30 days') AS views_30d,
    COUNT(DISTINCT pae.id) FILTER (WHERE pae.event_type = 'link_click' AND pae.created_at >= NOW() - INTERVAL '30 days') AS clicks_30d,
    COUNT(DISTINCT pae.session_id) FILTER (WHERE pae.created_at >= NOW() - INTERVAL '30 days') AS unique_visitors_30d,
    COUNT(DISTINCT pl.id) FILTER (WHERE pl.status = 'new') AS new_leads_count
FROM public_profiles pp
LEFT JOIN profile_analytics_events pae ON pp.id = pae.profile_id
LEFT JOIN profile_leads pl ON pp.id = pl.profile_id
WHERE pp.deleted_at IS NULL
GROUP BY pp.id, pp.slug, pp.views_count;

COMMENT ON VIEW profile_analytics_summary IS 'Aggregated analytics summary for profile dashboards';
