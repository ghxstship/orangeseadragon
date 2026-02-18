import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError } from '@/lib/api/response';
import { resolveEntityContext } from '@/lib/api/entity-access';
import { enforceResourceAccess } from '@/lib/api/role-guard';
import { deriveModelConfig } from '@/lib/csv/registry';
import { parseCsvString } from '@/lib/csv/parser';
import { processImport } from '@/lib/csv/importer';
import type { ColumnMapping } from '@/lib/csv/mapper';

/**
 * CSV IMPORT — CONFIRM & PROCESS
 *
 * POST /api/csv/[entity]/confirm
 * Body: FormData with 'file' field + JSON 'mappings' + 'duplicateStrategy'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;
  const ctx = resolveEntityContext(entity);
  if (!ctx) return notFound('Entity');

  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;

  const resourceAccessError = enforceResourceAccess(auth, ctx.tableName);
  if (resourceAccessError) return resourceAccessError;

  const { supabase, membership } = auth;
  const csvConfig = deriveModelConfig(ctx.schema);

  if (!csvConfig.importEnabled) {
    return badRequest('Import is not enabled for this entity');
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const mappingsJson = formData.get('mappings');
    const duplicateStrategy = (formData.get('duplicateStrategy') as string) ?? 'skip';

    if (!file || !(file instanceof File)) {
      return badRequest('No CSV file provided');
    }

    if (!mappingsJson || typeof mappingsJson !== 'string') {
      return badRequest('No column mappings provided');
    }

    let mappings: ColumnMapping[];
    try {
      mappings = JSON.parse(mappingsJson) as ColumnMapping[];
    } catch {
      return badRequest('Invalid mappings JSON');
    }

    const text = await file.text();
    const parseResult = parseCsvString(text);

    if (parseResult.totalRows === 0) {
      return badRequest('CSV file has no data rows');
    }

    const result = await processImport(
      supabase,
      parseResult.rows,
      mappings,
      csvConfig,
      {
        duplicateStrategy: duplicateStrategy as 'skip' | 'update' | 'error',
        organizationId: membership.organization_id,
      }
    );

    return apiSuccess({
      success: result.success,
      totalRows: result.totalRows,
      insertedCount: result.insertedCount,
      updatedCount: result.updatedCount,
      skippedCount: result.skippedCount,
      errorCount: result.errorCount,
      errors: result.errors.slice(0, 100),
      duration: result.duration,
    });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Import failed');
  }
}
