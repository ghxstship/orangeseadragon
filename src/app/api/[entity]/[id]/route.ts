import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiNoContent, notFound, badRequest, supabaseError, unprocessable } from '@/lib/api/response';
import { resolveEntityContext } from '@/lib/api/entity-access';
import { enforceResourceAccess } from '@/lib/api/role-guard';
import { captureError, extractRequestContext } from '@/lib/observability';
import { generateZodSchema, extractFormFieldKeys } from '@/lib/schema-engine/generateZodSchema';
import { auditService } from '@/lib/audit/service';

/**
 * GENERIC ENTITY RECORD API
 *
 * Handles GET (single), PATCH (update), and DELETE for any entity record.
 * Enforces org-scoping, policy-based authorization, server-side validation,
 * state machine transitions, and audit logging.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const { entity, id } = await params;
    const ctx = resolveEntityContext(entity);
    if (!ctx) {
        return notFound('Entity');
    }
    const { tableName } = ctx;

    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;

    const resourceAccessError = enforceResourceAccess(auth, tableName);
    if (resourceAccessError) return resourceAccessError;

    const { supabase, membership } = auth;

    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .eq('organization_id', membership.organization_id)
        .is('deleted_at', null)
        .single();

    if (error) {
        return error.code === 'PGRST116' ? notFound(tableName) : supabaseError(error);
    }

    return apiSuccess(data);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const { entity, id } = await params;
    const ctx = resolveEntityContext(entity);
    if (!ctx) {
        return notFound('Entity');
    }
    const { tableName, schema } = ctx;

    const auth = await requirePolicy('entity.write');
    if (auth.error) return auth.error;

    const resourceAccessError = enforceResourceAccess(auth, tableName);
    if (resourceAccessError) return resourceAccessError;

    const { supabase, user, membership } = auth;
    const requestContext = extractRequestContext(request.headers);

    try {
        const body = await request.json();

        // Fetch existing record for org-scoping validation and state machine checks
        const { data: existing, error: fetchError } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .eq('organization_id', membership.organization_id)
            .is('deleted_at', null)
            .single();

        if (fetchError || !existing) {
            return notFound(tableName);
        }

        // State machine enforcement
        if (schema.stateMachine) {
            const sm = schema.stateMachine;
            const statusField = sm.field;
            const newStatus = body[statusField];
            const currentStatus = existing[statusField];

            if (newStatus && newStatus !== currentStatus) {
                // Reject transitions from terminal states
                if (sm.terminal?.includes(currentStatus)) {
                    return badRequest(
                        `Cannot transition from terminal state '${currentStatus}'`
                    );
                }

                // Validate the transition is declared
                const allowed = sm.transitions.filter(
                    (t) => t.from === currentStatus && t.to === newStatus
                );

                if (allowed.length === 0) {
                    const validTargets = sm.transitions
                        .filter((t) => t.from === currentStatus)
                        .map((t) => t.to);
                    return badRequest(
                        `Invalid transition from '${currentStatus}' to '${newStatus}'`,
                        { allowed_transitions: validTargets }
                    );
                }

                // Check role-restricted transitions
                const transition = allowed[0];
                if (transition?.roles?.length && membership.role_slug) {
                    if (!transition.roles.includes(membership.role_slug)) {
                        return badRequest(
                            `Role '${membership.role_slug}' cannot perform transition to '${newStatus}'`,
                            { required_roles: transition.roles }
                        );
                    }
                }

                // Run guard function if present
                if (transition?.guard && !transition.guard(existing)) {
                    return badRequest(
                        `Transition guard failed for '${currentStatus}' → '${newStatus}'`
                    );
                }
            }
        }

        // Server-side Zod validation from schema field definitions
        if (schema.data.fields && schema.layouts?.form?.sections) {
            const formFields = extractFormFieldKeys(
                schema.layouts.form.sections as Parameters<typeof extractFormFieldKeys>[0]
            );
            // Only validate fields present in the body
            const fieldsToValidate = formFields.filter((f: string) => f in body);
            if (fieldsToValidate.length > 0) {
                const zodSchema = generateZodSchema(schema.data.fields, fieldsToValidate, 'edit');
                const result = zodSchema.safeParse(body);
                if (!result.success) {
                    const fieldErrors: Record<string, string> = {};
                    for (const issue of result.error.issues) {
                        const path = issue.path.join('.');
                        if (!fieldErrors[path]) {
                            fieldErrors[path] = issue.message;
                        }
                    }
                    return unprocessable('Validation failed', fieldErrors);
                }
            }
        }

        // Prevent org_id tampering
        const { organization_id: _orgId, id: _recordId, ...safeBody } = body;

        const { data, error } = await supabase
            .from(tableName)
            .update(safeBody)
            .eq('id', id)
            .eq('organization_id', membership.organization_id)
            .select()
            .single();

        if (error) {
            return supabaseError(error);
        }

        // Audit log
        const changes = Object.keys(safeBody)
            .filter((k) => existing[k] !== safeBody[k])
            .map((k) => ({ field: k, oldValue: existing[k], newValue: safeBody[k] }));

        if (changes.length > 0) {
            auditService.logUpdate(
                membership.organization_id,
                { id: user.id, type: 'user', email: user.email },
                { type: tableName, id, name: data.name ?? data.title ?? id },
                changes,
            ).catch((e) => captureError(e, 'api.generic_entity.audit_failed', { entity: tableName }));
        }

        return apiSuccess(data);
    } catch (error) {
        captureError(error, 'api.generic_entity.invalid_request_body', { entity: tableName, id, ...requestContext });
        return badRequest('Invalid request body');
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const { entity, id } = await params;
    const ctx = resolveEntityContext(entity);
    if (!ctx) {
        return notFound('Entity');
    }
    const { tableName } = ctx;

    const auth = await requirePolicy('entity.delete');
    if (auth.error) return auth.error;

    const resourceAccessError = enforceResourceAccess(auth, tableName);
    if (resourceAccessError) return resourceAccessError;

    const { supabase, user, membership } = auth;
    const requestContext = extractRequestContext(request.headers);

    // Soft delete: set deleted_at timestamp instead of hard delete
    const { data, error } = await supabase
        .from(tableName)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('organization_id', membership.organization_id)
        .select()
        .single();

    if (error) {
        // Fallback to hard delete for tables without deleted_at column
        if (error.message?.includes('deleted_at')) {
            const { error: hardDeleteError } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (hardDeleteError) {
                captureError(hardDeleteError, 'api.generic_entity.hard_delete_failed', { entity: tableName, id, ...requestContext });
                return supabaseError(hardDeleteError);
            }

            // Audit log for hard delete
            auditService.logDelete(
                membership.organization_id,
                { id: user.id, type: 'user', email: user.email },
                { type: tableName, id },
            ).catch((e) => captureError(e, 'api.generic_entity.audit_failed', { entity: tableName }));

            return apiNoContent();
        }
        return supabaseError(error);
    }

    // Audit log for soft delete
    auditService.logDelete(
        membership.organization_id,
        { id: user.id, type: 'user', email: user.email },
        { type: tableName, id, name: data.name ?? data.title ?? id },
    ).catch((e) => captureError(e, 'api.generic_entity.audit_failed', { entity: tableName }));

    return apiSuccess(data, { message: 'Record archived' });
}
