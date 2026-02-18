'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { taskListSchema } from '@/lib/schemas/core/taskList';

export default function NewTaskListPage() {
  return <CrudForm schema={taskListSchema} mode="create" />;
}
