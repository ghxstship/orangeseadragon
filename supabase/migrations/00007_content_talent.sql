-- ATLVS Platform Database Schema
-- Content Management & Talent Tables

-- ============================================================================
-- CONTENT MANAGEMENT TABLES
-- ============================================================================

-- Media Library
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,
    thumbnail_url TEXT,
    status media_status DEFAULT 'active',
    folder_path TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_organization ON media(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(file_type);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder_path);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN(tags);

-- Brand Guidelines
CREATE TABLE brand_guidelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(20),
    status brand_guideline_status DEFAULT 'draft',
    primary_colors JSONB DEFAULT '[]',
    secondary_colors JSONB DEFAULT '[]',
    typography JSONB DEFAULT '{}',
    logo_usage JSONB DEFAULT '{}',
    imagery_guidelines TEXT,
    voice_tone TEXT,
    dos_and_donts JSONB DEFAULT '{}',
    templates JSONB DEFAULT '[]',
    document_url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_brand_guidelines_organization ON brand_guidelines(organization_id);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_status ON brand_guidelines(status);

-- Marketing Campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type campaign_type NOT NULL,
    status campaign_status DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2),
    spent DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    target_audience TEXT,
    goals JSONB DEFAULT '[]',
    kpis JSONB DEFAULT '[]',
    channels TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_campaigns_organization ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_project ON campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_event ON campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);

-- Marketing Materials
CREATE TABLE marketing_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    material_type material_type NOT NULL,
    status material_status DEFAULT 'draft',
    file_url TEXT,
    preview_url TEXT,
    dimensions VARCHAR(50),
    specifications JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_marketing_materials_organization ON marketing_materials(organization_id);
CREATE INDEX IF NOT EXISTS idx_marketing_materials_campaign ON marketing_materials(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_materials_event ON marketing_materials(event_id);
CREATE INDEX IF NOT EXISTS idx_marketing_materials_type ON marketing_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_marketing_materials_status ON marketing_materials(status);

-- Social Media Posts
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    platform social_platform NOT NULL,
    status social_post_status DEFAULT 'draft',
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    hashtags TEXT[],
    mentions TEXT[],
    link_url TEXT,
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    external_post_id VARCHAR(255),
    external_url TEXT,
    engagement_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_social_posts_organization ON social_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_campaign ON social_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_at);

-- Content Approvals
CREATE TABLE content_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    status approval_status DEFAULT 'pending',
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    comments TEXT,
    revision_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_approvals_organization ON content_approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_entity ON content_approvals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_status ON content_approvals(status);
CREATE INDEX IF NOT EXISTS idx_content_approvals_assigned ON content_approvals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_approvals_pending ON content_approvals(organization_id, status) WHERE status = 'pending';

-- ============================================================================
-- TALENT MANAGEMENT TABLES
-- ============================================================================

-- Talent Profiles
CREATE TABLE talent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    talent_type talent_type NOT NULL,
    bio TEXT,
    short_bio VARCHAR(500),
    genres TEXT[],
    booking_status booking_status DEFAULT 'available',
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    instagram_handle VARCHAR(100),
    twitter_handle VARCHAR(100),
    facebook_url VARCHAR(255),
    spotify_url VARCHAR(255),
    soundcloud_url VARCHAR(255),
    youtube_url VARCHAR(255),
    press_kit_url TEXT,
    photo_url TEXT,
    logo_url TEXT,
    gallery_urls JSONB DEFAULT '[]',
    manager_name VARCHAR(255),
    manager_email VARCHAR(255),
    manager_phone VARCHAR(50),
    agent_name VARCHAR(255),
    agent_email VARCHAR(255),
    agent_phone VARCHAR(50),
    base_fee DECIMAL(12, 2),
    fee_currency VARCHAR(3) DEFAULT 'USD',
    fee_notes TEXT,
    technical_requirements TEXT,
    hospitality_requirements TEXT,
    travel_requirements TEXT,
    is_exclusive BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_talent_profiles_organization ON talent_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_type ON talent_profiles(talent_type);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_status ON talent_profiles(booking_status);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_genres ON talent_profiles USING GIN(genres);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_tags ON talent_profiles USING GIN(tags);

-- Talent Bookings
CREATE TABLE talent_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_day_id UUID REFERENCES event_days(id) ON DELETE SET NULL,
    stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
    status talent_booking_status DEFAULT 'inquiry',
    performance_type performance_type DEFAULT 'headliner',
    performance_date DATE NOT NULL,
    load_in_time TIME,
    soundcheck_time TIME,
    set_time TIME,
    set_duration_minutes INTEGER,
    curfew_time TIME,
    fee_type fee_type DEFAULT 'flat',
    fee_amount DECIMAL(12, 2),
    fee_currency VARCHAR(3) DEFAULT 'USD',
    deposit_amount DECIMAL(12, 2),
    deposit_due_date DATE,
    deposit_paid_date DATE,
    balance_due_date DATE,
    balance_paid_date DATE,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    notes TEXT,
    internal_notes TEXT,
    confirmed_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_talent_bookings_organization ON talent_bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_talent_bookings_talent ON talent_bookings(talent_id);
CREATE INDEX IF NOT EXISTS idx_talent_bookings_event ON talent_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_talent_bookings_status ON talent_bookings(status);
CREATE INDEX IF NOT EXISTS idx_talent_bookings_date ON talent_bookings(performance_date);

-- Riders
CREATE TABLE riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    talent_id UUID REFERENCES talent_profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES talent_bookings(id) ON DELETE CASCADE,
    rider_type rider_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    version INTEGER DEFAULT 1,
    status rider_status DEFAULT 'draft',
    document_url TEXT,
    notes TEXT,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_riders_organization ON riders(organization_id);
CREATE INDEX IF NOT EXISTS idx_riders_talent ON riders(talent_id);
CREATE INDEX IF NOT EXISTS idx_riders_booking ON riders(booking_id);
CREATE INDEX IF NOT EXISTS idx_riders_type ON riders(rider_type);
CREATE INDEX IF NOT EXISTS idx_riders_status ON riders(status);

-- Rider Items
CREATE TABLE rider_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    category rider_item_category NOT NULL,
    item VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    specifications TEXT,
    provider rider_item_provider DEFAULT 'venue',
    status rider_item_status DEFAULT 'pending',
    is_required BOOLEAN DEFAULT TRUE,
    substitution_allowed BOOLEAN DEFAULT FALSE,
    substitution_notes TEXT,
    notes TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rider_items_rider ON rider_items(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_items_category ON rider_items(category);
CREATE INDEX IF NOT EXISTS idx_rider_items_status ON rider_items(status);

-- Setlists
CREATE TABLE setlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    talent_id UUID REFERENCES talent_profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES talent_bookings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status setlist_status DEFAULT 'draft',
    total_duration_minutes INTEGER,
    notes TEXT,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_setlists_organization ON setlists(organization_id);
CREATE INDEX IF NOT EXISTS idx_setlists_talent ON setlists(talent_id);
CREATE INDEX IF NOT EXISTS idx_setlists_booking ON setlists(booking_id);
CREATE INDEX IF NOT EXISTS idx_setlists_status ON setlists(status);

-- Setlist Items
CREATE TABLE setlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setlist_id UUID NOT NULL REFERENCES setlists(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    duration_seconds INTEGER,
    bpm INTEGER,
    key VARCHAR(10),
    notes TEXT,
    is_encore BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_setlist_items_setlist ON setlist_items(setlist_id);
CREATE INDEX IF NOT EXISTS idx_setlist_items_position ON setlist_items(setlist_id, position);

-- Talent Payments
CREATE TABLE talent_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES talent_bookings(id) ON DELETE CASCADE,
    payment_type talent_payment_type NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method talent_payment_method,
    status talent_payment_status DEFAULT 'pending',
    due_date DATE,
    paid_date DATE,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_talent_payments_organization ON talent_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_talent_payments_booking ON talent_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_talent_payments_status ON talent_payments(status);
CREATE INDEX IF NOT EXISTS idx_talent_payments_due ON talent_payments(due_date);
