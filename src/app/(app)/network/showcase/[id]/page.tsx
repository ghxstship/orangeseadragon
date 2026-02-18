'use client';

import { use } from 'react';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { showcaseSchema } from '@/lib/schemas/crm/showcase';

export default function ShowcaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudDetail schema={showcaseSchema} id={id} />;
}
