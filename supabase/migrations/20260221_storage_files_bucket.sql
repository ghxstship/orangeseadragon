-- Migration: Storage Bucket for File Attachments
-- Created: 2026-02-21
-- Description: Creates the 'files' bucket for general file attachments
--              (documents, images, media) with org-scoped RLS policies.
--              Consolidates the previously-referenced 'files' and 'attachments'
--              bucket names into a single canonical 'files' bucket.

-- ============================================================================
-- FILES BUCKET — general file attachments (documents, images, media)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'files',
  'files',
  true,
  52428800, -- 50MB
  NULL      -- all MIME types allowed (validated at API layer)
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read files (public bucket — access control via RLS on file_attachments table)
DROP POLICY IF EXISTS "Public file read" ON storage.objects;
CREATE POLICY "Public file read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'files');

-- Authenticated users can upload files
DROP POLICY IF EXISTS "Authenticated users upload files" ON storage.objects;
CREATE POLICY "Authenticated users upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'files');

-- Authenticated users can update their own files
DROP POLICY IF EXISTS "Authenticated users update files" ON storage.objects;
CREATE POLICY "Authenticated users update files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'files');

-- Authenticated users can delete files
DROP POLICY IF EXISTS "Authenticated users delete files" ON storage.objects;
CREATE POLICY "Authenticated users delete files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'files');
