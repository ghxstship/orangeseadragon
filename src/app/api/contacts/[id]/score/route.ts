import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { data: contact, error } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, email, company_id, lead_score, lead_status, last_activity_at, created_at')
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (error) {
      return error.code === 'PGRST116' ? notFound('Contact') : supabaseError(error);
    }

    const { count: dealCount } = await supabase
      .from('deals')
      .select('id', { count: 'exact', head: true })
      .eq('contact_id', id);

    const { count: activityCount } = await supabase
      .from('activity_feed')
      .select('id', { count: 'exact', head: true })
      .eq('entity_id', id);

    const score = contact.lead_score ?? 0;
    const factors = [
      { label: 'Profile completeness', value: contact.email ? 20 : 0, max: 20 },
      { label: 'Deal engagement', value: Math.min((dealCount || 0) * 10, 30), max: 30 },
      { label: 'Activity recency', value: contact.last_activity_at ? 25 : 0, max: 25 },
      { label: 'Interaction frequency', value: Math.min((activityCount || 0) * 5, 25), max: 25 },
    ];

    return apiSuccess({
      score,
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F',
      factors,
      lastUpdated: contact.last_activity_at || contact.created_at,
    });
  } catch (err) {
    captureError(err, 'api.contacts.score.error');
    return serverError('Failed to calculate contact score');
  }
}
