import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';

/**
 * POST /api/deals/[id]/convert
 * Convert a won deal to a project using a transactional RPC function.
 * Falls back to multi-step approach if the RPC is not deployed yet.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const auth = await requirePolicy('entity.write');
        if (auth.error) return auth.error;
        const { user, supabase } = auth;
        const requestContext = extractRequestContext(request.headers);

        const body = await request.json();
        const { project_name, create_budget = true, budget_template_id = null } = body;

        // Attempt transactional RPC first (atomic, all-or-nothing)
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
            'convert_deal_to_project',
            {
                p_deal_id: id,
                p_user_id: user.id,
                p_project_name: project_name || null,
                p_create_budget: create_budget,
                p_budget_template_id: budget_template_id,
            }
        );

        if (!rpcError && rpcResult) {
            const result = rpcResult as { project: Record<string, unknown>; deal_id: string };

            // Fire-and-forget notification (outside transaction is fine)
            const project = result.project;
            void (async () => {
                try {
                    const { data: deal } = await supabase
                        .from('deals')
                        .select('owner_id, name, organization_id')
                        .eq('id', id)
                        .single();
                    if (deal?.owner_id && deal.owner_id !== user.id) {
                        await supabase.from('notifications').insert({
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
                } catch (e) {
                    captureError(e, 'api.deal_convert.notification_failed', { deal_id: id });
                }
            })();

            return apiSuccess(project, {
                deal_id: id,
                message: 'Deal successfully converted to project',
            });
        }

        // RPC not available — check if it's a "function not found" error
        const isMissingRpc = rpcError?.message?.includes('function') || rpcError?.code === '42883';

        if (rpcError && !isMissingRpc) {
            // RPC exists but raised a business-logic exception
            const msg = rpcError.message || 'Conversion failed';
            if (msg.includes('not found')) return notFound('Deal');
            if (msg.includes('Only won') || msg.includes('already converted') || msg.includes('cannot be')) {
                return badRequest(msg);
            }
            captureError(rpcError, 'api.deal_convert.rpc_failed', { deal_id: id, ...requestContext });
            return serverError(msg);
        }

        // ── Fallback: multi-step (non-transactional) ──────────────────────
        // This path is used when the RPC migration has not been applied yet.
        // Once migration 00116 is deployed, this code path is never reached.

        const { data: deal, error: fetchError } = await supabase
            .from('deals')
            .select('*, company:companies(*), contact:contacts(*)')
            .eq('id', id)
            .single();

        if (fetchError || !deal) return notFound('Deal');
        if (!deal.won_at) return badRequest('Only won deals can be converted to projects');
        if (deal.project_id) return badRequest('Deal has already been converted to a project', { project_id: deal.project_id });

        const baseSlug = (project_name || deal.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const projectSlug = `${baseSlug}-${Date.now().toString(36)}`;

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
                metadata: { converted_from_deal: deal.id, deal_name: deal.name, company_id: deal.company_id, contact_id: deal.contact_id },
                created_by: user.id,
            })
            .select()
            .single();

        if (projectError) {
            captureError(projectError, 'api.deal_convert.project_create_failed', { deal_id: id, ...requestContext });
            return serverError('Failed to create project');
        }

        // Budget
        if (create_budget && deal.value) {
            const { data: budget } = await supabase.from('budgets').insert({
                organization_id: deal.organization_id, project_id: project.id,
                name: `${project.name} Budget`, budget_type: 'fixed_price', period_type: 'project',
                start_date: new Date().toISOString().split('T')[0],
                total_amount: deal.value, revenue_amount: deal.value,
                cost_amount: deal.estimated_costs || 0, status: 'draft', created_by: user.id,
            }).select('id').single();

            if (budget?.id && budget_template_id) {
                const { data: templateItems } = await supabase
                    .from('budget_template_line_items').select('*')
                    .eq('template_id', budget_template_id).order('sort_order');
                if (templateItems?.length) {
                    await supabase.from('budget_line_items').insert(
                        templateItems.map((item: Record<string, unknown>) => ({
                            budget_id: budget.id, category_id: item.category_id,
                            name: item.name, description: item.description, planned_amount: item.default_amount || 0,
                        }))
                    );
                }
            }
        }

        // Link deal
        await supabase.from('deals').update({
            project_id: project.id, converted_project_id: project.id,
            converted_at: new Date().toISOString(), converted_by: user.id, updated_at: new Date().toISOString(),
        }).eq('id', id);

        // Members
        if (deal.owner_id) await supabase.from('project_members').insert({ project_id: project.id, user_id: deal.owner_id, role: 'owner' });
        if (user.id !== deal.owner_id) await supabase.from('project_members').insert({ project_id: project.id, user_id: user.id, role: 'admin' });

        // Task list + kickoff tasks
        await supabase.from('task_lists').insert({ organization_id: deal.organization_id, project_id: project.id, name: 'To Do', position: 0, is_default: true });
        const { data: taskList } = await supabase.from('task_lists').select('id').eq('project_id', project.id).eq('is_default', true).single();
        if (taskList) {
            await supabase.from('tasks').insert(
                ['Kickoff meeting', 'Define project scope', 'Create project timeline', 'Assign team members'].map((title, i) => ({
                    organization_id: deal.organization_id, project_id: project.id, task_list_id: taskList.id,
                    title, status: 'todo', priority: 'medium', task_type: 'task', position: i + 1, created_by: user.id,
                }))
            );
        }

        // Notification + audit
        if (deal.owner_id && deal.owner_id !== user.id) {
            await supabase.from('notifications').insert({
                organization_id: deal.organization_id, user_id: deal.owner_id,
                type: 'deal_converted', title: 'Deal Converted to Project',
                message: `"${deal.name}" has been converted to a project`,
                data: { deal_id: id, project_id: project.id }, entity_type: 'project', entity_id: project.id,
            });
        }
        await supabase.from('audit_logs').insert({
            organization_id: deal.organization_id, user_id: user.id,
            action: 'deal_converted_to_project', entity_type: 'deal', entity_id: id,
            new_values: { project_id: project.id, project_name: project.name },
        });

        return apiSuccess(project, { deal_id: id, message: 'Deal successfully converted to project' });
    } catch (e) {
        captureError(e, 'api.deal_convert.unhandled', { deal_id: id });
        return serverError('Conversion failed');
    }
}
