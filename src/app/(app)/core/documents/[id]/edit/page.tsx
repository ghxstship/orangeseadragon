'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { documentSchema } from '@/lib/schemas/document';

export default function EditDocumentPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={documentSchema} mode="edit" id={params.id} />;
}
