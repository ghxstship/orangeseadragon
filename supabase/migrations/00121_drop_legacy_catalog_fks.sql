-- ============================================================================
-- Migration 00121: Drop Legacy Catalog System — Rewire All FKs to Platform Catalog SSOT
-- ============================================================================
-- This migration eliminates backward compatibility with the legacy category/catalog
-- system. All FKs that pointed to asset_categories, advance_categories, catalog_items,
-- and advancing_catalog_items are rewired to platform_catalog_categories or
-- platform_catalog_items.
--
-- Legacy tables are NOT dropped (data preservation) but all FK constraints
-- pointing to them are removed and replaced.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. assets.category_id → platform_catalog_categories
-- ---------------------------------------------------------------------------
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_category_id_fkey;
-- Rename legacy column to mark it deprecated, add new FK
ALTER TABLE assets RENAME COLUMN category_id TO legacy_category_id;
-- platform_catalog_item_id already exists from migration 00120

-- ---------------------------------------------------------------------------
-- 2. asset_kits.category_id → platform_catalog_categories
-- ---------------------------------------------------------------------------
ALTER TABLE asset_kits DROP CONSTRAINT IF EXISTS asset_kits_category_id_fkey;
ALTER TABLE asset_kits RENAME COLUMN category_id TO legacy_category_id;
ALTER TABLE asset_kits ADD COLUMN IF NOT EXISTS platform_catalog_category_id UUID
  REFERENCES platform_catalog_categories(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 3. catalog_items.category_id → platform_catalog_categories
-- ---------------------------------------------------------------------------
ALTER TABLE catalog_items DROP CONSTRAINT IF EXISTS catalog_items_category_id_fkey;
ALTER TABLE catalog_items RENAME COLUMN category_id TO legacy_category_id;
ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS platform_catalog_category_id UUID
  REFERENCES platform_catalog_categories(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 4. inventory_items.category_id → platform_catalog_categories
-- ---------------------------------------------------------------------------
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_category_id_fkey;
ALTER TABLE inventory_items RENAME COLUMN category_id TO legacy_category_id;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS platform_catalog_category_id UUID
  REFERENCES platform_catalog_categories(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 5. pm_schedules.asset_category_id → platform_catalog_categories
-- ---------------------------------------------------------------------------
ALTER TABLE pm_schedules DROP CONSTRAINT IF EXISTS pm_schedules_asset_category_id_fkey;
ALTER TABLE pm_schedules RENAME COLUMN asset_category_id TO legacy_asset_category_id;
ALTER TABLE pm_schedules ADD COLUMN IF NOT EXISTS platform_catalog_category_id UUID
  REFERENCES platform_catalog_categories(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 6. pull_list_items.catalog_item_id → platform_catalog_items
-- ---------------------------------------------------------------------------
ALTER TABLE pull_list_items DROP CONSTRAINT IF EXISTS pull_list_items_catalog_item_id_fkey;
ALTER TABLE pull_list_items RENAME COLUMN catalog_item_id TO legacy_catalog_item_id;
ALTER TABLE pull_list_items ADD COLUMN IF NOT EXISTS platform_catalog_item_id UUID
  REFERENCES platform_catalog_items(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 7. advance_items.category_id → platform_catalog_categories
-- ---------------------------------------------------------------------------
ALTER TABLE advance_items DROP CONSTRAINT IF EXISTS advance_items_category_id_fkey;
ALTER TABLE advance_items RENAME COLUMN category_id TO legacy_category_id;
ALTER TABLE advance_items ADD COLUMN IF NOT EXISTS platform_catalog_category_id UUID
  REFERENCES platform_catalog_categories(id) ON DELETE SET NULL;
-- advance_items.platform_catalog_item_id already exists from migration 00120

-- ---------------------------------------------------------------------------
-- 8. advance_items.catalog_item_id → platform_catalog_items (was advancing_catalog_items)
-- ---------------------------------------------------------------------------
ALTER TABLE advance_items DROP CONSTRAINT IF EXISTS advance_items_catalog_item_id_fkey;
ALTER TABLE advance_items RENAME COLUMN catalog_item_id TO legacy_catalog_item_id;
-- platform_catalog_item_id already exists from migration 00120

-- ---------------------------------------------------------------------------
-- 9. advancing_catalog_items.category_id → platform_catalog_categories
-- ---------------------------------------------------------------------------
ALTER TABLE advancing_catalog_items DROP CONSTRAINT IF EXISTS advancing_catalog_items_category_id_fkey;
ALTER TABLE advancing_catalog_items RENAME COLUMN category_id TO legacy_category_id;
ALTER TABLE advancing_catalog_items ADD COLUMN IF NOT EXISTS platform_catalog_category_id UUID
  REFERENCES platform_catalog_categories(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 10. asset_tags.catalog_item_id → platform_catalog_items (was advancing_catalog_items)
-- ---------------------------------------------------------------------------
ALTER TABLE asset_tags DROP CONSTRAINT IF EXISTS asset_tags_catalog_item_id_fkey;
ALTER TABLE asset_tags RENAME COLUMN catalog_item_id TO legacy_catalog_item_id;
ALTER TABLE asset_tags ADD COLUMN IF NOT EXISTS platform_catalog_item_id UUID
  REFERENCES platform_catalog_items(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 11. Drop self-referencing FK on legacy tables (keep tables for data)
-- ---------------------------------------------------------------------------
ALTER TABLE asset_categories DROP CONSTRAINT IF EXISTS asset_categories_parent_id_fkey;
ALTER TABLE advance_categories DROP CONSTRAINT IF EXISTS advance_categories_parent_category_id_fkey;

-- ---------------------------------------------------------------------------
-- 12. Indexes on new FK columns
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_asset_kits_platform_catalog_category
  ON asset_kits(platform_catalog_category_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_platform_catalog_category
  ON catalog_items(platform_catalog_category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_platform_catalog_category
  ON inventory_items(platform_catalog_category_id);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_platform_catalog_category
  ON pm_schedules(platform_catalog_category_id);
CREATE INDEX IF NOT EXISTS idx_pull_list_items_platform_catalog_item
  ON pull_list_items(platform_catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_advance_items_platform_catalog_category
  ON advance_items(platform_catalog_category_id);
CREATE INDEX IF NOT EXISTS idx_advancing_catalog_items_platform_catalog_category
  ON advancing_catalog_items(platform_catalog_category_id);
CREATE INDEX IF NOT EXISTS idx_asset_tags_platform_catalog_item
  ON asset_tags(platform_catalog_item_id);

COMMIT;
