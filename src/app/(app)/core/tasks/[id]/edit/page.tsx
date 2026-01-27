'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { taskSchema } from '@/lib/schemas/task';

export default function EditTaskPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={taskSchema} mode="edit" id={params.id} />;
}
