'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { taskSchema } from '@/lib/schemas/task';

export default function ProjectTasksPage({ params }: { params: { id: string } }) {
  return (
    <CrudList 
      schema={taskSchema} 
      filter={{ project_id: params.id }}
    />
  );
}
