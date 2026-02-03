'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { journalEntrySchema } from '@/lib/schemas/journalEntry';

export default function TransactionsPage() {
  return <CrudList schema={journalEntrySchema} />;
}
