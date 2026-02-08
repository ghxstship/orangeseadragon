import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, supabaseError, serverError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
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
      .order('name', { ascending: true });

    if (isActive === 'true') {
      query = query.eq('is_active', true);
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data: pipelines, error } = await query;

    if (error) {
      console.error('Error fetching pipelines:', error);
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
    console.error('Error in pipelines API:', error);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
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
      console.error('Error creating pipeline:', error);
      return supabaseError(error);
    }

    // Create default stages if this is a new pipeline
    if (pipeline && body.create_default_stages !== false) {
      const defaultStages = [
        { name: 'Prospecting', slug: 'prospecting', position: 1, probability: 10, color: '#94a3b8' },
        { name: 'Qualification', slug: 'qualification', position: 2, probability: 25, color: '#3b82f6' },
        { name: 'Proposal', slug: 'proposal', position: 3, probability: 50, color: '#eab308' },
        { name: 'Negotiation', slug: 'negotiation', position: 4, probability: 75, color: '#f97316' },
        { name: 'Closed Won', slug: 'closed-won', position: 5, probability: 100, color: '#22c55e', is_won: true },
        { name: 'Closed Lost', slug: 'closed-lost', position: 6, probability: 0, color: '#ef4444', is_lost: true },
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
    console.error('Error in pipelines POST:', error);
    return serverError();
  }
}
