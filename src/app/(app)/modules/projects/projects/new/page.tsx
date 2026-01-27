'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { projectSchema } from '@/lib/schemas/project';

export default function NewProjectPage() {
  return <CrudForm schema={projectSchema} mode="create" />;
}
