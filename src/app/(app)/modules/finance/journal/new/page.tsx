'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { journalEntrySchema } from '@/lib/schemas/journalEntry';

export default function NewJournalEntryPage() {
  return <CrudForm schema={journalEntrySchema} mode="create" />;
}
