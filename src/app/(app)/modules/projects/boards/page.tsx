'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { boardSchema } from '@/lib/schemas/board';

export default function BoardsPage() {
  return <CrudList schema={boardSchema} />;
}
