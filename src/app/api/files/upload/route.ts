// /app/api/files/upload/route.ts
// File upload API — stores in Supabase Storage, records in file_attachments table

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MiB — matches Supabase Storage config
const MAX_FILES_PER_REQUEST = 10;

const ALLOWED_MIME_PREFIXES = [
  'image/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'text/plain',
  'text/csv',
  'audio/',
  'video/',
] as const;

function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/\.\./g, '_')
    .replace(/[\/\\]/g, '_')
    .replace(/[^a-zA-Z0-9._\- ]/g, '_')
    .slice(0, 255);
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const formData = await request.formData();
    const entityId = formData.get('entityId') as string;
    const files = formData.getAll('files') as File[];

    if (!entityId || files.length === 0) {
      return badRequest('entityId and at least one file are required');
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return badRequest(`Maximum ${MAX_FILES_PER_REQUEST} files per request`);
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return badRequest(`File "${sanitizeFilename(file.name)}" exceeds maximum size of 50 MiB`);
      }
      if (!file.type || !isAllowedMimeType(file.type)) {
        return badRequest(`File type "${file.type || 'unknown'}" is not allowed`);
      }
    }

    const uploaded: Array<{ id: string; name: string; url: string }> = [];

    for (const file of files) {
      // Upload to Supabase Storage
      const safeName = sanitizeFilename(file.name);
      const ext = safeName.split('.').pop() || 'bin';
      const storagePath = `attachments/${entityId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        captureError(uploadError, 'api.files.upload.error');
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(storagePath);

      // Record in database
      const { data: record, error: dbError } = await supabase
        .from('file_attachments')
        .insert({
          entity_id: entityId,
          name: safeName,
          size: file.size,
          mime_type: file.type,
          storage_path: storagePath,
          url: urlData.publicUrl,
          uploaded_by: user.id,
          uploaded_by_name: user.user_metadata?.full_name || user.email || 'Unknown',
        })
        .select('id')
        .single();

      if (dbError) {
        captureError(dbError, 'api.files.upload.error');
        continue;
      }

      uploaded.push({ id: record.id, name: safeName, url: urlData.publicUrl });
    }

    return apiSuccess({ uploaded, count: uploaded.length });
  } catch (err) {
    captureError(err, 'api.files.upload.error');
    return serverError('Failed to upload files');
  }
}
