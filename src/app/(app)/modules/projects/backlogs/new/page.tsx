'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { backlogSchema } from '@/lib/schemas/backlog';

export default function NewBacklogPage() {
  return <CrudForm schema={backlogSchema} mode="create" />;
}
