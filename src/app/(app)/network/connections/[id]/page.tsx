'use client';

import { use } from 'react';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { connectionSchema } from '@/lib/schemas/connection';

export default function ConnectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudDetail schema={connectionSchema} id={id} />;
}
