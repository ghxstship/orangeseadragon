import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { searchParams } = new URL(request.url);
    
    const isActive = searchParams.get('is_active');
    const organizationId = searchParams.get('organization_id');

    let query = supabase
      .from('pipelines')
      .select(`
        *,
        pipeline_stages (
          id,
          name,
          slug,
          position,
          probability,
          color,
          rotting_days,
          is_won,
          is_lost
        )
      `)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (isActive === 'true') {
      query = query.eq('is_active', true);
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data: pipelines, error } = await query;

    if (error) {
      captureError(error, 'api.pipelines.fetch_failed');
      return supabaseError(error);
    }

    // Get deal counts for each pipeline
    const pipelinesWithCounts = await Promise.all(
      (pipelines || []).map(async (pipeline) => {
        const { count } = await supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })
          .eq('pipeline_id', pipeline.id);

        return {
          ...pipeline,
          deal_count: count || 0,
        };
      })
    );

    return apiSuccess(pipelinesWithCounts, { total: pipelinesWithCounts.length });
  } catch (error) {
    captureError(error, 'api.pipelines.get_unhandled');
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const body = await request.json();

    const { data: pipeline, error } = await supabase
      .from('pipelines')
      .insert({
        name: body.name,
        description: body.description,
        pipeline_type: body.pipeline_type || 'sales',
        is_default: body.is_default || false,
        is_active: true,
        settings: body.settings || {},
      })
      .select()
      .single();

    if (error) {
      captureError(error, 'api.pipelines.create_failed');
      return supabaseError(error);
    }

    // Create default stages if this is a new pipeline
    if (pipeline && body.create_default_stages !== false) {
      const defaultStages = [
        { name: 'Prospecting', slug: 'prospecting', position: 1, probability: 10, color: 'hsl(var(--muted-foreground))' },
        { name: 'Qualification', slug: 'qualification', position: 2, probability: 25, color: 'hsl(var(--primary))' },
        { name: 'Proposal', slug: 'proposal', position: 3, probability: 50, color: 'hsl(var(--chart-4))' },
        { name: 'Negotiation', slug: 'negotiation', position: 4, probability: 75, color: 'hsl(var(--chart-expense))' },
        { name: 'Closed Won', slug: 'closed-won', position: 5, probability: 100, color: 'hsl(var(--chart-income))', is_won: true },
        { name: 'Closed Lost', slug: 'closed-lost', position: 6, probability: 0, color: 'hsl(var(--destructive))', is_lost: true },
      ];

      await supabase.from('pipeline_stages').insert(
        defaultStages.map((stage) => ({
          ...stage,
          pipeline_id: pipeline.id,
          organization_id: pipeline.organization_id,
        }))
      );
    }

    return apiCreated(pipeline);
  } catch (error) {
    captureError(error, 'api.pipelines.post_unhandled');
    return serverError();
  }
}
