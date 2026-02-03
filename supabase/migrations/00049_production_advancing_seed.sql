-- Migration: Production Advancing Seed Data
-- Phase 4: Default categories and workflow templates
-- See: docs/PRODUCTION_ADVANCING_INTEGRATION_PLAN.md

-- ============================================================================
-- DEFAULT ADVANCE CATEGORIES (System-wide, organization_id = NULL)
-- ============================================================================

-- Top-level categories
INSERT INTO advance_categories (organization_id, code, name, description, icon, color, sort_order) VALUES
(NULL, 'technical', 'Technical Production', 'Audio, lighting, video, rigging, staging, and power', 'cpu', '#3b82f6', 1),
(NULL, 'logistics', 'Logistics & Operations', 'Transportation, load-in/out, storage, and site access', 'truck', '#10b981', 2),
(NULL, 'hospitality', 'Hospitality & Catering', 'Artist/crew catering, green rooms, accommodations, and riders', 'coffee', '#f59e0b', 3),
(NULL, 'staffing', 'Staffing & Personnel', 'Production staff, security, medical, and volunteers', 'users', '#8b5cf6', 4),
(NULL, 'safety', 'Safety & Compliance', 'Permits, insurance, safety plans, and emergency procedures', 'shield', '#ef4444', 5),
(NULL, 'marketing', 'Marketing & Branding', 'Signage, photography, videography, press, and sponsor activations', 'megaphone', '#ec4899', 6)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Technical subcategories
INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'technical.audio', 'Audio', 'PA systems, monitors, microphones, and audio equipment', 'volume-2', '#3b82f6', 1
FROM advance_categories WHERE code = 'technical' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'technical.lighting', 'Lighting', 'Stage lighting, effects, and control systems', 'lightbulb', '#3b82f6', 2
FROM advance_categories WHERE code = 'technical' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'technical.video', 'Video', 'LED walls, projectors, cameras, and video switching', 'monitor', '#3b82f6', 3
FROM advance_categories WHERE code = 'technical' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'technical.rigging', 'Rigging', 'Truss, motors, rigging points, and structural elements', 'anchor', '#3b82f6', 4
FROM advance_categories WHERE code = 'technical' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'technical.staging', 'Staging', 'Stage decks, risers, barricades, and scenic elements', 'layout', '#3b82f6', 5
FROM advance_categories WHERE code = 'technical' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'technical.power', 'Power & Electrical', 'Generators, distribution, and electrical services', 'zap', '#3b82f6', 6
FROM advance_categories WHERE code = 'technical' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'technical.backline', 'Backline', 'Instruments, amplifiers, and musician equipment', 'guitar', '#3b82f6', 7
FROM advance_categories WHERE code = 'technical' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'technical.sfx', 'Special Effects', 'Pyro, CO2, confetti, and special effects', 'sparkles', '#3b82f6', 8
FROM advance_categories WHERE code = 'technical' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

-- Logistics subcategories
INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'logistics.transportation', 'Transportation', 'Trucks, buses, vans, and ground transport', 'truck', '#10b981', 1
FROM advance_categories WHERE code = 'logistics' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'logistics.load_in', 'Load-In', 'Load-in scheduling, dock access, and equipment delivery', 'download', '#10b981', 2
FROM advance_categories WHERE code = 'logistics' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'logistics.load_out', 'Load-Out', 'Strike scheduling, pack-out, and equipment return', 'upload', '#10b981', 3
FROM advance_categories WHERE code = 'logistics' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'logistics.storage', 'Storage', 'On-site storage, secure areas, and equipment holding', 'archive', '#10b981', 4
FROM advance_categories WHERE code = 'logistics' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'logistics.site_access', 'Site Access', 'Credentials, parking, and access points', 'key', '#10b981', 5
FROM advance_categories WHERE code = 'logistics' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

-- Hospitality subcategories
INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'hospitality.artist_catering', 'Artist Catering', 'Artist meals, buyouts, and dietary requirements', 'utensils', '#f59e0b', 1
FROM advance_categories WHERE code = 'hospitality' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'hospitality.crew_catering', 'Crew Catering', 'Crew meals, craft services, and catering schedules', 'users', '#f59e0b', 2
FROM advance_categories WHERE code = 'hospitality' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'hospitality.green_rooms', 'Green Rooms', 'Dressing rooms, green room setup, and artist areas', 'home', '#f59e0b', 3
FROM advance_categories WHERE code = 'hospitality' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'hospitality.accommodations', 'Accommodations', 'Hotel rooms, lodging, and accommodation requirements', 'bed', '#f59e0b', 4
FROM advance_categories WHERE code = 'hospitality' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'hospitality.riders', 'Riders', 'Technical riders, hospitality riders, and contract requirements', 'file-text', '#f59e0b', 5
FROM advance_categories WHERE code = 'hospitality' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'hospitality.guest_lists', 'Guest Lists', 'Artist guest lists, VIP lists, and credentials', 'list', '#f59e0b', 6
FROM advance_categories WHERE code = 'hospitality' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

-- Staffing subcategories
INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'staffing.production', 'Production Staff', 'Stage managers, production assistants, and crew chiefs', 'hard-hat', '#8b5cf6', 1
FROM advance_categories WHERE code = 'staffing' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'staffing.security', 'Security', 'Security personnel, crowd management, and access control', 'shield', '#8b5cf6', 2
FROM advance_categories WHERE code = 'staffing' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'staffing.medical', 'Medical', 'EMTs, medical staff, and first aid stations', 'heart', '#8b5cf6', 3
FROM advance_categories WHERE code = 'staffing' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'staffing.volunteers', 'Volunteers', 'Volunteer coordination and assignments', 'hand-helping', '#8b5cf6', 4
FROM advance_categories WHERE code = 'staffing' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'staffing.stagehands', 'Stagehands', 'Local crew, stagehands, and labor calls', 'wrench', '#8b5cf6', 5
FROM advance_categories WHERE code = 'staffing' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

-- Safety subcategories
INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'safety.permits', 'Permits', 'Event permits, noise permits, and regulatory approvals', 'file-text', '#ef4444', 1
FROM advance_categories WHERE code = 'safety' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'safety.insurance', 'Insurance', 'Event insurance, liability coverage, and COIs', 'shield-check', '#ef4444', 2
FROM advance_categories WHERE code = 'safety' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'safety.safety_plans', 'Safety Plans', 'Safety plans, risk assessments, and emergency procedures', 'alert-triangle', '#ef4444', 3
FROM advance_categories WHERE code = 'safety' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'safety.fire_marshal', 'Fire Marshal', 'Fire marshal coordination, inspections, and approvals', 'flame', '#ef4444', 4
FROM advance_categories WHERE code = 'safety' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'safety.emergency', 'Emergency Procedures', 'Evacuation plans, emergency contacts, and protocols', 'siren', '#ef4444', 5
FROM advance_categories WHERE code = 'safety' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

-- Marketing subcategories
INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'marketing.signage', 'Signage', 'Event signage, wayfinding, and branding elements', 'sign', '#ec4899', 1
FROM advance_categories WHERE code = 'marketing' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'marketing.photography', 'Photography', 'Event photography, photo pits, and media access', 'camera', '#ec4899', 2
FROM advance_categories WHERE code = 'marketing' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'marketing.videography', 'Videography', 'Video production, live streaming, and content capture', 'video', '#ec4899', 3
FROM advance_categories WHERE code = 'marketing' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'marketing.press', 'Press & Media', 'Press credentials, interviews, and media relations', 'newspaper', '#ec4899', 4
FROM advance_categories WHERE code = 'marketing' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;

INSERT INTO advance_categories (organization_id, parent_category_id, code, name, description, icon, color, sort_order)
SELECT NULL, id, 'marketing.sponsor_activations', 'Sponsor Activations', 'Sponsor booths, activations, and brand experiences', 'award', '#ec4899', 5
FROM advance_categories WHERE code = 'marketing' AND organization_id IS NULL
ON CONFLICT (organization_id, code) DO NOTHING;
