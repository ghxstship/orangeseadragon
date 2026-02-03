-- ============================================================================
-- MIAMI MUSIC WEEK 2026 - CREW & ASSETS SEED DATA (Part 5)
-- Crew Members, Assets, Asset Categories
-- ============================================================================

-- Asset Categories (no is_active column)
INSERT INTO asset_categories (id, organization_id, name, slug, description) VALUES
('10000000-0000-0000-0080-000000000001', '10000000-0000-0000-0000-000000000001', 'Audio Equipment', 'audio-equipment', 'Sound systems, speakers, mixers'),
('10000000-0000-0000-0080-000000000002', '10000000-0000-0000-0000-000000000001', 'Lighting Equipment', 'lighting-equipment', 'Stage lighting, LED fixtures, controllers'),
('10000000-0000-0000-0080-000000000003', '10000000-0000-0000-0000-000000000001', 'Video Equipment', 'video-equipment', 'LED walls, projectors, cameras'),
('10000000-0000-0000-0080-000000000004', '10000000-0000-0000-0000-000000000001', 'Staging', 'staging', 'Stage structures, risers, barriers'),
('10000000-0000-0000-0080-000000000005', '10000000-0000-0000-0000-000000000001', 'DJ Equipment', 'dj-equipment', 'CDJs, mixers, turntables'),
('10000000-0000-0000-0080-000000000006', '10000000-0000-0000-0000-000000000001', 'Backline', 'backline', 'Instruments, amplifiers, drums'),
('10000000-0000-0000-0080-000000000007', '10000000-0000-0000-0000-000000000001', 'Power & Generators', 'power-generators', 'Generators, power distribution'),
('10000000-0000-0000-0080-000000000008', '10000000-0000-0000-0000-000000000001', 'Rigging', 'rigging', 'Truss, motors, rigging hardware'),
('10000000-0000-0000-0080-000000000009', '10000000-0000-0000-0000-000000000001', 'Communications', 'communications', 'Radios, intercoms, networking'),
('10000000-0000-0000-0080-000000000010', '10000000-0000-0000-0000-000000000001', 'Vehicles', 'vehicles', 'Golf carts, trucks, forklifts')
ON CONFLICT (id) DO NOTHING;

-- Assets (uses asset_tag, manufacturer, model, purchase_price instead of slug, quantity, etc.)
INSERT INTO assets (id, organization_id, category_id, asset_tag, name, description, manufacturer, model, status, purchase_price, purchase_currency) VALUES
('10000000-0000-0000-0081-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0080-000000000005', 'DJ-CDJ-001', 'Pioneer CDJ-3000', 'Professional DJ multi-player', 'Pioneer DJ', 'CDJ-3000', 'available', 2299, 'USD'),
('10000000-0000-0000-0081-000000000002', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0080-000000000005', 'DJ-MIX-001', 'Pioneer DJM-V10', '6-channel professional DJ mixer', 'Pioneer DJ', 'DJM-V10', 'available', 2999, 'USD'),
('10000000-0000-0000-0081-000000000003', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0080-000000000005', 'DJ-MIX-002', 'Allen & Heath Xone:96', 'Analogue DJ mixer', 'Allen & Heath', 'Xone:96', 'available', 2199, 'USD'),
('10000000-0000-0000-0081-000000000004', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0080-000000000001', 'AUD-SUB-001', 'Funktion-One F221', 'Bass enclosure', 'Funktion-One', 'F221', 'available', 8500, 'USD'),
('10000000-0000-0000-0081-000000000005', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0080-000000000001', 'AUD-TOP-001', 'Funktion-One Resolution 5', 'Mid-high enclosure', 'Funktion-One', 'Resolution 5', 'available', 6500, 'USD'),
('10000000-0000-0000-0081-000000000006', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0080-000000000002', 'LGT-MOV-001', 'Martin MAC Aura XB', 'LED wash moving head', 'Martin', 'MAC Aura XB', 'available', 4500, 'USD'),
('10000000-0000-0000-0081-000000000007', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0080-000000000002', 'LGT-MOV-002', 'Robe MegaPointe', 'Beam/spot/wash fixture', 'Robe', 'MegaPointe', 'available', 12000, 'USD'),
('10000000-0000-0000-0081-000000000008', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0080-000000000003', 'VID-LED-001', 'ROE Visual CB5', 'LED panel 5mm pitch', 'ROE Visual', 'CB5', 'available', 3500, 'USD'),
('10000000-0000-0000-0081-000000000009', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0080-000000000007', 'PWR-GEN-001', 'CAT 500kW Generator', 'Diesel generator', 'Caterpillar', '500kW', 'available', 150000, 'USD'),
('10000000-0000-0000-0081-000000000010', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0080-000000000009', 'COM-RAD-001', 'Motorola XPR 7550e', 'Two-way radio', 'Motorola', 'XPR 7550e', 'available', 650, 'USD')
ON CONFLICT (id) DO NOTHING;

-- Skills (no is_active column)
INSERT INTO skills (id, organization_id, name, slug, description, category) VALUES
('10000000-0000-0000-0082-000000000001', '10000000-0000-0000-0000-000000000001', 'FOH Audio Engineer', 'foh-audio', 'Front of house audio mixing', 'technical'),
('10000000-0000-0000-0082-000000000002', '10000000-0000-0000-0000-000000000001', 'Monitor Engineer', 'monitor-engineer', 'Stage monitor mixing', 'technical'),
('10000000-0000-0000-0082-000000000003', '10000000-0000-0000-0000-000000000001', 'Lighting Designer', 'lighting-designer', 'Lighting design and programming', 'technical'),
('10000000-0000-0000-0082-000000000004', '10000000-0000-0000-0000-000000000001', 'Video Engineer', 'video-engineer', 'LED wall and video systems', 'technical'),
('10000000-0000-0000-0082-000000000005', '10000000-0000-0000-0000-000000000001', 'Stage Manager', 'stage-manager-skill', 'Stage operations management', 'production'),
('10000000-0000-0000-0082-000000000006', '10000000-0000-0000-0000-000000000001', 'Rigger', 'rigger', 'Rigging and truss work', 'technical'),
('10000000-0000-0000-0082-000000000007', '10000000-0000-0000-0000-000000000001', 'Stagehand', 'stagehand', 'General stage labor', 'labor'),
('10000000-0000-0000-0082-000000000008', '10000000-0000-0000-0000-000000000001', 'Forklift Operator', 'forklift-operator', 'Certified forklift operation', 'labor'),
('10000000-0000-0000-0082-000000000009', '10000000-0000-0000-0000-000000000001', 'Security', 'security', 'Event security', 'operations'),
('10000000-0000-0000-0082-000000000010', '10000000-0000-0000-0000-000000000001', 'Medical', 'medical', 'Medical and first aid', 'operations')
ON CONFLICT (id) DO NOTHING;

-- Note: crew_members table doesn't exist - crew is managed through users table
