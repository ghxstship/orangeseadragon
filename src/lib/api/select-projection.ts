import { getSchema } from "@/lib/schemas";

const SYSTEM_COLUMNS = ["id", "organization_id", "created_at", "updated_at", "deleted_at", "created_by"];

/**
 * Derive a Supabase select clause from a schema's declared fields.
 * Returns system columns + all schema field names (camelCase → snake_case).
 *
 * Falls back to '*' when no schema is found for the given table.
 */
export function selectProjection(tableOrSlug: string, extra?: string[]): string {
  const schema = getSchema(tableOrSlug);
  if (!schema) return "*";

  const fieldKeys = Object.keys(schema.data.fields);
  const snakeFields = fieldKeys.map((k) =>
    k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase())
  );

  const columns = new Set([...SYSTEM_COLUMNS, ...snakeFields]);
  if (extra) extra.forEach((c) => columns.add(c));

  return Array.from(columns).join(", ");
}

/**
 * Minimal projection for action routes that only need to confirm
 * the mutation succeeded (approve, reject, flag, etc.).
 */
export function selectActionResult(extra?: string[]): string {
  const base = ["id", "status", "updated_at"];
  if (extra) base.push(...extra);
  return base.join(", ");
}
