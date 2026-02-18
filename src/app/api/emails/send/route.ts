import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiCreated, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const body = await request.json();

    const {
      email_account_id,
      to_addresses,
      cc_addresses,
      bcc_addresses,
      subject,
      body_html,
      body_text,
      contact_id,
      company_id,
      deal_id,
      in_reply_to,
      template_id,
      sequence_id,
      sequence_step_id,
    } = body;

    // Validate required fields
    if (!email_account_id) {
      return badRequest('Email account is required');
    }
    if (!to_addresses || to_addresses.length === 0) {
      return badRequest('At least one recipient is required');
    }

    // Get the email account
    const { data: account, error: accountError } = await supabase
      .from('email_accounts')
      .select('id, organization_id, email_address, display_name')
      .eq('id', email_account_id)
      .single();

    if (accountError || !account) {
      return notFound('Email account');
    }

    // Create the email message record
    const { data: message, error: messageError } = await supabase
      .from('email_messages')
      .insert({
        organization_id: account.organization_id,
        email_account_id,
        direction: 'outbound',
        status: 'queued',
        from_address: account.email_address,
        from_name: account.display_name,
        to_addresses,
        cc_addresses: cc_addresses || [],
        bcc_addresses: bcc_addresses || [],
        subject,
        body_html,
        body_text: body_text || stripHtml(body_html),
        snippet: createSnippet(body_text || stripHtml(body_html)),
        contact_id,
        company_id,
        deal_id,
        in_reply_to,
        template_id,
        sequence_id,
        sequence_step_id,
      })
      .select()
      .single();

    if (messageError) {
      captureError(messageError, 'api.emails.send.error');
      return supabaseError(messageError);
    }

    // In production, this would queue the email for sending via the provider
    // For now, we'll simulate immediate sending
    const { error: updateError } = await supabase
      .from('email_messages')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', message.id);

    if (updateError) {
      captureError(updateError, 'api.emails.send.error');
    }

    // Create tracking event
    await supabase.from('email_tracking_events').insert({
      email_message_id: message.id,
      event_type: 'sent',
      occurred_at: new Date().toISOString(),
    });

    return apiCreated({
      id: message.id,
      status: 'sent',
    }, { message: 'Email sent successfully' });

  } catch (error) {
    captureError(error, 'api.emails.send.error');
    return serverError('Failed to send email');
  }
}

// Helper to strip HTML tags
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper to create snippet
function createSnippet(text: string, maxLength: number = 200): string {
  if (!text) return '';
  const cleaned = text.substring(0, maxLength);
  return cleaned.length < text.length ? cleaned + '...' : cleaned;
}
