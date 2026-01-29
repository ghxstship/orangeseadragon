import { NextRequest, NextResponse } from 'next/server';
import { createUntypedClient as createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get the performance review
    const { data: review, error: fetchError } = await supabase
      .from('performance_reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !review) {
      return NextResponse.json({ error: 'Performance review not found' }, { status: 404 });
    }

    if (review.status !== 'draft' && review.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Review cannot be submitted in current status' },
        { status: 400 }
      );
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error submitting performance review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
