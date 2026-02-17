import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * GET /api/dashboards/:id/widgets
 * 
 * List all widgets for a specific dashboard, ordered by position.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { id: dashboardId } = await params;

    const { data: widgets, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('position_y', { ascending: true })
      .order('position_x', { ascending: true });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(widgets);
  } catch (error) {
    captureError(error, 'api.dashboards.id.widgets.error');
    return serverError('Failed to process dashboard widgets');
  }
}

/**
 * POST /api/dashboards/:id/widgets
 * 
 * Add a new widget to a dashboard.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { id: dashboardId } = await params;
    const body = await request.json();

    const {
      title,
      widget_type,
      data_source,
      config,
      position_x,
      position_y,
      width,
      height,
    } = body;

    if (!title || !widget_type) {
      return badRequest('title and widget_type are required');
    }

    const { data: widget, error: insertError } = await supabase
      .from('dashboard_widgets')
      .insert({
        dashboard_id: dashboardId,
        title,
        widget_type,
        data_source: data_source || null,
        config: config || {},
        position_x: position_x ?? 0,
        position_y: position_y ?? 0,
        width: width ?? 4,
        height: height ?? 3,
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    return apiCreated(widget);
  } catch (error) {
    captureError(error, 'api.dashboards.id.widgets.error');
    return serverError('Failed to process dashboard widgets');
  }
}

/**
 * PATCH /api/dashboards/:id/widgets
 * 
 * Bulk update widget positions (for drag-and-drop layout changes).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { id: dashboardId } = await params;
    const { widgets } = await request.json();

    if (!Array.isArray(widgets)) {
      return badRequest('widgets array is required');
    }

    const updates = widgets.map((w: { id: string; position_x: number; position_y: number; width: number; height: number }) =>
      supabase
        .from('dashboard_widgets')
        .update({
          position_x: w.position_x,
          position_y: w.position_y,
          width: w.width,
          height: w.height,
        })
        .eq('id', w.id)
        .eq('dashboard_id', dashboardId)
    );

    await Promise.all(updates);

    return apiSuccess({ updated: widgets.length });
  } catch (error) {
    captureError(error, 'api.dashboards.id.widgets.error');
    return serverError('Failed to process dashboard widgets');
  }
}
