-- ============================================================================
-- Migration 00120: Platform-Wide Asset & Advancing Catalog (SSOT)
-- ============================================================================
-- Creates a global, platform-wide catalog that serves as the single source of
-- truth for all asset inventory and production advancing workflows.
--
-- Architecture:
--   platform_catalog_divisions  → Top-level grouping (Production, Operations)
--   platform_catalog_categories → Category within a division
--   platform_catalog_items      → Template items within a category
--
-- These tables are NOT org-scoped. They are platform-wide reference data.
-- Org-specific assets/advance_items reference catalog items via FK.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Platform Catalog Divisions (Production, Operations)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_catalog_divisions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text,
  icon        text,
  sort_order  int NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_catalog_divisions_slug ON platform_catalog_divisions(slug);

-- ---------------------------------------------------------------------------
-- 2. Platform Catalog Categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_catalog_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id   uuid NOT NULL REFERENCES platform_catalog_divisions(id) ON DELETE CASCADE,
  slug          text NOT NULL UNIQUE,
  name          text NOT NULL,
  description   text,
  icon          text,
  color         text,
  sort_order    int NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_catalog_categories_division ON platform_catalog_categories(division_id);
CREATE INDEX IF NOT EXISTS idx_platform_catalog_categories_slug ON platform_catalog_categories(slug);

-- ---------------------------------------------------------------------------
-- 3. Platform Catalog Items (template items within categories)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_catalog_items (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id           uuid NOT NULL REFERENCES platform_catalog_categories(id) ON DELETE CASCADE,
  slug                  text NOT NULL UNIQUE,
  name                  text NOT NULL,
  description           text,
  icon                  text,
  image_url             text,
  default_unit_cost     numeric(12,2),
  default_rental_rate   numeric(12,2),
  currency              text NOT NULL DEFAULT 'USD',
  unit_of_measure       text DEFAULT 'each',
  is_rentable           boolean NOT NULL DEFAULT false,
  is_purchasable        boolean NOT NULL DEFAULT true,
  is_service            boolean NOT NULL DEFAULT false,
  specifications        jsonb,
  tags                  text[] DEFAULT '{}',
  sort_order            int NOT NULL DEFAULT 0,
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_catalog_items_category ON platform_catalog_items(category_id);
CREATE INDEX IF NOT EXISTS idx_platform_catalog_items_slug ON platform_catalog_items(slug);
CREATE INDEX IF NOT EXISTS idx_platform_catalog_items_tags ON platform_catalog_items USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_platform_catalog_items_active ON platform_catalog_items(is_active) WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- 4. Add platform_catalog_item_id FK to assets table
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'platform_catalog_item_id'
  ) THEN
    ALTER TABLE assets ADD COLUMN platform_catalog_item_id uuid REFERENCES platform_catalog_items(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_assets_platform_catalog_item ON assets(platform_catalog_item_id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 5. Add platform_catalog_item_id FK to advance_items table
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'advance_items' AND column_name = 'platform_catalog_item_id'
  ) THEN
    ALTER TABLE advance_items ADD COLUMN platform_catalog_item_id uuid REFERENCES platform_catalog_items(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_advance_items_platform_catalog_item ON advance_items(platform_catalog_item_id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 6. RLS Policies — Platform catalog is readable by all authenticated users,
--    writable only by service_role (admin seeding).
-- ---------------------------------------------------------------------------
ALTER TABLE platform_catalog_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_catalog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_catalog_items ENABLE ROW LEVEL SECURITY;

-- Read access for all authenticated users
CREATE POLICY "platform_catalog_divisions_read" ON platform_catalog_divisions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "platform_catalog_categories_read" ON platform_catalog_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "platform_catalog_items_read" ON platform_catalog_items
  FOR SELECT TO authenticated USING (true);

-- Write access for service_role only (platform admin)
CREATE POLICY "platform_catalog_divisions_admin_write" ON platform_catalog_divisions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "platform_catalog_categories_admin_write" ON platform_catalog_categories
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "platform_catalog_items_admin_write" ON platform_catalog_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 7. Seed: Divisions
-- ---------------------------------------------------------------------------
INSERT INTO platform_catalog_divisions (slug, name, description, icon, sort_order) VALUES
  ('production',  'Production',  'Physical production infrastructure, equipment, and services', 'Clapperboard', 1),
  ('operations',  'Operations',  'Operational logistics, credentials, and support services',    'Settings',     2)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. Seed: Categories
-- ---------------------------------------------------------------------------
-- Production categories
INSERT INTO platform_catalog_categories (division_id, slug, name, description, icon, color, sort_order) VALUES
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'site-infrastructure',     'Site Infrastructure',         'Tents, stages, barricades, fencing, flooring, rigging',                  'Building2',     '#6366f1', 1),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'site-vehicles',           'Site Vehicles',               'Golf carts, forklifts, trucks, trailers, flatbeds',                      'Truck',         '#8b5cf6', 2),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'site-services',           'Site Services',               'Power, lighting, HVAC, refrigeration, sanitation, waste management',      'Zap',           '#f59e0b', 3),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'heavy-equipment',         'Heavy Equipment & Machinery', 'Cranes, scissor lifts, boom lifts, generators, compressors',             'HardHat',       '#ef4444', 4),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'tools-hardware',          'Tools & Hardware',            'Hand tools, power tools, fasteners, rigging hardware',                   'Wrench',        '#64748b', 5),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'health-safety',           'Health & Safety',             'First aid, fire extinguishers, PPE, AEDs, safety signage',               'ShieldCheck',   '#22c55e', 6),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'office-storage',          'Office & Storage',            'Portable offices, storage containers, shelving, filing',                 'Archive',       '#0ea5e9', 7),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'furniture',               'Furniture',                   'Tables, chairs, sofas, desks, counters, bars',                          'Armchair',      '#a855f7', 8),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'decor-props',             'Decor & Props',               'Draping, props, scenic elements, floral, themed decor',                 'Palette',       '#ec4899', 9),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'greenery',                'Greenery',                    'Plants, trees, floral arrangements, planters',                          'TreePine',      '#16a34a', 10),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'signage',                 'Signage',                     'Wayfinding, directional, branded, regulatory, and digital signage',     'SignpostBig',   '#d946ef', 11),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'it-services',             'IT Services',                 'WiFi, networking, AV equipment, screens, projectors',                   'Wifi',          '#06b6d4', 12),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'security-services',       'Security Services',           'Security personnel, CCTV, access control, metal detectors',             'Shield',        '#f97316', 13),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'janitorial-services',     'Janitorial Services',         'Cleaning crews, supplies, trash removal, recycling',                    'Sparkles',      '#14b8a6', 14),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'production'), 'food-beverage',           'Food & Beverage',             'Kitchen, bar, and restaurant equipment, appliances, tools, and supplies', 'CookingPot',  '#fb923c', 15),
-- Operations categories
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'operations'), 'credentials',             'Credentials',                 'Badges, laminates, wristbands, lanyards, credential printers',          'BadgeCheck',    '#3b82f6', 1),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'operations'), 'parking',                 'Parking',                     'Parking passes, lot management, shuttle services, valet',               'Car',           '#6b7280', 2),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'operations'), 'catering',                'Catering',                    'Meals, snacks, beverages, dietary accommodations, service staff',       'UtensilsCrossed','#f59e0b', 3),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'operations'), 'hospitality',             'Hospitality',                 'Green rooms, artist riders, VIP services, guest amenities, gifting',    'Heart',         '#f43f5e', 4),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'operations'), 'access',                  'Access',                      'SaaS subscriptions, software licenses, platform access',                'KeyRound',      '#8b5cf6', 5),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'operations'), 'communications',          'Communications',              'Radios, walkie-talkies, headsets, intercom systems',                    'Radio',         '#0ea5e9', 6),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'operations'), 'uniforms',                'Uniforms',                    'Staff shirts, jackets, vests, hats, branded apparel',                   'Shirt',         '#a855f7', 7),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'operations'), 'travel',                  'Travel',                      'Flights, ground transport, car rentals, fuel',                          'Plane',         '#ef4444', 8),
  ((SELECT id FROM platform_catalog_divisions WHERE slug = 'operations'), 'lodging',                 'Lodging',                     'Hotel rooms, Airbnb, housing, per diem accommodations',                 'Hotel',         '#22c55e', 9)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 9. Seed: Catalog Items (representative items per category)
-- ---------------------------------------------------------------------------

-- === PRODUCTION: Site Infrastructure ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_rentable, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-infrastructure'), 'tent-10x10',           '10×10 Pop-Up Tent',           'Standard 10×10 pop-up canopy tent',                    'each', true,  true,  1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-infrastructure'), 'tent-20x20',           '20×20 Frame Tent',            'Medium frame tent with sidewalls',                     'each', true,  false, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-infrastructure'), 'tent-40x60',           '40×60 Clearspan Tent',        'Large clearspan structure tent',                       'each', true,  false, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-infrastructure'), 'stage-4x8',            '4×8 Stage Deck',              'Modular stage deck section',                           'each', true,  true,  4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-infrastructure'), 'stage-riser',          'Stage Riser / Leg Set',       'Adjustable height stage legs',                         'set',  true,  true,  5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-infrastructure'), 'barricade-section',    'Crowd Barricade Section',     'Steel crowd control barricade (8ft section)',           'each', true,  true,  6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-infrastructure'), 'bike-rack-barricade',  'Bike Rack Barricade',         'Interlocking bike rack style barricade',                'each', true,  true,  7),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-infrastructure'), 'fencing-panel',        'Temporary Fencing Panel',     '6ft temporary construction fencing panel',              'each', true,  true,  8),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-infrastructure'), 'flooring-panel',       'Event Flooring Panel',        'Interlocking event flooring tile (2×2)',                'sqft', true,  true,  9),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-infrastructure'), 'truss-section',        'Truss Section (10ft)',        'Aluminum box truss 10ft section',                      'each', true,  true,  10),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-infrastructure'), 'ground-protection',    'Ground Protection Mat',       'Heavy-duty ground protection mat for vehicles/foot traffic', 'each', true, true, 11)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Site Vehicles ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_rentable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-vehicles'), 'golf-cart-4seat',     '4-Seat Golf Cart',            'Standard 4-passenger golf cart',                       'each', true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-vehicles'), 'golf-cart-6seat',     '6-Seat Golf Cart',            '6-passenger golf cart',                                'each', true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-vehicles'), 'utility-cart',        'Utility Cart / Gator',        'Utility vehicle with cargo bed',                       'each', true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-vehicles'), 'flatbed-truck',       'Flatbed Truck',               'Flatbed truck for site transport',                     'each', true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-vehicles'), 'box-truck',           'Box Truck (26ft)',            '26ft box truck for equipment transport',                'each', true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-vehicles'), 'trailer-enclosed',    'Enclosed Trailer',            'Enclosed cargo trailer',                               'each', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Site Services ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_service, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'power-distribution',   'Power Distribution',          'Electrical power distribution and cabling',            'day',  true, false, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'generator-rental',     'Generator Rental',            'Diesel/gas generator rental',                          'day',  true, false, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'lighting-package',     'Site Lighting Package',       'Temporary site lighting towers and fixtures',          'day',  true, false, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'hvac-cooling',         'HVAC / Cooling',              'Portable AC units and cooling systems',                'day',  true, false, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'hvac-heating',         'HVAC / Heating',              'Portable heaters and heating systems',                 'day',  true, false, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'refrigeration',        'Refrigeration',               'Walk-in coolers, freezer trailers',                    'day',  true, false, 6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'portable-restroom',    'Portable Restrooms',          'Standard portable restroom units',                     'each', true, false, 7),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'restroom-trailer',     'Restroom Trailer (Luxury)',   'Climate-controlled restroom trailer',                  'each', true, false, 8),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'handwash-station',     'Handwash Station',            'Portable handwashing station',                         'each', true, false, 9),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'waste-dumpster',       'Waste Dumpster',              'Roll-off waste dumpster',                              'each', true, false, 10),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'recycling-station',    'Recycling Station',           'Multi-stream recycling collection station',             'each', true, false, 11),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'site-services'), 'water-service',        'Water Service / Tanker',      'Potable water delivery and distribution',               'day',  true, false, 12)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Heavy Equipment & Machinery ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_rentable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'heavy-equipment'), 'forklift',            'Forklift',                    'Standard warehouse forklift',                          'day',  true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'heavy-equipment'), 'scissor-lift',        'Scissor Lift',                'Electric scissor lift (26ft)',                         'day',  true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'heavy-equipment'), 'boom-lift',           'Boom Lift',                   'Articulating boom lift (40ft)',                        'day',  true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'heavy-equipment'), 'crane-mobile',        'Mobile Crane',                'Mobile crane for heavy rigging',                       'day',  true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'heavy-equipment'), 'telehandler',         'Telehandler',                 'Telescopic handler for material placement',            'day',  true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'heavy-equipment'), 'air-compressor',      'Air Compressor',              'Portable air compressor',                              'day',  true, 6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'heavy-equipment'), 'pressure-washer',     'Pressure Washer',             'Commercial pressure washer',                           'day',  true, 7)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Tools & Hardware ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'tools-hardware'), 'tool-kit-general',    'General Tool Kit',            'Comprehensive hand tool kit',                          'kit',  true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'tools-hardware'), 'power-drill',         'Cordless Power Drill',        'Cordless drill/driver with battery',                   'each', true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'tools-hardware'), 'impact-wrench',       'Impact Wrench',               'Cordless impact wrench',                               'each', true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'tools-hardware'), 'rigging-hardware',    'Rigging Hardware Kit',        'Shackles, turnbuckles, carabiners, slings',            'kit',  true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'tools-hardware'), 'gaffer-tape',         'Gaffer Tape (Case)',          'Case of gaffer tape rolls (24 rolls)',                  'case', true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'tools-hardware'), 'cable-ramp',          'Cable Ramp / Protector',      'Heavy-duty cable ramp for pedestrian/vehicle crossing', 'each', true, 6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'tools-hardware'), 'zip-ties-box',        'Zip Ties (Box)',              'Box of assorted cable ties',                           'box',  true, 7),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'tools-hardware'), 'sandbag',             'Sandbag (50lb)',              '50lb sandbag for ballast/anchoring',                   'each', true, 8)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Health & Safety ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'health-safety'), 'first-aid-kit',       'First Aid Kit',               'OSHA-compliant first aid kit',                         'each', true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'health-safety'), 'aed',                 'AED (Defibrillator)',         'Automated external defibrillator',                     'each', true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'health-safety'), 'fire-extinguisher',   'Fire Extinguisher (ABC)',     'Multi-purpose ABC fire extinguisher',                   'each', true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'health-safety'), 'safety-vest',         'High-Vis Safety Vest',        'ANSI Class 2 high-visibility vest',                    'each', true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'health-safety'), 'hard-hat',            'Hard Hat',                    'OSHA-compliant hard hat',                              'each', true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'health-safety'), 'safety-glasses',      'Safety Glasses',              'ANSI Z87.1 safety glasses',                            'each', true, 6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'health-safety'), 'ear-protection',      'Ear Protection',              'Over-ear hearing protection (NRR 25dB)',                'each', true, 7),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'health-safety'), 'safety-cones',        'Safety Cones (Set of 10)',    'Orange traffic cones with reflective collar',           'set',  true, 8),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'health-safety'), 'wet-floor-sign',      'Wet Floor / Caution Sign',    'Folding caution sign',                                 'each', true, 9)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Office & Storage ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_rentable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'office-storage'), 'portable-office',     'Portable Office Trailer',     'Climate-controlled portable office',                   'each', true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'office-storage'), 'storage-container',   'Storage Container (20ft)',    '20ft shipping container for secure storage',            'each', true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'office-storage'), 'storage-container-40','Storage Container (40ft)',    '40ft shipping container for secure storage',            'each', true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'office-storage'), 'shelving-unit',       'Industrial Shelving Unit',    'Heavy-duty industrial shelving',                       'each', true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'office-storage'), 'road-case',           'Road Case (Large)',           'Heavy-duty road case with wheels',                     'each', true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'office-storage'), 'filing-cabinet',      'Portable Filing Cabinet',     'Locking portable filing cabinet',                      'each', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Furniture ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_rentable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'furniture'), 'folding-table-6ft',    '6ft Folding Table',           'Standard 6ft rectangular folding table',                'each', true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'furniture'), 'folding-table-8ft',    '8ft Folding Table',           'Standard 8ft rectangular folding table',                'each', true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'furniture'), 'round-table-60',       '60" Round Table',             '60-inch round banquet table',                          'each', true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'furniture'), 'folding-chair',        'Folding Chair',               'Standard folding chair',                               'each', true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'furniture'), 'chiavari-chair',       'Chiavari Chair',              'Chiavari ballroom chair',                              'each', true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'furniture'), 'bar-stool',            'Bar Stool',                   'Standard bar height stool',                            'each', true, 6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'furniture'), 'cocktail-table',       'Cocktail / Highboy Table',    'Cocktail height round table',                          'each', true, 7),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'furniture'), 'sofa-lounge',          'Lounge Sofa',                 'Event lounge sofa / couch',                            'each', true, 8),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'furniture'), 'registration-counter', 'Registration Counter',        'Portable registration / check-in counter',              'each', true, 9),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'furniture'), 'portable-bar',         'Portable Bar',                'Foldable portable bar unit',                           'each', true, 10)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Decor & Props ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_rentable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'decor-props'), 'pipe-drape-section',   'Pipe & Drape Section',        'Pipe and drape section (8ft tall)',                    'each', true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'decor-props'), 'fabric-draping',       'Fabric Draping (per ft)',     'Ceiling or wall fabric draping',                       'ft',   true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'decor-props'), 'scenic-flat',          'Scenic Flat / Panel',         'Painted scenic flat for staging',                      'each', true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'decor-props'), 'string-lights',        'String Lights (100ft)',       'Bistro / Edison string lights',                        'each', true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'decor-props'), 'uplighting-fixture',   'LED Uplighting Fixture',      'Wireless LED uplighting fixture',                      'each', true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'decor-props'), 'centerpiece',          'Table Centerpiece',           'Decorative table centerpiece',                         'each', true, 6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'decor-props'), 'photo-backdrop',       'Photo Backdrop / Step & Repeat', 'Branded photo backdrop with frame',                'each', true, 7),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'decor-props'), 'themed-prop',          'Themed Prop',                 'Custom themed prop or scenic element',                 'each', true, 8)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Signage ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_rentable, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'signage'), 'wayfinding-sign',      'Wayfinding Sign',             'Directional wayfinding sign with stand',               'each', true,  true,  1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'signage'), 'banner-stand',         'Retractable Banner Stand',    'Retractable roll-up banner stand',                     'each', true,  true,  2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'signage'), 'a-frame-sign',         'A-Frame / Sandwich Board',    'Double-sided A-frame sign',                            'each', true,  true,  3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'signage'), 'vinyl-banner',         'Vinyl Banner',                'Custom printed vinyl banner',                          'each', false, true,  4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'signage'), 'coroplast-sign',       'Coroplast Sign',              'Corrugated plastic directional sign',                  'each', false, true,  5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'signage'), 'digital-sign-display', 'Digital Signage Display',     'Digital signage screen with media player',             'each', true,  false, 6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'signage'), 'exit-sign',            'Exit / Emergency Sign',       'Illuminated exit or emergency sign',                   'each', true,  true,  7),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'signage'), 'sponsor-sign',         'Sponsor / Branded Sign',      'Custom sponsor or branded signage panel',               'each', false, true,  8)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Greenery ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_rentable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'greenery'), 'potted-tree',          'Potted Tree (6-8ft)',         'Live potted tree for event decor',                     'each', true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'greenery'), 'planter-box',          'Planter Box (Large)',         'Large decorative planter box',                         'each', true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'greenery'), 'floral-arrangement',   'Floral Arrangement',          'Custom floral arrangement',                            'each', false, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'greenery'), 'hedge-wall',           'Boxwood Hedge Wall',          '8×8 boxwood hedge wall panel',                         'each', true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'greenery'), 'artificial-turf',      'Artificial Turf (per sqft)',  'Artificial grass turf for event flooring',              'sqft', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: IT Services ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_service, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'it-services'), 'wifi-access-point',    'WiFi Access Point',           'Enterprise-grade WiFi access point',                   'each', false, true,  1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'it-services'), 'network-switch',       'Network Switch (24-port)',    '24-port managed network switch',                       'each', false, true,  2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'it-services'), 'internet-service',     'Dedicated Internet Line',     'Temporary dedicated internet service',                  'day',  true,  false, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'it-services'), 'led-screen',           'LED Video Wall Panel',        'Indoor/outdoor LED video wall panel',                   'each', true,  false, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'it-services'), 'projector',            'Projector (10K+ Lumens)',     'High-brightness event projector',                       'each', true,  false, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'it-services'), 'projection-screen',    'Projection Screen (16:9)',    'Portable projection screen',                           'each', true,  false, 6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'it-services'), 'laptop-rental',        'Laptop Rental',               'Laptop for event registration/operations',              'each', true,  false, 7),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'it-services'), 'printer-rental',       'Printer Rental',              'Laser printer for on-site printing',                    'each', true,  false, 8)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Security Services ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_service, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'security-services'), 'security-guard',       'Security Guard (per shift)',   'Licensed security guard (8-hour shift)',                'shift', true,  false, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'security-services'), 'security-supervisor',  'Security Supervisor',         'Security supervisor / team lead',                       'shift', true,  false, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'security-services'), 'cctv-camera',          'CCTV Camera System',          'Temporary CCTV camera with recording',                  'each',  false, true,  3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'security-services'), 'metal-detector',       'Walk-Through Metal Detector', 'Walk-through metal detector',                           'each',  true,  false, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'security-services'), 'wand-detector',        'Handheld Metal Detector',     'Handheld security wand',                                'each',  true,  true,  5)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Janitorial Services ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_service, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'janitorial-services'), 'cleaning-crew',        'Cleaning Crew (per shift)',   'Janitorial crew (8-hour shift)',                        'shift', true,  false, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'janitorial-services'), 'trash-can-set',        'Trash Can Set (10)',          'Set of 10 event trash cans with liners',                'set',   false, true,  2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'janitorial-services'), 'cleaning-supplies',    'Cleaning Supply Kit',         'Mops, brooms, cleaning solutions',                      'kit',   false, true,  3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'janitorial-services'), 'pressure-wash-svc',    'Pressure Washing Service',    'Post-event pressure washing service',                   'day',   true,  false, 4)
ON CONFLICT (slug) DO NOTHING;

-- === OPERATIONS: Credentials ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'credentials'), 'laminate-badge',       'Laminate Badge',              'Custom printed laminate credential badge',               'each', true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'credentials'), 'wristband-tyvek',      'Tyvek Wristband',            'Single-use Tyvek wristband',                            'each', true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'credentials'), 'wristband-fabric',     'Fabric Wristband',           'Woven fabric wristband with RFID option',               'each', true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'credentials'), 'lanyard',              'Lanyard',                    'Printed lanyard with badge clip',                       'each', true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'credentials'), 'badge-holder',         'Badge Holder',               'Clear vinyl badge holder',                              'each', true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'credentials'), 'credential-printer',   'Credential Printer',         'On-site badge/credential printer',                      'each', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- === OPERATIONS: Parking ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_purchasable, is_service, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'parking'), 'parking-pass-daily',   'Daily Parking Pass',          'Single-day parking pass',                               'each', true,  false, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'parking'), 'parking-pass-event',   'Event Parking Pass',          'Full-event parking pass',                               'each', true,  false, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'parking'), 'valet-service',        'Valet Service',               'Valet parking service (per shift)',                      'shift',false, true,  3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'parking'), 'shuttle-service',      'Shuttle Service',             'Shuttle bus service between locations',                  'day',  false, true,  4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'parking'), 'parking-cones',        'Parking Cones / Delineators', 'Traffic cones for lot management',                      'each', true,  false, 5)
ON CONFLICT (slug) DO NOTHING;

-- === OPERATIONS: Catering ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_service, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'catering'), 'meal-breakfast',       'Breakfast Meal',              'Hot breakfast meal per person',                          'person', true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'catering'), 'meal-lunch',           'Lunch Meal',                  'Lunch meal per person',                                 'person', true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'catering'), 'meal-dinner',          'Dinner Meal',                 'Dinner meal per person',                                'person', true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'catering'), 'snack-pack',           'Snack Pack',                  'Assorted snack pack per person',                        'person', true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'catering'), 'beverage-service',     'Beverage Service',            'Coffee, water, soft drinks station',                    'day',    true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'catering'), 'dietary-accommodation','Dietary Accommodation',       'Special dietary meal (vegan, GF, halal, kosher)',       'person', true, 6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'catering'), 'catering-staff',       'Catering Staff (per shift)',  'Catering service staff',                                'shift',  true, 7)
ON CONFLICT (slug) DO NOTHING;

-- === OPERATIONS: Access ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_service, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'access'), 'saas-license',         'SaaS License / Seat',         'Software platform license per user',                    'seat',  true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'access'), 'platform-access',      'Platform Access Pass',        'Temporary platform/tool access',                        'each',  true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'access'), 'api-access',           'API Access Key',              'API access key for integrations',                       'each',  true, 3)
ON CONFLICT (slug) DO NOTHING;

-- === OPERATIONS: Communications ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_rentable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'communications'), 'two-way-radio',        'Two-Way Radio',               'Digital two-way radio with charger',                    'each', true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'communications'), 'radio-earpiece',       'Radio Earpiece',              'Surveillance-style radio earpiece',                     'each', true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'communications'), 'radio-repeater',       'Radio Repeater',              'Radio repeater for extended range',                     'each', true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'communications'), 'radio-charger-bank',   'Radio Charger Bank (6-unit)', '6-unit multi-radio charging station',                   'each', true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'communications'), 'headset-comms',        'Comms Headset',               'Full-duplex communications headset',                    'each', true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'communications'), 'bullhorn',             'Bullhorn / Megaphone',        'Battery-powered megaphone',                             'each', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- === OPERATIONS: Uniforms ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'uniforms'), 'crew-tshirt',          'Crew T-Shirt',                'Branded crew t-shirt',                                  'each', true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'uniforms'), 'crew-polo',            'Crew Polo Shirt',             'Branded crew polo shirt',                               'each', true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'uniforms'), 'crew-jacket',          'Crew Jacket',                 'Branded crew jacket / windbreaker',                     'each', true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'uniforms'), 'crew-vest',            'Crew Vest',                   'Branded crew vest',                                     'each', true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'uniforms'), 'crew-hat',             'Crew Hat / Cap',              'Branded crew hat or cap',                               'each', true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'uniforms'), 'rain-poncho',          'Rain Poncho',                 'Disposable or reusable rain poncho',                    'each', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- === OPERATIONS: Travel ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_service, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'travel'), 'flight-domestic',      'Domestic Flight',             'Domestic round-trip flight',                            'trip',  true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'travel'), 'flight-international', 'International Flight',        'International round-trip flight',                       'trip',  true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'travel'), 'car-rental',           'Car Rental',                  'Standard car rental per day',                           'day',   true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'travel'), 'ground-transport',     'Ground Transport / Transfer', 'Airport transfer or ground transport',                  'trip',  true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'travel'), 'fuel-reimbursement',   'Fuel / Mileage Reimbursement','Fuel or mileage reimbursement',                         'mile',  true, 5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'travel'), 'bus-charter',          'Bus Charter',                 'Charter bus for group transport',                       'day',   true, 6)
ON CONFLICT (slug) DO NOTHING;

-- === PRODUCTION: Food & Beverage ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_rentable, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'commercial-oven',      'Commercial Oven',             'Commercial convection or combi oven',                   'each', true,  true,  1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'commercial-fridge',    'Commercial Refrigerator',     'Commercial reach-in refrigerator',                      'each', true,  true,  2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'commercial-freezer',   'Commercial Freezer',          'Commercial reach-in or chest freezer',                  'each', true,  true,  3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'prep-table',           'Prep Table (Stainless)',      'Stainless steel food prep table',                       'each', true,  true,  4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'fryer',                'Deep Fryer',                  'Commercial deep fryer',                                 'each', true,  true,  5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'flat-top-grill',       'Flat Top Grill / Griddle',    'Commercial flat top griddle',                           'each', true,  true,  6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'ice-machine',          'Ice Machine',                 'Portable or undercounter ice machine',                  'each', true,  true,  7),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'beverage-dispenser',   'Beverage Dispenser',          'Large beverage dispenser / cambro',                     'each', true,  true,  8),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'coffee-station',       'Coffee Station / Machine',    'Commercial coffee maker or espresso machine',           'each', true,  true,  9),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'draft-system',         'Draft / Tap System',          'Portable draft beer or beverage tap system',            'each', true,  false, 10),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'bar-equipment',        'Bar Equipment Kit',           'Speed rails, shakers, jiggers, pourers, bar mats',     'kit',  false, true,  11),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'chafing-dish',         'Chafing Dish / Warmer',       'Stainless steel chafing dish set',                      'each', true,  true,  12),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'cooler-large',         'Large Cooler / Ice Chest',    'Large rolling cooler (100qt+)',                          'each', true,  true,  13),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'serving-supplies',     'Serving Supplies Kit',        'Plates, cups, napkins, utensils, serving trays',        'kit',  false, true,  14),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'food-tent',            'Food Service Tent',           'Tent configured for food service with counters',        'each', true,  false, 15),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'sink-portable',        'Portable 3-Compartment Sink', 'Health-code compliant portable sink',                   'each', true,  true,  16),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'food-beverage'), 'fire-suppression',     'Kitchen Fire Suppression',    'Portable kitchen fire suppression system',              'each', true,  true,  17)
ON CONFLICT (slug) DO NOTHING;

-- === OPERATIONS: Hospitality ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_service, is_purchasable, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'hospitality'), 'green-room-setup',     'Green Room Setup',            'Furniture, refreshments, and amenities for green room',  'each', true,  false, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'hospitality'), 'artist-rider',         'Artist Rider Fulfillment',    'Fulfillment of artist/talent hospitality rider',        'each', true,  false, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'hospitality'), 'vip-lounge-setup',     'VIP Lounge Setup',            'VIP area furniture, decor, and service setup',          'each', true,  false, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'hospitality'), 'gift-bag',             'Gift Bag / Swag Bag',         'Curated gift bag for VIPs, talent, or sponsors',       'each', false, true,  4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'hospitality'), 'amenity-kit',          'Amenity Kit',                 'Toiletries, comfort items, phone chargers',             'each', false, true,  5),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'hospitality'), 'towel-service',        'Towel / Linen Service',       'Fresh towels and linens for talent or VIP areas',       'day',  true,  false, 6),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'hospitality'), 'concierge-service',    'Concierge Service',           'Dedicated concierge / runner for talent or VIP needs',  'shift',true,  false, 7),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'hospitality'), 'floral-hospitality',   'Hospitality Floral',          'Floral arrangements for green rooms and VIP areas',     'each', false, true,  8)
ON CONFLICT (slug) DO NOTHING;

-- === OPERATIONS: Lodging ===
INSERT INTO platform_catalog_items (category_id, slug, name, description, unit_of_measure, is_service, sort_order) VALUES
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'lodging'), 'hotel-standard',       'Hotel Room (Standard)',       'Standard hotel room per night',                         'night', true, 1),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'lodging'), 'hotel-suite',          'Hotel Suite',                 'Hotel suite per night',                                 'night', true, 2),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'lodging'), 'airbnb-rental',        'Short-Term Rental (Airbnb)',  'Short-term rental property per night',                  'night', true, 3),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'lodging'), 'per-diem-lodging',     'Per Diem (Lodging)',          'Lodging per diem allowance',                            'day',   true, 4),
  ((SELECT id FROM platform_catalog_categories WHERE slug = 'lodging'), 'housing-block',        'Hotel Room Block',            'Block of hotel rooms (group rate)',                      'room',  true, 5)
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 10. Updated_at trigger for all new tables
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_platform_catalog_divisions') THEN
    CREATE TRIGGER set_updated_at_platform_catalog_divisions
      BEFORE UPDATE ON platform_catalog_divisions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_platform_catalog_categories') THEN
    CREATE TRIGGER set_updated_at_platform_catalog_categories
      BEFORE UPDATE ON platform_catalog_categories
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_platform_catalog_items') THEN
    CREATE TRIGGER set_updated_at_platform_catalog_items
      BEFORE UPDATE ON platform_catalog_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
