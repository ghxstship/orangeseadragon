import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id } = await params;

    // Get the performance review
    const { data: review, error: fetchError } = await supabase
      .from('performance_reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !review) {
      return notFound('Performance review');
    }

    if (review.status !== 'pending_approval') {
      return badRequest('Review must be pending approval to complete');
    }

    // Update review status
    const { data, error } = await supabase
      .from('performance_reviews')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    captureError(error, 'api.performance-reviews.id.complete.error');
    return serverError('Failed to complete performance review');
  }
}
