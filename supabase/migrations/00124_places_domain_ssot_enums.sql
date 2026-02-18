-- ============================================================================
-- Migration 00124: Places Domain SSOT — Part 1: Expand location_type enum
-- ============================================================================
-- This must run in its own migration (outside a transaction) because
-- PostgreSQL cannot use newly added enum values in the same transaction.
-- ============================================================================

ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'room';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'zone';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'stage';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'loading_dock';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'green_room';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'backstage';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'front_of_house';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'parking';
ALTER TYPE location_type ADD VALUE IF NOT EXISTS 'site';
