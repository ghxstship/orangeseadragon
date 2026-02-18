'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { checklistSchema } from '@/lib/schemas/operations/checklist';

export default function ChecklistsPage() {
  return <CrudList schema={checklistSchema} />;
}
