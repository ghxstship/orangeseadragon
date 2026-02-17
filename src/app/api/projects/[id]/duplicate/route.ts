import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/projects/[id]/duplicate
 * Duplicate a project with date reset and optional scope selection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const {
      new_name,
      start_date,
      include_tasks = true,
      include_budget = false,
      include_team = true,
    } = body;

    // Fetch source project
    const { data: source, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !source) {
      return notFound('Project');
    }

    if (!new_name) {
      return badRequest('new_name is required');
    }

    // Generate slug
    const baseSlug = new_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const projectSlug = `${baseSlug}-${Date.now().toString(36)}`;

    // Calculate date offset if new start_date provided
    const dateOffset = start_date && source.start_date
      ? new Date(start_date).getTime() - new Date(source.start_date).getTime()
      : 0;

    // Create duplicated project
    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert({
        organization_id: source.organization_id,
        name: new_name,
        slug: projectSlug,
        description: source.description,
        status: 'planning',
        visibility: source.visibility,
        priority: source.priority,
        project_type: source.project_type,
        budget_amount: source.budget_amount,
        budget_currency: source.budget_currency,
        start_date: start_date || source.start_date,
        end_date: source.end_date && dateOffset
          ? new Date(new Date(source.end_date).getTime() + dateOffset).toISOString().split('T')[0]
          : source.end_date,
        metadata: {
          ...((source.metadata as Record<string, unknown>) || {}),
          duplicated_from: source.id,
          duplicated_from_name: source.name,
        },
        duplicated_from_id: source.id,
        duplicated_at: new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      return supabaseError(createError);
    }

    // Duplicate tasks with date offset
    if (include_tasks) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .is('deleted_at', null)
        .order('position');

      if (tasks && tasks.length > 0) {
        const newTasks = tasks.map((task: Record<string, unknown>) => ({
          organization_id: source.organization_id,
          project_id: newProject.id,
          task_list_id: task.task_list_id,
          title: task.title,
          description: task.description,
          status: 'todo',
          priority: task.priority,
          task_type: task.task_type,
          position: task.position,
          due_date: task.due_date && dateOffset
            ? new Date(new Date(task.due_date as string).getTime() + dateOffset).toISOString().split('T')[0]
            : task.due_date,
          start_date: task.start_date && dateOffset
            ? new Date(new Date(task.start_date as string).getTime() + dateOffset).toISOString().split('T')[0]
            : task.start_date,
          estimated_hours: task.estimated_hours,
          created_by: user.id,
        }));
        await supabase.from('tasks').insert(newTasks);
      }
    }

    // Duplicate budget structure (without actuals)
    if (include_budget) {
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('project_id', id)
        .is('deleted_at', null);

      if (budgets && budgets.length > 0) {
        for (const budget of budgets) {
          const { data: newBudget } = await supabase
            .from('budgets')
            .insert({
              organization_id: source.organization_id,
              project_id: newProject.id,
              name: budget.name,
              budget_type: budget.budget_type,
              period_type: budget.period_type,
              total_amount: budget.total_amount,
              revenue_amount: budget.revenue_amount,
              cost_amount: budget.cost_amount,
              status: 'draft',
              created_by: user.id,
            })
            .select('id')
            .single();

          if (newBudget) {
            const { data: lineItems } = await supabase
              .from('budget_line_items')
              .select('*')
              .eq('budget_id', budget.id);

            if (lineItems && lineItems.length > 0) {
              const newItems = lineItems.map((item: Record<string, unknown>) => ({
                budget_id: newBudget.id,
                category_id: item.category_id,
                name: item.name,
                description: item.description,
                planned_amount: item.planned_amount,
                actual_amount: 0,
              }));
              await supabase.from('budget_line_items').insert(newItems);
            }
          }
        }
      }
    }

    // Duplicate team members
    if (include_team) {
      const { data: members } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', id);

      if (members && members.length > 0) {
        const newMembers = members.map((m: Record<string, unknown>) => ({
          project_id: newProject.id,
          user_id: m.user_id,
          role: m.role,
        }));
        await supabase.from('project_members').insert(newMembers);
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: source.organization_id,
      user_id: user.id,
      action: 'project_duplicated',
      entity_type: 'project',
      entity_id: newProject.id,
      new_values: {
        source_project_id: id,
        include_tasks,
        include_budget,
        include_team,
      },
    });

    return apiSuccess(newProject, {
      source_project_id: id,
      message: 'Project duplicated successfully',
    });
  } catch (e) {
    captureError(e, 'api.projects.id.duplicate.error');
    return serverError('Duplication failed');
  }
}
