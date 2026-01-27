'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { leadSchema } from '@/lib/schemas/lead';

export default function LeadsPage() {
  return <CrudList schema={leadSchema} />;
}
