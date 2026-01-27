'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { projectResourceSchema } from '@/lib/schemas/projectResource';

export default function NewProjectResourcePage() {
  return <CrudForm schema={projectResourceSchema} mode="create" />;
}
