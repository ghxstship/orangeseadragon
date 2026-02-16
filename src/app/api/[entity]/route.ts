import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiPaginated, apiCreated, badRequest, notFound, supabaseError, unprocessable } from '@/lib/api/response';
import { resolveEntityContext } from '@/lib/api/entity-access';
import { captureError, extractRequestContext } from '@/lib/observability';
import { generateZodSchema, extractFormFieldKeys } from '@/lib/schema/generateZodSchema';
import { auditService } from '@/lib/audit/service';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePositiveInt(value: string | null, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }

    return parsed;
}

/**
 * GENERIC ENTITY LIST API
 *
 * Handles GET (list) and POST (create) for any entity.
 * Enforces org-scoping, policy-based authorization, server-side validation,
 * schema-aware search, and audit logging.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    const { entity } = await params;
    const ctx = resolveEntityContext(entity);
    if (!ctx) {
        return notFound('Entity');
    }
    const { tableName, schema } = ctx;

    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase, membership } = auth;
    const requestContext = extractRequestContext(request.headers);

    const searchParams = request.nextUrl.searchParams;
    const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
    const requestedPageSize = parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE);
    const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
    const fields = searchParams.get('fields');

    const includeDeleted = searchParams.get('include_deleted') === 'true';

    const selectableFields = new Set(Object.keys(schema.data.fields));
    selectableFields.add(schema.data.primaryKey || 'id');

    const requestedFields = fields
        ?.split(',')
        .map((field) => field.trim())
        .filter((field) => field.length > 0 && selectableFields.has(field));

    const selectClause = requestedFields && requestedFields.length > 0
        ? Array.from(new Set([schema.data.primaryKey || 'id', ...requestedFields])).join(',')
        : '*';

    let query = supabase.from(tableName).select(selectClause, { count: 'exact' });

    // Org-scoping: restrict to the authenticated user's organization
    query = query.eq('organization_id', membership.organization_id);

    if (!includeDeleted) {
        query = query.is('deleted_at', null);
    }

    const where = searchParams.get('where');
    const orderBy = searchParams.get('orderBy');
    const search = searchParams.get('search');

    // Basic filtering
    if (where) {
        try {
            const filters = JSON.parse(where);
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    query = query.eq(key, value);
                }
            });
        } catch (e) {
            captureError(e, 'api.generic_entity.where_parse_failed', { entity: tableName, ...requestContext });
        }
    }

    // Schema-aware search: use declared search.fields, fallback to 'name'
    if (search) {
        const searchFields = schema.search?.fields;
        if (searchFields && searchFields.length > 0) {
            const orClause = searchFields
                .map((f: string) => `${f}.ilike.%${search}%`)
                .join(',');
            query = query.or(orClause);
        } else {
            query = query.ilike('name', `%${search}%`);
        }
    }

    // Sorting
    if (orderBy) {
        try {
            const { field, direction } = JSON.parse(orderBy);
            query = query.order(field, { ascending: direction === 'asc' });
        } catch (e) {
            captureError(e, 'api.generic_entity.orderby_parse_failed', { entity: tableName, ...requestContext });
        }
    } else {
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        return supabaseError(error);
    }

    return apiPaginated(data || [], {
        page,
        limit: pageSize,
        total: count || 0,
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    const { entity } = await params;
    const ctx = resolveEntityContext(entity);
    if (!ctx) {
        return notFound('Entity');
    }
    const { tableName, schema } = ctx;

    const auth = await requirePolicy('entity.write');
    if (auth.error) return auth.error;
    const { supabase, user, membership } = auth;
    const requestContext = extractRequestContext(request.headers);

    try {
        const body = await request.json();

        // Server-side Zod validation from schema field definitions
        if (schema.data.fields && schema.layouts?.form?.sections) {
            const formFields = extractFormFieldKeys(
                schema.layouts.form.sections as Parameters<typeof extractFormFieldKeys>[0]
            );
            if (formFields.length > 0) {
                const zodSchema = generateZodSchema(schema.data.fields, formFields, 'create');
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

        // Enforce org-scoping: inject the user's organization_id
        const record = {
            ...body,
            organization_id: membership.organization_id,
        };

        const { data, error } = await supabase.from(tableName).insert(record).select().single();

        if (error) {
            captureError(error, 'api.generic_entity.insert_failed', { entity: tableName, ...requestContext });
            return supabaseError(error);
        }

        // Audit log
        auditService.logCreate(
            membership.organization_id,
            { id: user.id, type: 'user', email: user.email },
            { type: tableName, id: data.id, name: data.name ?? data.title ?? data.id },
        ).catch((e) => captureError(e, 'api.generic_entity.audit_failed', { entity: tableName }));

        return apiCreated(data);
    } catch (e) {
        captureError(e, 'api.generic_entity.invalid_request_body', { entity: tableName, ...requestContext });
        return badRequest('Invalid request body');
    }
}
