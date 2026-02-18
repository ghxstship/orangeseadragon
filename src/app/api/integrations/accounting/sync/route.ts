import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/integrations/accounting/sync
 * Create or update an accounting sync mapping (QuickBooks, Xero, Sage, FreshBooks)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(['owner', 'admin', 'controller']);
    if (auth.error) return auth.error;
    const { user, supabase, membership } = auth;

    const body = await request.json();
    const {
      provider,
      internal_entity_type,
      internal_entity_id,
      external_entity_id,
      external_entity_type,
      sync_direction = 'push',
    } = body;

    if (!provider || !internal_entity_type || !internal_entity_id || !external_entity_id || !external_entity_type) {
      return badRequest('provider, internal_entity_type, internal_entity_id, external_entity_id, and external_entity_type are required');
    }

    if (!['quickbooks', 'xero', 'sage', 'freshbooks'].includes(provider)) {
      return badRequest('provider must be one of: quickbooks, xero, sage, freshbooks');
    }

    const { data: mapping, error: upsertError } = await supabase
      .from('accounting_sync_mappings')
      .upsert({
        organization_id: membership.organization_id,
        provider,
        internal_entity_type,
        internal_entity_id,
        external_entity_id,
        external_entity_type,
        sync_direction,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id,provider,internal_entity_type,internal_entity_id',
      })
      .select()
      .single();

    if (upsertError) {
      return supabaseError(upsertError);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: 'accounting_sync_mapping_created',
      entity_type: 'accounting_sync_mapping',
      entity_id: mapping.id,
      new_values: { provider, internal_entity_type, external_entity_type },
    });

    return apiCreated(mapping);
  } catch (e) {
    captureError(e, 'api.integrations.accounting.sync.error');
    return serverError('Failed to create accounting sync mapping');
  }
}

/**
 * GET /api/integrations/accounting/sync
 * List accounting sync mappings for the org
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(['owner', 'admin', 'controller']);
    if (auth.error) return auth.error;
    const { supabase, membership } = auth;

    const provider = request.nextUrl.searchParams.get('provider');

    let query = supabase
      .from('accounting_sync_mappings')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (provider) {
      query = query.eq('provider', provider);
    }

    const { data, error } = await query;

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data || []);
  } catch (e) {
    captureError(e, 'api.integrations.accounting.sync.error');
    return serverError('Failed to list accounting sync mappings');
  }
}
