'use client';

import { use } from 'react';
import { CrudForm } from '@/lib/crud/components/CrudForm';
import { taskListSchema } from '@/lib/schemas/taskList';

export default function EditTaskListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudForm schema={taskListSchema} mode="edit" id={id} />;
}
