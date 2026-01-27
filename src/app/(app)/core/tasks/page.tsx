'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { taskSchema } from '@/lib/schemas/task';

export default function TasksPage() {
  return <CrudList schema={taskSchema} />;
}
