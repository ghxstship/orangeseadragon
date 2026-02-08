'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { quoteSchema } from '@/lib/schemas/quote';

export default function QuotesPage() {
  return <CrudList schema={quoteSchema} />;
}
