'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { runsheetSchema } from '@/lib/schemas/runsheet';

export default function NewRunsheetPage() {
  return <CrudForm schema={runsheetSchema} mode="create" />;
}
