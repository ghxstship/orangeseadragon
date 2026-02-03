import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServiceClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get the email sequence
    const { data: sequence, error: fetchError } = await supabase
      .from('email_sequences')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !sequence) {
      return NextResponse.json({ error: 'Email sequence not found' }, { status: 404 });
    }

    if (sequence.status === 'active') {
      return NextResponse.json(
        { error: 'Sequence is already active' },
        { status: 400 }
      );
    }

    // Update sequence status
    const { data, error } = await supabase
      .from('email_sequences')
      .update({
        status: 'active',
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
    console.error('Error activating email sequence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
