'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { positionSchema } from '@/lib/schemas/position';

export default function NewPositionPage() {
  return <CrudForm schema={positionSchema} mode="create" />;
}
