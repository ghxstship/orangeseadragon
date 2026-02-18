/**
 * CSV Row Validation Engine
 *
 * Validates every row against the model config.
 * Returns detailed per-row, per-field errors and warnings.
 */

import type { CsvModelConfig, CsvFieldConfig } from './registry';
import type { ColumnMapping } from './mapper';

export interface RowValidationResult {
  rowIndex: number;
  valid: boolean;
  errors: { field: string; message: string; value: string }[];
  warnings: { field: string; message: string; value: string }[];
  parsedData: Record<string, unknown> | null;
}

export interface BatchValidationResult {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  results: RowValidationResult[];
  duplicatesDetected: { rowIndex: number; conflictField: string; conflictValue: string }[];
}

/**
 * Validate a batch of rows against the model config and column mappings.
 */
export function validateBatch(
  rows: Record<string, string>[],
  mappings: ColumnMapping[],
  config: CsvModelConfig
): BatchValidationResult {
  const activeMappings = mappings.filter(m => m.dbField !== null);
  const fieldsByDbName = new Map<string, CsvFieldConfig>();
  for (const f of config.fields) {
    fieldsByDbName.set(f.dbField, f);
  }

  const seenUniques = new Map<string, number[]>();

  const results: RowValidationResult[] = rows.map((row, rowIndex) => {
    const errors: RowValidationResult['errors'] = [];
    const warnings: RowValidationResult['warnings'] = [];
    const parsedData: Record<string, unknown> = {};

    for (const mapping of activeMappings) {
      const field = fieldsByDbName.get(mapping.dbField!);
      if (!field) continue;

      const rawValue = row[mapping.csvHeader]?.trim() ?? '';

      // Required check
      if (field.required && !rawValue) {
        errors.push({
          field: field.dbField,
          message: `${field.csvHeader} is required`,
          value: rawValue,
        });
        continue;
      }

      // Skip empty optional fields
      if (!rawValue && !field.required) {
        parsedData[field.dbField] = field.defaultValue ?? null;
        continue;
      }

      // Type-specific validation
      try {
        const parsed = field.parseValue(rawValue);
        const result = field.validation.safeParse(parsed);
        if (!result.success) {
          errors.push({
            field: field.dbField,
            message: result.error.issues[0]?.message ?? 'Invalid value',
            value: rawValue,
          });
        } else {
          parsedData[field.dbField] = result.data;
        }
      } catch {
        errors.push({
          field: field.dbField,
          message: 'Could not parse value',
          value: rawValue,
        });
      }

      // Enum validation
      if (field.type === 'enum' && field.enumValues && rawValue) {
        if (!field.enumValues.includes(rawValue.toLowerCase())) {
          errors.push({
            field: field.dbField,
            message: `Invalid value. Must be one of: ${field.enumValues.join(', ')}`,
            value: rawValue,
          });
        }
      }

      // Max length
      if (field.maxLength && rawValue.length > field.maxLength) {
        warnings.push({
          field: field.dbField,
          message: `Exceeds max length of ${field.maxLength} characters`,
          value: rawValue,
        });
      }
    }

    // Check required fields that weren't mapped at all
    for (const field of config.fields) {
      if (!field.importable || !field.required) continue;
      if (!activeMappings.some(m => m.dbField === field.dbField)) {
        errors.push({
          field: field.dbField,
          message: `Required field "${field.csvHeader}" is not mapped`,
          value: '',
        });
      }
    }

    // Track uniqueness within the batch
    for (const uniqueField of config.uniqueFields) {
      const value = parsedData[uniqueField];
      if (value != null) {
        const key = `${uniqueField}:${String(value).toLowerCase()}`;
        if (!seenUniques.has(key)) seenUniques.set(key, []);
        seenUniques.get(key)!.push(rowIndex);
      }
    }

    return {
      rowIndex,
      valid: errors.length === 0,
      errors,
      warnings,
      parsedData: errors.length === 0 ? parsedData : null,
    };
  });

  // Detect in-batch duplicates
  const duplicatesDetected: BatchValidationResult['duplicatesDetected'] = [];
  for (const [key, indices] of seenUniques) {
    if (indices.length > 1) {
      const separatorIdx = key.indexOf(':');
      const field = key.slice(0, separatorIdx);
      const value = key.slice(separatorIdx + 1);
      indices.forEach(i =>
        duplicatesDetected.push({ rowIndex: i, conflictField: field, conflictValue: value })
      );
    }
  }

  return {
    totalRows: rows.length,
    validRows: results.filter(r => r.valid).length,
    errorRows: results.filter(r => !r.valid).length,
    warningRows: results.filter(r => r.warnings.length > 0).length,
    results,
    duplicatesDetected,
  };
}

/**
 * Generate an error report CSV from validation results.
 * Returns only failed rows with an additional "Error" column.
 */
export function generateErrorReport(
  originalRows: Record<string, string>[],
  validation: BatchValidationResult,
  headers: string[]
): string {
  const errorRows = validation.results.filter(r => !r.valid);
  if (errorRows.length === 0) return '';

  const errorHeaders = [...headers, 'Error'];
  const lines: string[] = [errorHeaders.map(h => escapeCsv(h)).join(',')];

  for (const result of errorRows) {
    const originalRow = originalRows[result.rowIndex];
    if (!originalRow) continue;

    const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join('; ');
    const values = headers.map(h => escapeCsv(originalRow[h] ?? ''));
    values.push(escapeCsv(errorMessages));
    lines.push(values.join(','));
  }

  return '\uFEFF' + lines.join('\r\n');
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
