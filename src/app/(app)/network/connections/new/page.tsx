'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { connectionSchema } from '@/lib/schemas/connection';

export default function NewConnectionPage() {
  return <CrudForm schema={connectionSchema} mode="create" />;
}
