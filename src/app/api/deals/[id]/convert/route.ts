import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/deals/[id]/convert
 * Convert a won deal to a project
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const auth = await requireAuth();
        if (auth.error) return auth.error;
        const { user, supabase } = auth;

        const body = await request.json();
        const { project_name, create_budget = true, budget_template_id = null } = body;

        // Get the deal
        const { data: deal, error: fetchError } = await supabase
            .from('deals')
            .select(`
        *,
        company:companies(*),
        contact:contacts(*)
      `)
            .eq('id', id)
            .single();

        if (fetchError || !deal) {
            return notFound('Deal');
        }

        // Check if deal is won
        if (!deal.won_at) {
            return badRequest('Only won deals can be converted to projects');
        }

        // Check if already converted
        if (deal.project_id) {
            return badRequest('Deal has already been converted to a project', { project_id: deal.project_id });
        }

        // Generate project slug
        const baseSlug = (project_name || deal.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const timestamp = Date.now().toString(36);
        const projectSlug = `${baseSlug}-${timestamp}`;

        // Create the project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                organization_id: deal.organization_id,
                name: project_name || deal.name,
                slug: projectSlug,
                description: deal.description,
                status: 'planning',
                visibility: 'team',
                priority: 'medium',
                budget_amount: deal.value,
                budget_currency: deal.currency || 'USD',
                start_date: new Date().toISOString().split('T')[0],
                metadata: {
                    converted_from_deal: deal.id,
                    deal_name: deal.name,
                    company_id: deal.company_id,
                    contact_id: deal.contact_id,
                },
                created_by: user.id,
            })
            .select()
            .single();

        if (projectError) {
            return supabaseError(projectError);
        }

        // Create budget from deal value if requested
        let budgetId: string | null = null;
        if (create_budget && deal.value) {
            const { data: budget } = await supabase
                .from('budgets')
                .insert({
                    organization_id: deal.organization_id,
                    project_id: project.id,
                    name: `${project.name} Budget`,
                    budget_type: 'fixed_price',
                    period_type: 'project',
                    start_date: new Date().toISOString().split('T')[0],
                    total_amount: deal.value,
                    revenue_amount: deal.value,
                    cost_amount: deal.estimated_costs || 0,
                    status: 'draft',
                    created_by: user.id,
                })
                .select('id')
                .single();

            budgetId = budget?.id || null;

            // Copy template line items if a budget template was provided
            if (budgetId && budget_template_id) {
                const { data: templateItems } = await supabase
                    .from('budget_template_line_items')
                    .select('*')
                    .eq('template_id', budget_template_id)
                    .order('sort_order');

                if (templateItems && templateItems.length > 0) {
                    const lineItems = templateItems.map((item: Record<string, unknown>) => ({
                        budget_id: budgetId,
                        category_id: item.category_id,
                        name: item.name,
                        description: item.description,
                        planned_amount: item.default_amount || 0,
                    }));
                    await supabase.from('budget_line_items').insert(lineItems);
                }
            }
        }

        // Link deal to project (legacy field + new conversion tracking fields)
        await supabase
            .from('deals')
            .update({
                project_id: project.id,
                converted_project_id: project.id,
                converted_at: new Date().toISOString(),
                converted_by: user.id,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        // Add deal owner as project member
        if (deal.owner_id) {
            await supabase
                .from('project_members')
                .insert({
                    project_id: project.id,
                    user_id: deal.owner_id,
                    role: 'owner',
                });
        }

        // Add the current user as admin if different from owner
        if (user.id !== deal.owner_id) {
            await supabase
                .from('project_members')
                .insert({
                    project_id: project.id,
                    user_id: user.id,
                    role: 'admin',
                });
        }

        // Create default task list
        await supabase
            .from('task_lists')
            .insert({
                organization_id: deal.organization_id,
                project_id: project.id,
                name: 'To Do',
                position: 0,
                is_default: true,
            });

        // Create initial kickoff tasks
        const { data: taskList } = await supabase
            .from('task_lists')
            .select('id')
            .eq('project_id', project.id)
            .eq('is_default', true)
            .single();

        if (taskList) {
            const kickoffTasks = [
                { title: 'Kickoff meeting', position: 1 },
                { title: 'Define project scope', position: 2 },
                { title: 'Create project timeline', position: 3 },
                { title: 'Assign team members', position: 4 },
            ];

            const tasksToCreate = kickoffTasks.map(task => ({
                organization_id: deal.organization_id,
                project_id: project.id,
                task_list_id: taskList.id,
                title: task.title,
                status: 'todo',
                priority: 'medium',
                task_type: 'task',
                position: task.position,
                created_by: user.id,
            }));

            await supabase.from('tasks').insert(tasksToCreate);
        }

        // Notify deal owner about conversion
        if (deal.owner_id && deal.owner_id !== user.id) {
            await supabase
                .from('notifications')
                .insert({
                    organization_id: deal.organization_id,
                    user_id: deal.owner_id,
                    type: 'deal_converted',
                    title: 'Deal Converted to Project',
                    message: `"${deal.name}" has been converted to a project`,
                    data: { deal_id: id, project_id: project.id },
                    entity_type: 'project',
                    entity_id: project.id,
                });
        }

        // Audit log
        await supabase
            .from('audit_logs')
            .insert({
                organization_id: deal.organization_id,
                user_id: user.id,
                action: 'deal_converted_to_project',
                entity_type: 'deal',
                entity_id: id,
                new_values: {
                    project_id: project.id,
                    project_name: project.name,
                },
            });

        return apiSuccess(project, {
            deal_id: id,
            message: 'Deal successfully converted to project',
        });
    } catch (e) {
        console.error('[API] Deal conversion error:', e);
        return serverError('Conversion failed');
    }
}
