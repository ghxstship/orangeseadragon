import { getSchema } from "@/lib/schemas";
import type { EntitySchema } from "@/lib/schema/types";

const API_PREFIX = "/api/";

/**
 * Resolve a user-supplied entity segment to an explicitly declared schema endpoint.
 * Returns null when entity is not registered in the schema registry.
 */
export function resolveAllowedEntityTable(entityParam: string): string | null {
  const schema = getSchema(entityParam);
  if (!schema) {
    return null;
  }

  const endpoint = schema.data.endpoint;
  if (!endpoint.startsWith(API_PREFIX)) {
    return null;
  }

  const endpointSlug = endpoint.slice(API_PREFIX.length).split("/")[0];
  return endpointSlug.replace(/-/g, "_");
}

/**
 * Resolve entity param to both the table name and full schema definition.
 * Used by the generic entity API to access search fields, validation, hooks, etc.
 */
export function resolveEntityContext(entityParam: string): {
  tableName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- EntitySchema generic
  schema: EntitySchema<any>;
} | null {
  const schema = getSchema(entityParam);
  if (!schema) {
    return null;
  }

  const endpoint = schema.data.endpoint;
  if (!endpoint.startsWith(API_PREFIX)) {
    return null;
  }

  const endpointSlug = endpoint.slice(API_PREFIX.length).split("/")[0];
  const tableName = endpointSlug.replace(/-/g, "_");

  return { tableName, schema };
}
