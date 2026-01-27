import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Get the exhibitor
    const { data: exhibitor, error: fetchError } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !exhibitor) {
      return NextResponse.json({ error: 'Exhibitor not found' }, { status: 404 });
    }

    if (exhibitor.status !== 'pending') {
      return NextResponse.json(
        { error: 'Exhibitor is not pending confirmation' },
        { status: 400 }
      );
    }

    // Update exhibitor status
    const { data, error } = await supabase
      .from('exhibitors')
      .update({
        status: 'confirmed',
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
    console.error('Error confirming exhibitor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
