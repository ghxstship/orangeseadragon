-- Migration: Storage Buckets for Avatars and Organization Assets
-- Created: 2026-02-20
-- Description: Creates Supabase Storage buckets for user avatars and org logos
--              with appropriate RLS policies for authenticated upload/read.

-- ============================================================================
-- 1. AVATARS BUCKET — user profile photos
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view avatars (public bucket)
DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;
CREATE POLICY "Public avatar read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- 2. ORG-ASSETS BUCKET — organization logos, branding
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'org-assets',
  'org-assets',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view org assets (public bucket)
DROP POLICY IF EXISTS "Public org asset read" ON storage.objects;
CREATE POLICY "Public org asset read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'org-assets');

-- Org members can upload to their org folder
DROP POLICY IF EXISTS "Org members upload assets" ON storage.objects;
CREATE POLICY "Org members upload assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'org-assets'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text FROM public.organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Org members can update their org's assets
DROP POLICY IF EXISTS "Org members update assets" ON storage.objects;
CREATE POLICY "Org members update assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'org-assets'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text FROM public.organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Org members can delete their org's assets
DROP POLICY IF EXISTS "Org members delete assets" ON storage.objects;
CREATE POLICY "Org members delete assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'org-assets'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text FROM public.organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
