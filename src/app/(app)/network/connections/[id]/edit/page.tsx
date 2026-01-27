'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { connectionSchema } from '@/lib/schemas/connection';

export default function EditConnectionPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={connectionSchema} mode="edit" id={params.id} />;
}
