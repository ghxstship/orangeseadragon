'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { shiftSchema } from '@/lib/schemas/shift';

export default function NewShiftPage() {
  return <CrudForm schema={shiftSchema} mode="create" />;
}
