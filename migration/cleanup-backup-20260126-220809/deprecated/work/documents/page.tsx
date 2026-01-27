"use client";

import { CrudList } from '@/lib/crud/components/CrudList';
import { documentSchema } from '@/schemas/document.schema';

/**
 * Documents List Page
 *
 * Uses the generic CrudList component with document schema.
 * No entity-specific logic required.
 */
export default function DocumentsPage() {
  return <CrudList schema={documentSchema} />;
}
