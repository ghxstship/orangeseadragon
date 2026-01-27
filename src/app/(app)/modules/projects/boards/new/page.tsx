'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { boardSchema } from '@/lib/schemas/board';

export default function NewBoardPage() {
  return <CrudForm schema={boardSchema} mode="create" />;
}
