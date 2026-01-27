'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { emailSequenceSchema } from '@/lib/schemas/emailSequence';

export default function NewSequencePage() {
  return (
    <CrudForm
      schema={emailSequenceSchema}
      mode="create"
    />
  );
}
