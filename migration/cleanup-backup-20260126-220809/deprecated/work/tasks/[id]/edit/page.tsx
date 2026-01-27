"use client";

import { useParams } from "next/navigation";
import { CrudForm } from '@/lib/crud';
import { taskSchema } from '@/schemas/task.schema';

/**
 * Task Edit Page
 *
 * Uses the generic CrudForm component with task schema.
 * No entity-specific logic required.
 */
export default function TaskEditPage() {
  const params = useParams();
  const taskId = params.id as string;

  return <CrudForm schema={taskSchema} mode="edit" id={taskId} />;
}
