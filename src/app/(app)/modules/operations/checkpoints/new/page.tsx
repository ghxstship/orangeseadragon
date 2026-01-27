'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { checkpointSchema } from '@/lib/schemas/checkpoint';

export default function NewCheckpointPage() {
  return <CrudForm schema={checkpointSchema} mode="create" />;
}
