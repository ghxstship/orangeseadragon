import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError } from '@/lib/api/response';

/**
 * POST /api/webhooks/test
 * 
 * Send a test payload to a webhook endpoint to verify connectivity.
 * Creates a delivery log entry with the result.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {

    const { webhook_endpoint_id } = await request.json();

    if (!webhook_endpoint_id) {
      return badRequest('webhook_endpoint_id is required');
    }

    // Fetch the webhook endpoint
    const { data: endpoint, error: fetchError } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('id', webhook_endpoint_id)
      .single();

    if (fetchError || !endpoint) {
      return notFound('Webhook endpoint');
    }

    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook delivery' },
    };

    let responseCode = 0;
    let responseBody = '';
    let status: 'delivered' | 'failed' = 'failed';
    let errorMessage: string | null = null;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'ATLVS-Webhook/1.0',
        ...(endpoint.custom_headers || {}),
      };

      if (endpoint.secret) {
        headers['X-Webhook-Secret'] = endpoint.secret;
      }

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(10000),
      });

      responseCode = response.status;
      responseBody = await response.text();
      status = response.ok ? 'delivered' : 'failed';
      if (!response.ok) {
        errorMessage = `HTTP ${response.status}: ${responseBody.substring(0, 500)}`;
      }
    } catch (fetchErr) {
      errorMessage = fetchErr instanceof Error ? fetchErr.message : 'Unknown fetch error';
    }

    // Log the delivery
    await supabase.from('webhook_deliveries').insert({
      webhook_endpoint_id,
      event_type: 'webhook.test',
      payload: testPayload,
      response_code: responseCode || null,
      response_body: responseBody.substring(0, 5000) || null,
      status,
      delivered_at: status === 'delivered' ? new Date().toISOString() : null,
      error_message: errorMessage,
    });

    // Update endpoint stats
    if (status === 'delivered') {
      await supabase.rpc('increment_field', {
        table_name: 'webhook_endpoints',
        row_id: webhook_endpoint_id,
        field_name: 'success_count',
      }).then(() => {});
    } else {
      await supabase
        .from('webhook_endpoints')
        .update({
          failure_count: (endpoint.failure_count || 0) + 1,
          last_error: errorMessage,
          last_response_code: responseCode || null,
        })
        .eq('id', webhook_endpoint_id);
    }

    await supabase
      .from('webhook_endpoints')
      .update({ last_triggered_at: new Date().toISOString() })
      .eq('id', webhook_endpoint_id);

    return apiSuccess({
      delivered: status === 'delivered',
      status,
      response_code: responseCode,
      error: errorMessage,
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    return serverError();
  }
}
