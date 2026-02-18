import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { badRequest, notFound, serverError } from '@/lib/api/response';
import { resolveEntityContext } from '@/lib/api/entity-access';
import { enforceResourceAccess } from '@/lib/api/role-guard';
import { deriveModelConfig, getExportableFields } from '@/lib/csv/registry';
import { generateCsvString } from '@/lib/csv/generator';

/**
 * CSV EXPORT
 *
 * GET /api/csv/[entity]/export
 * Query params: fields (comma-separated), where (JSON), limit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;
  const ctx = resolveEntityContext(entity);
  if (!ctx) return notFound('Entity');

  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;

  const resourceAccessError = enforceResourceAccess(auth, ctx.tableName);
  if (resourceAccessError) return resourceAccessError;

  const { supabase, membership } = auth;
  const csvConfig = deriveModelConfig(ctx.schema);

  if (!csvConfig.exportEnabled) {
    return badRequest('Export is not enabled for this entity');
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(
    Number(searchParams.get('limit') ?? csvConfig.maxExportRows),
    csvConfig.maxExportRows
  );

  // Build query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from as any)(ctx.tableName).select('*').eq('organization_id', membership.organization_id).is('deleted_at', null).limit(limit);

  // Apply where filters
  const whereParam = searchParams.get('where');
  if (whereParam) {
    try {
      const where = JSON.parse(whereParam) as Record<string, unknown>;
      for (const [key, value] of Object.entries(where)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    } catch {
      return badRequest('Invalid where parameter');
    }
  }

  // Apply sort
  const orderBy = searchParams.get('orderBy') ?? ctx.schema.display.defaultSort.field;
  const orderDir = searchParams.get('orderDir') ?? ctx.schema.display.defaultSort.direction;
  query = query.order(orderBy, { ascending: orderDir === 'asc' });

  try {
    const { data, error } = await query;
    if (error) return serverError(error.message);

    const rows = (data as Record<string, unknown>[]) ?? [];
    const exportFields = getExportableFields(csvConfig);
    const csv = generateCsvString(rows, exportFields);

    const filename = `${entity}_export_${new Date().toISOString().split('T')[0]}.csv`;
    const bom = '\uFEFF';

    return new Response(bom + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Export failed');
  }
}
