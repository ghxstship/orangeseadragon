'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { journalEntrySchema } from '@/lib/schemas/journalEntry';

export default function JournalEntryDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={journalEntrySchema} id={params.id} />;
}
