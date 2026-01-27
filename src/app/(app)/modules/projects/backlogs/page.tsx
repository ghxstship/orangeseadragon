'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { backlogSchema } from '@/lib/schemas/backlog';

export default function BacklogsPage() {
  return <CrudList schema={backlogSchema} />;
}
