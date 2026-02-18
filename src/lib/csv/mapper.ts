/**
 * CSV Column Mapping Engine
 *
 * Auto-maps CSV headers to database fields using:
 * 1. Exact match (case-insensitive)
 * 2. Alias match (from field config)
 * 3. Fuzzy match (token overlap)
 */

import type { CsvModelConfig, CsvFieldConfig } from './registry';
import { getImportableFields } from './registry';

export interface ColumnMapping {
  csvHeader: string;
  dbField: string | null;
  confidence: 'exact' | 'alias' | 'fuzzy' | 'manual' | 'unmapped';
  targetLabel?: string;
}

/**
 * Auto-map CSV headers to database fields.
 */
export function autoMapColumns(
  csvHeaders: string[],
  config: CsvModelConfig
): ColumnMapping[] {
  const importFields = getImportableFields(config);
  const usedFields = new Set<string>();

  return csvHeaders.map(csvHeader => {
    const normalized = normalize(csvHeader);

    // 1. Exact match on csvHeader
    const exactMatch = importFields.find(
      f => !usedFields.has(f.dbField) && normalize(f.csvHeader) === normalized
    );
    if (exactMatch) {
      usedFields.add(exactMatch.dbField);
      return {
        csvHeader,
        dbField: exactMatch.dbField,
        confidence: 'exact' as const,
        targetLabel: exactMatch.csvHeader,
      };
    }

    // 2. Exact match on dbField name
    const dbMatch = importFields.find(
      f => !usedFields.has(f.dbField) && normalize(f.dbField) === normalized
    );
    if (dbMatch) {
      usedFields.add(dbMatch.dbField);
      return {
        csvHeader,
        dbField: dbMatch.dbField,
        confidence: 'exact' as const,
        targetLabel: dbMatch.csvHeader,
      };
    }

    // 3. Alias match
    const aliasMatch = importFields.find(f =>
      !usedFields.has(f.dbField) &&
      f.aliases.some(a => normalize(a) === normalized)
    );
    if (aliasMatch) {
      usedFields.add(aliasMatch.dbField);
      return {
        csvHeader,
        dbField: aliasMatch.dbField,
        confidence: 'alias' as const,
        targetLabel: aliasMatch.csvHeader,
      };
    }

    // 4. Fuzzy match (token overlap)
    const fuzzyResult = fuzzyMatch(normalized, importFields, usedFields);
    if (fuzzyResult) {
      usedFields.add(fuzzyResult.dbField);
      return {
        csvHeader,
        dbField: fuzzyResult.dbField,
        confidence: 'fuzzy' as const,
        targetLabel: fuzzyResult.csvHeader,
      };
    }

    // 5. Unmapped
    return { csvHeader, dbField: null, confidence: 'unmapped' as const };
  });
}

function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/[_\-\s]+/g, '');
}

function fuzzyMatch(
  normalized: string,
  fields: CsvFieldConfig[],
  usedFields: Set<string>
): CsvFieldConfig | null {
  const csvTokens = tokenize(normalized);
  let bestMatch: CsvFieldConfig | null = null;
  let bestScore = 0;

  for (const field of fields) {
    if (usedFields.has(field.dbField)) continue;

    const fieldTokens = [
      ...tokenize(field.csvHeader.toLowerCase()),
      ...field.aliases.flatMap(a => tokenize(a.toLowerCase())),
      ...tokenize(field.dbField.toLowerCase()),
    ];

    const overlap = csvTokens.filter(t => fieldTokens.includes(t)).length;
    const score = overlap / Math.max(csvTokens.length, 1);

    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      bestMatch = field;
    }
  }

  return bestMatch;
}

function tokenize(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[_\-\s]+/)
    .filter(Boolean);
}

/**
 * Get unmapped required fields that block import.
 */
export function getUnmappedRequiredFields(
  mappings: ColumnMapping[],
  config: CsvModelConfig
): CsvFieldConfig[] {
  const importFields = getImportableFields(config);
  const mappedDbFields = new Set(
    mappings.filter(m => m.dbField !== null).map(m => m.dbField!)
  );

  return importFields.filter(f => f.required && !mappedDbFields.has(f.dbField));
}
