/**
 * CSV Foreign Key Resolution Engine
 *
 * Resolves foreign key references from human-readable names to database IDs.
 * Example: "Acme Corp" → "uuid-of-acme-corp"
 */

import type { CsvFieldConfig } from './registry';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface ResolutionResult {
  resolved: Map<string, string>;
  unresolved: string[];
}

export interface FkResolutionSummary {
  field: string;
  model: string;
  totalValues: number;
  resolvedCount: number;
  unresolvedValues: string[];
}

/**
 * Resolve foreign key references for a single field across all rows.
 */
export async function resolveForeignKeys(
  supabase: SupabaseClient,
  values: string[],
  fkConfig: NonNullable<CsvFieldConfig['foreignKey']>,
  organizationId?: string
): Promise<ResolutionResult> {
  const uniqueValues = [...new Set(values.filter(Boolean))];
  if (uniqueValues.length === 0) {
    return { resolved: new Map(), unresolved: [] };
  }

  const resolved = new Map<string, string>();
  const unresolved: string[] = [];

  // Batch query: look up all values at once
  const tableName = fkConfig.model === 'company' ? 'companies' : `${fkConfig.model}s`;
  const selectFields = `${fkConfig.resolveField}, ${fkConfig.lookupField}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from as any)(tableName).select(selectFields).in(fkConfig.lookupField, uniqueValues);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) {
    return { resolved: new Map(), unresolved: uniqueValues };
  }

  // Build lookup map (case-insensitive)
  const lookupMap = new Map<string, string>();
  if (data && Array.isArray(data)) {
    for (const row of data as unknown as Record<string, unknown>[]) {
      const lookupVal = String(row[fkConfig.lookupField] ?? '').toLowerCase();
      const resolveVal = String(row[fkConfig.resolveField] ?? '');
      lookupMap.set(lookupVal, resolveVal);
    }
  }

  // Resolve each unique value
  for (const value of uniqueValues) {
    const id = lookupMap.get(value.toLowerCase());
    if (id) {
      resolved.set(value, id);
    } else {
      unresolved.push(value);
    }
  }

  return { resolved, unresolved };
}

/**
 * Resolve all FK fields in a batch of parsed rows.
 * Mutates parsedRows in place, replacing display values with resolved IDs.
 */
export async function resolveAllForeignKeys(
  supabase: SupabaseClient,
  parsedRows: Record<string, unknown>[],
  fkFields: CsvFieldConfig[],
  organizationId?: string
): Promise<FkResolutionSummary[]> {
  const summaries: FkResolutionSummary[] = [];

  for (const field of fkFields) {
    if (!field.foreignKey) continue;

    // Collect all values for this FK field
    const values = parsedRows
      .map(row => String(row[field.dbField] ?? ''))
      .filter(Boolean);

    const result = await resolveForeignKeys(
      supabase,
      values,
      field.foreignKey,
      organizationId
    );

    // Replace display values with resolved IDs in the parsed rows
    for (const row of parsedRows) {
      const value = String(row[field.dbField] ?? '');
      if (!value) continue;

      const resolvedId = result.resolved.get(value);
      if (resolvedId) {
        row[field.dbField] = resolvedId;
      }
      // If unresolved, leave the original value — it will be caught during import
    }

    summaries.push({
      field: field.dbField,
      model: field.foreignKey.model,
      totalValues: values.length,
      resolvedCount: result.resolved.size,
      unresolvedValues: result.unresolved,
    });
  }

  return summaries;
}
