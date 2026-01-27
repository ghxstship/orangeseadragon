'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { taskListSchema } from '@/lib/schemas/taskList';

export default function EditTaskListPage({ params }: { params: { id: string } }) {
  return <CrudForm schema={taskListSchema} mode="edit" id={params.id} />;
}
