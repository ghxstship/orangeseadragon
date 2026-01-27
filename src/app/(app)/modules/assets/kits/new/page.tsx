'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { kitSchema } from '@/lib/schemas/kit';

export default function NewKitPage() {
  return <CrudForm schema={kitSchema} mode="create" />;
}
