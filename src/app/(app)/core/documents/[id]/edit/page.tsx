'use client';

import { use } from 'react';
import { CrudForm } from '@/lib/crud/components/CrudForm';
import { documentSchema } from '@/lib/schemas/document';

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudForm schema={documentSchema} mode="edit" id={id} />;
}
