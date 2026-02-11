-- ATLVS Platform Database Schema
-- Experience Management Tables (Ticketing, Guest Lists, Hospitality)

-- ============================================================================
-- TICKETING TABLES
-- ============================================================================

-- Ticket Types
CREATE TABLE ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tier ticket_tier DEFAULT 'general',
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    quantity_available INTEGER,
    quantity_sold INTEGER DEFAULT 0,
    max_per_order INTEGER,
    sale_start TIMESTAMPTZ,
    sale_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    includes TEXT[],
    restrictions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_types_organization ON ticket_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_tier ON ticket_types(tier);

-- Ticket Orders
CREATE TABLE ticket_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    status ticket_order_status DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    fees DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method payment_method,
    payment_reference VARCHAR(255),
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_amount DECIMAL(10, 2),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_ticket_orders_organization ON ticket_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_event ON ticket_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_email ON ticket_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_status ON ticket_orders(status);

-- Tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_day_id UUID REFERENCES event_days(id) ON DELETE SET NULL,
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES ticket_orders(id) ON DELETE SET NULL,
    ticket_number VARCHAR(50) NOT NULL,
    barcode VARCHAR(100),
    qr_code TEXT,
    status ticket_status DEFAULT 'purchased',
    holder_name VARCHAR(255),
    holder_email VARCHAR(255),
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
    transferred_from UUID REFERENCES tickets(id) ON DELETE SET NULL,
    transferred_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, ticket_number)
);

CREATE INDEX IF NOT EXISTS idx_tickets_organization ON tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_tickets_order ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_barcode ON tickets(barcode);
CREATE INDEX IF NOT EXISTS idx_tickets_holder ON tickets(holder_email);

-- ============================================================================
-- GUEST LIST TABLES
-- ============================================================================

-- Guest Lists
CREATE TABLE guest_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_day_id UUID REFERENCES event_days(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    list_type guest_list_type NOT NULL,
    status guest_list_status DEFAULT 'draft',
    capacity INTEGER,
    entries_count INTEGER DEFAULT 0,
    checked_in_count INTEGER DEFAULT 0,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_guest_lists_organization ON guest_lists(organization_id);
CREATE INDEX IF NOT EXISTS idx_guest_lists_event ON guest_lists(event_id);
CREATE INDEX IF NOT EXISTS idx_guest_lists_type ON guest_lists(list_type);
CREATE INDEX IF NOT EXISTS idx_guest_lists_status ON guest_lists(status);

-- Guest List Entries
CREATE TABLE guest_list_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_list_id UUID NOT NULL REFERENCES guest_lists(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    plus_ones INTEGER DEFAULT 0,
    plus_ones_checked_in INTEGER DEFAULT 0,
    status guest_entry_status DEFAULT 'pending',
    ticket_tier ticket_tier DEFAULT 'general',
    access_areas TEXT[],
    notes TEXT,
    internal_notes TEXT,
    confirmed_at TIMESTAMPTZ,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_list_entries_list ON guest_list_entries(guest_list_id);
CREATE INDEX IF NOT EXISTS idx_guest_list_entries_email ON guest_list_entries(email);
CREATE INDEX IF NOT EXISTS idx_guest_list_entries_status ON guest_list_entries(status);

-- ============================================================================
-- HOSPITALITY TABLES
-- ============================================================================

-- Hospitality Requests
CREATE TABLE hospitality_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES talent_bookings(id) ON DELETE SET NULL,
    request_type hospitality_request_type NOT NULL,
    status hospitality_status DEFAULT 'pending',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    priority priority_level DEFAULT 'medium',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hospitality_requests_organization ON hospitality_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_requests_event ON hospitality_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_requests_booking ON hospitality_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_requests_type ON hospitality_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_hospitality_requests_status ON hospitality_requests(status);

-- Accommodations
CREATE TABLE accommodations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES talent_bookings(id) ON DELETE SET NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255),
    guest_phone VARCHAR(50),
    hotel_name VARCHAR(255) NOT NULL,
    hotel_address TEXT,
    hotel_phone VARCHAR(50),
    confirmation_number VARCHAR(100),
    room_type VARCHAR(100),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status accommodation_status DEFAULT 'booked',
    nightly_rate DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    special_requests TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_accommodations_organization ON accommodations(organization_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_event ON accommodations(event_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_booking ON accommodations(booking_id);
CREATE INDEX IF NOT EXISTS idx_accommodations_dates ON accommodations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_accommodations_status ON accommodations(status);

-- Transportation
CREATE TABLE transportation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES talent_bookings(id) ON DELETE SET NULL,
    transport_type transport_type NOT NULL,
    status transport_status DEFAULT 'booked',
    passenger_names TEXT[],
    passenger_count INTEGER DEFAULT 1,
    departure_location TEXT NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME,
    arrival_location TEXT NOT NULL,
    arrival_date DATE,
    arrival_time TIME,
    carrier VARCHAR(255),
    flight_number VARCHAR(50),
    confirmation_number VARCHAR(100),
    vehicle_type VARCHAR(100),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    cost DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    special_requests TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transportation_organization ON transportation(organization_id);
CREATE INDEX IF NOT EXISTS idx_transportation_event ON transportation(event_id);
CREATE INDEX IF NOT EXISTS idx_transportation_booking ON transportation(booking_id);
CREATE INDEX IF NOT EXISTS idx_transportation_type ON transportation(transport_type);
CREATE INDEX IF NOT EXISTS idx_transportation_date ON transportation(departure_date);
CREATE INDEX IF NOT EXISTS idx_transportation_status ON transportation(status);

-- Catering Orders
CREATE TABLE catering_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_day_id UUID REFERENCES event_days(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES talent_bookings(id) ON DELETE SET NULL,
    order_type catering_order_type NOT NULL,
    status catering_status DEFAULT 'pending',
    delivery_location TEXT,
    delivery_time TIMESTAMPTZ,
    head_count INTEGER,
    dietary_requirements JSONB DEFAULT '{}',
    menu_items JSONB DEFAULT '[]',
    special_requests TEXT,
    vendor_name VARCHAR(255),
    vendor_contact VARCHAR(255),
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_catering_orders_organization ON catering_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_catering_orders_event ON catering_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_catering_orders_booking ON catering_orders(booking_id);
CREATE INDEX IF NOT EXISTS idx_catering_orders_type ON catering_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_catering_orders_status ON catering_orders(status);
CREATE INDEX IF NOT EXISTS idx_catering_orders_delivery ON catering_orders(delivery_time);

-- ============================================================================
-- COMMUNITY TABLES
-- ============================================================================

-- Community Members
CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    external_id VARCHAR(255),
    member_type community_member_type DEFAULT 'fan',
    display_name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    interests TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_members_organization ON community_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_type ON community_members(member_type);
CREATE INDEX IF NOT EXISTS idx_community_members_interests ON community_members USING GIN(interests);

-- Community Posts
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    post_type post_type DEFAULT 'text',
    visibility post_visibility DEFAULT 'public',
    content TEXT,
    media_urls JSONB DEFAULT '[]',
    poll_options JSONB,
    poll_ends_at TIMESTAMPTZ,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_organization ON community_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_visibility ON community_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_community_posts_published ON community_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_featured ON community_posts(organization_id, is_featured) WHERE is_featured = TRUE;

-- Community Comments
CREATE TABLE community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent ON community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author ON community_comments(author_id);

-- Community Follows
CREATE TABLE community_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_community_follows_follower ON community_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_community_follows_following ON community_follows(following_id);
