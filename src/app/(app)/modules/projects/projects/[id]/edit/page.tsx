'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { projectSchema } from '@/lib/schemas/project';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={projectSchema} mode="edit" id={params.id} />;
}
