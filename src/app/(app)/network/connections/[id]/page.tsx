'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { connectionSchema } from '@/lib/schemas/connection';

export default function ConnectionDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={connectionSchema} id={params.id} />;
}
