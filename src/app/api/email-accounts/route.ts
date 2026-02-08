import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { data: accounts, error } = await supabase
      .from('email_accounts')
      .select('id, email_address, display_name, provider, is_default, sync_enabled, last_sync_at, sync_status')
      .eq('sync_enabled', true)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching email accounts:', error);
      return supabaseError(error);
    }

    return apiSuccess(accounts || [], { total: accounts?.length || 0 });
  } catch (error) {
    console.error('Error in email-accounts API:', error);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();

    // Get user's organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return badRequest('No organization found');
    }

    const { data: account, error } = await supabase
      .from('email_accounts')
      .insert({
        organization_id: membership.organization_id,
        user_id: user.id,
        provider: body.provider,
        email_address: body.email_address,
        display_name: body.display_name,
        access_token: body.access_token,
        refresh_token: body.refresh_token,
        token_expires_at: body.token_expires_at,
        smtp_host: body.smtp_host,
        smtp_port: body.smtp_port,
        smtp_username: body.smtp_username,
        smtp_password: body.smtp_password,
        smtp_use_tls: body.smtp_use_tls,
        sync_enabled: body.sync_enabled ?? true,
        sync_from_date: body.sync_from_date,
        is_default: body.is_default ?? false,
        signature_html: body.signature_html,
        signature_text: body.signature_text,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating email account:', error);
      return supabaseError(error);
    }

    return apiCreated(account);
  } catch (error) {
    console.error('Error in email-accounts POST:', error);
    return serverError();
  }
}
