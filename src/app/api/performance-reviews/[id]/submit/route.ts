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

    if (review.status !== 'draft' && review.status !== 'in_progress') {
      return badRequest('Review cannot be submitted in current status');
    }

    // Update review status
    const { data, error } = await supabase
      .from('performance_reviews')
      .update({
        status: 'pending_approval',
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
    console.error('Error submitting performance review:', error);
    return serverError();
  }
}
