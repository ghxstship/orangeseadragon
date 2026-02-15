import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound } from '@/lib/api/response';
import { resolveEntityContext } from '@/lib/api/entity-access';
import { captureError, extractRequestContext } from '@/lib/observability';
import { auditService } from '@/lib/audit/service';

/**
 * GENERIC ENTITY BATCH API
 *
 * POST /api/[entity]/batch
 *
 * Accepts an array of operations and executes them sequentially.
 * Each operation specifies an action (create, update, delete) and its payload.
 *
 * Request body:
 *   { operations: [{ action: 'create'|'update'|'delete', id?: string, data?: object }] }
 *
 * Response:
 *   { data: { results: [{ action, id, success, data?, error? }], summary: { total, succeeded, failed } } }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    const { entity } = await params;
    const ctx = resolveEntityContext(entity);
    if (!ctx) return notFound('Entity');
    const { tableName } = ctx;

    const auth = await requirePolicy('entity.write');
    if (auth.error) return auth.error;
    const { supabase, user, membership } = auth;
    const requestContext = extractRequestContext(request.headers);

    let body: { operations: BatchOperation[] };
    try {
        body = await request.json();
    } catch {
        return badRequest('Invalid request body');
    }

    if (!Array.isArray(body?.operations) || body.operations.length === 0) {
        return badRequest('Request must include a non-empty "operations" array');
    }

    if (body.operations.length > 100) {
        return badRequest('Batch limited to 100 operations per request');
    }

    const results: BatchResult[] = [];

    for (const op of body.operations) {
        try {
            switch (op.action) {
                case 'create': {
                    const record = {
                        ...(op.data || {}),
                        organization_id: membership.organization_id,
                    };
                    const { data, error } = await supabase
                        .from(tableName)
                        .insert(record)
                        .select()
                        .single();

                    if (error) {
                        results.push({ action: 'create', success: false, error: error.message });
                    } else {
                        results.push({ action: 'create', id: data.id, success: true, data });
                        auditService.logCreate(
                            membership.organization_id,
                            { id: user.id, type: 'user', email: user.email },
                            { type: tableName, id: data.id, name: data.name ?? data.title ?? data.id },
                        ).catch((e) => captureError(e, 'api.batch.audit_failed', { entity: tableName }));
                    }
                    break;
                }

                case 'update': {
                    if (!op.id) {
                        results.push({ action: 'update', success: false, error: 'Missing id for update' });
                        break;
                    }
                    const { data, error } = await supabase
                        .from(tableName)
                        .update(op.data || {})
                        .eq('id', op.id)
                        .eq('organization_id', membership.organization_id)
                        .select()
                        .single();

                    if (error) {
                        results.push({ action: 'update', id: op.id, success: false, error: error.message });
                    } else {
                        results.push({ action: 'update', id: op.id, success: true, data });
                        const changes = Object.entries(op.data || {}).map(([field, value]) => ({
                            field,
                            oldValue: undefined as unknown,
                            newValue: value,
                        }));
                        auditService.logUpdate(
                            membership.organization_id,
                            { id: user.id, type: 'user', email: user.email },
                            { type: tableName, id: op.id, name: data.name ?? data.title ?? op.id },
                            changes,
                        ).catch((e) => captureError(e, 'api.batch.audit_failed', { entity: tableName }));
                    }
                    break;
                }

                case 'delete': {
                    if (!op.id) {
                        results.push({ action: 'delete', success: false, error: 'Missing id for delete' });
                        break;
                    }
                    const { error } = await supabase
                        .from(tableName)
                        .update({ deleted_at: new Date().toISOString() })
                        .eq('id', op.id)
                        .eq('organization_id', membership.organization_id);

                    if (error) {
                        results.push({ action: 'delete', id: op.id, success: false, error: error.message });
                    } else {
                        results.push({ action: 'delete', id: op.id, success: true });
                        auditService.logDelete(
                            membership.organization_id,
                            { id: user.id, type: 'user', email: user.email },
                            { type: tableName, id: op.id },
                        ).catch((e) => captureError(e, 'api.batch.audit_failed', { entity: tableName }));
                    }
                    break;
                }

                default:
                    results.push({
                        action: (op as BatchOperation).action || 'unknown',
                        success: false,
                        error: `Unknown action: ${(op as BatchOperation).action}`,
                    });
            }
        } catch (e) {
            captureError(e, 'api.batch.operation_failed', { entity: tableName, action: op.action, ...requestContext });
            results.push({ action: op.action, id: op.id, success: false, error: 'Internal error' });
        }
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.length - succeeded;

    return apiSuccess({
        results,
        summary: { total: results.length, succeeded, failed },
    });
}

interface BatchOperation {
    action: 'create' | 'update' | 'delete';
    id?: string;
    data?: Record<string, unknown>;
}

interface BatchResult {
    action: string;
    id?: string;
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
}
