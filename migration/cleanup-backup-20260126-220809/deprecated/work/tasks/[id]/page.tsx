"use client";

import { useParams } from "next/navigation";
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { taskSchema } from '@/schemas/task.schema';

/**
 * Task Detail Page
 *
 * Uses the generic CrudDetail component with task schema.
 * No entity-specific logic required.
 */
export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;

  return <CrudDetail schema={taskSchema} id={taskId} />;
}
