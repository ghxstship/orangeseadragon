"use client";

import { CrudForm } from '@/lib/crud';
import { taskSchema } from '@/schemas/task.schema';

/**
 * New Task Page
 *
 * Uses the generic CrudForm component with task schema.
 * No entity-specific logic required.
 */
export default function NewTaskPage() {
  return <CrudForm schema={taskSchema} mode="create" />;
}
