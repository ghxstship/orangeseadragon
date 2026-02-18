/**
 * CSV Template Generator
 *
 * Generates downloadable CSV templates with:
 * - Header row with human-readable column names
 * - Description row explaining each field
 * - Example row showing sample data
 * - Constraints row showing validation rules
 */

import type { CsvModelConfig } from './registry';
import { getImportableFields } from './registry';

/**
 * Generate a CSV template Blob for a model.
 */
export function generateTemplateBlob(config: CsvModelConfig): Blob {
  const csv = generateTemplateString(config);
  const bom = '\uFEFF';
  return new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Generate a CSV template string for a model.
 */
export function generateTemplateString(config: CsvModelConfig): string {
  const importFields = getImportableFields(config);

  const headers = importFields.map(f => escapeCsv(f.csvHeader));
  const descriptions = importFields.map(f => escapeCsv(f.description));
  const examples = importFields.map(f => escapeCsv(f.example));
  const constraints = importFields.map(f => {
    const parts: string[] = [];
    if (f.required) parts.push('REQUIRED');
    if (f.maxLength) parts.push(`Max ${f.maxLength} chars`);
    if (f.enumValues) parts.push(`Options: ${f.enumValues.join(' | ')}`);
    if (f.foreignKey) parts.push(`Must match existing ${f.foreignKey.model}`);
    if (f.type === 'email') parts.push('Valid email');
    if (f.type === 'date') parts.push('Format: YYYY-MM-DD');
    if (f.type === 'datetime') parts.push('Format: YYYY-MM-DD HH:mm');
    if (f.type === 'url') parts.push('Valid URL');
    if (f.type === 'currency') parts.push('Number, no currency symbol');
    if (f.type === 'boolean') parts.push('Yes or No');
    if (f.type === 'tags') parts.push('Comma-separated values');
    return escapeCsv(parts.join('; ') || 'Optional');
  });

  const lines = [
    headers.join(','),
    descriptions.join(','),
    examples.join(','),
    constraints.join(','),
  ];

  return lines.join('\r\n');
}

/**
 * Generate a template filename.
 */
export function generateTemplateFilename(modelName: string): string {
  const slug = modelName.toLowerCase().replace(/\s+/g, '_');
  return `${slug}_import_template.csv`;
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
