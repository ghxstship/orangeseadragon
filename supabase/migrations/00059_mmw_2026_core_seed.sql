-- ============================================================================
-- MIAMI MUSIC WEEK 2026 - CORE SEED DATA (Part 1)
-- Organizations, Roles, Departments, Positions, Workspaces, Venues, Addresses
-- ============================================================================

-- Organization (using existing demo org ID)
INSERT INTO organizations (id, name, slug, description, website, email, phone) VALUES
('10000000-0000-0000-0000-000000000001', 'MMW Productions', 'mmw-productions', 'Miami Music Week 2026 Production Company', 'https://miamimusicweek.com', 'info@mmwproductions.com', '+1 (305) 555-0000')
ON CONFLICT (id) DO NOTHING;

-- Roles
INSERT INTO roles (id, organization_id, name, slug, description, level, permissions, is_system) VALUES
('10000000-0000-0000-0001-000000000001', '10000000-0000-0000-0000-000000000001', 'Executive Producer', 'executive-producer', 'Overall event oversight and decision making', 100, '{"events": ["read", "write", "delete"], "finance": ["read", "write"], "talent": ["read", "write"]}', false),
('10000000-0000-0000-0001-000000000002', '10000000-0000-0000-0000-000000000001', 'Production Manager', 'production-manager', 'Day-to-day production operations', 80, '{"events": ["read", "write"], "crew": ["read", "write"], "assets": ["read", "write"]}', false),
('10000000-0000-0000-0001-000000000003', '10000000-0000-0000-0000-000000000001', 'Stage Manager', 'stage-manager', 'Individual stage operations', 60, '{"events": ["read"], "crew": ["read", "write"], "schedules": ["read", "write"]}', false),
('10000000-0000-0000-0001-000000000004', '10000000-0000-0000-0000-000000000001', 'Talent Coordinator', 'talent-coordinator', 'Artist relations and booking coordination', 60, '{"talent": ["read", "write"], "bookings": ["read", "write"]}', false),
('10000000-0000-0000-0001-000000000005', '10000000-0000-0000-0000-000000000001', 'Finance Manager', 'finance-manager', 'Budget and financial oversight', 70, '{"finance": ["read", "write"], "invoices": ["read", "write"]}', false),
('10000000-0000-0000-0001-000000000006', '10000000-0000-0000-0000-000000000001', 'Marketing Director', 'marketing-director', 'Marketing and communications', 70, '{"marketing": ["read", "write"], "content": ["read", "write"]}', false),
('10000000-0000-0000-0001-000000000007', '10000000-0000-0000-0000-000000000001', 'Operations Lead', 'operations-lead', 'Logistics and operations', 60, '{"operations": ["read", "write"], "assets": ["read", "write"]}', false),
('10000000-0000-0000-0001-000000000008', '10000000-0000-0000-0000-000000000001', 'Crew Member', 'crew-member', 'General crew access', 20, '{"schedules": ["read"], "tasks": ["read", "write"]}', false)
ON CONFLICT (id) DO NOTHING;

-- Departments (no is_active column)
INSERT INTO departments (id, organization_id, name, slug, description) VALUES
('10000000-0000-0000-0002-000000000001', '10000000-0000-0000-0000-000000000001', 'Executive', 'executive', 'Executive leadership and strategy'),
('10000000-0000-0000-0002-000000000002', '10000000-0000-0000-0000-000000000001', 'Production', 'production', 'Event production and technical operations'),
('10000000-0000-0000-0002-000000000003', '10000000-0000-0000-0000-000000000001', 'Talent', 'talent', 'Artist relations and booking'),
('10000000-0000-0000-0002-000000000004', '10000000-0000-0000-0000-000000000001', 'Finance', 'finance', 'Financial operations and accounting'),
('10000000-0000-0000-0002-000000000005', '10000000-0000-0000-0000-000000000001', 'Marketing', 'marketing', 'Marketing, PR, and communications'),
('10000000-0000-0000-0002-000000000006', '10000000-0000-0000-0000-000000000001', 'Operations', 'operations', 'Logistics, security, and operations'),
('10000000-0000-0000-0002-000000000007', '10000000-0000-0000-0000-000000000001', 'Hospitality', 'hospitality', 'VIP services and hospitality'),
('10000000-0000-0000-0002-000000000008', '10000000-0000-0000-0000-000000000001', 'Technical', 'technical', 'Audio, video, lighting, and staging')
ON CONFLICT (id) DO NOTHING;

-- Positions
INSERT INTO positions (id, organization_id, department_id, name, slug, description, level, is_active) VALUES
('10000000-0000-0000-0003-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0002-000000000001', 'CEO', 'ceo', 'Chief Executive Officer', 100, true),
('10000000-0000-0000-0003-000000000002', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0002-000000000002', 'Head of Production', 'head-production', 'Head of Production Department', 90, true),
('10000000-0000-0000-0003-000000000003', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0002-000000000002', 'Senior Stage Manager', 'senior-stage-manager', 'Senior Stage Manager', 70, true),
('10000000-0000-0000-0003-000000000004', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0002-000000000003', 'Head of Talent', 'head-talent', 'Head of Talent Relations', 90, true),
('10000000-0000-0000-0003-000000000005', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0002-000000000004', 'CFO', 'cfo', 'Chief Financial Officer', 95, true),
('10000000-0000-0000-0003-000000000006', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0002-000000000005', 'CMO', 'cmo', 'Chief Marketing Officer', 95, true),
('10000000-0000-0000-0003-000000000007', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0002-000000000006', 'Head of Operations', 'head-operations', 'Head of Operations', 90, true),
('10000000-0000-0000-0003-000000000008', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0002-000000000008', 'Technical Director', 'technical-director', 'Technical Director', 90, true)
ON CONFLICT (id) DO NOTHING;

-- Workspaces
INSERT INTO workspaces (id, organization_id, name, slug, description, is_default) VALUES
('10000000-0000-0000-0004-000000000001', '10000000-0000-0000-0000-000000000001', 'MMW 2026 Main', 'mmw-2026-main', 'Primary workspace for Miami Music Week 2026', true),
('10000000-0000-0000-0004-000000000002', '10000000-0000-0000-0000-000000000001', 'Ultra Music Festival', 'ultra-2026', 'Ultra Music Festival production', false),
('10000000-0000-0000-0004-000000000003', '10000000-0000-0000-0000-000000000001', 'Winter Music Conference', 'wmc-2026', 'WMC panels, workshops, and networking', false),
('10000000-0000-0000-0004-000000000004', '10000000-0000-0000-0000-000000000001', 'Club Events', 'club-events-2026', 'Nightclub and venue events', false),
('10000000-0000-0000-0004-000000000005', '10000000-0000-0000-0000-000000000001', 'Pool Parties', 'pool-parties-2026', 'Daytime pool party events', false)
ON CONFLICT (id) DO NOTHING;

-- Venues
INSERT INTO venues (id, organization_id, name, slug, venue_type, description, capacity, website, phone, email, contact_name, is_active) VALUES
('10000000-0000-0000-0005-000000000001', '10000000-0000-0000-0000-000000000001', 'Bayfront Park', 'bayfront-park', 'outdoor', 'Home of Ultra Music Festival - Downtown Miami waterfront park', 55000, 'https://ultra.com', '+1 (305) 555-0001', 'production@ultra.com', 'Ultra Production Team', true),
('10000000-0000-0000-0005-000000000002', '10000000-0000-0000-0000-000000000001', 'Miami Beach Convention Center', 'mbcc', 'indoor', 'Winter Music Conference headquarters and expo', 15000, 'https://wintermusicconference.com', '+1 (305) 555-0002', 'info@wmcon.com', 'WMC Operations', true),
('10000000-0000-0000-0005-000000000003', '10000000-0000-0000-0000-000000000001', 'Space Miami', 'space-miami', 'indoor', 'Legendary 24-hour club in Downtown Miami', 3000, 'https://spacemiami.com', '+1 (305) 555-0003', 'events@spacemiami.com', 'Space Events Team', true),
('10000000-0000-0000-0005-000000000004', '10000000-0000-0000-0000-000000000001', 'Club E11EVEN', 'club-e11even', 'indoor', '24/7 ultraclub in Downtown Miami', 2500, 'https://11miami.com', '+1 (305) 555-0004', 'events@11miami.com', 'E11EVEN Events', true),
('10000000-0000-0000-0005-000000000005', '10000000-0000-0000-0000-000000000001', 'LIV Miami', 'liv-miami', 'indoor', 'Premier nightclub at Fontainebleau Miami Beach', 2000, 'https://livnightclub.com', '+1 (305) 555-0005', 'events@livmiami.com', 'LIV Events', true),
('10000000-0000-0000-0005-000000000006', '10000000-0000-0000-0000-000000000001', 'Story Miami', 'story-miami', 'indoor', 'South Beach mega-club', 1800, 'https://storymiami.com', '+1 (305) 555-0006', 'events@storymiami.com', 'Story Events', true),
('10000000-0000-0000-0005-000000000007', '10000000-0000-0000-0000-000000000001', 'Factory Town', 'factory-town', 'hybrid', 'Industrial warehouse venue in Hialeah', 5000, 'https://factorytown.com', '+1 (305) 555-0007', 'events@factorytown.com', 'Factory Town Productions', true),
('10000000-0000-0000-0005-000000000008', '10000000-0000-0000-0000-000000000001', 'Treehouse Miami', 'treehouse-miami', 'indoor', 'Intimate club in Miami Beach', 800, 'https://treehousemiami.com', '+1 (305) 555-0008', 'events@treehousemiami.com', 'Treehouse Events', true),
('10000000-0000-0000-0005-000000000009', '10000000-0000-0000-0000-000000000001', 'Do Not Sit On The Furniture', 'do-not-sit', 'indoor', 'Underground house music venue', 500, 'https://donotsit.com', '+1 (305) 555-0009', 'events@donotsit.com', 'DNSOTF Events', true),
('10000000-0000-0000-0005-000000000010', '10000000-0000-0000-0000-000000000001', 'Floyd Miami', 'floyd-miami', 'indoor', 'Techno-focused club in Wynwood', 600, 'https://floydmiami.com', '+1 (305) 555-0010', 'events@floydmiami.com', 'Floyd Events', true),
('10000000-0000-0000-0005-000000000011', '10000000-0000-0000-0000-000000000001', 'Fontainebleau Pool', 'fontainebleau-pool', 'outdoor', 'Iconic Miami Beach hotel pool', 3000, 'https://fontainebleau.com', '+1 (305) 555-0011', 'events@fontainebleau.com', 'Fontainebleau Events', true),
('10000000-0000-0000-0005-000000000012', '10000000-0000-0000-0000-000000000001', 'Delano Beach Club', 'delano-beach-club', 'outdoor', 'South Beach pool venue', 1500, 'https://delano-hotel.com', '+1 (305) 555-0012', 'events@delano.com', 'Delano Events', true),
('10000000-0000-0000-0005-000000000013', '10000000-0000-0000-0000-000000000001', 'Hyde Beach at SLS', 'hyde-beach-sls', 'outdoor', 'South Beach pool party venue', 2000, 'https://sbe.com/hyde', '+1 (305) 555-0013', 'events@hydebeach.com', 'Hyde Events', true),
('10000000-0000-0000-0005-000000000014', '10000000-0000-0000-0000-000000000001', 'Nautilus by Arlo Pool', 'nautilus-pool', 'outdoor', 'Boutique hotel pool venue', 800, 'https://nautilushotel.com', '+1 (305) 555-0014', 'events@nautilus.com', 'Nautilus Events', true),
('10000000-0000-0000-0005-000000000015', '10000000-0000-0000-0000-000000000001', 'Faena Forum', 'faena-forum', 'indoor', 'Architectural landmark event space', 1000, 'https://faena.com', '+1 (305) 555-0015', 'events@faena.com', 'Faena Events', true),
('10000000-0000-0000-0005-000000000016', '10000000-0000-0000-0000-000000000001', 'Soho Beach House', 'soho-beach-house', 'hybrid', 'Members club with event spaces', 500, 'https://sohohouse.com', '+1 (305) 555-0016', 'events@sohohouse.com', 'Soho House Events', true)
ON CONFLICT (id) DO NOTHING;

-- Addresses for Venues
INSERT INTO addresses (id, organization_id, label, address_type, street_line_1, city, state_province, postal_code, country, country_code, latitude, longitude, is_verified, is_active) VALUES
('10000000-0000-0000-0006-000000000001', '10000000-0000-0000-0000-000000000001', 'Bayfront Park', 'venue', '301 Biscayne Blvd', 'Miami', 'FL', '33132', 'United States', 'US', 25.7743, -80.1855, true, true),
('10000000-0000-0000-0006-000000000002', '10000000-0000-0000-0000-000000000001', 'Miami Beach Convention Center', 'venue', '1901 Convention Center Dr', 'Miami Beach', 'FL', '33139', 'United States', 'US', 25.7950, -80.1340, true, true),
('10000000-0000-0000-0006-000000000003', '10000000-0000-0000-0000-000000000001', 'Space Miami', 'venue', '34 NE 11th St', 'Miami', 'FL', '33132', 'United States', 'US', 25.7856, -80.1918, true, true),
('10000000-0000-0000-0006-000000000004', '10000000-0000-0000-0000-000000000001', 'Club E11EVEN', 'venue', '29 NE 11th St', 'Miami', 'FL', '33132', 'United States', 'US', 25.7854, -80.1922, true, true),
('10000000-0000-0000-0006-000000000005', '10000000-0000-0000-0000-000000000001', 'LIV Miami', 'venue', '4441 Collins Ave', 'Miami Beach', 'FL', '33140', 'United States', 'US', 25.8195, -80.1225, true, true),
('10000000-0000-0000-0006-000000000006', '10000000-0000-0000-0000-000000000001', 'Story Miami', 'venue', '136 Collins Ave', 'Miami Beach', 'FL', '33139', 'United States', 'US', 25.7787, -80.1300, true, true),
('10000000-0000-0000-0006-000000000007', '10000000-0000-0000-0000-000000000001', 'Factory Town', 'venue', '1250 NE 89th St', 'Miami', 'FL', '33138', 'United States', 'US', 25.8550, -80.1800, true, true),
('10000000-0000-0000-0006-000000000008', '10000000-0000-0000-0000-000000000001', 'Treehouse Miami', 'venue', '323 23rd St', 'Miami Beach', 'FL', '33139', 'United States', 'US', 25.7920, -80.1350, true, true)
ON CONFLICT (id) DO NOTHING;
