import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;
    const { searchParams } = new URL(request.url);
    
    const direction = searchParams.get('direction');
    const contactId = searchParams.get('contact_id');
    const companyId = searchParams.get('company_id');
    const dealId = searchParams.get('deal_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('email_messages_with_tracking')
      .select('*')
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (direction) {
      query = query.eq('direction', direction);
    }
    if (contactId) {
      query = query.eq('contact_id', contactId);
    }
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    if (dealId) {
      query = query.eq('deal_id', dealId);
    }

    const { data: emails, error, count } = await query;

    if (error) {
      console.error('Error fetching emails:', error);
      return supabaseError(error);
    }

    return apiSuccess({
      records: emails || [],
      total: count || emails?.length || 0,
    });
  } catch (error) {
    console.error('Error in emails API:', error);
    return serverError();
  }
}
