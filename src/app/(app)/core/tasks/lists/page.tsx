'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { taskListSchema } from '@/lib/schemas/taskList';

export default function TaskListsPage() {
  return <CrudList schema={taskListSchema} />;
}
