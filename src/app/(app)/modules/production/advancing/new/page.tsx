'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { advancingSchema } from '@/lib/schemas/advancing';

export default function NewAdvancingPage() {
  return <CrudForm schema={advancingSchema} mode="create" />;
}
