import { NextRequest, NextResponse } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * GET /api/documents/[id]/download
 * Download a document. Checks for a file attachment first (Supabase Storage),
 * then falls back to exporting the document content as HTML.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return badRequest('Document ID is required');
  }

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    // Try to find a file attachment for this document
    const { data: attachment } = await supabase
      .from('file_attachments')
      .select('id, file_name, file_path, mime_type')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attachment?.file_path) {
      // Download from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('attachments')
        .download(attachment.file_path);

      if (downloadError) {
        captureError(downloadError, 'api.documents.id.download.error');
        // Fall through to content export
      } else if (fileData) {
        const arrayBuffer = await fileData.arrayBuffer();
        return new NextResponse(arrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': attachment.mime_type || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${attachment.file_name || 'document'}"`,
          },
        });
      }
    }

    // Fallback: export document content as HTML
    const { data: document, error } = await supabase
      .from('documents')
      .select('id, title, content, content_format, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) return supabaseError(error);
    if (!document) return notFound('Document');

    const title = document.title || 'Untitled Document';
    const content = document.content || '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .meta { color: #6b7280; font-size: 13px; margin-bottom: 32px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Last updated: ${document.updated_at ? new Date(document.updated_at).toLocaleDateString() : '—'}</p>
  <div>${content}</div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.html"`,
      },
    });
  } catch (err) {
    captureError(err, 'api.documents.id.download.error');
    return serverError('Failed to download document');
  }
}
