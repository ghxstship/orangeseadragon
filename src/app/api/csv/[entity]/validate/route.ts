import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError } from '@/lib/api/response';
import { resolveEntityContext } from '@/lib/api/entity-access';
import { deriveModelConfig } from '@/lib/csv/registry';
import { parseCsvString } from '@/lib/csv/parser';
import { autoMapColumns } from '@/lib/csv/mapper';
import { validateBatch } from '@/lib/csv/validator';

/**
 * CSV IMPORT — UPLOAD & VALIDATE
 *
 * POST /api/csv/[entity]/validate
 * Body: FormData with 'file' field
 * Returns: parse result, auto-mapped columns, validation preview
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

  const csvConfig = deriveModelConfig(ctx.schema);

  if (!csvConfig.importEnabled) {
    return badRequest('Import is not enabled for this entity');
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return badRequest('No CSV file provided');
    }

    if (file.size > 10 * 1024 * 1024) {
      return badRequest('File size exceeds 10MB limit');
    }

    const text = await file.text();
    const parseResult = parseCsvString(text);

    if (parseResult.headers.length === 0) {
      return badRequest('CSV file is empty or has no headers');
    }

    if (parseResult.totalRows === 0) {
      return badRequest('CSV file has no data rows');
    }

    if (parseResult.totalRows > csvConfig.maxImportRows) {
      return badRequest(`CSV exceeds maximum of ${csvConfig.maxImportRows} rows`);
    }

    // Auto-map columns
    const mappings = autoMapColumns(parseResult.headers, csvConfig);

    // Validate with current mappings
    const validation = validateBatch(parseResult.rows, mappings, csvConfig);

    return apiSuccess({
      parse: {
        headers: parseResult.headers,
        totalRows: parseResult.totalRows,
        parseErrors: parseResult.errors,
        encoding: parseResult.encoding,
        delimiter: parseResult.delimiter,
      },
      mappings,
      validation: {
        totalRows: validation.totalRows,
        validRows: validation.validRows,
        errorRows: validation.errorRows,
        warningRows: validation.warningRows,
        duplicatesDetected: validation.duplicatesDetected,
        previewErrors: validation.results
          .filter(r => !r.valid)
          .slice(0, 20)
          .map(r => ({
            rowIndex: r.rowIndex,
            errors: r.errors,
          })),
        previewWarnings: validation.results
          .filter(r => r.warnings.length > 0)
          .slice(0, 10)
          .map(r => ({
            rowIndex: r.rowIndex,
            warnings: r.warnings,
          })),
      },
      config: {
        model: csvConfig.model,
        displayName: csvConfig.displayName,
        importableFields: csvConfig.fields
          .filter(f => f.importable)
          .map(f => ({
            dbField: f.dbField,
            csvHeader: f.csvHeader,
            type: f.type,
            required: f.required,
            enumValues: f.enumValues,
            foreignKey: f.foreignKey ? { model: f.foreignKey.model } : undefined,
          })),
      },
    });
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Validation failed');
  }
}
