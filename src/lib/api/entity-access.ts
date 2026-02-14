import { getSchema } from "@/lib/schemas";

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
