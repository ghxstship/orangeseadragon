'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { sprintSchema } from '@/lib/schemas/sprint';

export default function NewSprintPage() {
  return <CrudForm schema={sprintSchema} mode="create" />;
}
