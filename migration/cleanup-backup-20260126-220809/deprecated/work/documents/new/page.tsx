"use client";

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { documentSchema } from '@/schemas/document.schema';

/**
 * New Document Page
 *
 * Uses the generic CrudForm component with document schema.
 * No entity-specific logic required.
 */
export default function NewDocumentPage() {
  return <CrudForm schema={documentSchema} mode="create" />;
}
