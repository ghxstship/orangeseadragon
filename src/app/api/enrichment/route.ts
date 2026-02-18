import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

const ENTITY_TABLE_MAP: Record<string, string> = {
  contact: 'contacts',
  company: 'companies',
};

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { searchParams } = request.nextUrl;
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');

    if (!entityType || !entityId) {
      return badRequest('entity_type and entity_id are required');
    }

    const tableName = ENTITY_TABLE_MAP[entityType];
    if (!tableName) {
      return badRequest(`Unsupported entity type: ${entityType}`);
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', entityId)
      .eq('organization_id', membership.organization_id)
      .single();

    if (error) {
      return error.code === 'PGRST116' ? notFound(entityType) : supabaseError(error);
    }

    const enrichmentData = {
      entity: data,
      enrichment: {
        completeness: calculateCompleteness(data),
        suggestions: generateSuggestions(data, entityType),
        lastEnriched: data.enriched_at || null,
      },
    };

    return apiSuccess(enrichmentData);
  } catch (err) {
    captureError(err, 'api.enrichment.get.error');
    return serverError('Failed to fetch enrichment data');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const body = await request.json();
    const { entity_type, entity_id } = body;

    if (!entity_type || !entity_id) {
      return badRequest('entity_type and entity_id are required');
    }

    const tableName = ENTITY_TABLE_MAP[entity_type];
    if (!tableName) {
      return badRequest(`Unsupported entity type: ${entity_type}`);
    }

    const { data, error } = await supabase
      .from(tableName)
      .update({ enriched_at: new Date().toISOString() })
      .eq('id', entity_id)
      .eq('organization_id', membership.organization_id)
      .select()
      .single();

    if (error) {
      return error.code === 'PGRST116' ? notFound(entity_type) : supabaseError(error);
    }

    return apiSuccess({
      enriched: true,
      entity: data,
      completeness: calculateCompleteness(data),
    });
  } catch (err) {
    captureError(err, 'api.enrichment.post.error');
    return serverError('Failed to enrich entity');
  }
}

function calculateCompleteness(record: Record<string, unknown>): number {
  const fields = Object.entries(record).filter(
    ([key]) => !['id', 'organization_id', 'created_at', 'updated_at', 'deleted_at'].includes(key)
  );
  const filled = fields.filter(([, value]) => value !== null && value !== '' && value !== undefined);
  return Math.round((filled.length / Math.max(fields.length, 1)) * 100);
}

function generateSuggestions(record: Record<string, unknown>, entityType: string): string[] {
  const suggestions: string[] = [];
  if (entityType === 'contact') {
    if (!record.email) suggestions.push('Add email address');
    if (!record.phone) suggestions.push('Add phone number');
    if (!record.company_id) suggestions.push('Link to a company');
    if (!record.linkedin_url) suggestions.push('Add LinkedIn profile');
  } else if (entityType === 'company') {
    if (!record.website) suggestions.push('Add website URL');
    if (!record.industry) suggestions.push('Set industry');
    if (!record.employee_count) suggestions.push('Add employee count');
    if (!record.annual_revenue) suggestions.push('Add annual revenue');
  }
  return suggestions;
}
