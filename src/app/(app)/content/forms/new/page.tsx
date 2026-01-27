'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { formTemplateSchema } from '@/lib/schemas/formTemplate';

export default function NewFormPage() {
  return <CrudForm schema={formTemplateSchema} mode="create" />;
}
