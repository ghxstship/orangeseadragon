'use client';

import { use } from 'react';
import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { quoteSchema } from '@/lib/schemas/quote';

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <CrudDetail schema={quoteSchema} id={id} />;
}
