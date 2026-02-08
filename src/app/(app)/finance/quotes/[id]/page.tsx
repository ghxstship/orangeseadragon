'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { quoteSchema } from '@/lib/schemas/quote';

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={quoteSchema} id={params.id} />;
}
