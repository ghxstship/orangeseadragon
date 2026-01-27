"use client";

import { CrudList } from '@/lib/crud/components/CrudList';
import { taskSchema } from '@/schemas/task.schema';

/**
 * Tasks List Page
 *
 * Uses the generic CrudList component with task schema.
 * No entity-specific logic required.
 */
export default function TasksPage() {
  return <CrudList schema={taskSchema} />;
}
