'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { riderSchema } from '@/lib/schemas/rider';

export default function NewRiderPage() {
  return <CrudForm schema={riderSchema} mode="create" />;
}
