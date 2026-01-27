'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { taskSchema } from '@/lib/schemas/task';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={taskSchema} id={params.id} />;
}
