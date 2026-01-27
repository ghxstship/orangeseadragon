'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { emailSequenceSchema } from '@/lib/schemas/emailSequence';

export default function SequencesPage() {
  return (
    <CrudList
      schema={emailSequenceSchema}
    />
  );
}
