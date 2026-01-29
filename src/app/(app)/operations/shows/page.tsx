'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { showSchema } from '@/lib/schemas/show';

export default function ShowsPage() {
  return <CrudList schema={showSchema} />;
}
