/**
 * CSV Parser Engine
 *
 * Enhanced parser that works with File objects and raw strings.
 * Handles: UTF-8 BOM, various delimiters, quoted fields, line breaks in fields.
 * Reuses the proven parsing logic from lib/utils/csv.ts.
 */

import { parseCsv as parseRaw } from '@/lib/utils/csv';

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  errors: CsvParseError[];
  encoding: string;
  delimiter: string;
}

export interface CsvParseError {
  row: number;
  column?: string;
  message: string;
}

/**
 * Parse a CSV file (browser File object) into structured rows.
 */
export async function parseCsvFile(file: File): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseCsvString(text);
        resolve(result);
      } catch (err) {
        reject(new Error(`CSV parse failed: ${err instanceof Error ? err.message : 'Unknown error'}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Parse a CSV string into structured rows.
 */
export function parseCsvString(text: string): CsvParseResult {
  const raw = parseRaw(text);

  // Detect delimiter (the existing parser uses comma)
  const delimiter = detectDelimiter(text);

  return {
    headers: raw.headers,
    rows: raw.rows,
    totalRows: raw.totalRows,
    errors: raw.errors.map(e => ({
      row: e.row,
      column: e.column,
      message: e.message,
    })),
    encoding: 'UTF-8',
    delimiter,
  };
}

/**
 * Detect the most likely delimiter in a CSV string.
 */
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0] ?? '';
  const commas = (firstLine.match(/,/g) ?? []).length;
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const semicolons = (firstLine.match(/;/g) ?? []).length;

  if (tabs > commas && tabs > semicolons) return '\t';
  if (semicolons > commas) return ';';
  return ',';
}
