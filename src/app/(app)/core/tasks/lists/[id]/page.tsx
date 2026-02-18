'use client';

import { use } from 'react';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { taskListSchema } from '@/lib/schemas/core/taskList';

export default function TaskListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudDetail schema={taskListSchema} id={id} />;
}
