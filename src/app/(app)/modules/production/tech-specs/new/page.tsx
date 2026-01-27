'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { techSpecSchema } from '@/lib/schemas/techSpec';

export default function NewTechSpecPage() {
  return <CrudForm schema={techSpecSchema} mode="create" />;
}
