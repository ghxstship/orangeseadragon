-- Migration: Rate Cards Consolidation
-- Created: 2026-01-29
-- Description: Consolidates workforce rate_cards (00004) and service rate_cards (00034)
--              into a unified polymorphic structure

-- ============================================================================
-- STEP 1: Add rate_card_type to existing rate_cards table
-- ============================================================================

-- Add discriminator column to distinguish workforce vs service rate cards
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rate_cards' AND column_name = 'rate_card_type'
    ) THEN
        ALTER TABLE rate_cards ADD COLUMN IF NOT EXISTS rate_card_type VARCHAR(20) DEFAULT 'workforce' 
            CHECK (rate_card_type IN ('workforce', 'service', 'rental', 'custom'));
    END IF;
END $$;

-- Add is_active if not exists (00034 has it, 00004 doesn't)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rate_cards' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE rate_cards ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Rename end_date to expiration_date for consistency (if end_date exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rate_cards' AND column_name = 'end_date'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rate_cards' AND column_name = 'expiration_date'
    ) THEN
        ALTER TABLE rate_cards RENAME COLUMN end_date TO expiration_date;
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Consolidate rate_card_items with polymorphic references
-- ============================================================================

-- Add service_id to rate_card_items if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rate_card_items' AND column_name = 'service_id'
    ) THEN
        ALTER TABLE rate_card_items ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add item_code for service rate cards
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rate_card_items' AND column_name = 'item_code'
    ) THEN
        ALTER TABLE rate_card_items ADD COLUMN IF NOT EXISTS item_code VARCHAR(50);
    END IF;
END $$;

-- Add description for service rate cards
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rate_card_items' AND column_name = 'description'
    ) THEN
        ALTER TABLE rate_card_items ADD COLUMN IF NOT EXISTS description VARCHAR(255);
    END IF;
END $$;

-- Add unit_price (maps to regular_rate for workforce, unit_price for service)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rate_card_items' AND column_name = 'unit_price'
    ) THEN
        ALTER TABLE rate_card_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2);
        -- Copy regular_rate to unit_price for existing records
        UPDATE rate_card_items SET unit_price = regular_rate WHERE unit_price IS NULL AND regular_rate IS NOT NULL;
    END IF;
END $$;

-- Add unit for service rate cards
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rate_card_items' AND column_name = 'unit'
    ) THEN
        ALTER TABLE rate_card_items ADD COLUMN IF NOT EXISTS unit VARCHAR(50);
    END IF;
END $$;

-- Add minimum_quantity for service rate cards
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rate_card_items' AND column_name = 'minimum_quantity'
    ) THEN
        ALTER TABLE rate_card_items ADD COLUMN IF NOT EXISTS minimum_quantity INTEGER DEFAULT 1;
    END IF;
END $$;

-- Create index on service_id
CREATE INDEX IF NOT EXISTS idx_rate_card_items_service ON rate_card_items(service_id);

-- ============================================================================
-- STEP 3: Create unified view for rate cards with type
-- ============================================================================

CREATE OR REPLACE VIEW rate_cards_unified AS
SELECT 
    rc.id,
    rc.organization_id,
    rc.name,
    rc.description,
    rc.rate_card_type,
    rc.is_default,
    rc.is_active,
    rc.effective_date,
    rc.expiration_date,
    rc.created_at,
    rc.updated_at,
    COUNT(rci.id) as item_count
FROM rate_cards rc
LEFT JOIN rate_card_items rci ON rci.rate_card_id = rc.id
GROUP BY rc.id;

-- ============================================================================
-- STEP 4: Create view for workforce rate card items
-- ============================================================================

CREATE OR REPLACE VIEW workforce_rate_card_items AS
SELECT 
    rci.id,
    rci.rate_card_id,
    rci.position_id,
    rci.skill_id,
    rci.rate_type,
    rci.regular_rate,
    rci.overtime_rate,
    rci.double_time_rate,
    rci.currency,
    rci.notes,
    rci.created_at,
    rci.updated_at,
    p.name as position_title,
    s.name as skill_name
FROM rate_card_items rci
JOIN rate_cards rc ON rc.id = rci.rate_card_id
LEFT JOIN positions p ON p.id = rci.position_id
LEFT JOIN skills s ON s.id = rci.skill_id
WHERE rc.rate_card_type = 'workforce';

-- ============================================================================
-- STEP 5: Create view for service rate card items
-- ============================================================================

CREATE OR REPLACE VIEW service_rate_card_items AS
SELECT 
    rci.id,
    rci.rate_card_id,
    rci.service_id,
    rci.item_code,
    rci.description,
    rci.unit_price,
    rci.unit,
    rci.minimum_quantity,
    rci.created_at,
    sv.name as service_name,
    sv.category as service_category
FROM rate_card_items rci
JOIN rate_cards rc ON rc.id = rci.rate_card_id
LEFT JOIN services sv ON sv.id = rci.service_id
WHERE rc.rate_card_type = 'service';
