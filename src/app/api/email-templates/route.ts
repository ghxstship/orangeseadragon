// /app/api/email-templates/route.ts
// Email templates API — list and manage email templates

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const category = request.nextUrl.searchParams.get('category');

  try {
    let query = supabase
      .from('email_templates')
      .select('id, name, subject, category, is_default, updated_at')
      .order('name', { ascending: true });

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) return supabaseError(error);

    return apiSuccess(data || []);
  } catch (err) {
    captureError(err, 'api.email-templates.error');
    return serverError('Failed to fetch email templates');
  }
}
