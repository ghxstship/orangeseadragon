'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { taskListSchema } from '@/lib/schemas/taskList';

export default function TaskListPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={taskListSchema} id={params.id} />;
}
