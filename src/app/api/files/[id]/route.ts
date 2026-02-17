// /app/api/files/[id]/route.ts
// File delete API — removes from storage and database

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const { id } = await params;

  try {
    // Get file record to find storage path
    const { data: file, error: fetchError } = await supabase
      .from('file_attachments')
      .select('id, storage_path')
      .eq('id', id)
      .single();

    if (fetchError || !file) {
      return supabaseError(fetchError || { message: 'File not found', code: '404' });
    }

    // Delete from storage
    if (file.storage_path) {
      await supabase.storage
        .from('files')
        .remove([file.storage_path]);
    }

    // Delete database record
    const { error: deleteError } = await supabase
      .from('file_attachments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return supabaseError(deleteError);
    }

    return apiSuccess({ deleted: true });
  } catch (err) {
    captureError(err, 'api.files.id.error');
    return serverError('Failed to delete file');
  }
}
