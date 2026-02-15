// /app/api/email-templates/route.ts
// Email templates API — list and manage email templates

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
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
    console.error('[Email Templates] GET error:', err);
    return serverError('Failed to fetch email templates');
  }
}
