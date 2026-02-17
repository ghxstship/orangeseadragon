'use client';

import { use } from 'react';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { taskSchema } from '@/lib/schemas/task';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudDetail schema={taskSchema} id={id} />;
}
