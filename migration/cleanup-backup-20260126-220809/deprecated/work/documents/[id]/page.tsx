"use client";

import { useParams } from "next/navigation";
import { CrudDetail } from '@/lib/crud';
import { documentSchema } from '@/schemas/document.schema';

/**
 * Document Detail Page
 *
 * Uses the generic CrudDetail component with document schema.
 * No entity-specific logic required.
 */
export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;

  return <CrudDetail schema={documentSchema} id={documentId} />;
}
