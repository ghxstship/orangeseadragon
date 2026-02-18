'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { creditNoteSchema } from '@/lib/schemas/finance/creditNote';

export default function CreditNotesPage() {
  return <CrudList schema={creditNoteSchema} />;
}
