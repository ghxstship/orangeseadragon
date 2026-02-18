'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { taskSchema } from '@/lib/schemas/core/task';

export default function NewTaskPage() {
  return <CrudForm schema={taskSchema} mode="create" />;
}
