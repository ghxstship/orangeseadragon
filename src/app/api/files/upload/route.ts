// /app/api/files/upload/route.ts
// File upload API — stores in Supabase Storage, records in file_attachments table

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, serverError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const formData = await request.formData();
    const entityId = formData.get('entityId') as string;
    const files = formData.getAll('files') as File[];

    if (!entityId || files.length === 0) {
      return new Response(JSON.stringify({ error: 'entityId and at least one file are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const uploaded: Array<{ id: string; name: string; url: string }> = [];

    for (const file of files) {
      // Upload to Supabase Storage
      const ext = file.name.split('.').pop() || 'bin';
      const storagePath = `attachments/${entityId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('[Files Upload] Storage error:', uploadError);
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
          name: file.name,
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
        console.error('[Files Upload] DB error:', dbError);
        continue;
      }

      uploaded.push({ id: record.id, name: file.name, url: urlData.publicUrl });
    }

    return apiSuccess({ uploaded, count: uploaded.length });
  } catch (err) {
    console.error('[Files Upload] Error:', err);
    return serverError('Failed to upload files');
  }
}
