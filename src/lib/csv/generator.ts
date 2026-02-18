/**
 * CSV Generator Engine
 *
 * Generates CSV files from structured data using CsvFieldConfig definitions.
 * Handles: UTF-8 BOM for Excel compatibility, proper escaping, date formatting.
 */

import type { CsvFieldConfig } from './registry';

export interface GenerateCsvOptions {
  includeHeaders?: boolean;
  delimiter?: string;
}

/**
 * Generate a CSV Blob from structured data using field configs.
 */
export function generateCsvBlob(
  data: Record<string, unknown>[],
  fields: CsvFieldConfig[],
  options?: GenerateCsvOptions
): Blob {
  const csv = generateCsvString(data, fields, options);
  const bom = '\uFEFF';
  return new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Generate a CSV string from structured data using field configs.
 */
export function generateCsvString(
  data: Record<string, unknown>[],
  fields: CsvFieldConfig[],
  options?: GenerateCsvOptions
): string {
  const { includeHeaders = true, delimiter = ',' } = options ?? {};

  const exportFields = fields.filter(f => f.exportable);
  const headers = exportFields.map(f => f.csvHeader);

  const rows = data.map(row =>
    exportFields.map(field => {
      const value = row[field.dbField];
      const formatted = field.formatValue(value);
      return escapeCsvField(formatted, delimiter);
    })
  );

  const lines: string[] = [];
  if (includeHeaders) lines.push(headers.map(h => escapeCsvField(h, delimiter)).join(delimiter));
  rows.forEach(row => lines.push(row.join(delimiter)));

  return lines.join('\r\n');
}

/**
 * Escape a CSV field value for safe inclusion.
 */
function escapeCsvField(value: string, delimiter: string): string {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCsvBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a filename for CSV export.
 */
export function generateExportFilename(modelName: string): string {
  const date = new Date().toISOString().split('T')[0];
  const slug = modelName.toLowerCase().replace(/\s+/g, '-');
  return `${slug}_export_${date}.csv`;
}
