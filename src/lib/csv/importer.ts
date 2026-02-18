/**
 * CSV Batch Import Processor
 *
 * Orchestrates the full import pipeline:
 * 1. Validate all rows
 * 2. Resolve foreign keys
 * 3. Check for duplicates against existing data
 * 4. Batch insert/upsert within a transaction
 * 5. Return detailed results
 */

import type { CsvModelConfig } from './registry';
import type { ColumnMapping } from './mapper';
import type { BatchValidationResult } from './validator';
import { validateBatch } from './validator';
import { resolveAllForeignKeys } from './resolver';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ImportOptions {
  duplicateStrategy: 'skip' | 'update' | 'error';
  batchSize: number;
  dryRun: boolean;
  organizationId?: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: ImportRowError[];
  validation: BatchValidationResult;
  duration: number;
}

export interface ImportRowError {
  rowIndex: number;
  field?: string;
  message: string;
  originalData: Record<string, string>;
}

const DEFAULT_BATCH_SIZE = 100;

/**
 * Process a CSV import for a given model.
 */
export async function processImport(
  supabase: SupabaseClient,
  rows: Record<string, string>[],
  mappings: ColumnMapping[],
  config: CsvModelConfig,
  options: Partial<ImportOptions> = {}
): Promise<ImportResult> {
  const startTime = Date.now();
  const opts: ImportOptions = {
    duplicateStrategy: options.duplicateStrategy ?? 'skip',
    batchSize: options.batchSize ?? DEFAULT_BATCH_SIZE,
    dryRun: options.dryRun ?? false,
    organizationId: options.organizationId,
  };

  // Step 1: Validate
  const validation = validateBatch(rows, mappings, config);

  if (validation.validRows === 0) {
    return {
      success: false,
      totalRows: rows.length,
      insertedCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errorCount: validation.errorRows,
      errors: validation.results
        .filter(r => !r.valid)
        .map(r => ({
          rowIndex: r.rowIndex,
          message: r.errors.map(e => `${e.field}: ${e.message}`).join('; '),
          originalData: rows[r.rowIndex] ?? {},
        })),
      validation,
      duration: Date.now() - startTime,
    };
  }

  // Step 2: Collect valid parsed rows
  const validResults = validation.results.filter(r => r.valid && r.parsedData);
  const parsedRows = validResults.map(r => r.parsedData!);

  // Step 3: Resolve foreign keys
  const fkFields = config.fields.filter(f => f.foreignKey && f.importable);
  if (fkFields.length > 0) {
    await resolveAllForeignKeys(supabase, parsedRows, fkFields, opts.organizationId);
  }

  // Step 4: If dry run, return validation results only
  if (opts.dryRun) {
    return {
      success: true,
      totalRows: rows.length,
      insertedCount: validResults.length,
      updatedCount: 0,
      skippedCount: validation.errorRows,
      errorCount: 0,
      errors: [],
      validation,
      duration: Date.now() - startTime,
    };
  }

  // Step 5: Batch insert
  const tableName = deriveTableName(config.endpoint);
  let insertedCount = 0;
  const updatedCount = 0;
  let skippedCount = 0;
  const importErrors: ImportRowError[] = [];

  for (let i = 0; i < parsedRows.length; i += opts.batchSize) {
    const batch = parsedRows.slice(i, i + opts.batchSize);
    const batchIndices = validResults.slice(i, i + opts.batchSize).map(r => r.rowIndex);

    // Add organization_id if provided
    const insertData = batch.map(row => ({
      ...row,
      ...(opts.organizationId ? { organization_id: opts.organizationId } : {}),
    }));

    try {
      if (opts.duplicateStrategy === 'update' && config.uniqueFields.length > 0) {
        // Upsert
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from as any)(tableName)
          .upsert(insertData, { onConflict: config.uniqueFields.join(',') })
          .select('id');

        if (error) {
          batch.forEach((_, idx) => {
            const rowIdx = batchIndices[idx] ?? i + idx;
            importErrors.push({
              rowIndex: rowIdx,
              message: error.message,
              originalData: rows[rowIdx] ?? {},
            });
          });
        } else {
          const count = Array.isArray(data) ? data.length : 0;
          insertedCount += count;
        }
      } else {
        // Insert (skip duplicates via onConflict ignore if strategy is 'skip')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from as any)(tableName)
          .insert(insertData)
          .select('id');

        if (error) {
          if (error.code === '23505' && opts.duplicateStrategy === 'skip') {
            // Duplicate key — insert one by one to skip duplicates
            for (let j = 0; j < batch.length; j++) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error: singleError } = await (supabase.from as any)(tableName)
                .insert(insertData[j])
                .select('id');

              const rowIdx = batchIndices[j] ?? i + j;
              if (singleError) {
                if (singleError.code === '23505') {
                  skippedCount++;
                } else {
                  importErrors.push({
                    rowIndex: rowIdx,
                    message: singleError.message,
                    originalData: rows[rowIdx] ?? {},
                  });
                }
              } else {
                insertedCount++;
              }
            }
          } else {
            batch.forEach((_, idx) => {
              const rowIdx = batchIndices[idx] ?? i + idx;
              importErrors.push({
                rowIndex: rowIdx,
                message: error.message,
                originalData: rows[rowIdx] ?? {},
              });
            });
          }
        } else {
          const count = Array.isArray(data) ? data.length : 0;
          insertedCount += count;
        }
      }
    } catch (err) {
      batch.forEach((_, idx) => {
        const rowIdx = batchIndices[idx] ?? i + idx;
        importErrors.push({
          rowIndex: rowIdx,
          message: err instanceof Error ? err.message : 'Unknown error',
          originalData: rows[rowIdx] ?? {},
        });
      });
    }
  }

  // Add validation errors to import errors
  const validationErrors: ImportRowError[] = validation.results
    .filter(r => !r.valid)
    .map(r => ({
      rowIndex: r.rowIndex,
      message: r.errors.map(e => `${e.field}: ${e.message}`).join('; '),
      originalData: rows[r.rowIndex] ?? {},
    }));

  return {
    success: importErrors.length === 0,
    totalRows: rows.length,
    insertedCount,
    updatedCount,
    skippedCount: skippedCount + validation.errorRows,
    errorCount: importErrors.length + validationErrors.length,
    errors: [...validationErrors, ...importErrors],
    validation,
    duration: Date.now() - startTime,
  };
}

/**
 * Derive table name from API endpoint.
 * /api/contacts → contacts
 * /api/chart-of-accounts → chart_of_accounts
 */
function deriveTableName(endpoint: string): string {
  const parts = endpoint.split('/').filter(Boolean);
  const last = parts[parts.length - 1] ?? '';
  return last.replace(/-/g, '_');
}
