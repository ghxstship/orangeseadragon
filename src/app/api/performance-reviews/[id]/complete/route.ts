import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id } = params;

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
    console.error('Error completing performance review:', error);
    return serverError();
  }
}
