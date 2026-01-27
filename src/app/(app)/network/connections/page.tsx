'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { connectionSchema } from '@/lib/schemas/connection';

export default function ConnectionsPage() {
  return <CrudList schema={connectionSchema} />;
}
