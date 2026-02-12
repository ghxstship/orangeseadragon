/**
 * CSV Utility Functions
 *
 * Provides parsing, generation, and validation for CSV import/export.
 * Handles quoted fields, escaped quotes, newlines within fields, and BOM.
 */

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: CsvParseError[];
  totalRows: number;
}

export interface CsvParseError {
  row: number;
  column?: string;
  message: string;
}

export interface CsvFieldMapping {
  csvHeader: string;
  entityField: string;
  transform?: (value: string) => unknown;
}

export interface CsvExportOptions {
  fields: { key: string; label: string }[];
  data: Record<string, unknown>[];
  filename?: string;
  delimiter?: string;
  includeHeaders?: boolean;
}

/**
 * Parse a CSV string into structured data.
 * Handles: quoted fields, escaped quotes (""), newlines in quotes, BOM.
 */
export function parseCsv(raw: string): CsvParseResult {
  const errors: CsvParseError[] = [];

  // Strip BOM
  const text = raw.replace(/^\uFEFF/, '');

  const lines = splitCsvLines(text);
  if (lines.length === 0) {
    return { headers: [], rows: [], errors: [{ row: 0, message: 'Empty file' }], totalRows: 0 };
  }

  const headers = parseCsvRow(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCsvRow(line);

    if (values.length !== headers.length) {
      errors.push({
        row: i + 1,
        message: `Expected ${headers.length} columns, got ${values.length}`,
      });
      // Still attempt to map what we can
    }

    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      record[header] = idx < values.length ? values[idx].trim() : '';
    });
    rows.push(record);
  }

  return { headers, rows, errors, totalRows: rows.length };
}

/**
 * Split CSV text into logical lines, respecting quoted fields with newlines.
 */
function splitCsvLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && i + 1 < text.length && text[i + 1] === '"') {
        current += '""';
        i++;
      } else {
        inQuotes = !inQuotes;
        current += char;
      }
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
        i++;
      }
      lines.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

/**
 * Parse a single CSV row into an array of field values.
 */
function parseCsvRow(row: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && i + 1 < row.length && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

/**
 * Generate a CSV string from structured data.
 */
export function generateCsv(options: CsvExportOptions): string {
  const { fields, data, delimiter = ',', includeHeaders = true } = options;
  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(fields.map((f) => escapeCsvField(f.label, delimiter)).join(delimiter));
  }

  for (const record of data) {
    const row = fields.map((f) => {
      const value = record[f.key];
      const str = value === null || value === undefined ? '' : String(value);
      return escapeCsvField(str, delimiter);
    });
    lines.push(row.join(delimiter));
  }

  return lines.join('\n');
}

/**
 * Escape a single CSV field value.
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
export function downloadCsv(options: CsvExportOptions): void {
  const csv = generateCsv(options);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const filename = options.filename || 'export.csv';

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
 * Validate parsed CSV rows against expected field definitions.
 */
export function validateCsvRows(
  rows: Record<string, string>[],
  requiredFields: string[]
): CsvParseError[] {
  const errors: CsvParseError[] = [];

  rows.forEach((row, idx) => {
    requiredFields.forEach((field) => {
      if (!row[field] || row[field].trim() === '') {
        errors.push({
          row: idx + 2, // +2 for 1-indexed + header row
          column: field,
          message: `Missing required field "${field}"`,
        });
      }
    });
  });

  return errors;
}

/**
 * Auto-map CSV headers to entity fields using fuzzy matching.
 * Returns best-guess mappings.
 */
export function autoMapHeaders(
  csvHeaders: string[],
  entityFields: { key: string; label: string }[]
): CsvFieldMapping[] {
  return csvHeaders.map((csvHeader) => {
    const normalized = csvHeader.toLowerCase().replace(/[_\-\s]+/g, '');

    // Exact match on key
    const exactKey = entityFields.find(
      (f) => f.key.toLowerCase().replace(/[_\-\s]+/g, '') === normalized
    );
    if (exactKey) {
      return { csvHeader, entityField: exactKey.key };
    }

    // Exact match on label
    const exactLabel = entityFields.find(
      (f) => f.label.toLowerCase().replace(/[_\-\s]+/g, '') === normalized
    );
    if (exactLabel) {
      return { csvHeader, entityField: exactLabel.key };
    }

    // Partial match
    const partial = entityFields.find(
      (f) =>
        normalized.includes(f.key.toLowerCase().replace(/[_\-\s]+/g, '')) ||
        f.key.toLowerCase().replace(/[_\-\s]+/g, '').includes(normalized)
    );
    if (partial) {
      return { csvHeader, entityField: partial.key };
    }

    // No match — leave unmapped
    return { csvHeader, entityField: '' };
  });
}
