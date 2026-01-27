'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { showSchema } from '@/lib/schemas/show';

export default function NewShowPage() {
  return <CrudForm schema={showSchema} mode="create" />;
}
